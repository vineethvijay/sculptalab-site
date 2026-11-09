# Screen swap list (interim → polish)

## Tap-to-highlight demo (required)

Demo frames are **pre-composited** from app plates + alpha masks so the selected muscle is bright and the rest is dim — no CSS glow.

Source (app `mi-2d-default`):
- `apps/web/public/mi-anatomy-v4/plates/female-{front,back}.webp`
- `apps/web/public/mi-anatomy-v4/masks/female-{front,back}/*.webp`

Site files to replace after polish (same names):

| Slot | Path pattern |
| --- | --- |
| Plates | `public/images/anatomy/mi-v4/plates/female-{front,back}{,-480w,-800w}.webp` |
| Masks | `public/images/anatomy/mi-v4/masks/female-{front,back}/<region>.webp` |
| Highlights | `public/images/anatomy/mi-v4/highlights/female-{front,back}-<region>-{480,800}w.webp` |

Rebuild highlights after swapping plates/masks:

```bash
python3 scripts/build-mi-highlights.py
BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build
```

Regions:
- front: `quads`, `core`, `calves`, `shoulders`, `arms`
- back: `glutes`, `hamstrings`, `back`, `calves`, `shoulders`, `arms`

## Progress / trainer screenshots (do not polish here)

`public/images/screens/a05-*`, `a09-*` — interim `96abc02` / `settings-6a7d220`. Swap when app polish lands.

## Palette (`miAnatomy` on mi-2d-default)

| Region | Hex |
| --- | --- |
| glutes | `#B44DFF` |
| hamstrings | `#FDE047` |
| quads | `#FF3B5C` |
| back | `#22D3EE` |
| shoulders | `#FF5FA2` |
| core | `#6C63FF` |
| arms | `#84CC16` |
| calves | `#3DFF8A` |
