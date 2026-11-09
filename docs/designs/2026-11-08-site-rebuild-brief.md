# SculptaLab marketing site — design and build brief

Date: 8 November 2026 (Europe/Amsterdam). Deliverable: implementation-ready specification, not a site launch.

## 1. Evidence, scope and current-site audit

Inspected local HTTPS checkout of `vineethvijay/sculptalab-site`, base `e5dc97e` (Add GitHub Pages deploy workflow), and refreshed `/workspace/sculptalab` with `git pull --ff-only`, current app main `eab8a243a2a5d046ccf76e6de96e4994c5ecad0d`. The requested site checkout already existed clean on main; reused it rather than overwriting it. No credentials belong in this brief or assets.

Current site is a single English `index.html`, Vite 5.4, vanilla `src/main.js`, `src/style.css`, GSAP/ScrollTrigger, Lenis, and a background WebGL shader. No framework or server runtime. Fonts are self-hosted Inter Variable and Instrument Serif. `package.json` supplies build/dev/preview/shots; its test command intentionally fails and is not a real suite. README estimates 54 KB gzip JS; this is documentation, not a fresh performance measurement.

Existing sequence: blocking brand loader, hero/generated body plus phone, manifesto, pinned four-step story, muscle/Sculpta/per-rep scores, form cards, convenience bento, trainer dashboard concept, coming-soon cards, download. Public icons, `hero-figure.webp`, `og.png`, manifest and robots exist; `shots/` contains old desktop/mobile captures. `design/hero-variants` has three JPG alternatives. Reuse the logo and favicon family, not the old fabricated interface as evidence of the current product.

Deployment is `.github/workflows/deploy.yml`: pushes to main or manual dispatch; Node 20/npm ci; `BASE=/sculptalab-site/ npm run build`; upload `dist` and deploy Pages with `pages:write`, `id-token:write`, environment `github-pages`, concurrency group `pages`. `vite.config.js` reads BASE, default `/`. Preserve project-path hosting until an actual custom domain is approved; README mentions sculptalab.com as planned, not owned/live evidence.

Portability: `scripts/shots.mjs` and `scripts/assets.mjs` hard-code `/usr/bin/google-chrome` and sandbox flags. These are Linux/possible WSL assumptions, not proof the site was developed in WSL. No checked-in `/mnt/c` evidence found in inspected scripts/source. Replace hard-coded browser paths with an optional `CHROME_PATH` or supported browser discovery. Do not carry no-sandbox into ordinary interactive usage. README deployment advice is stale (does not explain existing Pages pipeline; says OG still needed although file exists). Store URLs are empty in `src/main.js`; buttons currently fall back to a toast. English-only document and overconfident iOS/live-form copy need correction.

App evidence: `apps/web/src/app`, `apps/mobile/app`, `apps/mobile/src/config/features.ts`, `packages/ui-tokens/src/index.ts` and `scripts/build.ts`; product docs `SCULPTALAB_PRODUCT_SPEC`, `PRODUCT-ROADMAP-VISION-2026-10`, `STUDIO_FEATURE_CATALOGUE`, `MUSCLE-INTELLIGENCE`, `SHARE-WITH-TRAINER`, `TRAINER_GROUP_SESSIONS`, `I18N-DUTCH`, `WEBSITE-APP-GAP-2026-11`; anatomy reference `docs/designs/2026-11-08-mi-anatomy-v4-brief.md`. Older roadmap labels are not current availability evidence: code now contains trainer and Studio pages formerly labelled coming soon.

### Truth rules (release gate)

A route demonstrates implementation, not production readiness. Use **In the pilot / In de pilot**, **Preview / Voorproefje**, **Planned / Gepland** as explicit statuses. Do not say globally available, clinically validated, injury prevention, recovery percentage, guaranteed muscle growth, or accurate muscle-size measurement. Muscle Intelligence shows training-derived estimates, not a body scan. e1RM is estimated. No left/right asymmetry or valgus diagnosis. No fake trainer endorsements, user counts, prices, app ratings, or before/after transformations.

Mobile defaults `liveCamera:false`, `formScoring:false`, `premium:false`; server flags may override but are not verified here. Live pose, uploaded scoring and AI form analysis must be preview/pilot-gated, not universally advertised. Trainer queue itself says AI checker coming soon. NL exists but translation completion/native review remains pending. Android APK pilot exists; store availability and iOS release are not established. V4 screenshots currently exist but may predate the shader fix; never publish a blank-body capture merely because its filename says v4.

## 2. Audience, conversion and direction contract

Persuade mode. Primary visitor: trainer receiving a WhatsApp link at the gym, viewing on a phone between clients. They must understand what they can demonstrate, what clients control, and how to request a guided pilot. Secondary: clients wanting a simple strength-training companion, with legs/glutes foundations and whole-body balance, not exclusionary gender promises.

