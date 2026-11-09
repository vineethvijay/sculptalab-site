# Site rebuild verification handoff

- **Branch:** `site-rebuild`
- **Brief:** `docs/designs/2026-11-08-site-rebuild-brief.md`
- **Static check:** `BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build` (includes `check-static.mjs`)
- **Indexing:** `noindex, nofollow` until `ALLOW_INDEXING=true` and owner approval (contact, legal, assets)

## Pending on CI / staging (Batch 6)

- Lighthouse mobile ≥90 on `/nl/` and `/nl/trainers/` (run in GitHub Actions or ai-node browser host)
- At most four sanitized screenshots under `docs/build/shots/`
- Record scores and commit SHA after first green Pages preview

## Remaining pilot blockers (Brief §12)

1. ~~Public demo contact~~ — `config.demoEmail` set to `vantlo@mail.grokbot.com` (owner may change before public launch)
2. Production domain / indexing decision
3. Legal identity and finalized privacy/terms
4. Store listings and public Studio origin (`config.play`, `ios`, `publicStudio`)
5. Owner sign-off on sanitized screenshots and Dutch copy

## Local build note

Mac used for codegen only; full `npm run build` validated locally when remote Node host unavailable. PR CI is authoritative for reproducibility.
