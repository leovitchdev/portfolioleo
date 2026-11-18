import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const route = process.argv[2] || '/';
  const response = await page.goto(`https://wondr-agency.webflow.io${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await delay(500);
  const inspect = async label => {
    const state = await page.evaluate(label => ({
      label,
      url: location.href,
      h1: [...document.querySelectorAll('h1')].map(item => ({ text: item.innerText, font: getComputedStyle(item).fontFamily, size: getComputedStyle(item).fontSize, box: item.getBoundingClientRect().toJSON() })),
      elements: [...document.querySelectorAll('h1,h2,section,img,video')].filter(item => {
        const box = item.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      }).slice(0, 24).map(item => ({ tag: item.tagName, className: typeof item.className === 'string' ? item.className : '', text: item.tagName.match(/^H/) ? item.innerText.slice(0, 100) : '', opacity: getComputedStyle(item).opacity, visibility: getComputedStyle(item).visibility, box: item.getBoundingClientRect().toJSON(), src: item.currentSrc || '' })),
    }), label);
    process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
  };
  process.stdout.write(`HTTP=${response?.status()}\n`);
  await inspect('initial');
  for (let y = 0; y <= 1800; y += 180) {
    await page.evaluate(top => window.scrollTo(0, top), y);
    await delay(100);
  }
  await delay(1300);
  await inspect('stepped-scroll');
  await page.screenshot({ path: `screenshots/comparison/probe-${route.replaceAll('/', '-') || 'home'}.png` });
} finally {
  await browser.close();
}
