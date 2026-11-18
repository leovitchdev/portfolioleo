import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'screenshots', 'comparison');
const localUrl = process.env.CAPTURE_LOCAL_URL || 'http://127.0.0.1:4173';
const referenceUrl = 'https://wondr-agency.webflow.io';
const primaryPages = [
  ['home', '/', '/'],
  ['about', '/about', '/about'],
  ['service-detail', '/services/ui-ux-design', '/services/ui-ux-digital-design'],
  ['projects', '/projects', '/projects'],
  ['blogs', '/blogs', '/blogs'],
  ['pricing', '/pricing', '/pricing'],
  ['contact', '/contact', '/contact'],
];
const viewportSet = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

async function waitForFonts(page) {
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(() => {
    document.querySelectorAll('video').forEach(video => {
      video.pause();
      video.currentTime = 0;
    });
  }).catch(() => {});
  await page.addStyleTag({ content: `html{scroll-behavior:auto!important}*{caret-color:transparent!important}` }).catch(() => {});
  await delay(500);
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      const timing = animation.effect?.getComputedTiming();
      if (timing?.iterations === Infinity) {
        animation.currentTime = 0;
        animation.pause();
      }
    }
  }).catch(() => {});
}

async function visit(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForLoadState('load', { timeout: 20_000 }).catch(() => {});
  await waitForFonts(page);
  return response?.status() ?? 0;
}

async function loadImages(page) {
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach(image => { image.loading = 'eager'; });
    await Promise.all(images.map(image => image.decode().catch(() => {})));
  });
}

async function inspectPage(page) {
  await loadImages(page);
  return page.evaluate(() => {
    const rect = element => {
      const box = element.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y + scrollY), width: Math.round(box.width), height: Math.round(box.height) };
    };
    const images = [...document.images].map(image => ({
      src: image.currentSrc || image.src,
      alt: image.alt,
      loaded: image.complete && image.naturalWidth > 0,
      intrinsic: [image.naturalWidth, image.naturalHeight],
      rendered: rect(image),
      objectFit: getComputedStyle(image).objectFit,
      objectPosition: getComputedStyle(image).objectPosition,
    }));
    const regions = [...document.querySelectorAll('main img, main video, main [style*="background"], main .concept-preview, main .project-card, main .article-card')]
      .filter(element => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map(element => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === 'string' ? element.className : '',
        box: rect(element),
        backgroundImage: getComputedStyle(element).backgroundImage,
      }));
    const heading = document.querySelector('h1');
    const headingStyle = heading ? getComputedStyle(heading) : null;
    return {
      title: document.title,
      h1: heading?.innerText || '',
      h2: [...document.querySelectorAll('h2')].map(item => item.innerText.trim()).filter(Boolean),
      header: document.querySelector('header') ? rect(document.querySelector('header')) : null,
      h1Style: headingStyle ? { fontFamily: headingStyle.fontFamily, fontSize: headingStyle.fontSize, lineHeight: headingStyle.lineHeight, letterSpacing: headingStyle.letterSpacing } : null,
      imageCount: images.length,
      images,
      mediaRegions: regions,
      pageHeight: document.documentElement.scrollHeight,
      pageWidth: document.documentElement.scrollWidth,
    };
  });
}

function scrollPositions(viewport, pageHeight) {
  const maximum = Math.max(0, pageHeight - viewport.height);
  const stride = Math.max(240, Math.round(viewport.height * 0.8));
  const positions = [0];
  for (let y = stride; y < maximum; y += stride) positions.push(y);
  if (maximum > 0 && positions.at(-1) !== maximum) positions.push(maximum);
  return positions;
}

async function scrollCapture(page, positions) {
  const captures = [];
  for (const y of positions) {
    let current = await page.evaluate(() => Math.round(scrollY));
    while (current < y) {
      current = Math.min(y, current + 180);
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), current);
      await delay(35);
    }
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
    await delay(1100);
    const buffer = await page.screenshot({ caret: 'hide' });
    const actualY = await page.evaluate(() => Math.round(scrollY));
    captures.push({ y: actualY, requestedY: y, buffer });
  }
  return captures;
}

