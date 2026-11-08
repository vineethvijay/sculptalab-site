# Site rebuild status

- **Branch:** `site-rebuild`
- **Brief:** `docs/designs/2026-11-08-site-rebuild-brief.md`
- **Plan:** `docs/designs/2026-11-08-site-rebuild-plan.md`
- **Updated:** 2026-11-08

## Batches

| Batch | Status | Commit area |
|-------|--------|-------------|
| 1 Content scaffolding | done | feature-manifest, render-pages, locale JSON |
| 2 Design system + home | done | `src/styles/*`, `home.html`, `main.js`, `DESIGN.md` |
| 3 Assets | done | `public/images/*`, `scripts/images.mjs`, OG cards |
| 4 Subroutes | done | trainers/features/pilot/legal/contact templates |
| 5 Integration | done | metadata, check-static, deploy PR build, legacy removed |
| 6 Verification | pending CI | Lighthouse + 4 shots per `site-rebuild-check.md` |

## Worktree merges

| Source branch | Merged into `site-rebuild` |
|---------------|----------------------------|
| `site-rebuild-wt-b1` | Batch 1 (`e08cf6c`) |
| `site-rebuild-wt-b3` | Batch 3 (`f12e514`) |
| `site-rebuild-wt-b2` | Batch 2+4 (`222383b`) |

## QA polish (2026-11-08)

- Home **plan** steps: three-column layout on tablet/desktop; tighter screenshot sizes.
- **Features** catalogue: compact cards, smaller caveats, no per-row “On home” links.
- **Demo contact:** `vantlo@mail.grokbot.com` mailto + “Book a trainer demo” CTA (`config.demoEmail`).
- **Copy:** no live-camera workout claim on home plan note and workout-player caveat; form analysis no longer advertises live camera.
- **Indexing:** `noindex, nofollow` on all pages until `ALLOW_INDEXING=true` (default in `render-pages.mjs`); `robots.txt` from `metadata.mjs` stays aligned.

## Build

```bash
BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build
```

Produces 16 localized routes + root chooser + 404 under `dist/`.
