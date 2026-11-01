# SculptaLab — marketing site

The landing page for **SculptaLab**: *sculpt your foundation*. Personalised strength training for women, with per-muscle scores, live form tracking and a Sculpt score (Android, iOS, English and Dutch). Trainer sharing, an AI form checker, a web version and watch apps are coming soon.

**Stack:** Vite (static build), vanilla JS, GSAP + ScrollTrigger, Lenis smooth scroll, a WebGL gradient shader for the background (falls back to CSS), and self-hosted Inter Variable and Instrument Serif fonts. There is no framework runtime, and the JS is about 54 KB gzipped.

**Sections (v2):** loader, a hero with an original generated brand figure (`public/hero-figure.webp`, made from the SculptaLab icon artwork; variants in `design/hero-variants/`) plus muscle pins, a manifesto, a pinned How it works story (Today, Plan, Live pose, Muscle balance), Scores (muscle map, Sculpt score, per-rep scores), Form, a bento grid, a Trainer web dashboard concept (coming soon), Coming soon, and Download. Every mockup is animated (counters, timers, drawing charts, rotating lists) and stays static under reduced motion.

**v1 sections:** an animated S-mark loader, the hero (word reveal, contour art, 3D-tilt phone), an exercise marquee, a manifesto with a scroll-scrubbed word reveal, a pinned "How it works" story where the phone screen changes per step (Today, Live pose, Plan, Progress), Form AI cards, a bento grid (bubble, notification timer, reminders, sync, Dutch), Coming soon (trainer sharing, watch, web), and a download CTA.

Brand tokens come from `packages/ui-tokens` in the app repo. All screens are illustrative mockups. The site uses no real user data, metrics or testimonials.

## Develop
```bash
npm i
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serve dist on :4173
npm run shots      # desktop and mobile screenshots into shots/ (needs preview running and Chrome at /usr/bin/google-chrome)
```

## Store links
Set `STORE.play` / `STORE.ios` in `src/main.js` once the listings are public. Until then, the download buttons show an "early access" toast. The watch app is marked "Coming soon".

## Accessibility and performance
- `prefers-reduced-motion` skips the loader and turns off the shader animation, scroll smoothing and scrubs.
- Includes a skip link, focus rings and semantic sections. Decorative art is `aria-hidden`.
- The shader renders at half resolution.

## Deploy (sculptalab.com planned)
`dist/` is plain static files, so any static host works:
- **Cloudflare Pages:** connect this repo, build command `npm run build`, output `dist`, then add the custom domain `sculptalab.com` (easiest if the domain is registered or uses DNS at Cloudflare).
- **Netlify / Vercel:** same build settings.
- **Homelab:** `npm run build` and serve `dist/` with nginx behind the ingress.

Before launch, add an `og.png` (1200×630) to `public/` for link previews.
