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

## Build

```bash
BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build
```

Produces 16 localized routes + root chooser + 404 under `dist/`.