THESIS: show the loop “plan → train → understand → review together”, with trainer trust before an exhaustive feature inventory. Reject the old scroll-controlled product film.
OWN-WORLD: current dark app chrome, warm orange action, readable cream text, restrained neutral panels; muscle neon belongs inside anatomical imagery, not random glows across the entire page. Preserve Inter and Instrument Serif as the established brand, not a new font hunt.
STORY: see a recognisable workout, understand the muscle view, see how a trainer uses consented data, request a pilot or inspect the full feature list.
FIRST VIEWPORT: mobile logo and NL/EN switch in a 64px header; pilot eyebrow, 3-line headline, 2-line explanation, full-width trainer CTA, secondary app CTA, then one portrait app visual. Desktop has text 5/12, visual 7/12, actions above fold. No splash loader.
FORM: brief-pinned dark/orange/neon product showcase, content-led static sections; no concept tournament because this is a documentation handoff with fixed brand requirements. No UI implementation or visual approval claimed.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

As an unattended brief-writing subagent, substitute the supplied user requirements for a design interview. This does not imply user approval of generated images or legal copy.

## 3. Information architecture and localization

Generate actual HTML at `/nl/`, `/en/`, `/nl/trainers/`, `/en/trainers/`, `/nl/features/`, `/en/features/`, `/nl/pilot/`, `/en/pilot/`, plus localized privacy/terms/contact and a 404. Root is a tiny accessible language chooser, Dutch prominently offered; no JS-only redirect and no browser-language forced rerouting. Base here means `/sculptalab-site/` on current Pages host. Preserve section hashes when switching languages where IDs match. Every route renders readable content with JavaScript disabled.

Home tells the story; trainers expands workflow; features is the complete catalogue below. Pilot explains actual access and limits without pretending to collect a working registration when no backend exists. Legal pages must be owner/legal-reviewed before accepting real pilot health data; placeholder notices cannot masquerade as valid policies.

Use build-time dictionaries `src/content/nl.json`, `en.json`; shared section IDs and translation keys; no runtime i18n payload. Translate alt text, aria labels, metadata, nav, footers, status badges, FAQ, contact mail subjects, errors and screenshots captions. Native Dutch review before public promotion. Locale URLs are canonical; EN link label “English”, NL “Nederlands”.

Navigation: Product / Product; For trainers / Voor trainers; All features / Alle functies; Pilot / Pilot; language. Primary “Request a trainer demo / Vraag een trainersdemo aan”. Mobile menu via native details or tiny progressive enhancement; never hide the only CTA behind the menu.

## 4. Feature → section coverage (implementation evidence, not launch promises)

IDs below are stable homepage anchors; feature catalogue expands all rows and labels platform/status. Web paths are under `apps/web/src/app`, Studio hub paths under `studio/(hub)`; mobile under `apps/mobile/app`. Include these sources in content manifest so future product additions cannot silently disappear.

| Feature family / evidence | Site location and narrative | Status caveat |
|---|---|---|
| Mobile auth, first-run, onboarding, plan setup/preview/building; Studio sign-in/forgot/reset | #plan; features “Getting started”: account, preferences, goals, plan creation/rebuild | Pilot; no “three questions” unless current flow confirms |
| Today, train, workout-day/exercise/player/live/finish; Studio today/plan | #train: upcoming session, sets/reps/load, history, swaps, rest, completion | Pilot core workflow |
| log-set, log-cardio, calendar; Studio calendar, sessions, activities and detail, sets detail | #train + features Activity: strength and cardio logging, scheduling, session history, provenance | Only show connected source data that exists |
| Mobile progress/rank, form-scores; Studio progress/[tab], strength, records, effort, consistency | #progress: Sculpta score breakdown, estimated strength/e1RM, PRs, volume/load/RIR, consistency, streaks and comparison with own history | No population fitness tiers; incomplete metrics labelled |
| Muscle Intelligence; Studio progress, volume, analysis | #muscles: male/female anatomy, front/back, 2D fallback, muscle coverage, volume, progression, region detail, trends/comparison, date ranges and sets contributing to estimates | V4 feature flag and rendering approval required; not a scan |
| Studio exercises and exercise detail; mobile exercise-catalogue/exercise, learn/guides/guide, did-you-know | #learn: searchable exercises, cues, movement demonstrations, science notes | Avoid fixed exercise count unless generated from catalogue |
| Mobile live/upload/results; Studio form/set detail; trainer queue | #form: live and recorded analysis previews, rep/ROM/tempo/depth/lockout feedback, recording time/source labels | Gated, limited movements; no “every exercise” AI claim |
| Notification timer, floating workout bubble, reminder preferences, sync settings | #daily: reminders, rest awareness, resume and sync | Android-specific distinctions visible, permissions optional |
| Mobile connect-health/connected-sources/sync; Studio settings | features Connections: account sync, imports, source provenance, duplicate handling | Health Connect/HealthKit/Strava support must be confirmed individually; never imply universal watch support |
| Studio home/my-dashboard | #studio: personal dashboard, overview and configurable views | Customization only if enabled in current pilot |
| Studio blocks, reports, insights | #studio + features Insights: block comparisons, planned/done, weekly/monthly summaries, adherence, per-session averages and computed-fact insights | No causal AI assertions or guaranteed forecasts |
| Studio body | features Body: check-ins/bodyweight trends when logged | Neutral language; no invented body composition |
| Studio diet; mobile nutrition-tips | #learn: protein/nutrition education | Not a shipped trainer-authored meal prescription |
| Studio share; public s/[token]; trainer sign-in/onboarding/home/c/[grantId] | #trainers: consent-scoped sharing, client view, revoke/expiry/access errors, trainer review | No trainer invite-code promise (separate gap) |
| Trainer queue | trainers page: review workflow and preview form queue | AI checker explicitly not generally released |
| Trainer group-sessions/[id]; Studio group/[id] | features “Group sessions”: trainer/member group workspace preview | Route present; watch following, alerts and class orchestration not assumed shipped |
| Studio billing, settings; mobile profile/settings/paywall | FAQ + features Account: units/preferences, theme, account controls, profile | Billing demo/premium gated; no prices or paid checkout |
| share-persona/share-outfit; leaderboard, twin, clients, sessions legacy routes | features “Additional views”: shareable presentation and legacy/experimental views | Audit underlying behavior before public screenshots; do not promote as core or imply social ranking readiness |
| Studio lab | features “Research previews”: forecasts, PR prediction, change-points, clustering, correlations, monotony/strain, camera velocity | Current panels hidden/experimental, not available capabilities |
| Wear OS/Apple Watch, iPhone Live Activities, smart set detection, clip-on sensor, gym QR, trainer plan editing/diet, trainer-first invitation, public store rollout | #roadmap with small planned list; full detail on features roadmap | Planned, no dates; separate scaffolding from working product |
| Dutch and English | All site routes and #daily; FAQ | Site fully bilingual; app NL still being completed/reviewed |

