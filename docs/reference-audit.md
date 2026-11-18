# WONDR reference audit

Inspected `https://wondr-agency.webflow.io/` on 2026-11-16 using desktop and mobile browser viewports. The audit compared the reference at 1440×900 and 390×844, inspected its page structure and responsive navigation, and exercised the dropdown, feature tabs, project carousel, FAQ disclosures, and monthly/yearly control. The visual capture script extends the comparison to all nine requested viewport sizes and the seven main page families.

## Visual system

- White, near-black, and a warm yellow form the core palette. The yellow is used for actions and small emphasis, with large black display titles and restrained gray copy.
- Anton is used for display headings; Inter Tight handles body copy, controls, and metadata.
- The header is approximately 92 px tall on desktop and 65 px on mobile. The main gutter is about 49 px desktop and 23 px at 390 px mobile width.
- The desktop home hero is about 810 px tall at a 900 px viewport; its main display heading is 112 px. On the 390 px mobile viewport, the heading is about 40 px and the hero is approximately 540 px tall.
- The reference uses an eight-second muted video in the hero, repeating logo/partner marks, an about-and-tabs section, a home-page services list, project carousel, testimonials, pricing, image-backed CTA, and a multi-column footer. Four service-detail pages use one shared template; there is no `/services` index route.
- The projects index uses a three-column staggered layout; the blog index uses three columns. Service and project details follow shared page templates. Blog detail pages repeat the same article shell.
- The desktop navigation has a Pages dropdown. Mobile navigation becomes a hamburger menu. Project cards move horizontally and scale their image to 1.1 on hover while revealing a round action; service rows expand on hover; FAQs use disclosure-style accordions; pricing includes a billing-period selector.

## Adaptation decisions

- Preserve page rhythm, editorial typography, navigation placement, card geometry, yellow action color, responsive transitions, and restrained motion while replacing the identity, writing, work, and images.
- No WONDR source code, photos, client marks, testimonials, or numeric business claims are copied. The original template attribution/widget chrome is not part of Leo’s portfolio.
- The video generation capability was unavailable, so a compressed still carries the hero composition. The home and About portraits were created from Leo’s own photo supplied for this portfolio; they keep his recognizable features and depict an individual developer, not an agency. Other original generated image masters were retained. The reference’s video timing cannot be compared.
- The reference’s testimonial wall and preset package prices are replaced with working principles and a project-scope selector because verified client quotes or prices were not supplied.
- Nine reference project cards and six blog articles informed the content map. Three new project examples are explicitly labeled hypothetical demonstration concepts; six new articles cover supplied service areas. No reference case study or article is presented as Leo’s work.

## Automated comparison

Run `npm run capture` to generate local/reference screenshots at the same viewport and scroll positions, image overlays, difference renders, and a pixel-delta summary. Outputs are under `screenshots/comparison/`. The capture includes the home page at all nine widths in the brief and desktop/mobile captures for Home, About, a service detail, Projects, Blogs, Pricing, and Contact. The local `/services` overview is an added route; the reference service list is part of its home page rather than a separate page.

The difference metric is only a locator for mismatched regions. It includes intentionally changed copy, colors, branding, original generated photos, and page content; it is not used as a numerical pass/fail threshold. Geometric and typographic fidelity is reviewed against the overlays and the measured tokens. Video pixels are intentionally excluded from equivalence claims.
