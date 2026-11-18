# Page map and content inventory

All routes use the shared responsive header/footer. Pages set a route-specific document title, description, canonical URL, and Open Graph values. Deep links load through the Vercel rewrite.

## Main pages

| Reference route | LEO DEV route | Implementation |
|---|---|---|
| `/` | `/` | Hero, intro tabs, service list with four-image service gallery, nine-photo concept carousel, principles, custom-scope CTA |
| `/about` | `/about` | Centered title and panoramic photo, Leo’s provided profile, visual practice sections, capability list, and solo-practice CTA; no unverified resume claims |
| Home page Services section and `/services/ui-ux-design` detail template | `/services` | New overview of eight offerings adapted from the supplied brief |
| `/projects` | `/projects` | Nine original concepts in an image-led, staggered three-column gallery; each clearly labeled as illustrative |
| `/blogs` | `/blogs` | Six original educational articles with distinct, original photographic covers |
| `/pricing` | `/pricing` | Scope selector and custom-quote cards instead of invented prices |
| `/contact` | `/contact` | Validated inquiry form, direct email/phone alternatives |

## Service details

The reference presents its service list on the home page and has four detail templates (UI/UX Design, Web App Development, Illustration & Branding, Consulting & Strategy). The brief lists eight service areas, which are presented as distinct pages with an individual full-width photograph behind a new LEO DEV overview:

`/services/web-development`, `/services/full-stack-development`, `/services/ecommerce-marketplaces`, `/services/ai-agents-automation`, `/services/software-web-applications`, `/services/ui-ux-digital-design`, `/services/creative-development`, `/services/digital-content-branding`.

## Project and article routes

The reference has nine project detail routes and six blog detail routes. Its case-study/article layouts informed the templates, but those names, client stories, results, and text are not copied into Leo’s portfolio. They are replaced with nine demonstrator routes and six new articles:

- Projects: `/projects/commerce-experience`, `/projects/care-portal`, `/projects/delivery-dashboard`, `/projects/audio-discovery`, `/projects/digital-signage`, `/projects/spatial-gallery`, `/projects/insight-dashboard`, `/projects/creative-workspace`, `/projects/everyday-mobile`.
- Articles: `/blogs/vanilla-javascript-project-structure`, `/blogs/full-stack-architecture`, `/blogs/reliable-ai-workflows`, `/blogs/ecommerce-user-journeys`, `/blogs/useful-microinteractions`, `/blogs/web-performance-layout-stability`.

## Pricing and template utility routes

The reference’s three `/product/*-package` details informed three LEO DEV quote pages: `/pricing/website-development`, `/pricing/web-application`, and `/pricing/custom-digital-solutions`. Their purpose is to collect scope and start a conversation; none presents a fabricated fixed fee or promises a deliverable schedule.

`/404` and unknown client routes render a branded not-found page. The reference’s `/checkout` flow and `/401` access page do not fit a personal developer portfolio and are not reproduced. The reference style guide, changelog, and license pages are authoring/template utilities rather than visitor-facing portfolio pages; reference notes and asset provenance are documented locally instead.

## Direct contact

Email: `tleovitch2@gmail.com` · Phone: `+509 43 30 0624` · Location shown: Haiti.

The contact form does not claim successful sending unless the Resend endpoint confirms delivery. The exact sender domain/configuration still needs to be entered in the Vercel project before live form delivery is enabled.