async function comparePair(name, localBuffer, referenceBuffer, viewport) {
  const localPath = path.join(outputDir, `${name}-local.webp`);
  const referencePath = path.join(outputDir, `${name}-reference.webp`);
  const overlayPath = path.join(outputDir, `${name}-overlay.webp`);
  const differencePath = path.join(outputDir, `${name}-difference.webp`);
  await sharp(localBuffer).webp({ quality: 88, effort: 4 }).toFile(localPath);
  await sharp(referenceBuffer).webp({ quality: 88, effort: 4 }).toFile(referencePath);
  await sharp(localBuffer).composite([{ input: referenceBuffer, blend: 'over', opacity: 0.5 }]).webp({ quality: 88, effort: 4 }).toFile(overlayPath);
  const diff = sharp(localBuffer).composite([{ input: referenceBuffer, blend: 'difference' }]).webp({ quality: 88, effort: 4 });
  const diffInfo = await diff.toFile(differencePath);
  const a = await sharp(localBuffer).removeAlpha().raw().toBuffer();
  const b = await sharp(referenceBuffer).removeAlpha().raw().toBuffer();
  let total = 0;
  let changed = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 3) {
    const delta = (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 3;
    total += delta;
    if (delta >= 24) changed++;
  }
  const pixels = Math.min(a.length, b.length) / 3;
  return {
    name,
    viewport: `${viewport.width}×${viewport.height}`,
    meanAbsoluteChannelDifference: Number((total / pixels).toFixed(2)),
    pixelsWithAverageDeltaAtLeast24Percent: Number((100 * changed / pixels).toFixed(2)),
    differenceImageBytes: diffInfo.size,
    local: path.relative(root, localPath).replaceAll('\\', '/'),
    reference: path.relative(root, referencePath).replaceAll('\\', '/'),
    overlay: path.relative(root, overlayPath).replaceAll('\\', '/'),
    difference: path.relative(root, differencePath).replaceAll('\\', '/'),
  };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  let server;
  let browser;
  let ownsServer = false;
  try {
    try {
      const response = await fetch(localUrl, { signal: AbortSignal.timeout(1500) });
      if (!response.ok) throw new Error(`local server responded ${response.status}`);
    } catch {
      const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
      server = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { cwd: root, stdio: 'ignore', windowsHide: true });
      ownsServer = true;
      let ready = false;
      for (let attempt = 0; attempt < 40; attempt++) {
        try {
          const response = await fetch(localUrl, { signal: AbortSignal.timeout(1000) });
          ready = response.ok;
          if (ready) break;
        } catch {}
        await delay(250);
      }
      if (!ready) throw new Error('Could not start the local Vite preview on port 4173. Run npm run build first.');
    }

    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const rows = [];
    const audits = [];
    const work = [
      ...viewportSet.map(viewport => ({ route: '/', name: 'home', viewport, scroll: false })),
      ...primaryPages.flatMap(([name, referencePath, localPath]) => [
        { route: referencePath, localPath, name, viewport: { width: 1440, height: 900 }, scroll: true },
        { route: referencePath, localPath, name, viewport: { width: 390, height: 844 }, scroll: true },
      ]),
    ];

    for (const item of work) {
      const viewport = item.viewport;
      const reference = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
      const local = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
      const referenceStatus = await visit(reference, `${referenceUrl}${item.route}`);
      const localStatus = await visit(local, `${localUrl}${item.localPath || item.route}`);
      if (referenceStatus < 200 || referenceStatus >= 400 || localStatus < 200 || localStatus >= 400) {
        rows.push({ name: item.name, viewport: `${viewport.width}×${viewport.height}`, referenceStatus, localStatus, error: 'A page did not return a successful response.' });
        await reference.close();
        await local.close();
        continue;
      }
      const [referenceAudit, localAudit] = await Promise.all([inspectPage(reference), inspectPage(local)]);
      const captureName = `${item.name}-${viewport.width}x${viewport.height}`;
      const positions = item.scroll
        ? scrollPositions(viewport, Math.max(referenceAudit.pageHeight, localAudit.pageHeight))
        : [0];
      audits.push({
        name: captureName,
        viewport: `${viewport.width}×${viewport.height}`,
        referenceRoute: item.route,
        localRoute: item.localPath || item.route,
        reference: referenceAudit,
        local: localAudit,
      });
      const referenceShots = await scrollCapture(reference, positions);
      const localShots = await scrollCapture(local, positions);
      for (let i = 0; i < Math.min(referenceShots.length, localShots.length); i++) {
        const state = i === 0 ? 'top' : `scroll-${referenceShots[i].requestedY}`;
        const name = `${captureName}-${state}`;
        rows.push({
          ...(await comparePair(name, localShots[i].buffer, referenceShots[i].buffer, viewport)),
          localScrollY: localShots[i].y,
          referenceRoute: item.route,
          localRoute: item.localPath || item.route,
          referenceStatus,
          localStatus,
          scrollY: referenceShots[i].y,
        });
      }
      await reference.close();
      await local.close();
      process.stdout.write(`Captured ${item.name} at ${viewport.width}×${viewport.height}\n`);
    }

    const report = {
      capturedAt: new Date().toISOString(),
      reference: referenceUrl,
      local: localUrl,
      note: 'Difference values include expected changes in imagery, page copy, and branding. They are a screening aid, not a pass/fail fidelity score. Read docs/reference-audit.md for manual review context.',
      viewportCoverage: viewportSet.map(v => `${v.width}×${v.height}`),
      audits,
      captures: rows,
    };
    await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    const markdown = [
      '# Visual comparison capture',
      '',
      `Captured: ${report.capturedAt}`, '',
      `Reference: ${referenceUrl}`, '',
      `Local: ${localUrl}`, '',
      'The automated difference metric includes intentional content and original-image changes; use overlays for geometric review. See [reference-audit.md](../../docs/reference-audit.md).', '',
      '| Page / state | Viewport | Mean pixel delta | Changed pixels | Images |',
      '|---|---:|---:|---:|---|',
      ...rows.map(row => row.error
        ? `| ${row.name} | ${row.viewport} | — | — | Failed: HTTP ${row.referenceStatus}/${row.localStatus} |`
        : `| ${row.name} | ${row.viewport} | ${row.meanAbsoluteChannelDifference} | ${row.pixelsWithAverageDeltaAtLeast24Percent}% | [overlay](${path.basename(row.overlay)}), [difference](${path.basename(row.difference)}) |`),
      '',
      'Source screenshots are saved beside each overlay and difference image. Filenames include route, viewport, and scroll position. Long pages are compared at overlapping scroll intervals so each section is reviewed; the JSON report also records image counts, image sources, intrinsic dimensions, rendered boxes, headings, and page heights for both sites.',
      '',
    ].join('\n');
    await writeFile(path.join(outputDir, 'report.md'), markdown);
    process.stdout.write(`Saved ${rows.length} comparisons to ${path.relative(root, outputDir)}\n`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (ownsServer && server && !server.killed) server.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
