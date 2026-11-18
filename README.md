# LEO DEV portfolio

Responsive portfolio for Leo Vitch, implemented with semantic HTML rendered from Vanilla JavaScript modules, Tailwind utilities, custom CSS, GSAP, and Vite. It reinterprets the editorial layout and motion language reviewed at WONDR Agency with original copy, interface concepts, and generated photography.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Build and verify

```powershell
npm run build
npm test
npm run capture
```

`npm test` builds the site, runs Playwright checks for the main routes at nine requested viewport sizes, exercises detail routes and key controls, then checks the contact API handler. `npm run capture` rebuilds and produces same-viewport screenshots, overlays, pixel-difference images, and a summary for the WONDR reference and local site. It launches a temporary Vite preview on port 4173 if one is not already available. Capture outputs are saved under `screenshots/comparison/`.

## Contact delivery

The contact form posts to `/api/contact`. On Vercel, set these environment variables in the `leo-dev-portfolio` project:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend server-side API key |
| `CONTACT_FROM_EMAIL` | Verified sender address in Resend |
| `CONTACT_TO_EMAIL` | Optional destination; defaults to `tleovitch2@gmail.com` |

Copy `.env.example` as a reference only; never commit actual credentials. The form reports delivery only after Resend accepts a message. Without the two required settings it offers direct email as a fallback.

## Vercel deployment

The project targets the Vercel account workspace specified in the brief. Once authenticated with the Vercel CLI, deploy a preview with `npx vercel --scope tleovitch2-8383s-projects`, inspect the preview, then deploy to production with `npx vercel --prod --scope tleovitch2-8383s-projects`. The `vercel.json` rewrite serves deep client routes; `/api/contact` is a serverless function.

## GitHub Pages deployment

GitHub Pages is configured to serve the `main` branch from its root. The Actions workflow builds the site with the `/portfolioleo/` base path, copies the compiled `dist/` output to that root, and pushes the generated files so Pages can serve them. For a manual publish, run `npm run build` and then `npm run publish:github-pages`, and commit the generated root files. The included `404.html` restores direct links to client-side routes. GitHub Pages does not run `/api/contact`; the form displays the direct-email fallback there.

## Project notes

- Route inventory and template adaptations: [`docs/page-map.md`](docs/page-map.md).
- Reference inspection and comparison approach: [`docs/reference-audit.md`](docs/reference-audit.md).
- Tokens and responsive measurements: [`docs/design-tokens.md`](docs/design-tokens.md).
- Motion and interaction behavior: [`docs/motion-spec.md`](docs/motion-spec.md).
- Asset provenance and items to personalize: [`docs/asset-provenance.md`](docs/asset-provenance.md).
- QA results and remaining deployment needs: [`docs/qa-report.md`](docs/qa-report.md).