Do not market fixture/test routes such as muscle-coverage-fixture, debug controls or auth bypasses. Route aliases are not distinct features. Retain an “Other pilot tools” catalogue subsection for implemented secondary tools rather than bloating the hero.

## 5. Section-by-section layout and bilingual copy drafts

All text below is draft marketing copy, not legal assurance. In each pair EN precedes NL. Translate consistently with the app vocabulary after native review.

### 01 Header + hero (#top)
64px header, 20px mobile gutters. Hero headline 40–48px mobile, 64–76px desktop, no clipped text. Eyebrow: “A gym pilot, built around trainers” / “Een pilot in de sportschool, samen met trainers”.
H1: “Make every workout easier to understand.” / “Krijg meer inzicht in elke training.”
Body: “Plan your training, log your sets and see your progress. Review the bigger picture with a trainer you choose.” / “Plan je trainingen, houd je sets bij en bekijk je voortgang. Bespreek het totaalbeeld met een trainer die jij kiest.”
Primary “Request a trainer demo” / “Vraag een trainersdemo aan” → localized pilot page. Secondary “Explore the app” / “Bekijk de app” → #train. Microcopy: “Android pilot · Web Studio · English & Dutch” / “Android-pilot · Web Studio · Engels en Nederlands”. Add separate “App translations are still being refined / De vertalingen in de app worden nog verbeterd”. Hero asset A01, labelled “Illustrative app preview / Illustratieve appweergave”.

### 02 Trainer bridge (#trainers)
Place this before feature detail, not near the footer. Warm neutral band, short statement and three numbered steps; companion trainer/client photo A08 below text mobile, beside text desktop.
H2: “A better conversation at the gym.” / “Een beter gesprek in de sportschool.”
Body: “Your client brings the training history. You bring the coaching. Review shared workouts and progress together, with access controlled by the client.” / “Je cliënt brengt de trainingshistorie mee. Jij brengt de coaching. Bekijk gedeelde trainingen en voortgang samen; je cliënt bepaalt de toegang.”
Steps: “Client chooses what to share → Trainer reviews → Discuss the next session” / “Cliënt kiest wat wordt gedeeld → Trainer bekijkt de gegevens → Bespreek de volgende training”.
CTA “See the trainer workflow / Bekijk de trainersworkflow” → trainers route. Caption “Pilot workflow; public onboarding is being prepared / Pilotworkflow; openbare toegang wordt voorbereid”.

### 03 Plan and train (#plan, #train)
Three compact numbered rows, not a pinned scroll story. Each has 1 sentence plus one screen crop A02/A03. Mobile stacked; desktop alternating 5/7 columns, no forced horizontal swiping.
H2 “A plan you can actually follow.” / “Een plan dat je kunt volgen.”
Rows: “Start with a plan that fits your routine.” / “Begin met een plan dat bij je ritme past.”; “Keep sets, reps and weights in one place.” / “Houd sets, herhalingen en gewichten op één plek bij.”; “Finish your session and see what you did.” / “Rond je training af en bekijk wat je hebt gedaan.”
Supporting line “Strength sessions, cardio logs and a calendar that keeps the week clear.” / “Krachttraining, cardiologs en een overzichtelijke trainingskalender.” CTA “Explore training features / Bekijk de trainingsfuncties” → features#training.

### 04 Muscle Intelligence (#muscles)
Signature full-bleed near-black stage with exported anatomy image A04, no WebGL or 3D runtime. On mobile put short copy above image, two readable crop choices front/back as native links or details, no hover dependence. On desktop image 60%, copy 40%, leader labels remain inside image safe area.
H2 “See where your training goes.” / “Zie welke spieren je traint.”
Body “Explore training volume and progression by muscle group. Switch between anatomy views and compare periods in Studio.” / “Bekijk trainingsvolume en voortgang per spiergroep. Wissel in Studio tussen anatomieweergaven en vergelijk periodes.”
Disclaimer “Training-based estimates, not a body scan or medical assessment.” / “Schattingen op basis van je training, geen lichaamsscan of medische beoordeling.”
Legend is real HTML: glutes, quads, hamstrings, calves, core, back, shoulders, arms; localized. CTA “Discover Muscle Intelligence / Ontdek Muscle Intelligence” → features#muscles.

