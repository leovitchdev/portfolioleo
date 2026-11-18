# Design tokens and responsive measurements

Measurements below were sampled from the WONDR reference on 2026-11-16. The LEO DEV implementation follows them where content and replacement imagery allow.

## Color

| Token | Value | Use |
|---|---|---|
| Butter yellow | `#FBEA69` | Primary CTA, highlights, focus treatment |
| Ink | `#0B0B0B` | Display titles, dark buttons, footer |
| White | `#FFFFFF` | Canvas and reversed text |
| Mid gray | `#7F7E7E` | Body/secondary copy |
| Light gray | `#E4E4E4` | Rules and subtle surfaces |
| Off-white | `#F9F9F9` | Soft section/card backgrounds |

## Type

- Display: Anton; reference H1 112 px with 1.0 line-height and about −0.01em letter spacing; H2 about 64 px / 1.2.
- Body and UI: Inter Tight, with weights 400–700.
- Mobile reference H1 at 390 px width: about 40 px / 1.0.
- Font files are requested from Google Fonts in `index.html`; runtime font delivery requires a network connection. System sans-serif fallbacks are configured.

## Geometry

| Element | Desktop reference | Mobile reference |
|---|---:|---:|
| Header | ~92 px | ~65 px |
| Main horizontal gutter | ~49 px | ~23 px at 390 px width |
| Home hero at sampled viewport | ~810 px at 1440×900 | ~540 px at 390×844 |
| Main grid | 3 columns for project/blog listings | 1 column for narrow viewports |

The main responsive viewport matrix lives in `tests/site.spec.js`: 320×568, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, and 1920×1080.
