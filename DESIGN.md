# SculptaLab marketing site — design system (Batch 2)

Authoritative product and copy rules remain in `docs/designs/2026-11-08-site-rebuild-brief.md`. This file documents the implemented tokens and layout contract.

## Typography

- **UI/body:** Inter Variable (`public/fonts/inter-latin-wght-normal.woff2`, preloaded in `page.html`).
- **Accent:** Instrument Serif italic via `@font-face` in `src/styles/base.css` (below-fold editorial only).

## Color tokens

Mapped in `src/styles/tokens.css` from app UI tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--color-brand` | `#FF7A3D` | Primary CTA |
| `--color-canvas` | `#120D0B` | Page background |
| `--color-surface` | `#1C1512` | Panels / warm bands |
| `--color-text` | `#F5ECE6` | Body copy |
| `--color-anatomy-stage` | `#07080B` | Muscle Intelligence section |

Muscle legend swatches use `--muscle-*` neon identities; brand orange does not appear inside the anatomy stage.

## Layout

- Mobile-first base (320–767px): single column, `--space-gutter` 16–20px, section rhythm `--space-section`.
- `min-width: 768px`: desktop nav visible, `details` menu hidden, two-column splits.
- `min-width: 1024px`: `--container-max` 75rem, three-column editorial blocks.

Header is 64px sticky with visible language switch and primary CTA on tablet+. Mobile secondary links live in `<details class="nav-details">`; primary CTA stays outside the menu.

## Progressive enhancement

`src/main.js` only:

1. Preserves location hash when switching `NL` / `EN`.
2. Closes open `nav-details` and FAQ `details` on Escape.

All story content, CTAs, FAQ answers, and catalogue rows render in HTML without JavaScript.

## Templates

| Route | Template |
| --- | --- |
| Home | `src/templates/home.html` (§5 sections) |
| Trainers / features / pilot | Dedicated templates |
| Privacy / terms | `legal.html` |
| Contact | `contact.html` |

Build-time assembly: `node scripts/render-pages.mjs` → `.pages/` for Vite MPA inputs.

## Images

Responsive `<picture>` elements are composed in `scripts/render-pages.mjs` from `public/images/{hero,anatomy,screens,lifestyle}/` with AVIF/WebP `srcset`, explicit dimensions, and lazy loading except hero LCP (`A01`) and trainers hero (`A09`).