### 05 Progress and Studio (#progress, #studio)
One authentic dashboard crop A05; below, three compact editorial columns rather than 12 competing cards.
H2 “Your training history, with context.” / “Je trainingshistorie in perspectief.”
Columns “Strength & records / Kracht en records”, “Volume & consistency / Volume en regelmaat”, “Reports & insights / Rapporten en inzichten”.
Body “Follow estimated strength, personal records and training patterns. Move from a summary into the sessions behind it.” / “Volg geschatte kracht, persoonlijke records en trainingspatronen. Bekijk vanuit het overzicht de bijbehorende trainingen.”
CTA “See all Studio tools / Bekijk alle Studio-functies” → features#studio. Never link homelab.local as a public login. Public Studio CTA stays absent until the public origin is verified.

### 06 Form preview (#form)
One clean phone capture A06; a Preview badge always adjacent to heading.
H2 “Look back at how you moved.” / “Kijk terug op je beweging.”
Body “Explore form feedback for supported movements in the pilot. Availability depends on the enabled analysis features.” / “Ontdek feedback op je uitvoering voor ondersteunde oefeningen in de pilot. De beschikbaarheid hangt af van de ingeschakelde analysefuncties.”
Footnote “Not a substitute for a trainer or medical advice.” / “Geen vervanging voor een trainer of medisch advies.” CTA “What is available in the pilot? / Wat is beschikbaar in de pilot?” → pilot#availability. Do not animate synthetic rep counters as live evidence.

### 07 Learning and everyday details (#learn, #daily)
Six icon-led compact items with optional A07 guide image: exercise demonstrations, cues/science notes, protein/nutrition education, cardio, reminders/timers, sync/language. Android-only bubble gets explicit badge.
H2 “Support between the big milestones.” / “Ondersteuning tussen de mijlpalen.”
Body “Learn the movement, remember the session and keep your training together.” / “Leer de beweging, onthoud je training en houd alles bij elkaar.” CTA “Browse all features / Bekijk alle functies”.

### 08 Honest roadmap (#roadmap)
Text-first narrow section. H2 “In the pilot. Next on the roadmap.” / “Nu in de pilot. Straks op de roadmap.”
Two clearly separated lists: pilot core (plans/logging/Studio/consent-sharing); planned (public rollout, trainer invites, expanded form tools, trainer-authored plans/diet, watch/gym integrations). No dates, progress percentages, pricing or “available now” for flag-off tools. Link complete status catalogue.

### 09 FAQ (#faq)
Native details, 6 questions, first closed by default. Answers remain HTML.
- “Can I download it today? / Kan ik de app nu downloaden?” → “Android access is arranged for pilot participants. Public store links are not live yet. / Android-toegang wordt geregeld voor pilotdeelnemers. Openbare storelinks zijn nog niet beschikbaar.”
- “Is there an iPhone app? / Is er een iPhone-app?” → “An iOS release is not confirmed for this pilot. / Een iOS-release voor deze pilot is nog niet bevestigd.”
- “Who sees my training data? / Wie ziet mijn trainingsgegevens?” → “Trainer access follows the sharing permissions you grant. Review scope and expiry in the app. / Trainertoegang volgt de toestemming die je geeft. Bekijk de reikwijdte en einddatum in de app.” Avoid blanket “GDPR compliant”.
- “Does the body show actual muscle growth? / Toont het lichaam echte spiergroei?” → “No. It visualises training-derived metrics and estimates. / Nee. Het visualiseert trainingsgegevens en schattingen.”
- “Can I use it in Dutch? / Kan ik Nederlands gebruiken?” → “The site is bilingual. Dutch app translations are still being refined. / De website is tweetalig. De Nederlandse appvertalingen worden nog verbeterd.”
- “What does the pilot cost? / Wat kost de pilot?” → “Pilot arrangements are confirmed during the demo; there is no public pricing checkout here. / De pilotafspraken worden tijdens de demo bevestigd; deze site heeft geen openbare betaalpagina.”

### 10 Pilot CTA, store placeholders and footer (#pilot)
H2 “Bring it to your next trainer conversation.” / “Neem het mee naar je volgende gesprek met je trainer.”
Body “Start with a guided demo before inviting clients.” / “Begin met een begeleide demo voordat je cliënten uitnodigt.”
Primary “Request a demo / Vraag een demo aan” → pilot contact instructions. No fake success toast, dead href or unconnected form. Until an owner-approved contact exists, show “Demo contact details will be added here / Contactgegevens voor een demo volgen hier” and an in-page explanation, not a pretending active booking button.
Store config `{ play:null, ios:null, publicStudio:null, demoEmail:null }`. Render “Google Play — not yet public / nog niet openbaar” and “App Store — planned / gepland” as non-link text, not counterfeit download badges. Once verified, use actual listing URLs; never guess package IDs or listings. No public APK file in Pages unless explicitly approved.
Footer: short brand line, bilingual legal/contact links, feature availability note, © actual year, “Illustrations use demo data / Illustraties gebruiken demogegevens”. Legal pages visibly pending review until supplied; no fabricated company address or registration number.

