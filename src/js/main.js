import '../css/main.css';
import { services } from '../data/services.js';
import { projects } from '../data/projects.js';
import { articles } from '../data/articles.js';
import { initNavigation } from './navigation.js';
import { initMotion } from './animations.js';
import { initContactForm } from './contact.js';

const app = document.querySelector('#app');
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const githubPagesRouteKey = 'leo-dev:github-pages-route';

function normalizePath(value) {
  if (!value || value === '/') return '/';
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return '/404';
  }
  return `/${decoded.replace(/^\/+|\/+$/g, '')}`;
}

function sitePath(value) {
  if (!value?.startsWith('/') || value.startsWith('//') || !basePath) return value;
  if (value === basePath || value.startsWith(`${basePath}/`)) return value;
  return `${basePath}${value}`;
}

function currentRoutePath() {
  try {
    const savedRoute = sessionStorage.getItem(githubPagesRouteKey);
    if (savedRoute) {
      sessionStorage.removeItem(githubPagesRouteKey);
      const original = JSON.parse(savedRoute);
      let originalPath = original.path || '/';
      if (basePath && (originalPath === basePath || originalPath.startsWith(`${basePath}/`))) {
        originalPath = originalPath.slice(basePath.length) || '/';
      }
      const restoredUrl = `${sitePath(normalizePath(originalPath))}${original.search || ''}${original.hash || ''}`;
      window.history.replaceState(null, '', restoredUrl);
    }
  } catch {
    try { sessionStorage.removeItem(githubPagesRouteKey); } catch {}
  }

  let pathname = window.location.pathname;
  if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    pathname = pathname.slice(basePath.length) || '/';
  }
  return normalizePath(pathname);
}

const path = currentRoutePath();

