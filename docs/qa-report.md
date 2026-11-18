# QA report

## Automated checks

The suite is run with `npm test`; it builds the production bundle before testing. The latest recorded test run is from 2026-11-16.

- Main routes (`/`, `/about`, `/services`, `/projects`, `/blogs`, `/pricing`, `/contact`) are checked at the nine viewport sizes from the brief for a visible page heading and horizontal overflow.
- All service, concept project, article, pricing-detail, and not-found routes are opened directly in the browser.
- Mobile menu open/Escape close, desktop Pages dropdown, feature tabs, project next control and hover reveal, service row expansion and keyboard focus, pricing focus selector, FAQ disclosure, article cover loading/social metadata, contact validation/fallback, internal link destinations, and contact endpoint behavior are covered.
- Contact API tests verify malformed/oversized payload handling, invalid email rejection, honeypot response, rate limit response, no-credential fallback status, and confirmation only after provider acceptance.
- Latest `npm audit` on 2026-11-16 reported zero vulnerabilities.

## Visual checks

The browser reference audit records the desktop and mobile layout, typography, colors, page patterns, and key interaction states. `npm run capture` produces local/reference screenshots and comparison artifacts for the home page at all nine requested viewport sizes, plus all seven primary page types on desktop/mobile and overlapping scroll positions on longer pages. The latest run (2026-11-17 UTC) recorded 113 comparisons after the French localization and portrait update. The generated screenshots and machine-readable report remain local under `screenshots/comparison/` and are excluded from Git because they include third-party reference captures and generated review images; run `npm run capture` to recreate them.

Expected pixel differences include entirely replaced photography/video, brand identity, content, removed testimonials/prices, and concept/educational content. The overlays are for reviewing shared geometry and breakpoint behavior; there is no claim of pixel identity for changed content/media.

For the final 1440×900 run, the measured document heights were:

| Page | Reference | LEO DEV | Difference |
|---|---:|---:|---:|
| Home | 8,462 px | 8,675 px | +213 px |
| About | 11,728 px | 11,025 px | −703 px |
| Service detail | 3,067 px | 2,993 px | −74 px |
| Projects | 2,719 px | 2,755 px | +36 px |
| Blog | 2,572 px | 2,438 px | −134 px |
| Pricing | 2,418 px | 2,428 px | +10 px |
| Contact | 1,765 px | 1,848 px | +83 px |

The home, about, service-detail, projects, blog, pricing, and contact pages were reviewed at desktop and mobile sizes. All local page images loaded in the final capture. The user's supplied portrait informs the home hero and About portrait; the other original image masters were retained. The service-detail hero geometry matches the reference closely; project and blog image rows enter the viewport at comparable positions. About remains shorter because the reference's team and client sections cannot be truthfully recreated for a solo developer portfolio.

## Deployment and form limits

- Vercel production deployment is not recorded as complete until the Vercel CLI confirms it. Account target: `tleovitch2-8383s-projects`; project name: `leo-dev-portfolio`. The final `vercel whoami` check on 2026-11-16 returned `Logged out`, so preview and production deployment still require account authentication.
- Resend environment variables are absent from the repository by design. Configure `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` in Vercel to enable live form delivery. The API defaults the destination to `tleovitch2@gmail.com` unless `CONTACT_TO_EMAIL` is set.
- The original hero video was not recreated because video generation was unavailable; an optimized, original WebP still is used.
- A portrait photo was supplied for this portfolio and used to create two natural editorial portraits of Leo for the home and About pages. No approved logo file or real project/testimonial evidence was supplied; illustrative examples remain labeled as concept studies.

## Results

- `npm test` (2026-11-16): production build passed; 10/10 Playwright tests passed; 7/7 contact-handler tests passed.
- `npm audit`: 0 vulnerabilities.
- `npm run capture` (2026-11-17 UTC): production build passed and 113 reference/local comparisons completed, with no HTTP route failures or unloaded local page images. Home was captured at all nine viewport sizes; the seven primary page families were captured at 1440×900 and 390×844, with overlapping scroll views for long pages.
- Final captures were regenerated with the installed Chrome channel and reviewed locally.
- Final mobile and desktop captures were visually reviewed. Replaced photography/video and localized copy remain deliberate sources of pixel difference; see the reference height and content notes above.