### Trainer detail route
Repeat the CTA above fold; image A09. Sections: (1) guided pilot promise, (2) sign-in/onboarding, (3) consent-first client sharing and scopes, (4) review client sessions/progress, (5) queue preview, (6) group workspace preview, (7) what is not yet public, (8) demo checklist/CTA. Copy headline “Coach the person, with their training in view.” / “Coach de persoon, met inzicht in de training.” Include no trainer-originated invitation workflow until implemented. Client identities in mockups are invented and labelled.

### Features route
Sticky category index as wrapping links (not horizontal overflow): Training, Progress, Muscles, Studio, Trainers, Learning, Connections, Planned. Every table row in §4 must have a translated feature entry, platform badge, status badge and evidence key. Body pages, records, effort, lab and settings must not vanish simply because they do not fit the home page.

### Pilot route
Explain trainer-led demo → supervised Android setup → consent discussion → first session → feedback. List practical limitations: homelab/public hosting, backup/restore, privacy/terms, invite flow, error monitoring, NL review and store rollout remain launch checks, not marketing claims. Page should support a real guided demonstration now without implying remote self-serve availability. No health-data intake form on static Pages.

## 6. Design tokens, responsive behavior and accessibility

Brand action `#FF7A3D`, optional coral `#FF5E6C`. Current app dark tokens include surface `#1C1512`, primary text `#F5ECE6`, secondary `#C4B3A8`. Use current generated tokens as source for remaining canvas/border values; document mappings in `src/styles/tokens.css`, do not silently replace them with pure black/gray. Orange button uses very dark text, verify WCAG contrast.

Anatomy stage `#07080B`; neutral head/hands `#1A1D24`; inactive muscle `#2A1418`–`#1E1A20`; rim `#CFE3FF`. Neon identities: glutes `#B44DFF`, quads `#FF3B5C`, hamstrings `#FFB020`, calves `#3DFF8A`, core `#6C63FF`, back `#22D3EE`, shoulders `#FF7A59` (fallback `#FF5FA2` if too close to brand), arms `#F472B6`, optional serratus `#3B82F6`. Use labels/patterns in addition to color. No theme-orange inside the anatomy stage. Confirm against latest exported palette before producing imagery; brief palette is not permission to edit app tokens.

Inter Variable for UI/body and bold clear display, matching app tokens (`Inter_400Regular` through extra-bold). Instrument Serif italic only as a short existing-brand editorial accent; no long serif UI copy. Self-host Latin/Latin-ext WOFF2 subset containing Dutch diacritics; font-display swap; system fallback; preload only the primary used font, optional serif below fold.

Mobile 320–767px: one column, 20px gutters (16 at 320), 16–18px body, 1.5–1.6 line-height, 44–48px touch targets, sections 56–72px apart. 768–1023: two columns where useful; ≥1024: 1200px max container, 12-column grid, 80–112px section rhythm. Headings clamp, never 148px inherited hero on phones. No minimum viewport height that traps landscape phones. Account for safe-area insets in sticky action rail; rail must not obscure footer/consent content. No hover-only labels, autoplay video, drag-only interface, scroll-jacking or mandatory carousels.

Use one H1/route, semantic landmarks/heading order, skip link, visible focus, keyboard-operable menu/FAQ and 4.5:1 normal-text contrast. Respect reduced motion; at most 160–220ms opacity/translate on optional decoration, content visible initially. No loader gate, counters announcing constantly, or critical text baked into raster images. Keep figure captions and chart descriptions in HTML. At 200% text zoom and 320px width, no horizontal scroll.

## 7. Image inventory and production prompts

All generated imagery is illustrative, not product proof. Generate backgrounds/devices without legible UI text, then composite verified screenshots or deterministic HTML/SVG app mockups with real fonts and translated labels. Never rely on an image model for chart values or Dutch text. Save editable source plus prompt/provenance, model/date, synthetic label, screenshot source commit and privacy review in `docs/assets/site-image-manifest.json`. No live personal data, email, trainer names, auth tokens, URLs or credentials in images. Do not use Vineeth-account QA captures publicly without replacing all identifying data and obtaining publishing approval.

Common prompt constraints for every generated asset: premium but realistic fitness product photography, warm dark charcoal environment, orange #FF7A3D reserved for brand/chrome, crisp natural materials, restrained rim lighting, credible adult anatomy and device perspective, inclusive adult subjects, no logos except composited approved SculptaLab mark, no watermark, no testimonials/ratings, no before-after body claims, no garbled text. Keep 10% crop-safe margins and clean negative space for responsive crops.