function applyBasePathToRenderedPage() {
  if (!basePath) return;
  document.querySelectorAll('[href], [src], [srcset], [action]').forEach(element => {
    for (const attribute of ['href', 'src', 'action']) {
      const value = element.getAttribute(attribute);
      if (value?.startsWith('/') && !value.startsWith('//')) element.setAttribute(attribute, sitePath(value));
    }
    const srcset = element.getAttribute('srcset');
    if (srcset) {
      element.setAttribute('srcset', srcset.split(',').map(candidate => {
        const [url, ...descriptor] = candidate.trim().split(/\s+/);
        return [sitePath(url), ...descriptor].join(' ');
      }).join(', '));
    }
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function arrowIcon(direction = 'right') {
  const rotate = direction === 'left' ? 'rotate(180 12 12)' : direction === 'up' ? 'rotate(-45 12 12)' : '';
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g transform="${rotate}"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
}

function serviceIcon(name) {
  const shapes = {
    window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    cart: '<path d="M3 4h2l2.4 11.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
    dashboard: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
    cursor: '<path d="m5 3 14 9-7 1.2L9 20 5 3Z"/><path d="m12 13 4 7"/>',
    motion: '<path d="M4 16c3-8 6-8 8 0s5 8 8 0"/><path d="M4 8c3-4 6-4 8 0s5 4 8 0"/>',
    pen: '<path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z"/><path d="m14.8 5.7 3.5 3.5M4 21h16"/>',
  };
  return `<svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${shapes[name] || shapes.window}</svg>`;
}

const navItems = [
  { label: 'Accueil', href: '/', key: 'home' },
  { label: 'À propos', href: '/about', key: 'about' },
  { label: 'Services', href: '/services', key: 'services' },
  { label: 'Projets', href: '/projects', key: 'projects' },
];

function header(active = '') {
  const link = item => `<a class="nav-link${active === item.key ? ' is-active' : ''}" href="${item.href}"${active === item.key ? ' aria-current="page"' : ''}>${item.label}</a>`;
  return `
    <header class="site-header" data-site-header>
      <div class="header-inner">
        <a class="brand" href="/" aria-label="LEO DEV — Accueil"><span>LEO</span><span class="brand__dot">.</span><span class="brand__small">DEV</span></a>
        <nav class="desktop-nav" aria-label="Navigation principale">
          ${navItems.map(link).join('')}
          <details class="nav-dropdown">
            <summary class="nav-link${['blogs', 'pricing'].includes(active) ? ' is-active' : ''}">Plus ${arrowIcon('right')}</summary>
            <div class="nav-dropdown__panel">
              <a href="/blogs">Journal</a><a href="/pricing">Tarifs</a><a href="/contact">Contact</a>
            </div>
          </details>
        </nav>
        <div class="header-actions">
          <a class="button button--yellow header-cta" href="/contact">Parlons de votre projet ${arrowIcon()}</a>
          <button class="menu-toggle" type="button" aria-label="Ouvrir le menu de navigation" aria-expanded="false" aria-controls="mobile-navigation" data-menu-toggle>
            <span></span><span></span>
          </button>
        </div>
      </div>
      <nav class="mobile-nav" id="mobile-navigation" aria-label="Navigation mobile" hidden data-mobile-navigation>
        ${[...navItems, { label: 'Journal', href: '/blogs', key: 'blogs' }, { label: 'Tarifs', href: '/pricing', key: 'pricing' }, { label: 'Contact', href: '/contact', key: 'contact' }].map(item => `<a href="${item.href}"${active === item.key ? ' aria-current="page"' : ''}>${item.label}<span>${arrowIcon()}</span></a>`).join('')}
      </nav>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-intro">
          <a class="brand brand--footer" href="/" aria-label="LEO DEV — Accueil"><span>LEO</span><span class="brand__dot">.</span><span class="brand__small">DEV</span></a>
          <p>Du code à l’impact.<br />Des créations numériques réfléchies, façonnées pour celles et ceux qui les utilisent.</p>
          <div class="footer-contact">
            <h2>Contact</h2>
            <a href="mailto:tleovitch2@gmail.com">tleovitch2@gmail.com</a>
            <a href="tel:+50943300624">+509 43 30 0624</a>
          </div>
        </div>
        <div class="footer-links">
          <div><h2>Découvrir</h2><a href="/">Accueil</a><a href="/about">À propos</a><a href="/services">Services</a><a href="/projects">Projets</a></div>
          <div><h2>Explorer</h2><a href="/blogs">Journal</a><a href="/pricing">Tarifs</a><a href="/contact">Contact</a></div>
          <div><h2>Services</h2><a href="/services/web-development">Développement web</a><a href="/services/ai-agents-automation">IA et automatisation</a><a href="/services/ui-ux-digital-design">Conception UX/UI</a></div>
        </div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} LEO DEV · Leo Vitch · Haïti</span><a href="/contact">Démarrer une conversation ${arrowIcon()}</a></div>
    </footer>`;
}

function pageShell(active, content, pageClass = '') {
  app.innerHTML = `${header(active)}${content}${footer()}`;
  document.body.className = `min-h-screen bg-white text-ink antialiased ${pageClass}`;
  initNavigation();
  initMotion();
  initContactForm();
  initCarousels();
  initTabs();
  initPricingFocus();
  setActiveLinks(active);
  applyBasePathToRenderedPage();
}

function setActiveLinks(active) {
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    const isActive = (active === 'home' && linkPath === '/') || (active !== 'home' && linkPath !== '/' && linkPath.split('/')[1] === active);
    if (isActive) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function setPageMeta(title, description, type = 'website', image = '/images/leo-portfolio-hero.webp') {
  document.title = `${title} | LEO DEV`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = description;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = document.title;
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = description;
  const ogType = document.querySelector('meta[property="og:type"]');
  if (ogType) ogType.content = type;
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.content = new URL(sitePath(image), window.location.origin).href;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = `${window.location.origin}${sitePath(path)}`;
}

function button(label, href, style = 'yellow') {
  return `<a class="button button--${style}" href="${href}">${label}<span>${arrowIcon()}</span></a>`;
}

function responsiveImage(folder, base, alt, { sizes = '100vw', width = 1536, height = 1024, className = '', loading = 'lazy' } = {}) {
  const path = `/images/${folder}/${base}`;
  return `<img${className ? ` class="${className}"` : ''} src="${sitePath(`${path}-card.webp`)}" srcset="${sitePath(`${path}-card.webp`)} 720w, ${sitePath(`${path}.webp`)} 1600w" sizes="${sizes}" width="${width}" height="${height}" alt="${escapeHtml(alt)}" loading="${loading}" decoding="async" />`;
}

function sectionHeading(eyebrow, title, copy = '') {
  return `<div class="section-heading" data-reveal><p class="eyebrow">${eyebrow}</p><h2 class="display-title">${title}</h2>${copy ? `<p class="section-heading__copy">${copy}</p>` : ''}</div>`;
}

function serviceRows(items) {
  return `<div class="service-list">${items.map((service, index) => `
    <a class="service-row" href="/services/${service.slug}" data-reveal aria-label="${escapeHtml(service.title)} — ${escapeHtml(service.short)}">
      <span class="service-row__number">${String(index + 1).padStart(2, '0')}</span>
      <span class="service-row__icon">${serviceIcon(service.icon)}</span>
      <span class="service-row__copy"><strong>${escapeHtml(service.title)}</strong><small class="service-row__short">${escapeHtml(service.short)}</small><span class="service-row__detail"><span>${escapeHtml(service.description)}</span><span class="service-row__includes">${service.includes.map(item => `<i>${escapeHtml(item)}</i>`).join('')}</span></span></span>
      <span class="round-arrow">${arrowIcon()}</span>
    </a>`).join('')}</div>`;
}

function conceptVisual(type) {
  if (type === 'commerce') return `
    <div class="preview-top"><span>OBJETS / QUOTIDIEN</span><span>MENU</span></div>
    <div class="preview-commerce"><p>L’ESSENTIEL AU QUOTIDIEN</p><div class="preview-commerce__hero"><strong>Pensé pour<br />le quotidien.</strong><span>VOIR LA COLLECTION ${arrowIcon()}</span></div><div class="preview-products"><i></i><i></i><i></i></div></div>`;
  if (type === 'care') return `
    <div class="preview-top"><span>SOINS / PORTAIL</span><span>CONCEPT</span></div>
    <div class="preview-care"><aside><b>APERÇU</b><span>Rendez-vous</span><span>Services</span><span>Renseignements</span></aside><div><small>VOTRE PROCHAINE ÉTAPE</small><strong>Préparer une visite<br />en toute clarté.</strong><div class="preview-care__line"></div><div class="preview-care__button">VOIR LES OPTIONS DE RENDEZ-VOUS</div></div></div>`;
  return `
    <div class="preview-top preview-top--dark"><span>LIVRAISONS / APERÇU</span><span>DONNÉES DE DÉMO</span></div>
    <div class="preview-delivery"><div class="preview-delivery__sidebar"><i></i><i></i><i></i><i></i></div><div class="preview-delivery__main"><small>OPÉRATIONS DU JOUR</small><strong>Suivi des livraisons</strong><div class="preview-stat-grid"><i></i><i></i><i></i></div><div class="preview-table"><i></i><i></i><i></i><i></i></div></div></div>`;
}

function projectCard(project, index = 0) {
  return `<a class="project-card project-card--${project.visual}" href="/projects/${project.slug}" data-reveal>
    <div class="project-photo project-photo--${project.visual}">${responsiveImage('projects', project.cover, `Image illustrative du concept « ${project.title} » — ${project.category}`, { sizes: '(max-width: 767px) 88vw, (max-width: 980px) 42vw, 30vw', width: 1448, height: 1084, className: 'project-photo__image' })}<span class="preview-label">Visuel illustratif · concept</span><span class="project-hover-button">${arrowIcon()}</span></div>
    <div class="project-card__meta"><span>${project.category}</span><span>${String(index + 1).padStart(2, '0')}</span></div>
    <h3>${project.title}</h3><p>${project.summary}</p>
  </a>`;
}

function articleArt(article) {
  return `<div class="article-art article-art--${article.cover}">${responsiveImage('articles', article.cover, `Photo éditoriale pour l’article « ${article.title} » sur ${article.category}`, { sizes: '(max-width: 767px) 88vw, (max-width: 980px) 45vw, 31vw', width: 1536, height: 1024, className: 'article-art__image' })}<span class="article-art__label">LEO DEV · NOTES</span><b class="article-art__category">${escapeHtml(article.category)}</b></div>`;
}

function articleCard(article) {
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${article.date}T12:00:00Z`));
  return `<a class="article-card" href="/blogs/${article.slug}" data-reveal>
    ${articleArt(article)}
    <div class="article-card__meta"><span>${date}</span><span>${article.readTime}</span></div>
    <h2>${article.title}</h2><p>${article.summary}</p><span class="text-link">Lire l’article ${arrowIcon()}</span>
  </a>`;
}

function homePage() {
  const coreServices = services.slice(0, 4);
  const introTabs = [
    { title: 'Partir du vrai besoin', text: 'Chaque projet commence par son objectif, son public et la tâche qu’il doit simplifier.' },
    { title: 'Penser l’expérience entière', text: 'La structure et les choix visuels s’accordent pour rendre l’interface claire avant qu’elle ne se complexifie.' },
    { title: 'Prévoir la suite', text: 'Une solution bien pensée est plus simple à maintenir, à faire évoluer et à relier aux autres outils.' },
  ];
  const content = `
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <img class="hero__image" src="/images/leo-portfolio-hero.webp" width="1672" height="941" alt="Portrait éditorial de Leo Vitch dans un studio de création numérique." fetchpriority="high" />
        <div class="hero__shade"></div>
        <div class="hero__content">
          <p class="eyebrow hero__eyebrow">DÉVELOPPEUR FULL-STACK · CRÉATEUR NUMÉRIQUE</p>
          <h1 class="hero__title" id="hero-title"><span class="hero-title__desktop">DES IDÉES NUMÉRIQUES QUI<br />FONT AVANCER LES CHOSES</span><span class="hero-title__tablet">DES IDÉES QUI FONT<br />AVANCER LES CHOSES</span><span class="hero-title__mobile">DES IDÉES<br />QUI FONT AVANCER<br />LES CHOSES</span></h1>
          <p class="hero__copy">Je transforme des idées ambitieuses en sites utiles, applications réfléchies et parcours numériques connectés, pour rendre les tâches complexes plus claires au quotidien.</p>
          ${button('Parlons de votre projet', '/contact')}
        </div>
        <a class="hero__scroll" href="#intro">Défiler pour découvrir <span>↓</span></a>
        <div class="hero-ticker" aria-label="Développement web, produits numériques, automatisation et expériences interactives">
          <div class="hero-ticker__track"><span>Développement web</span><i></i><span>Produits numériques</span><i></i><span>Automatisation</span><i></i><span>Expériences interactives</span><i></i><span>Développement web</span><i></i><span>Produits numériques</span><i></i><span>Automatisation</span><i></i><span>Expériences interactives</span></div>
        </div>
      </section>

      <section class="section intro-section" id="intro">
        <div class="content-width">
          <p class="eyebrow" data-reveal>LEO VITCH · HAÏTI</p>
          <h2 class="intro-title" data-reveal>JE CRÉE DES EXPÉRIENCES NUMÉRIQUES QUI DONNENT VIE AUX IDÉES.</h2>
          <div class="intro-layout">
            <p class="intro-layout__lead" data-reveal>Développement full-stack, design numérique et automatisation réunis autour des personnes qui utiliseront le résultat.</p>
            <p data-reveal>Je travaille sur des sites, applications web, boutiques en ligne, tableaux de bord et flux automatisés. Chaque projet part de ses besoins concrets et prend forme par un design et un développement réfléchis.</p>
          </div>
        </div>
      </section>

      <section class="section profile-section" aria-label="Ma démarche de création numérique">
        <div class="profile-image-wrap" data-reveal><img src="/images/developer-workspace.webp" width="1122" height="1402" loading="lazy" alt="Scène illustrative d’un espace de travail numérique, sans représenter Leo Vitch." /></div>
        <div class="profile-content">
          <p class="eyebrow" data-reveal>MA FAÇON DE TRAVAILLER</p>
          <div class="feature-tabs" data-tabset>
            ${introTabs.map((tab, index) => `<button class="feature-tab${index === 0 ? ' is-selected' : ''}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="feature-panel-${index}" id="feature-tab-${index}" data-tab-trigger="${index}"><span class="feature-tab__title">${tab.title}</span><span class="round-arrow">${arrowIcon()}</span></button>`).join('')}
          </div>
          ${introTabs.map((tab, index) => `<div class="feature-panel" role="tabpanel" id="feature-panel-${index}" aria-labelledby="feature-tab-${index}"${index !== 0 ? ' hidden' : ''} data-tab-panel="${index}"><p>${tab.text}</p><a class="text-link" href="/about">Découvrir ma démarche ${arrowIcon()}</a></div>`).join('')}
        </div>
      </section>

      <section class="section services-section" id="services">
        <div class="content-width">
          ${sectionHeading('MES SERVICES', 'STRATÉGIE, DESIGN ET DÉVELOPPEMENT RÉUNIS.', 'Des solutions numériques adaptées aux objectifs, aux outils et aux personnes concernés.')}
          ${serviceRows(coreServices)}
          <div class="home-service-gallery" aria-label="Aperçu visuel des services LEO DEV">${coreServices.map(service => `<a href="/services/${service.slug}">${responsiveImage('services', service.cover, `Visuel illustratif pour le service ${service.title}`, { sizes: '(max-width: 767px) 78vw, 24vw', width: 1672, height: 941, className: 'home-service-gallery__image' })}<span>${escapeHtml(service.title)}</span>${arrowIcon()}</a>`).join('')}</div>
          <div class="section-end">${button('Voir tous les services', '/services', 'dark')}</div>
        </div>
      </section>

      <section class="section work-section" id="work">
        <div class="content-width">
          <div class="work-heading">${sectionHeading('CONCEPTS CHOISIS', 'DES INTERFACES PENSÉES POUR DES BESOINS CONCRETS.', 'Des concepts originaux de démonstration, et non des projets clients ou des produits lancés.')}
            <div class="carousel-controls"><button class="round-arrow" type="button" aria-label="Concepts précédents" data-carousel="project-track" data-direction="-1">${arrowIcon('left')}</button><button class="round-arrow" type="button" aria-label="Concepts suivants" data-carousel="project-track" data-direction="1">${arrowIcon()}</button></div>
          </div>
          <div class="project-track" id="project-track" aria-label="Exemples de concepts de projets">${projects.map(projectCard).join('')}</div>
          <div class="section-end">${button('Voir tous les projets', '/projects', 'dark')}</div>
        </div>
      </section>

      <section class="section home-studies" aria-labelledby="home-studies-title">
        <div class="content-width">
          <div class="home-studies__heading" id="home-studies-title">${sectionHeading('MA DÉMARCHE', 'DU PREMIER CROQUIS À UNE INTERFACE CLAIRE.', 'Des études illustratives montrent comment structure, écrans et détails s’assemblent.')}</div>
          <div class="home-studies__grid">
            <figure data-reveal>${responsiveImage('about', 'about-study-wireframes', 'Maquettes illustratives d’interface dessinées à la main', { sizes: '(max-width: 767px) 90vw, 46vw', className: 'home-studies__image' })}<figcaption>01 · STRUCTURER LA PAGE</figcaption></figure>
            <figure data-reveal>${responsiveImage('about', 'about-study-responsive', 'Maquettes illustratives affichées sur un ordinateur et un téléphone', { sizes: '(max-width: 767px) 90vw, 46vw', className: 'home-studies__image' })}<figcaption>02 · PENSER AU PETIT ÉCRAN</figcaption></figure>
            <figure data-reveal>${responsiveImage('about', 'about-study-journey', 'Cartographie illustrative d’un parcours utilisateur sur papier', { sizes: '(max-width: 767px) 90vw, 46vw', className: 'home-studies__image' })}<figcaption>03 · CLARIFIER LA SUITE</figcaption></figure>
            <figure data-reveal>${responsiveImage('about', 'about-study-system', 'Système de design numérique illustratif affiché sur une tablette', { sizes: '(max-width: 767px) 90vw, 46vw', className: 'home-studies__image' })}<figcaption>04 · AFFINER LE SYSTÈME</figcaption></figure>
          </div>
        </div>
      </section>

      <section class="section approach-section">
        <div class="content-width">
          ${sectionHeading('LES PRINCIPES', 'UN BON PROJET NUMÉRIQUE EST CLAIR, UTILE ET BIEN PENSÉ.')}
          <div class="principle-grid">
            <article class="principle-card" data-reveal><span>01</span><h3>La clarté d’abord</h3><p>Rendre l’objectif et la prochaine étape faciles à comprendre.</p></article>
            <article class="principle-card" data-reveal><span>02</span><h3>Le détail compte</h3><p>La typographie, le mouvement et les petits états définissent le ressenti.</p></article>
            <article class="principle-card" data-reveal><span>03</span><h3>Prévoir l’évolution</h3><p>Choisir des repères qui restent utiles quand le produit change.</p></article>
          </div>
        </div>
      </section>

      <section class="section home-scope-section" aria-labelledby="home-scope-title">
        <div class="content-width">
          <div class="section-heading" data-reveal><p class="eyebrow">TARIFS / SUR MESURE</p><h2 class="display-title" id="home-scope-title">UN PÉRIMÈTRE CLAIR POUR CHAQUE PROJET NUMÉRIQUE.</h2><p class="section-heading__copy">Choisissez un point de départ. Les fonctions, les délais et le devis sont définis selon le projet réel.</p></div>
          <div class="home-scope-grid">${offers.map(homeScopeCard).join('')}</div>
          <div class="section-end home-scope-end">${button('Parlons de votre projet', '/contact', 'dark')}</div>
        </div>
      </section>

      <section class="cta-band" aria-labelledby="cta-title">
        <img src="/images/leo-portfolio-hero.webp" width="1672" height="941" loading="lazy" alt="" />
        <div class="cta-band__shade"></div><div class="cta-band__content"><p class="eyebrow">UNE IDÉE EN TÊTE ?</p><h2 id="cta-title">CRÉONS QUELQUE CHOSE<br />D’UTILE.</h2>${button('Parlons de votre projet', '/contact')}</div>
      </section>
    </main>`;
  pageShell('home', content, 'page-home');
  setPageMeta('Du code à l’impact', 'Développement full-stack, design numérique et automatisation par Leo Vitch, créateur numérique indépendant en Haïti.');
  setPersonSchema();
}

function setPersonSchema() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Leo Vitch',
    alternateName: 'LEO DEV',
    jobTitle: 'Développeur web full-stack et créateur de solutions numériques',
    email: 'tleovitch2@gmail.com',
    telephone: '+509 43 30 0624',
    address: { '@type': 'PostalAddress', addressCountry: 'HT' },
    url: window.location.origin,
  });
  document.head.append(script);
}

function aboutPage() {
  const content = `
    <main id="main" class="inner-page">
      <section class="about-masthead">
        <div class="about-masthead__copy content-width"><h1 class="page-title" data-reveal>LA PERSONNE DERRIÈRE<br />LE TRAVAIL NUMÉRIQUE.</h1>
          ${button('Parlons de votre projet', '/contact')}
        </div>
        <figure class="about-masthead__image">${responsiveImage('about', 'leo-about-portrait', 'Portrait éditorial de Leo Vitch dans un studio lumineux.', { sizes: '100vw', width: 1672, height: 941, className: 'about-masthead__photo', loading: 'eager' })}</figure>
      </section>
      <section class="about-statement content-width"><p data-reveal>Je suis Leo Vitch, développeur full-stack et créateur numérique. Je réunis développement, design d’interface et automatisation pour transformer des idées en expériences utiles, claires et évolutives.</p></section>
      <section class="section about-story content-width">
        <div class="about-story__image" data-reveal><img src="/images/leo-portfolio-hero.webp" width="1672" height="941" loading="lazy" alt="Portrait éditorial de Leo Vitch dans son espace de travail." /></div>
        <div class="about-story__copy"><p class="eyebrow" data-reveal>TECHNOLOGIE · DESIGN · AUTOMATISATION</p><h2 class="display-title" data-reveal>PENSER AVEC CLARTÉ. CONSTRUIRE AVEC SOIN.</h2><p class="lead" data-reveal>Je suis Leo Vitch, développeur full-stack et créateur numérique. Je conçois des sites, des applications et des expériences automatisées.</p><p data-reveal>Je relie développement, design d’interface et flux numériques pour faire évoluer les idées en produits utiles. Mon travail part des objectifs du projet, et non d’une liste d’outils ou d’une méthode universelle.</p><p data-reveal>Qu’il s’agisse d’un site riche en contenu ou d’une plateforme sur mesure, je veille à la façon dont les personnes s’y orientent et à la facilité d’entretien du système après sa mise en ligne.</p></div>
      </section>
      <section class="section values-section"><div class="content-width">${sectionHeading('CE QUI GUIDE MON TRAVAIL', 'UNE BONNE SOLUTION S’ADAPTE AUX PERSONNES QUI L’UTILISENT.')}
        <div class="values-grid"><article data-reveal><span>01 / Comprendre</span><h3>Écouter avant de choisir un outil.</h3><p>Clarifier l’objectif, les contraintes et les personnes concernées.</p></article><article data-reveal><span>02 / Structurer</span><h3>Réunir structure et émotion.</h3><p>Faire de l’interface, du contenu et des interactions les parties d’une même solution.</p></article><article data-reveal><span>03 / Construire</span><h3>Prévoir ce qui vient ensuite.</h3><p>Garder un résultat lisible, adaptatif et simple à faire évoluer.</p></article></div>
      </div></section>
      <section class="about-practice content-width"><figure>${responsiveImage('about', 'about-process', 'Croquis d’interface et tablette illustrant un exercice de planification numérique', { sizes: '(max-width: 767px) 90vw, 58vw', className: 'about-practice__image' })}<figcaption>PLANIFICATION · TROUVER UN PARCOURS CLAIR</figcaption></figure><div><p class="eyebrow" data-reveal>UNE PRATIQUE INDÉPENDANTE</p><h2 class="display-title" data-reveal>UNE PERSONNE. UNE VISION NUMÉRIQUE CONNECTÉE.</h2><ul><li data-reveal><span>01</span><p>Partir du problème, des personnes et de l’objectif.</p></li><li data-reveal><span>02</span><p>Relier contenu, interface et logique du produit.</p></li><li data-reveal><span>03</span><p>Créer une expérience adaptative et facile à comprendre.</p></li></ul></div></section>
      <section class="about-visual-story content-width"><figure>${responsiveImage('about', 'about-creative', 'Étude visuelle illustrative préparée dans un atelier créatif', { sizes: '(max-width: 767px) 88vw, 48vw', className: 'about-visual-story__image' })}<figcaption>SYSTÈMES VISUELS · ÉTUDE DE CONCEPT</figcaption></figure><div><p class="eyebrow" data-reveal>DE L’IDÉE À L’INTERFACE</p><h2 class="display-title" data-reveal>RENDRE LE COMPLEXE PLUS ACCESSIBLE.</h2><p data-reveal>Un travail numérique utile demande à la fois de l’imagination et de la structure. Je les réunis par des parcours de page clairs, des interactions réfléchies et un développement qui peut évoluer avec le projet.</p>${button('Découvrir mes services', '/services', 'dark')}</div></section>
      <section class="about-build-story content-width"><div><p class="eyebrow" data-reveal>CONCEVOIR EN PENSANT AU DÉVELOPPEMENT</p><h2 class="display-title" data-reveal>LES DÉTAILS DOIVENT SERVIR L’ENSEMBLE.</h2><p data-reveal>Je porte attention aux choix qui façonnent l’expérience : la place du contenu, la réponse des interactions et la clarté du résultat sur chaque écran.</p></div><figure>${responsiveImage('about', 'about-build', 'Illustration d’un développeur travaillant sur une interface dans un studio éclairé par la lumière du jour', { sizes: '(max-width: 767px) 90vw, 50vw', className: 'about-build-story__image' })}<figcaption>INTERFACE · DÉVELOPPEMENT · AJUSTEMENTS</figcaption></figure></section>
      <section class="section about-capabilities content-width"><div><p class="eyebrow" data-reveal>DOMAINES D’INTERVENTION</p><h2 class="display-title" data-reveal>UNE PRATIQUE NUMÉRIQUE, PLUSIEURS PISTES UTILES.</h2></div><ul>${['Sites web et applications','Commerce en ligne et places de marché','Outils logiciels et tableaux de bord','IA et automatisation des flux','Conception UX/UI','Développement créatif et animation'].map((item,i)=>`<li data-reveal><span>${String(i+1).padStart(2,'0')}</span>${item}</li>`).join('')}</ul></section>
      <section class="section about-study-gallery" aria-labelledby="about-study-gallery-title">
        <div class="content-width">
          <div class="about-study-gallery__heading"><p class="eyebrow" data-reveal>LES DÉTAILS D’UNE PRATIQUE NUMÉRIQUE</p><h2 id="about-study-gallery-title" class="display-title" data-reveal>LES PETITS CHOIX FAÇONNENT TOUTE L’EXPÉRIENCE.</h2></div>
          <div class="about-study-gallery__grid">
            <figure data-reveal>${responsiveImage('about', 'about-study-wireframes', 'Maquettes d’interface dessinées à la main, en vue du dessus', { sizes: '(max-width: 767px) 92vw, 47vw', className: 'about-study-gallery__image' })}<figcaption>PLANIFICATION · LA PAGE AVANT LES PIXELS</figcaption></figure>
            <figure data-reveal>${responsiveImage('about', 'about-study-responsive', 'Maquettes d’interface sur un ordinateur portable et un téléphone', { sizes: '(max-width: 767px) 92vw, 47vw', className: 'about-study-gallery__image' })}<figcaption>DESIGN ADAPTATIF · DE L’ORDINATEUR AU MOBILE</figcaption></figure>
            <figure data-reveal>${responsiveImage('about', 'about-study-journey', 'Parcours utilisateur illustratif représenté sur papier', { sizes: '(max-width: 767px) 92vw, 47vw', className: 'about-study-gallery__image' })}<figcaption>PARCOURS UTILISATEUR · TROUVER LA SUITE</figcaption></figure>
            <figure data-reveal>${responsiveImage('about', 'about-study-system', 'Système de design numérique illustratif affiché sur une tablette', { sizes: '(max-width: 767px) 92vw, 47vw', className: 'about-study-gallery__image' })}<figcaption>SYSTÈME VISUEL · COULEUR, FORME ET HIÉRARCHIE</figcaption></figure>
          </div>
        </div>
      </section>
      <section class="about-photo-row" aria-label="Études visuelles dans plusieurs domaines numériques">${['project-architecture','project-audio','project-health'].map((cover,index)=>`<figure>${responsiveImage('projects', cover, ['Architecture illustrative pour un concept de plateforme culturelle','Portrait illustratif pour un concept de découverte audio','Clinique illustrative pour un concept d’interface de santé'][index], { sizes: '(max-width: 767px) 84vw, 30vw', className: 'about-photo-row__image' })}<figcaption>${['ESPACE ET ORIENTATION','PRODUIT ET RÉCIT','INFORMATION ET SOINS'][index]}</figcaption></figure>`).join('')}</section>
      <section class="about-principles content-width"><p class="eyebrow" data-reveal>COMMENT UNE IDÉE PREND FORME</p><div class="about-principles__list"><article data-reveal><span>01</span><h3>Comprendre</h3><p>Clarifier le public, le contenu et le rôle du produit.</p></article><article data-reveal><span>02</span><h3>Concevoir</h3><p>Définir une structure et une direction visuelle cohérentes.</p></article><article data-reveal><span>03</span><h3>Développer</h3><p>Créer les interactions et le système en pensant aux écrans.</p></article><article data-reveal><span>04</span><h3>Peaufiner</h3><p>Vérifier les détails, les cas particuliers et l’accessibilité.</p></article></div></section>
      <section class="section about-note content-width"><p class="eyebrow">À PROPOS DE CE PORTFOLIO</p><p>Ce site présente des concepts d’interface pour montrer une direction visuelle et front-end. Ils sont identifiés comme des concepts et ne représentent pas des mandats clients réalisés.</p></section>
      <section class="cta-band"><img src="/images/leo-portfolio-hero.webp" width="1672" height="941" loading="lazy" alt="" /><div class="cta-band__shade"></div><div class="cta-band__content"><p class="eyebrow">VOTRE PROJET, VOTRE CONTEXTE</p><h2>TROUVONS LA<br />BONNE APPROCHE.</h2>${button('Me contacter', '/contact')}</div></section>
    </main>`;
  pageShell('about', content, 'page-about');
  setPageMeta('À propos de Leo Vitch', 'Rencontrez Leo Vitch, développeur web full-stack et créateur numérique en développement, design et automatisation.');
}

function servicesPage() {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero content-width"><p class="eyebrow" data-reveal>LEO DEV / SERVICES</p><h1 class="page-title" data-reveal>DES SERVICES NUMÉRIQUES,<br />CONÇUS AUTOUR DE VOS BESOINS.</h1><p class="page-hero__intro" data-reveal>Des compétences complémentaires, de la structure et de l’interface jusqu’à la logique qui fait fonctionner le produit.</p></section>
      <section class="section services-overview content-width"><div class="services-overview__intro"><p class="eyebrow">UNE PRATIQUE SOUPLE</p><p class="lead">Choisissez un service ciblé ou présentez une idée plus large qui demande plusieurs disciplines.</p></div><div class="services-overview__grid">${services.map((service,index)=>`<a class="service-card" href="/services/${service.slug}" data-reveal><div class="service-card__image">${responsiveImage('services', service.cover, `Visuel illustratif pour le service ${service.title}`, { sizes: '(max-width: 767px) 88vw, 46vw', width: 1672, height: 941 })}<span>${String(index+1).padStart(2,'0')}</span>${serviceIcon(service.icon)}</div><h2>${service.title}</h2><p>${service.short}</p><span class="text-link">Découvrir le service ${arrowIcon()}</span></a>`).join('')}</div></section>
      <section class="section services-cta"><div class="content-width services-cta__inner"><div><p class="eyebrow">VOUS NE SAVEZ PAS PAR OÙ COMMENCER ?</p><h2 class="display-title">PARLONS DE CE QUE VOUS SOUHAITEZ RÉSOUDRE.</h2></div>${button('Démarrer une conversation','/contact')}</div></section>
    </main>`;
  pageShell('services', content, 'page-services');
  setPageMeta('Services numériques', 'Développement web et full-stack, commerce en ligne, automatisation par l’IA, design produit et création numérique par LEO DEV.');
}

function servicePage(service) {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero service-hero content-width"><h1 class="page-title" data-reveal>${escapeHtml(service.pageTitle || service.title.toUpperCase())}</h1></section>
      <figure class="service-cover">${responsiveImage('services', service.cover, `Visuel illustratif pour le service ${service.title}`, { sizes: '(max-width: 767px) calc(100vw - 32px), 1104px', width: 1672, height: 941, className: 'service-cover__image', loading: 'eager' })}</figure>
      <section class="section service-detail content-width">
        <div class="service-detail__lead"><h2 class="service-detail__heading" data-reveal>${escapeHtml(service.detailTitle || service.short)}</h2><p class="service-detail__description" data-reveal>${escapeHtml(service.detailDescription || service.description)}</p></div>
        <div class="service-deliverables"><h3 data-reveal>Ce que je propose</h3><p data-reveal>${escapeHtml(service.detailApproach || service.approach)}</p><ul class="service-detail__bullets">${service.includes.map(item=>`<li data-reveal>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </section>
      <figure class="service-story-image" data-reveal>${responsiveImage(service.detailImageFolder || 'services', service.detailImage || service.cover, service.detailImageAlt || `Illustrative visual direction for ${service.title}`, { sizes: '(max-width: 767px) calc(100vw - 30px), 1104px', width: 1672, height: 872, className: 'service-story-image__image' })}</figure>
      <section class="section service-why content-width"><h2 data-reveal>Pourquoi c’est important</h2><p data-reveal>${escapeHtml(service.detailWhy || service.description)}</p></section>
    </main>`;
  pageShell('services', content, 'page-service-detail');
  setPageMeta(service.title, service.description);
}

function projectsPage() {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero content-width"><h1 class="page-title" data-reveal>PROJETS<br />CHOISIS</h1></section>
      <section class="section projects-list content-width"><div class="project-grid">${projects.map(projectCard).join('')}</div></section>
      <section class="section concept-note content-width"><p class="eyebrow">NOTE DE TRANSPARENCE</p><p>Les aperçus et les récits présentés ici sont des concepts de démonstration. Ils ne représentent ni des clients, ni des résultats de production, ni des produits en ligne.</p></section>
    </main>`;
  pageShell('projects', content, 'page-projects');
  setPageMeta('Projets et concepts', 'Concepts originaux d’interface par LEO DEV, clairement présentés comme des études de démonstration et non comme des mandats clients.');
}

function projectPage(project) {
  const content = `
    <main id="main" class="inner-page">
      <section class="project-detail-hero content-width"><p class="eyebrow" data-reveal>ÉTUDE DE CONCEPT / ${escapeHtml(project.category.toUpperCase())}</p><h1 class="page-title" data-reveal>${escapeHtml(project.title.toUpperCase())}</h1><p class="page-hero__intro" data-reveal>${escapeHtml(project.summary)}</p><div class="project-facts" data-reveal><div><span>Type</span><strong>Concept de portfolio</strong></div><div><span>Statut</span><strong>Interface illustrative · étude de démonstration</strong></div><div><span>Technologies</span><strong>HTML, CSS et JavaScript natif</strong></div></div></section>
      <figure class="project-detail-cover content-width">${responsiveImage('projects', project.cover, `Visuel illustratif du concept « ${project.title} »`, { sizes: '(max-width: 767px) 100vw, 92vw', width: 1448, height: 1084, className: 'project-detail-cover__image', loading: 'eager' })}<figcaption>VISUEL ILLUSTRATIF · CONCEPT DE PORTFOLIO</figcaption></figure>
      <section class="section project-detail-visual content-width"><div class="concept-preview concept-preview--${project.visual} concept-preview--large" aria-label="Aperçu illustratif de l’interface conceptuelle"><div class="concept-preview__screen">${conceptVisual(project.visual)}</div><span class="preview-label">Concept d’interface illustratif · données de démonstration</span></div></section>
      <section class="section case-study content-width"><article><p class="eyebrow">LE BRIEF DU CONCEPT</p><h2 class="display-title">UN BESOIN PRODUIT HYPOTHÉTIQUE.</h2><p>${escapeHtml(project.brief)}</p></article><article><p class="eyebrow">OBJECTIFS D’EXPÉRIENCE</p><h2 class="display-title">CE QUE L’INTERFACE EXPLORE.</h2><ul>${project.goals.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></article></section>
      <section class="section project-direction"><div class="content-width project-direction__inner"><div><p class="eyebrow">DIRECTION VISUELLE</p><h2 class="display-title">UN CONCEPT MIS EN IMAGES.</h2></div><div><p class="lead">${escapeHtml(project.direction)}</p><p>Cette démonstration fait partie du portfolio LEO DEV. Elle ne décrit ni un service lancé ni un résultat de production.</p></div></div></section>
      <section class="section more-concepts more-concepts--visual content-width"><p class="eyebrow">AUTRES CONCEPTS</p><div>${projects.filter(item=>item.slug!==project.slug).slice(0,3).map(item=>`<a class="related-project-card" href="/projects/${item.slug}">${responsiveImage('projects', item.cover, `Visuel illustratif du concept « ${item.title} »`, { sizes: '(max-width: 767px) 82vw, 30vw', width: 1448, height: 1084, className: 'related-project-card__image' })}<span>${escapeHtml(item.title)}</span>${arrowIcon()}</a>`).join('')}</div></section>
    </main>`;
  pageShell('projects', content, 'page-project-detail');
  setPageMeta(project.title, project.summary);
}

function blogsPage() {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero content-width"><h1 class="page-title" data-reveal>DES IDÉES POUR<br />LE TRAVAIL NUMÉRIQUE.</h1></section>
      <section class="section blog-list content-width"><div class="article-grid">${articles.map(articleCard).join('')}</div></section>
    </main>`;
  pageShell('blogs', content, 'page-blogs');
  setPageMeta('Journal', 'Articles originaux sur le développement web, l’architecture full-stack, l’automatisation, le design d’interface, le commerce en ligne et la performance.');
}

function articlePage(article) {
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${article.date}T12:00:00Z`));
  const content = `
    <main id="main" class="inner-page article-page">
      <article>
        <header class="article-hero content-width"><p class="eyebrow" data-reveal>${escapeHtml(article.category)} · ${article.readTime}</p><h1 class="article-title" data-reveal>${escapeHtml(article.title)}</h1><div class="article-byline" data-reveal><span>LEO DEV</span><time datetime="${article.date}">${date}</time></div></header>
        <div class="content-width article-cover">${articleArt(article)}</div>
        <div class="article-body content-width"><p class="lead">${escapeHtml(article.summary)}</p>${article.sections.map(([heading,body])=>`<section data-reveal><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p></section>`).join('')}<aside class="article-note"><p class="eyebrow">NOTE ÉDITORIALE</p><p>Cet article éducatif est original. Il ne revendique aucun résultat de projet ni aucune expérience personnelle qui n’a été communiquée pour LEO DEV.</p></aside></div>
      </article>
      <section class="section related-articles related-articles--visual content-width"><p class="eyebrow">POUR ALLER PLUS LOIN</p><div>${articles.filter(item=>item.slug!==article.slug).slice(0,3).map(item=>`<a class="related-article-card" href="/blogs/${item.slug}">${responsiveImage('articles', item.cover, `Photo éditoriale pour l’article « ${item.title} »`, { sizes: '(max-width: 767px) 82vw, 30vw', width: 1536, height: 1024, className: 'related-article-card__image' })}<span>${escapeHtml(item.title)}</span>${arrowIcon()}</a>`).join('')}</div></section>
    </main>`;
  pageShell('blogs', content, 'page-article-detail');
  setPageMeta(article.title, article.summary, 'article', `/images/articles/${article.cover}.webp`);
}

const offers = [
  { slug: 'website-development', title: 'Création de site web', shortLabel: 'Site web', short: 'Une présence web claire et adaptative, pensée autour de votre activité.', type: 'Création de site web', bullets: ['Structure des pages et interface adaptative', 'Contenu et parcours de prise de contact', 'Développement et transfert définis ensemble'] },
  { slug: 'web-application', title: 'Application web', shortLabel: 'Application', short: 'Une interface pratique pour un produit ou un flux de travail.', type: 'Application web', bullets: ['Parcours utilisateurs principaux et interface', 'Fonctions définies selon vos besoins', 'Intégrations et plan de livraison à discuter'] },
  { slug: 'custom-digital-solutions', title: 'Solutions numériques sur mesure', shortLabel: 'Sur mesure', short: 'Une approche adaptée aux logiciels, à l’automatisation et aux produits numériques.', type: 'Solutions numériques sur mesure', bullets: ['Besoins liés aux flux et aux systèmes', 'Options de design, de développement et d’intégration', 'Périmètre défini lors d’une discussion'] },
];

function pricingCard(offer, index = 0) {
  return `<article class="pricing-card${index === 1 ? ' pricing-card--featured' : ''}" data-offer-card="${offer.slug}" data-reveal><p class="eyebrow">${String(index+1).padStart(2,'0')} / PÉRIMÈTRE SUR MESURE</p><h2>${offer.title}</h2><p>${offer.short}</p><p class="pricing-quote">Devis<br />sur mesure</p><a class="button ${index===1?'button--yellow':'button--outline'}" href="/contact?type=${encodeURIComponent(offer.type)}">En discuter ${arrowIcon()}</a><ul>${offer.bullets.map(item=>`<li>${item}</li>`).join('')}</ul></article>`;
}

function homeScopeCard(offer, index = 0) {
  return `<article class="home-scope-card" data-reveal><p class="eyebrow">${String(index+1).padStart(2,'0')} / SUR MESURE</p><h3>${offer.title}</h3><p>${offer.short}</p><p class="home-scope-card__quote">Devis sur mesure</p><a class="text-link" href="/pricing/${offer.slug}">Découvrir cette offre ${arrowIcon()}</a></article>`;
}

function pricingPage() {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero content-width"><h1 class="page-title" data-reveal>DES PROJETS ADAPTÉS<br />AUX IDÉES NUMÉRIQUES.</h1></section>
      <section class="section pricing-section content-width">
        <div class="pricing-selector" role="group" aria-label="Choisir le type de projet">${offers.map((offer,index)=>`<button type="button" data-pricing-focus="${offer.slug}" aria-label="${offer.title}" aria-pressed="${index===0}"><span class="pricing-selector__full">${offer.title}</span><span class="pricing-selector__compact">${offer.shortLabel}</span></button>`).join('')}</div>
        <p class="pricing-focus-status" aria-live="polite" data-pricing-status>Orientation choisie : Création de site web</p>
        <div class="pricing-grid">${offers.map(pricingCard).join('')}</div>
      </section>
      <section class="section faq-section"><div class="content-width faq-layout"><div><p class="eyebrow">QUESTIONS FRÉQUENTES</p><h2 class="display-title">DÉFINISSONS LE BON PÉRIMÈTRE.</h2><p>Chaque devis dépend du projet. Voici comment démarrer une conversation utile.</p></div><div class="faq-list">
        <details><summary>Comment fonctionne un devis sur mesure ? <span>+</span></summary><p>Présentez l’objectif, les fonctions attendues et les contraintes de délai ou de technologie. Nous pourrons définir le périmètre du projet et préparer un devis.</p></details>
        <details><summary>Proposez-vous des forfaits mensuels ou annuels ? <span>+</span></summary><p>Non. Les services présentés ici sont définis selon chaque projet ; aucun tarif public fixe ni abonnement n’est proposé.</p></details>
        <details><summary>Puis-je demander une seule partie d’un projet ? <span>+</span></summary><p>Oui. Indiquez la partie à réaliser et ce qui existe déjà afin de discuter du périmètre dans son contexte.</p></details>
        <details><summary>Comment commencer ? <span>+</span></summary><p>Utilisez le formulaire ou écrivez directement à Leo en décrivant brièvement ce que vous souhaitez créer.</p></details>
      </div></div></section>
    </main>`;
  pageShell('pricing', content, 'page-pricing');
  setPageMeta('Tarifs', 'Devis sur mesure pour la création de sites web, les applications web et les solutions numériques. Aucun tarif fixe public n’est affiché.');
}

function pricingDetail(offer) {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero content-width"><p class="eyebrow">PÉRIMÈTRE DU PROJET</p><h1 class="page-title">${escapeHtml(offer.title.toUpperCase())}</h1><p class="page-hero__intro">${escapeHtml(offer.short)}</p></section>
      <section class="section offer-detail content-width"><div class="offer-detail__feature"><p class="eyebrow">AUCUN PRIX FIXE AFFICHÉ</p><h2 class="display-title">DEVIS SUR MESURE</h2><p>Présentez les objectifs et les besoins du projet pour définir un périmètre adapté.</p>${button('Discuter de ce projet', `/contact?type=${encodeURIComponent(offer.type)}`)}</div><div><p class="eyebrow">POINTS À DISCUTER</p><ul>${offer.bullets.map((item,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span>${escapeHtml(item)}</li>`).join('')}</ul></div></section>
      <section class="section related-services content-width"><p class="eyebrow">AUTRES TYPES DE PROJETS</p><div>${offers.filter(item=>item.slug!==offer.slug).map(item=>`<a href="/pricing/${item.slug}">${item.title}${arrowIcon()}</a>`).join('')}</div></section>
    </main>`;
  pageShell('pricing', content, 'page-pricing-detail');
  setPageMeta(offer.title, offer.short);
}

function contactPage() {
  const content = `
    <main id="main" class="inner-page">
      <section class="page-hero content-width"><h1 class="page-title" data-reveal>CRÉONS<span class="contact-title__desktop"> QUELQUE CHOSE<br /></span><span class="contact-title__mobile"><br />QUELQUE CHOSE<br /></span>D’UTILE ENSEMBLE.</h1></section>
      <section class="section contact-section content-width">
        <form id="contact-form" class="contact-form" action="/api/contact" method="post" novalidate>
          <div class="field-grid">
            <div class="field"><label for="first-name">Prénom <span>*</span></label><input id="first-name" name="firstName" autocomplete="given-name" required maxlength="80" /></div>
            <div class="field"><label for="last-name">Nom <span>*</span></label><input id="last-name" name="lastName" autocomplete="family-name" required maxlength="80" /></div>
            <div class="field"><label for="phone">Téléphone</label><input id="phone" name="phone" type="tel" autocomplete="tel" maxlength="60" /></div>
            <div class="field"><label for="email">Adresse e-mail <span>*</span></label><input id="email" name="email" type="email" autocomplete="email" required maxlength="180" /></div>
            <div class="field field--wide"><label for="project-type">Type de projet</label><select id="project-type" name="projectType"><option value="">Choisir un domaine</option>${services.map(service=>`<option value="${service.title}">${service.title}</option>`).join('')}<option value="Autre">Autre</option></select></div>
            <div class="field field--wide"><label for="message">Message <span>*</span></label><textarea id="message" name="message" rows="6" required maxlength="5000"></textarea></div>
          </div>
          <label class="honeypot" aria-hidden="true">Laisser ce champ vide<input name="website" tabindex="-1" autocomplete="off" /></label>
          <div class="form-footer"><button class="button button--yellow" type="submit">Envoyer le message ${arrowIcon()}</button><p>Les champs obligatoires sont marqués d’un astérisque.</p></div>
          <p class="form-status" id="contact-status" role="status" aria-live="polite"></p>
          <p class="form-fallback" id="contact-fallback" hidden>Le formulaire n’est pas encore connecté. Écrivez directement à <a href="mailto:tleovitch2@gmail.com">tleovitch2@gmail.com</a>.</p>
        </form>
        <aside class="contact-details">
          <div class="contact-detail"><span class="contact-detail__icon">${serviceIcon('pen')}</span><div><h2>Courriel</h2><a href="mailto:tleovitch2@gmail.com">tleovitch2@gmail.com</a></div></div>
          <div class="contact-detail"><span class="contact-detail__icon">${serviceIcon('window')}</span><div><h2>Téléphone</h2><a href="tel:+50943300624">+509 43 30 0624</a></div></div>
          <div class="contact-detail"><span class="contact-detail__icon">${serviceIcon('spark')}</span><div><h2>Basé en</h2><p>Haïti · projets numériques</p></div></div>
          <a class="whatsapp-link" href="https://wa.me/50943300624" target="_blank" rel="noreferrer">Ouvrir WhatsApp ${arrowIcon()}</a>
        </aside>
      </section>
    </main>`;
  pageShell('contact', content, 'page-contact');
  setPageMeta('Contact', 'Contactez Leo Vitch chez LEO DEV pour un site web, un produit numérique, un flux automatisé ou une solution sur mesure.');
}

function notFoundPage() {
  const content = `<main id="main" class="not-found"><p class="eyebrow">404 / PAGE INTROUVABLE</p><h1 class="page-title">CETTE PAGE<br />N’EXISTE PAS.</h1><p>L’adresse a peut-être changé ou cette page n’existe pas.</p>${button('Retour à l’accueil','/','dark')}<a class="text-link" href="/projects">Voir les concepts ${arrowIcon()}</a></main>`;
  pageShell('', content, 'page-not-found');
  setPageMeta('Page introuvable', 'Cette page est introuvable. Retournez à la page d’accueil de LEO DEV.');
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(buttonEl => {
    buttonEl.addEventListener('click', () => {
      const track = document.getElementById(buttonEl.dataset.carousel);
      if (!track) return;
      const direction = Number(buttonEl.dataset.direction) || 1;
      const amount = Math.max(track.clientWidth * 0.72, 260) * direction;
      track.scrollBy({ left: amount, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  });
}

function initTabs() {
  document.querySelectorAll('[data-tabset]').forEach(tabset => {
    tabset.querySelectorAll('[data-tab-trigger]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const target = trigger.dataset.tabTrigger;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        tabset.querySelectorAll('[data-tab-trigger]').forEach(tab => {
          const selected = tab === trigger;
          tab.setAttribute('aria-selected', String(selected));
          tab.classList.toggle('is-selected', selected);
        });
        tabset.parentElement.querySelectorAll('[data-tab-panel]').forEach(panel => {
          if (!panel.id.startsWith('feature-panel-')) return;
          const selected = panel.dataset.tabPanel === target;
          if (selected) {
            const wasHidden = panel.hidden;
            panel.hidden = false;
            if (wasHidden && !reduceMotion) {
              panel.animate([
                { height: '0px', opacity: 0 },
                { height: `${panel.scrollHeight}px`, opacity: 1 },
              ], { duration: 400, easing: 'cubic-bezier(.22,1,.36,1)' });
            }
          } else {
            panel.hidden = true;
          }
        });
      });
    });
  });
}

function initPricingFocus() {
  const buttons = [...document.querySelectorAll('[data-pricing-focus]')];
  if (!buttons.length) return;
  const status = document.querySelector('[data-pricing-status]');
  const cards = [...document.querySelectorAll('[data-offer-card]')];
  const contacts = [...document.querySelectorAll('.pricing-card .button')];
  const setFocus = slug => {
    const offer = offers.find(item => item.slug === slug);
    if (!offer) return;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pricingFocus === slug)));
    cards.forEach(card => card.classList.toggle('is-selected', card.dataset.offerCard === slug));
    contacts.forEach((link,index) => { link.href = sitePath(`/contact?type=${encodeURIComponent(offers[index].type)}`); });
    if (status) status.textContent = `Orientation choisie : ${offer.title}`;
  };
  buttons.forEach(button => button.addEventListener('click', () => setFocus(button.dataset.pricingFocus)));
}

function route() {
  if (path === '/') return homePage();
  if (path === '/about') return aboutPage();
  if (path === '/services') return servicesPage();
  if (path === '/projects') return projectsPage();
  if (path === '/blogs') return blogsPage();
  if (path === '/pricing') return pricingPage();
  if (path === '/contact') return contactPage();
  if (path === '/404') return notFoundPage();

  const [family, slug] = path.split('/').filter(Boolean);
  if (family === 'services') {
    const service = services.find(item => item.slug === slug);
    if (service) return servicePage(service);
  }
  if (family === 'projects') {
    const project = projects.find(item => item.slug === slug);
    if (project) return projectPage(project);
  }
  if (family === 'blogs') {
    const article = articles.find(item => item.slug === slug);
    if (article) return articlePage(article);
  }
  if (family === 'pricing') {
    const offer = offers.find(item => item.slug === slug);
    if (offer) return pricingDetail(offer);
  }
  return notFoundPage();
}

route();
