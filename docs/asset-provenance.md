# Asset provenance and personalization list

## Original assets in this project

| Asset | Provenance | Use / notes |
|---|---|---|
| `assets/source/solo-developer-hero.png` → `public/images/solo-developer-hero.webp` | Generated specifically for this portfolio with an image-generation tool | Anonymous solo Black digital creator, viewed from behind; an editorial replacement for the reference hero video, not a portrait of Leo or a depiction of an agency |
| `assets/source/developer-workspace.png` → `public/images/developer-workspace.webp` | Generated specifically for this portfolio with an image-generation tool | Anonymous creator at a workstation; an illustrative work scene, not a portrait of Leo |
| `assets/source/personal/leo-portfolio-hero.png` and `leo-about-portrait.png` → `public/images/leo-portfolio-hero.webp` and `public/images/about/leo-about-portrait.webp` | Generated from Leo Vitch’s own photo, supplied with permission for this portfolio | Two natural editorial portraits with different clothing, pose, and studio setting; his identity, facial features, locs, and facial hair are retained |
| `assets/source/about/*.png` → `public/images/about/*.webp` and `*-card.webp` | Eight separate generated image masters created specifically for this portfolio | Panoramic masthead plus editorial images about planning, interface sketching, responsive design, user journeys, visual systems, and development; every depicted person is illustrative and none is presented as Leo Vitch |
| `assets/source/projects/*.png` → `public/images/projects/*.webp` and `*-card.webp` | Nine separate generated image masters created specifically for this portfolio | Distinct illustrative cover photographs for nine fictional interface concepts; concept labels remain visible and none is presented as client work |
| `assets/source/services/*.png` → `public/images/services/*.webp` and `*-card.webp` | Eight separate generated image masters created specifically for this portfolio | Service-specific editorial imagery used in the overview, home gallery, and corresponding service detail page |
| `assets/source/articles/*.png` → `public/images/articles/*.webp` and `*-card.webp` | Six separate generated image masters created specifically for this portfolio | Photographic covers used by the blog index and article pages; the photos illustrate topics and do not imply client work |
| `public/icons/favicon.svg` | Created for LEO DEV | Original simple LEO DEV monogram |
| Inline interface icons | Original SVG markup in `src/js/main.js` | Small line icons; no copied icon library or client marks |
| Interface concept previews | CSS/HTML rendered in `src/js/main.js` | Original demo UI treatments; not delivered customer products |

PNG masters are retained locally in `assets/source/` and are not required to build the site; the repository uses compressed full-size WebP and 720px card variants from `public/images/`. The two portraits derived from Leo’s supplied photo appear on the home and About pages. No WONDR, Lummi, Pexels, client, or template photography/marks are redistributed. The template’s visible marketplace promotion is also omitted.

## Third-party runtime dependency

Anton and Inter Tight are loaded through the Google Fonts CSS endpoint. They are not included as local font binaries. Their appearance depends on third-party font delivery; the CSS has local generic fallbacks.

## Items to personalize or configure

1. Replace illustrative concept photography only when authentic, licensed work imagery is available and approved. The home and About portraits are generated from the photo Leo supplied for this use; other people and work scenes remain illustrative.
2. Add/replace the text-built LEO DEV mark with the official logo if Leo supplies one.
3. Add real client work, screenshots, testimonials, verifiable outcomes, and real article dates only when approved facts are available. Current project cards are marked concept demos and article dates reflect the build date.
4. Configure Resend credentials and a verified sender domain in the Vercel project. Direct email remains available until that happens.
5. Confirm the production domain after Vercel assigns it, then update `public/robots.txt` and `public/sitemap.xml` if it differs from `leo-dev-portfolio.vercel.app`.

The reference’s source photos, logo, and video were not copied. No license from the template owner is claimed.