| ID / output and role | Detailed generation/compositing prompt | Delivery and alt-text intent |
|---|---|---|
| A01 hero-app, 4:5 phone and 16:10 desktop crop | Studio product photograph of a single modern Android phone standing at slight 8-degree angle on matte charcoal gym bench, screen flat dark placeholder for later authentic Today/Progress composite, subtle warm-orange edge reflection, deep shadow with soft readable silhouette, no floating UI clutter, right-side device for desktop and centered portrait alternative; camera 70mm, soft key light, pristine but believable | 480/768/1200 widths; hero mobile ≤140 KB; alt “Illustrative SculptaLab training overview” translated |
| A02 plan, 3:4 | Orthographic premium app presentation, dark charcoal phone frame, straight-on clean screen reserved for current seeded plan view, orange tabs and warm cream typographic UI composited later, three exercise rows and week strip from verified app, no invented premium badges | 400/640/960; ≤100 KB mobile; alt describes weekly plan |
| A03 workout, 3:4 | Close product still of Android phone resting upright against a clean rubber gym block, screen reserved for workout-player set list and rest timer, a blurred dumbbell edge well outside screen, authentic soft gym light, no hands obscuring controls; composite safe demo workout | 400/640/960; ≤100 KB; alt describes set logging/rest |
| A04 muscle-front and muscle-back, each 4:5 | Anatomically credible stylised male and female ecorché figures as separate exports, all major muscles clearly segmented, smooth faceless dark charcoal head/hands, glossy but non-plastic PBR surface, restrained cool-white Fresnel rim, inactive deep maroon muscles, identity neon magenta glutes, red quads, amber hamstrings, green calves, violet core, cyan back, pink shoulders/arms, near-black vignette stage, full limbs in frame; no orange, no sci-fi armor, no text, no gore. Add labels/leader lines deterministically outside body, using v4 reference composition | 480/800/1200; ≤160 KB mobile per selected view; front eager only if hero, back lazy; alt identifies illustrative training map, not scan |
| A05 studio-overview, 16:10 and detail 4:5 | Straight-on web app editorial frame on matte dark background with minimal browser chrome; composite actual sanitized Studio overview with score, weekly chart and session list, warm orange selected tab, cream text and actual MI identity colors; no invented data precision, no decorative graph noise | 640/960/1440; ≤160 KB mobile crop; alt describes dashboard |
| A06 form-preview, 4:5 | Adult wearing opaque athletic clothing in controlled side-view squat setup, phone camera safely outside lifting path, neutral gym background, realistic joint alignment and equipment; overlay only a subtle illustrative pose trace and preview badge using deterministic vector layer, never a clinical diagnosis, no glowing organs or impossible bent limbs | 480/768/1200; ≤130 KB mobile; alt says illustrative supported-movement analysis preview |
| A07 movement-guide, 4:3 | Neutral faceless exercise mannequin demonstrating a hip hinge with light dumbbells, side view, stable spine and believable hip/knee angles, matte charcoal body and warm soft rim, dark plain background, enough space for deterministic three-step guide labels; use existing exercise art where suitable instead of regeneration | 400/640/960; ≤90 KB; alt describes exercise guide |
| A08 trainer-conversation, 3:2 with 4:5 crop | Candid editorial lifestyle photograph in a clean ordinary Dutch neighborhood gym, adult woman trainer and adult client with different body types discussing a tablet on bench between sessions, relaxed respectful posture, both fully clothed, naturally diverse, device screen blank for safe app composite, subtle orange towel detail, realistic daylight, no model-like bodybuilding pose, no visible commercial brands | 480/800/1280; ≤130 KB mobile; alt describes illustrative trainer/client discussion |
| A09 trainer-dashboard, 16:10 and 4:5 | Premium straight-on tablet product still on dark training desk, screen reserved for sanitized trainer client view, consent/status scope indicator, three history rows and chart; composite from current trainer UI or explicitly illustrative HTML, fictional client only, no medical metrics; generous crop margins | 480/800/1280; ≤140 KB mobile; alt trainer shared-data preview |
| A10 pilot-gym, 16:9 with 4:5 crop | Documentary-style inviting modest strength gym, adult trainer preparing a phone on stand near squat rack, uncrowded safe walkway, mixed practical equipment, soft daylight with warm accent, no luxury spa visual or identifiable gym/trainer logo, no QR code generated into photo | 480/800/1280; ≤120 KB; pilot route only |
| A11 og-nl and og-en, 1200:630 | Compose deterministic social card, not AI text: dark app ground, approved logo upper left, orange short headline “Meer inzicht in je training” / “Understand your training”, one phone crop and small authentic anatomy crop on right, large mobile-readable type, pilot tag, clear safe margins; use A01/A04 as artwork | JPEG/PNG ≤250 KB for crawler compatibility; localized OG not giant AVIF |
| A12 logo/favicon/social mark | Reuse approved public/favicon.svg and existing icon family; no image generation, no logo redesign | SVG plus existing PNG sizes, check manifest base paths |

No additional decorative stock image is necessary. More images require an explicit role/budget addition, not arbitrary filler. Keep source masters out of public deployment; export AVIF and WebP with JPEG/PNG fallback only where needed.

### Real screenshot shortlist (app repository, exact existing paths)

