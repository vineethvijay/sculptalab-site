# Screen swap list (interim → polish)

Interim screens were built on **2026-11-09** from:
- Live app shots: `/workspace/v4/mi-2d-96abc02/` and `/workspace/v4/settings-6a7d220/`
- Artwork sheet crops: `/workspace/v4/artwork/` (kept as optional source; live female crops preferred for A04)

When the in-app **2D polish round** lands, replace these files **in place** (same names + widths) and re-run `node scripts/build-2d-screens.mjs` then `npm run build`.

## Exact files to swap

| Slot | Replace these files | Replace with |
| --- | --- | --- |
| `a04-muscle-front` | `public/images/anatomy/a04-muscle-front-{480,800,1200}w.{webp,avif}` | Polished female **front** 2D body (no chrome if possible) |
| `a04-muscle-back` | `public/images/anatomy/a04-muscle-back-{480,800,1200}w.{webp,avif}` | Polished female **back** 2D body |
| `a04-highlight-glutes` | `public/images/anatomy/a04-highlight-glutes-{480,800}w.{webp,avif}` | List-tap Glutes highlight still |
| `a04-highlight-arms` | `public/images/anatomy/a04-highlight-arms-{480,800}w.{webp,avif}` | List-tap Arms highlight still |
| `a05-studio` / desktop | `public/images/screens/a05-studio-{640,960}w.*` · `a05-studio-desktop-1440w.*` | Fresh Studio laptop after polish |
| `a05-studio-highlight` | `public/images/screens/a05-studio-highlight-{640,960}w.*` · `a05-studio-highlight-desktop-1440w.*` | Laptop with Glutes row selected |
| `a05-studio-mobile` | `public/images/screens/a05-studio-mobile-{390,640}w.*` | Mobile MI after polish |
| `a09-trainer-dashboard` | `public/images/screens/a09-trainer-dashboard-{480,800}w.*` · `a09-trainer-dashboard-desktop-1280w.*` | Trainer roster (NL) |
| `a09-trainer-client-2d` | `public/images/screens/a09-trainer-client-2d-{480,800}w.*` · `a09-trainer-client-2d-desktop-1280w.*` | Trainer client detail + 2D map |

## Rebuild

```bash
node scripts/build-2d-screens.mjs
BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build
```

Do **not** advertise 3D. Keep demo client names only (Sanne etc.); never ship real emails.
