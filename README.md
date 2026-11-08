# SculptaLab — marketing site

Bilingual static marketing site for the **SculptaLab** gym pilot: mobile-first HTML/CSS, build-time page generation, honest feature status labels, and GitHub Pages deployment under `/sculptalab-site/`.

## Stack

- **Vite 5** multi-page build (no React/Next runtime)
- **Vanilla JS** progressive enhancement (`src/main.js`, ≤15 KB gzip)
- **Mobile-first CSS** (`src/styles/*.css`)
- **Locale dictionaries** `src/content/{en,nl}.json` (no runtime i18n JSON)
- **Self-hosted** Inter Variable + Instrument Serif accent

Legacy GSAP/Lenis/WebGL scroll film removed on the `site-rebuild` branch.

## Build

```bash
npm ci
BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build
```

Pipeline: `render-pages` → `vite build` → `metadata` (sitemap, robots, manifest) → `check-static`.

| Variable | Purpose |
|----------|---------|
| `BASE` | Asset prefix (`/sculptalab-site/` on project Pages) |
| `SITE_URL` | Absolute canonical/OG origin (trailing slash) |
| `ALLOW_INDEXING` | Set `true` only after owner approves contact, legal, and indexing |

## Content & routes

- `docs/content/feature-manifest.json` — 21 app-evidence feature rows
- `scripts/render-pages.mjs` — writes `.pages/` (git-ignored): root language chooser, `404`, `/nl/*`, `/en/*`
- Templates: `src/templates/{page,home,trainers,features,pilot,legal,contact}.html`
- Images: `public/images/` (see `docs/assets/site-image-manifest.json`)

## CI

`.github/workflows/deploy.yml` runs `npm run build` on pull requests (validate only). Pages deploy runs on `main` push / manual dispatch.

## Develop (local)

```bash
npm run render:pages
npm run dev        # Vite dev — use only on a machine where dev servers are allowed
```

## Assets tooling

```bash
npm run images:build   # regenerate marketing rasters (requires sharp)
npm run images:check   # budget validation
CHROME_PATH=... npm run assets   # favicon PNG export via puppeteer
```

See `docs/build/SITE-REBUILD-STATUS.md` and `DESIGN.md` for rebuild batch status and tokens.