- `docs/build/visual-qa-2026-11-08/systest/02_home.png` → A05 overview candidate.
- `docs/build/visual-qa-2026-11-08/systest/05_plan.png` → A02 plan candidate.
- `docs/build/visual-qa-2026-11-08/systest/04_workouts_sessions.png` and `04b_workouts_activities.png` → history proof in features.
- `docs/build/visual-qa-2026-11-08/systest/03_progress.png`, `03b_progress_mi_hero.png` → progression composition reference.
- `docs/build/visual-qa-2026-11-08/mi-anatomy-v3/sanne-mobile-female-anatomy-front.png`, `sanne-laptop-female-anatomy-back.png` → pre-v4 fallbacks, explicitly older visual treatment.
- `docs/build/visual-qa-2026-11-08/mi-anatomy-v4/laptop-front.png`, `laptop-back.png`, `mobile-front.png`, `laptop-hover-glutes.png` → v4 candidates ONLY after manual inspection confirms visible body, working shader, non-overlapping labels and current deployed version. Do not equate QA filename with approval.
- `docs/build/visual-qa-2026-11-08/mi-v2/sanne-mobile-home.png` → historical mobile layout reference, not current release screenshot.
- `docs/build/visual-qa-2026-11-07/muscle-coverage-preview-2026-11-07/fixture-mobile-390.png` → fixture/reference only, not customer proof.

These files were inventoried, not approved for publication or claimed visually verified in this documentation task. Obtain fresh sanitized trainer/mobile captures if no suitable QA image exists; never fabricate a “real screenshot”. Name sanitized derivatives by feature, not account name. Keep original screenshots unmodified in app repo; exports in site `public/images/screens/` only after approval.

## 8. Static implementation and performance contract

Retain Vite and vanilla HTML/CSS. Add a lightweight build-time page generator (`scripts/render-pages.mjs`, templates plus locale content); generate locale HTML inputs into a git-ignored working directory and supply explicit multi-page Vite inputs. Build must produce nested `dist/nl/index.html`, `dist/en/index.html`, trainers/features/pilot/legal subdirectories with working trailing-slash URLs. No SPA fallback trick, React/Next runtime, WebGL, GSAP, Lenis or client-side router. Root and 404 are real static HTML. Remove old shader/loader/pinned-story code and dependency imports, then unused dependencies/lock entries.

Performance budget on representative built home and trainer routes, mobile Lighthouse ≥90 performance (aim ≥95 accessibility/SEO), LCP <2.5s, CLS <0.1, INP target <200ms. These are acceptance targets, not measured claims. In field data confirm once traffic exists; a lab run cannot establish field INP.

Initial mobile transfer ≤450 KB including hero/fonts/CSS/JS; total homepage lazy image set target ≤1.5 MB. First-party JS ≤15 KB gzip, CSS ≤30 KB gzip, fonts ≤80 KB combined, no third-party scripts on initial navigation. Use one responsive hero with explicit width/height, fetchpriority high, not lazy; below-fold images loading lazy/decoding async; AVIF source then WebP source/fallback. `srcset` widths 400/640/960/1440 where appropriate, correct `sizes` at each layout; no loading all alternatives then hiding with CSS. Avoid font/image preloads that compete with LCP; no remote fonts, autoplay media or embedded trackers. Native SVG icons and CSS charts when explanatory, not interactive app clones.

Pages hosting does not provide arbitrary custom response headers: use content hashing and verify actual caching, not fictional `_headers` guarantees. Metadata and generated files must respect base paths. Include no external form/analytics SDK until separately approved with privacy review. Store/test tooling stays dev-only.

## 9. SEO, social and URL contract

Until domain is confirmed use `https://vineethvijay.github.io/sculptalab-site/` as configured canonical origin/base, verify actual Pages URL before publishing. One `SITE_URL` value drives canonical/sitemap/OG; changing to custom domain requires explicit DNS/Pages/CNAME decision and BASE `/` together.

Every route: correct `lang`, UTF-8, viewport, unique title/description, absolute canonical, hreflang `nl`, `en`, `x-default` root, localized OG type website/title/description/url/image/image:width=1200/height=630/image:alt and locale `nl_NL` / `en_US` plus alternate locale. Twitter card summary_large_image with same localized image. Theme-color dark. No canonical to homelab or localhost. No `og:video`, stars or product pricing.

Home title EN “SculptaLab — Training insights for you and your trainer”; NL “SculptaLab — Trainingsinzicht voor jou en je trainer”. Description EN “Plan workouts, log sets and explore your progress in SculptaLab. Discover the trainer-led gym pilot and consent-based sharing.” NL “Plan trainingen, houd sets bij en bekijk je voortgang met SculptaLab. Ontdek de trainerspilot en delen met toestemming.” Trainer title “SculptaLab for trainers — Gym pilot” / “SculptaLab voor trainers — Sportschoolpilot”. Features “SculptaLab features — Training, Studio and progress” / “SculptaLab-functies — Training, Studio en voortgang”. Pilot “Request a SculptaLab pilot demo” / “Vraag een SculptaLab-pilotdemo aan”. Legal titles state actual document type, not finalized compliance.

Generate sitemap.xml with locale alternates and robots.txt pointing to absolute sitemap. Preview deploys/artifacts noindex; production index only after contact, availability and legal copy approved. Root chooser should be indexable with x-default; no duplicate full English page at root. JSON-LD WebSite + SoftwareApplication with real name, category HealthApplication and honest platform text; omit offers/ratings/reviews/download URL when unavailable. Never add fake Organization address. Existing manifest start_url/icons must be base-aware; marketing is not advertised as an offline app.

