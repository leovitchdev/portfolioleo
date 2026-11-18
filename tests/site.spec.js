import { test, expect } from '@playwright/test';

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

const primaryRoutes = ['/', '/about', '/services', '/projects', '/blogs', '/pricing', '/contact'];
const detailRoutes = [
  ...['web-development','full-stack-development','ecommerce-marketplaces','ai-agents-automation','software-web-applications','ui-ux-digital-design','creative-development','digital-content-branding'].map(slug => `/services/${slug}`),
  ...['commerce-experience','care-portal','delivery-dashboard','audio-discovery','digital-signage','spatial-gallery','insight-dashboard','creative-workspace','everyday-mobile'].map(slug => `/projects/${slug}`),
  ...['vanilla-javascript-project-structure','full-stack-architecture','reliable-ai-workflows','ecommerce-user-journeys','useful-microinteractions','web-performance-layout-stability'].map(slug => `/blogs/${slug}`),
  '/pricing/website-development', '/pricing/web-application', '/pricing/custom-digital-solutions',
  '/404', '/a-route-that-does-not-exist',
];

test('primary pages render without horizontal overflow at all reference viewports', async ({ page }) => {
  for (const viewport of viewportSet) {
    await page.setViewportSize(viewport);
    for (const route of primaryRoutes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} at ${viewport.width}px`).toBe(200);
      await expect(page.locator('main h1').first(), `${route} at ${viewport.width}px`).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow, `${route} overflows at ${viewport.width}×${viewport.height}`).toBe(false);
    }
  }
});

test('all published detail routes load directly and have a useful heading', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of detailRoutes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('main h1').first(), route).toBeVisible();
    const cover = route.startsWith('/services/')
      ? page.locator('.service-cover__image')
      : route.startsWith('/projects/')
        ? page.locator('.project-detail-cover__image')
        : route.startsWith('/blogs/')
          ? page.locator('.article-cover .article-art__image')
          : null;
    if (cover) {
      await expect(cover).toHaveCount(1);
      await cover.evaluate(image => { image.loading = 'eager'; });
      await expect.poll(() => cover.evaluate(image => image.complete && image.naturalWidth > 0), route).toBe(true);
    }
  }
  await page.goto('/a-route-that-does-not-exist');
  await expect(page.locator('.not-found')).toBeVisible();
  await expect(page.locator('.not-found h1')).toContainText('HERE');
});

test('mobile navigation, feature tabs, project slider, pricing focus, and FAQ work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.locator('[data-menu-toggle]');
  const mobileMenu = page.locator('[data-mobile-navigation]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(mobileMenu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(mobileMenu).toBeHidden();

  await page.getByRole('tab', { name: 'Build for change' }).click();
  await expect(page.getByRole('tab', { name: 'Build for change' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('easier to maintain, extend, and connect');

  const track = page.locator('#project-track');
  await page.getByRole('button', { name: 'Next concepts' }).click();
  await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);

  await page.goto('/pricing');
  await page.getByRole('button', { name: 'Web Application' }).click();
  await expect(page.locator('[data-pricing-status]')).toContainText('Web Application');
  await expect(page.locator('[data-offer-card="web-application"]')).toHaveClass(/is-selected/);
  await page.locator('.faq-list summary').first().click();
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '');
});

test('desktop Pages dropdown opens and closes with its native summary control', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const trigger = page.locator('.nav-dropdown summary');
  const panel = page.locator('.nav-dropdown__panel');
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blogs');
  await trigger.click();
  await expect(panel).toBeHidden();
});

test('service rows expand on hover or keyboard focus and projects reveal the reference hover affordance', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const serviceRow = page.locator('.service-row').first();
  const detail = serviceRow.locator('.service-row__detail');
  await serviceRow.scrollIntoViewIfNeeded();
  await expect(detail).toHaveCSS('opacity', '0');
  await serviceRow.hover();
  await expect(serviceRow).toHaveCSS('background-color', 'rgb(251, 234, 105)');
  await expect.poll(() => detail.evaluate(element => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.9);

  let rowFocused = await serviceRow.evaluate(element => element === document.activeElement);
  for (let step = 0; step < 48 && !rowFocused; step += 1) {
    await page.keyboard.press('Tab');
    rowFocused = await serviceRow.evaluate(element => element === document.activeElement);
  }
  expect(rowFocused).toBe(true);

  await page.goto('/projects');
  const card = page.locator('.project-card').first();
  await card.evaluate(element => element.scrollIntoView({ block: 'center' }));
  await expect.poll(() => card.evaluate(element => getComputedStyle(element).visibility)).toBe('visible');
  await card.hover();
  await expect.poll(() => card.locator('.project-photo__image').evaluate(element => getComputedStyle(element).transform)).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await expect.poll(() => card.locator('.project-hover-button').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
});

test('every article has a loaded editorial cover and article pages expose it in social metadata', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/blogs');
  await page.locator('.article-art__image').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await expect(page.locator('.article-art__image')).toHaveCount(6);
  await page.waitForFunction(() => [...document.querySelectorAll('.article-art__image')].every(image => image.complete && image.naturalWidth > 0));

  await page.goto('/blogs/vanilla-javascript-project-structure');
  await expect.poll(() => page.locator('.article-cover .article-art__image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/images\/articles\/blog-code\.webp$/);
});

test('project, service, and article galleries use distinct loaded photographic assets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects');
  const projectImages = page.locator('.project-photo__image');
  await expect(projectImages).toHaveCount(9);
  await projectImages.evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('.project-photo__image')].every(image => image.complete && image.naturalWidth > 0));
  const projectSources = await projectImages.evaluateAll(images => images.map(image => new URL(image.currentSrc).pathname));
  expect(new Set(projectSources).size).toBe(9);

  await page.goto('/services');
  const serviceImages = page.locator('.service-card__image img');
  await expect(serviceImages).toHaveCount(8);
  await serviceImages.evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('.service-card__image img')].every(image => image.complete && image.naturalWidth > 0));
  const serviceSources = await serviceImages.evaluateAll(images => images.map(image => new URL(image.currentSrc).pathname));
  expect(new Set(serviceSources).size).toBe(8);
});

test('contact form validates input and never reports an unconfirmed delivery as sent', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/contact');
  await page.getByLabel('Prénom').fill('Alex');
  await page.getByLabel('Nom').fill('Example');
  await page.getByLabel('Adresse e-mail').fill('alex@example.test');
  await page.getByLabel('Message').fill('Vérification locale de la configuration d’envoi.');
  await page.getByRole('button', { name: /Envoyer le message/ }).click();
  await expect(page.locator('#contact-fallback')).toBeVisible();
  await expect(page.locator('#contact-status')).not.toHaveText('Votre message a été envoyé. Merci de m’avoir écrit.');
});

test('internal links resolve, contact links are actionable, and browser assets load cleanly', async ({ page, baseURL }) => {
  const pageErrors = [];
  const localRequestFailures = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    if (request.url().startsWith(baseURL)) localRequestFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
  });

  const internalLinks = new Set();
  for (const route of primaryRoutes) {
    await page.goto(route);
    const anchors = await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.href));
    for (const href of anchors) {
      const url = new URL(href);
      if (url.origin === baseURL) internalLinks.add(`${url.pathname}${url.search}`);
      else expect(['https:', 'mailto:', 'tel:'], href).toContain(url.protocol);
    }
    await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    const brokenImages = await page.locator('img').evaluateAll(images => images.filter(img => img.getAttribute('src')?.startsWith('/') && img.naturalWidth === 0).map(img => img.src));
    expect(brokenImages, `broken local images on ${route}`).toEqual([]);
  }

  for (const href of internalLinks) {
    const response = await page.goto(href);
    expect(response?.status(), href).toBe(200);
    const heading = page.locator('main h1').first();
    await expect(heading, href).toBeVisible();
    await expect(heading, href).not.toContainText(/not found|404/i);
  }

  expect(await page.locator('a[href="mailto:tleovitch2@gmail.com"]').count()).toBeGreaterThan(0);
  expect(await page.locator('a[href="tel:+50943300624"]').count()).toBeGreaterThan(0);
  expect(pageErrors).toEqual([]);
  expect(localRequestFailures).toEqual([]);
});

test('keyboard focus and hover feedback remain visible on the primary action', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.locator('.skip-link');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS('outline-width', '2px');

  const action = page.locator('.header-cta');
  await action.hover();
  await expect.poll(() => action.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
});
