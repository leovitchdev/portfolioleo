import { test, expect } from '@playwright/test';

const viewportSet = [
  { width: 280, height: 653 },
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 640, height: 360 },
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
const allRoutes = [...new Set([...primaryRoutes, ...detailRoutes])];

test('every page fits all reference viewports and its mobile images load', async ({ page }) => {
  test.setTimeout(300_000);
  for (const viewport of viewportSet) {
    await page.setViewportSize(viewport);
    for (const route of allRoutes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} at ${viewport.width}px`).toBe(200);
      await expect(page.locator('main h1').first(), `${route} at ${viewport.width}px`).toBeVisible();
      if (viewport.width <= 430) {
        await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
        await page.waitForFunction(() => [...document.images].every(image => image.complete));
      }
      const metrics = await page.evaluate(() => {
        const cta = document.querySelector('.hero__content .button');
        const hero = document.querySelector('.hero');
        const ticker = document.querySelector('.hero-ticker');
        const ctaRect = cta?.getBoundingClientRect();
        const heroRect = hero?.getBoundingClientRect();
        const tickerRect = ticker?.getBoundingClientRect();
        const images = [...document.images].map(image => {
          const rect = image.getBoundingClientRect();
          return { src: image.currentSrc || image.src, loaded: image.complete && image.naturalWidth > 0, width: rect.width, height: rect.height };
        });
        const width = document.documentElement.clientWidth;
        return {
          overflow: document.documentElement.scrollWidth > width + 1,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: width,
          overflowingElements: [...document.body.querySelectorAll('*')].map(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {tag: element.tagName, className: typeof element.className === 'string' ? element.className : '', right: Math.round(rect.right), width: Math.round(rect.width), overflowX: style.overflowX};
          }).filter(element => element.right > width + 1 && !['auto','scroll','hidden','clip'].includes(element.overflowX)).slice(0, 10),
          ctaOverlapsTicker: !!ctaRect && !!tickerRect && ctaRect.bottom > tickerRect.top + 1,
          ctaOutsideHero: !!ctaRect && !!heroRect && ctaRect.bottom > heroRect.bottom + 1,
          ctaBottom: ctaRect ? Math.round(ctaRect.bottom) : null,
          tickerTop: tickerRect ? Math.round(tickerRect.top) : null,
          heroBottom: heroRect ? Math.round(heroRect.bottom) : null,
          imageProblems: images.filter(image => !image.loaded || image.width < 1 || image.height < 1),
        };
      });
      expect(metrics.overflow, `${route} overflows at ${viewport.width}×${viewport.height}: ${JSON.stringify(metrics)}`).toBe(false);
      if (viewport.width <= 430) {
        expect(metrics.imageProblems, `bad images on ${route} at ${viewport.width}px`).toEqual([]);
      }
      if (route === '/' && viewport.width <= 767) {
        expect(metrics.ctaOverlapsTicker, `home CTA is covered by the ticker at ${viewport.width}×${viewport.height}: ${JSON.stringify(metrics)}`).toBe(false);
        expect(metrics.ctaOutsideHero, `home CTA is clipped at ${viewport.width}×${viewport.height}: ${JSON.stringify(metrics)}`).toBe(false);
      }
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
  await expect(page.locator('.not-found h1')).toContainText('N’EXISTE PAS');
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

  await page.getByRole('tab', { name: 'Prévoir la suite' }).click();
  await expect(page.getByRole('tab', { name: 'Prévoir la suite' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('plus simple à maintenir, à faire évoluer');

  const track = page.locator('#project-track');
  await page.getByRole('button', { name: 'Concepts suivants' }).click();
  await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);

  await page.goto('/pricing');
  await page.getByRole('button', { name: 'Application web' }).click();
  await expect(page.locator('[data-pricing-status]')).toContainText('Application web');
  await expect(page.locator('[data-offer-card="web-application"]')).toHaveClass(/is-selected/);
  await page.locator('.faq-list summary').first().click();
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '');
});

test('home work section and concept images keep their design at desktop and mobile sizes', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const layout = await page.evaluate(() => {
      const image = document.querySelector('.profile-image-wrap').getBoundingClientRect();
      const content = document.querySelector('.profile-content').getBoundingClientRect();
      const photo = document.querySelector('.project-track .project-photo').getBoundingClientRect();
      return {
        imageX: image.x,
        imageY: image.y,
        contentX: content.x,
        contentY: content.y,
        photoRatio: photo.width / photo.height,
      };
    });
    expect(layout.photoRatio).toBeCloseTo(0.77, 2);
    if (viewport.width < 768) {
      expect(layout.contentY).toBeLessThan(layout.imageY);
    } else {
      expect(layout.imageX).toBeLessThan(layout.contentX);
    }
  }
});

test('desktop Pages dropdown opens and closes with its native summary control', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const trigger = page.locator('.nav-dropdown summary');
  const panel = page.locator('.nav-dropdown__panel');
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/blogs');
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

  await serviceRow.focus();
  await expect(serviceRow).toBeFocused();

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
  await page.locator('#first-name').fill('Alex');
  await page.locator('#last-name').fill('Example');
  await page.locator('#email').fill('alex@example.test');
  await page.locator('#message').fill('Vérification locale de la configuration d’envoi.');
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