## 10. Pages deploy workflow (implementation specification)

Maintain `.github/workflows/deploy.yml`; build on PR for validation/artifact only, deploy on approved main push or manual main dispatch only. Set Node to supported project-approved LTS and pin lockfile (current is Node 20; update intentionally rather than silently requiring it forever). Steps: checkout → setup-node/npm cache → npm ci → content generation/asset checks → `BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build` → static link/locale budget checks → configure-pages → upload `dist` → deploy-pages in separate main-only job/environment. Restrict permissions: build contents read; deploy pages write/id-token write. Preserve concurrency and deployment URL output; keep Pages environment protection.

Public output must include `.nojekyll`, 404.html, robots/sitemap and all locale pages. Test images, fonts, manifest and links under project base including deep-route hard refresh. PR and brief branch must never publish the live site. Artifact-only build needs no app or cluster secrets. No GLUTE4ALL token in source/YAML/artifacts; existing credentials used only by git tooling. No Cloudflare/Vercel migration, DNS change, app deployment, or Pages settings mutation in this brief scope. Rollback by reverting approved site commit through normal history; never force-push.

## 11. Numbered Composer 2.5 build batches

Planning refinement may use Argon; implementation uses Composer 2.5 only (never fast). Build first without running tests during implementation; then static Pages deployment after approval; then one small verification pass. Do not repeat the previous 150-screenshot QA. Mac remains coding-only; any local build/test work uses ai-node or approved CI, never Mac app/dev/test processes. No deployment from this documentation branch.

1. **Content inventory and scaffolding.** Files `docs/content/feature-manifest.json`, `src/content/{nl,en}.json`, `scripts/render-pages.mjs`, `src/templates/{page,sections}.html`, `vite.config.js`, `package.json`, lockfile, README. Preserve old site until replacement complete. Acceptance after build phase: every §4 row has EN/NL text, source key, status/platform; generated nested static pages exist; null store/contact values supported; no unsupported feature inflated to released.
2. **Design system and home.** Files `src/styles/{tokens,base,layout,components}.css`, `src/templates/home.html`, `src/main.js`. Replace loader/shader/scroll effects; implement §5 sequence. Acceptance: all story/CTA content visible without JS; one H1; real section IDs; primary trainer CTA above hero image on mobile; no horizontal scroll at 320/390/768/1440; reduced motion has no content loss.
3. **Asset production and sanitization.** Files `public/images/{hero,anatomy,screens,lifestyle}/`, `scripts/images.mjs`, `docs/assets/site-image-manifest.json`. Generate A01–A11 only as needed, reuse A12; no publishing private QA originals. Acceptance: every image has provenance, crop/dimensions, alt keys, synthetic-vs-real label, AVIF/WebP variants and approved privacy status; visible anatomy and accurate demo UI; no baked-in AI text.
4. **Trainer/features/pilot and complete localization.** Files `src/templates/{trainers,features,pilot,legal,contact}.html`, dictionaries, feature manifest. Acceptance: all catalogue rows represented; trainer consent/scopes and preview limits clear; NL/EN switch preserves equivalent route; no invented email/form submission/store endpoint; legal pending state explicit; pilot does not collect health data.
5. **Metadata, build and Pages wiring.** Files `scripts/{metadata,check-static}.mjs`, `vite.config.js`, root/404 templates, `public/site.webmanifest`, generated robots/sitemap, OG assets, `.github/workflows/deploy.yml`, README. Acceptance: base-path deep links/assets work; PR cannot deploy; no secrets; localized canonical/hreflang/OG valid; npm ci/build reproducible; no runtime app server; remove GSAP/Lenis dependencies and unused shader code.
6. **Single final lightweight verification and handover.** Files `docs/build/site-rebuild-check.md` plus at most four screenshots (NL mobile home, EN mobile trainer, desktop anatomy, mobile features). After authorized staging/production deployment, one link/locale check and one Lighthouse mobile run each home/trainer. Acceptance: mobile score ≥90, LCP <2.5s with report/config recorded, budgets respected; no layout/label overlap, readable anatomy, working real CTAs or honest disabled state. If failing, focused correction then recheck only failing area. Report exact deployed commit/URL and remaining pilot blockers; no claims of QA clean without looking at captures. User-facing screenshots must be sanitized.

## 12. Decisions and launch checklist still needed

- Confirm real public contact channel and permission to publish it; until then no working demo-request claim.
- Confirm actual Pages production URL, domain plan and whether approved legal pages exist. Do not invent business identity.
- Verify which app flags are enabled for the pilot, iOS/store availability and the corrected v4 render before publishing claims/screens.
- Approve sanitized screenshots and generated illustrative images; no source QA account data leaves the repo through marketing exports by default.
- Trainer pilot prerequisites remain separate work: public HTTPS app origin, tested backups/restore, terms/privacy/health consent and trainer agreements, invitation flow, pilot billing behavior, error monitoring, native NL review and guided demo script. Website polish does not resolve those blockers.

Definition of done for this task: this evidence-grounded brief only, on `site-rebuild-brief`; no production deployment or application changes. Definition of done for the later rebuild: bilingual, honest feature coverage, mobile-first static output, approved assets/contact/legal content, Pages-path correctness and one small recorded performance/visual pass.
