#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(ROOT, ".pages");
const TEMPLATE_DIR = path.join(ROOT, "src", "templates");

const BASE = normalizeBase(process.env.BASE || "/");
const SITE_URL = normalizeSiteUrl(process.env.SITE_URL || "https://vineethvijay.github.io/sculptalab-site/");
const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";
const ROBOTS_META = ALLOW_INDEXING ? "index, follow" : "noindex, nofollow";

function normalizeSiteUrl(url) {
  if (!url.endsWith("/")) url = `${url}/`;
  return url;
}

function sitePath(...parts) {
  const joined = parts.filter(Boolean).join("/");
  if (!joined) return "";
  return joined.endsWith("/") ? joined : `${joined}/`;
}

function absoluteUrl(...pathParts) {
  const rel = sitePath(...pathParts);
  return `${SITE_URL}${rel}`;
}

function ogImageForLang(lang) {
  return `${SITE_URL}og-${lang === "nl" ? "nl" : "en"}.png`;
}

function buildSeoVars(lang, routeId, segment, content) {
  const pathParts = lang ? [lang, segment].filter(Boolean) : [];
  const canonicalUrl =
    routeId === "root"
      ? SITE_URL
      : routeId === "404"
        ? absoluteUrl("404.html")
        : absoluteUrl(...pathParts);

  const hreflangDefault = SITE_URL;
  const hreflangNl = segment ? absoluteUrl("nl", segment) : absoluteUrl("nl");
  const hreflangEn = segment ? absoluteUrl("en", segment) : absoluteUrl("en");

  const ogLocale = lang === "nl" ? "nl_NL" : "en_US";
  const ogLocaleAlternate = lang === "nl" ? "en_US" : "nl_NL";
  const ogImage = ogImageForLang(lang || "en");
  const ogImageAlt =
    lang === "nl"
      ? "SculptaLab — illustratieve trainingsapp-weergave"
      : "SculptaLab — illustrative training app preview";

  let jsonLdBlock = "";
  if (routeId === "home" || (lang && routeId.endsWith("/home"))) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "SculptaLab",
          url: SITE_URL,
          inLanguage: [lang === "nl" ? "nl-NL" : "en-US"],
        },
        {
          "@type": "SoftwareApplication",
          name: "SculptaLab",
          applicationCategory: "HealthApplication",
          operatingSystem: "Android pilot; Web Studio; trainer web preview",
        },
      ],
    };
    jsonLdBlock = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  }

  return {
    robotsMeta: ROBOTS_META,
    canonicalUrl,
    hreflangNl,
    hreflangEn,
    hreflangDefault,
    ogImage,
    ogImageAlt,
    ogLocale,
    ogLocaleAlternate,
    jsonLdBlock,
  };
}

const ROUTES = [
  { id: "home", segment: "", template: "home" },
  { id: "trainers", segment: "trainers", template: "trainers" },
  { id: "features", segment: "features", template: "features" },
  { id: "pilot", segment: "pilot", template: "pilot" },
  { id: "privacy", segment: "privacy", template: "legal" },
  { id: "terms", segment: "terms", template: "legal" },
  { id: "contact", segment: "contact", template: "contact" },
];

const TEMPLATE_FILES = {
  home: "home.html",
  trainers: "trainers.html",
  features: "features.html",
  pilot: "pilot.html",
  legal: "legal.html",
  contact: "contact.html",
};

function normalizeBase(base) {
  if (!base.startsWith("/")) base = `/${base}`;
  return base.endsWith("/") ? base : `${base}/`;
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

function readTemplate(name) {
  const file = TEMPLATE_FILES[name] ?? `${name}.html`;
  return fs.readFileSync(path.join(TEMPLATE_DIR, file), "utf8");
}

function flattenKeys(obj, prefix = "", out = new Set()) {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        flattenKeys(value, next, out);
      } else {
        out.add(next);
      }
    }
  }
  return out;
}

function validateLocaleParity(en, nl) {
  const enKeys = flattenKeys(en);
  const nlKeys = flattenKeys(nl);
  const missingInNl = [...enKeys].filter((k) => !nlKeys.has(k)).sort();
  const missingInEn = [...nlKeys].filter((k) => !enKeys.has(k)).sort();
  if (missingInNl.length || missingInEn.length) {
    console.error("Locale key mismatch:");
    for (const k of missingInNl) console.error(`  missing in nl.json: ${k}`);
    for (const k of missingInEn) console.error(`  missing in en.json: ${k}`);
    process.exit(1);
  }
}

function validateManifest(manifest, en, nl) {
  if (manifest.length !== 21) {
    console.error(`Expected 21 manifest features, got ${manifest.length}`);
    process.exit(1);
  }
  for (const row of manifest) {
    const key = row.truthCaveatKey;
    if (!key?.startsWith("features.")) {
      console.error(`Invalid truthCaveatKey for ${row.id}`);
      process.exit(1);
    }
    const featureId = key.replace("features.", "").replace(".caveat", "");
    if (!en.features?.[featureId] || !nl.features?.[featureId]) {
      console.error(`Missing feature copy for manifest id ${row.id} (${featureId})`);
      process.exit(1);
    }
  }
}

function substitute(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const v = vars[name];
      return v === null || v === undefined ? "" : String(v);
    }
    return "";
  });
}

function url(...parts) {
  const joined = parts.filter(Boolean).join("/");
  return `${BASE}${joined}${joined && !joined.endsWith(".html") ? "/" : ""}`.replace(
    /\/+/g,
    "/"
  );
}

function localeHref(lang, segment) {
  if (!segment) return url(lang);
  return url(lang, segment);
}

function swapLangHref(currentLang, segment) {
  const other = currentLang === "nl" ? "en" : "nl";
  return localeHref(other, segment);
}

function assetUrl(relFromPublic) {
  return `${BASE}${relFromPublic.replace(/^\//, "")}`;
}

function srcset(folder, stem, widths, format) {
  return widths.map((w) => `${assetUrl(`images/${folder}/${stem}-${w}w.${format}`)} ${w}w`).join(", ");
}

function responsivePicture({
  folder,
  stem,
  widths,
  alt,
  sizes,
  width,
  height,
  loading = "lazy",
  fetchpriority,
  desktopStem,
  desktopWidths = [1280],
}) {
  const avif = srcset(folder, stem, widths, "avif");
  const webp = srcset(folder, stem, widths, "webp");
  const priority = fetchpriority ? ` fetchpriority="${fetchpriority}"` : "";
  const load = ` loading="${loading}" decoding="async"${priority}`;
  let picture = `<picture>`;
  if (desktopStem) {
    const dAvif = desktopWidths
      .map((w) => `${assetUrl(`images/${folder}/${desktopStem}-${w}w.avif`)} ${w}w`)
      .join(", ");
    const dWebp = desktopWidths
      .map((w) => `${assetUrl(`images/${folder}/${desktopStem}-${w}w.webp`)} ${w}w`)
      .join(", ");
    picture += `<source media="(min-width: 768px)" type="image/avif" srcset="${dAvif}" sizes="${sizes}" />`;
    picture += `<source media="(min-width: 768px)" type="image/webp" srcset="${dWebp}" sizes="${sizes}" />`;
  }
  picture += `<source type="image/avif" srcset="${avif}" sizes="${sizes}" />`;
  picture += `<source type="image/webp" srcset="${webp}" sizes="${sizes}" />`;
  const fallback = assetUrl(`images/${folder}/${stem}-${widths[0]}w.webp`);
  picture += `<img src="${fallback}" alt="${alt}" width="${width}" height="${height}"${load} />`;
  picture += `</picture>`;
  return picture;
}

function statusKey(row) {
  return row.status === "in_pilot" ? "inPilot" : row.status === "preview" ? "preview" : "planned";
}

function platformLabels(content, platforms) {
  return platforms.map((p) => content.platforms[p] ?? p).join(" · ");
}

function demoMailtoUri(email, content) {
  const subject = encodeURIComponent(content.store.demoMailSubject ?? "SculptaLab trainer demo");
  return `mailto:${email}?subject=${subject}`;
}

function buildDemoContact(content) {
  const email = content.config.demoEmail;
  if (!email) {
    return `<p class="contact-pending">${content.store.demoContactPending}</p>`;
  }
  const mailto = demoMailtoUri(email, content);
  const label = content.store.demoBookCta;
  const mailText = content.store.demoMailLabel ?? email;
  return `<div class="contact-cta">
  <p><a href="${mailto}">${mailText}</a></p>
  <p class="hero-actions">
    <a class="btn-primary" href="${mailto}">${label}</a>
  </p>
</div>`;
}

function buildFeatureCatalogue(content, manifest) {
  const byCategory = new Map();
  for (const row of manifest) {
    const list = byCategory.get(row.category) ?? [];
    list.push(row);
    byCategory.set(row.category, list);
  }
  const order = [
    "training",
    "progress",
    "muscles",
    "studio",
    "trainers",
    "learning",
    "connections",
    "planned",
  ];
  return order
    .filter((cat) => byCategory.has(cat))
    .map((cat) => {
      const heading = content.categories[cat];
      const cards = byCategory
        .get(cat)
        .map((row) => {
          const f = content.features[row.id];
          const sk = statusKey(row);
          return `<article class="feature-card" id="${row.id}">
  <header class="feature-card__head">
    <h3>${f.title}</h3>
    <span class="badge">${content.status[sk]}</span>
  </header>
  <p class="feature-card__desc">${f.description}</p>
  <p class="platforms">${platformLabels(content, row.platforms)}</p>
  <p class="caveat">${f.caveat}</p>
</article>`;
        })
        .join("\n");
      return `<section class="page-section" id="cat-${cat}"><h2>${heading}</h2>\n${cards}</section>`;
    })
    .join("\n");
}

function commonVars(content) {
  const lang = content.lang;
  return {
    configPlay: content.config.play ?? "",
    configIos: content.config.ios ?? "",
    storePlay: content.config.play ? content.config.play : content.store.playPending,
    storeIos: content.config.ios ? content.config.ios : content.store.iosPending,
    demoContact: buildDemoContact(content),
    demoMailtoHref: content.config.demoEmail ? demoMailtoUri(content.config.demoEmail, content) : "",
    pilotHref: localeHref(lang, "pilot"),
    trainersHref: localeHref(lang, "trainers"),
    featuresHref: localeHref(lang, "features"),
    homeHref: localeHref(lang, ""),
    contactHref: localeHref(lang, "contact"),
    statusPreview: content.status.preview,
    statusInPilot: content.status.inPilot,
    statusAndroidOnly: content.status.androidOnly,
  };
}

function buildHomeVars(content) {
  const h = content.home;
  return {
    ...commonVars(content),
    heroEyebrow: h.hero.eyebrow,
    heroH1: h.hero.h1,
    heroBody: h.hero.body,
    heroPrimaryCta: h.hero.primaryCta,
    heroSecondaryCta: h.hero.secondaryCta,
    heroMicrocopy: h.hero.microcopy,
    heroTranslationNote: h.hero.translationNote,
    heroFigureCaption: h.hero.figureCaption,
    trainersH2: h.trainers.h2,
    trainersBody: h.trainers.body,
    trainersStep1: h.trainers.step1,
    trainersStep2: h.trainers.step2,
    trainersStep3: h.trainers.step3,
    trainersCta: h.trainers.cta,
    trainersCaption: h.trainers.caption,
    planTrainH2: h.planTrain.h2,
    planTrainRow1: h.planTrain.row1,
    planTrainRow2: h.planTrain.row2,
    planTrainRow3: h.planTrain.row3,
    planTrainSupporting: h.planTrain.supporting,
    planTrainWorkoutNote: h.planTrain.workoutNote,
    planTrainCta: h.planTrain.cta,
    musclesH2: h.muscles.h2,
    musclesBody: h.muscles.body,
    musclesDisclaimer: h.muscles.disclaimer,
    musclesViewLabel: h.muscles.viewLabel,
    musclesViewFront: h.muscles.viewFront,
    musclesViewBack: h.muscles.viewBack,
    musclesLegendGlutes: h.muscles.legendGlutes,
    musclesLegendQuads: h.muscles.legendQuads,
    musclesLegendHamstrings: h.muscles.legendHamstrings,
    musclesLegendCalves: h.muscles.legendCalves,
    musclesLegendCore: h.muscles.legendCore,
    musclesLegendBack: h.muscles.legendBack,
    musclesLegendShoulders: h.muscles.legendShoulders,
    musclesLegendArms: h.muscles.legendArms,
    musclesCta: h.muscles.cta,
    musclesDemoHint: h.muscles.demoHint,
    musclesDemoTap: h.muscles.demoTap,
    musclesLegendGluteusMax: h.muscles.legendGluteusMax,
    musclesLegendRectusFem: h.muscles.legendRectusFem,
    musclesLegendHamGroup: h.muscles.legendHamGroup,
    musclesLegendGastroc: h.muscles.legendGastroc,
    musclesLegendAbs: h.muscles.legendAbs,
    musclesLegendLats: h.muscles.legendLats,
    musclesLegendDelts: h.muscles.legendDelts,
    musclesLegendBisTris: h.muscles.legendBisTris,
    musclesFigureAlt: h.muscles.figureAlt,
    muscleFrontHref: assetUrl("images/anatomy/mi-v4/plates/female-front-480w.webp"),
    muscleBackHref: assetUrl("images/anatomy/mi-v4/plates/female-back-480w.webp"),
    muscleFrontImg: assetUrl("images/anatomy/mi-v4/plates/female-front-800w.webp"),
    muscleBackImg: assetUrl("images/anatomy/mi-v4/plates/female-back-800w.webp"),
    muscleHighlightBase: assetUrl("images/anatomy/mi-v4/highlights/"),
    muscleHighlightQuads: assetUrl("images/anatomy/mi-v4/highlights/female-front-quads-800w.webp"),
    progressH2: h.progressStudio.h2,
    progressBody: h.progressStudio.body,
    progressCol1: h.progressStudio.col1Title,
    progressCol2: h.progressStudio.col2Title,
    progressCol3: h.progressStudio.col3Title,
    progressCol1Body: h.progressStudio.col1Body,
    progressCol2Body: h.progressStudio.col2Body,
    progressCol3Body: h.progressStudio.col3Body,
    progressCta: h.progressStudio.cta,
    formH2: h.form.h2,
    formBody: h.form.body,
    formFootnote: h.form.footnote,
    formCta: h.form.cta,
    learnH2: h.learnDaily.h2,
    learnBody: h.learnDaily.body,
    learnItem1: h.learnDaily.item1,
    learnItem2: h.learnDaily.item2,
    learnItem3: h.learnDaily.item3,
    learnItem4: h.learnDaily.item4,
    learnItem5: h.learnDaily.item5,
    learnItem6: h.learnDaily.item6,
    learnCta: h.learnDaily.cta,
    roadmapH2: h.roadmap.h2,
    roadmapPilotHeading: h.roadmap.pilotHeading,
    roadmapPlannedHeading: h.roadmap.plannedHeading,
    roadmapPilotList: h.roadmap.pilotList,
    roadmapPlannedList: h.roadmap.plannedList,
    roadmapCatalogueLink: h.roadmap.catalogueLink,
    faqH2: h.faq.h2,
    faqQ1: h.faq.q1,
    faqA1: h.faq.a1,
    faqQ2: h.faq.q2,
    faqA2: h.faq.a2,
    faqQ3: h.faq.q3,
    faqA3: h.faq.a3,
    faqQ4: h.faq.q4,
    faqA4: h.faq.a4,
    faqQ5: h.faq.q5,
    faqA5: h.faq.a5,
    faqQ6: h.faq.q6,
    faqA6: h.faq.a6,
    pilotFooterH2: h.pilotFooter.h2,
    pilotFooterBody: h.pilotFooter.body,
    pilotFooterPrimaryCta: h.pilotFooter.primaryCta,
    pilotFooterDemoExplanation: h.pilotFooter.demoExplanation,
    heroPicture: responsivePicture({
      folder: "hero",
      stem: "a01-hero-app",
      widths: [480, 768],
      desktopStem: "a01-hero-app-desktop",
      desktopWidths: [1200],
      alt: h.hero.figureAlt,
      sizes: "(min-width: 768px) 42vw, 100vw",
      width: 480,
      height: 600,
      loading: "eager",
      fetchpriority: "high",
    }),
    trainersPicture: responsivePicture({
      folder: "lifestyle",
      stem: "a08-trainer-conversation",
      widths: [480, 800],
      desktopStem: "a08-trainer-conversation-desktop",
      alt: h.trainers.figureAlt,
      sizes: "(min-width: 768px) 40vw, 100vw",
      width: 480,
      height: 640,
    }),
    planPicture: responsivePicture({
      folder: "screens",
      stem: "a02-plan",
      widths: [400, 640],
      alt: h.planTrain.planAlt,
      sizes: "(min-width: 768px) 12rem, min(100vw - 2.5rem, 14rem)",
      width: 400,
      height: 533,
    }),
    workoutPicture: responsivePicture({
      folder: "screens",
      stem: "a03-workout",
      widths: [400, 640],
      alt: h.planTrain.workoutAlt,
      sizes: "(min-width: 768px) 12rem, min(100vw - 2.5rem, 14rem)",
      width: 400,
      height: 533,
    }),
    musclePicture: responsivePicture({
      folder: "anatomy",
      stem: "a04-muscle-front",
      widths: [480, 800],
      alt: h.muscles.figureAlt,
      sizes: "(min-width: 768px) 38vw, 100vw",
      width: 480,
      height: 600,
    }),
    studioPicture: responsivePicture({
      folder: "screens",
      stem: "a05-studio-mobile",
      widths: [390, 640],
      desktopStem: "a05-studio-desktop",
      desktopWidths: [1440],
      alt: h.progressStudio.figureAlt,
      sizes: "(min-width: 768px) 70vw, 100vw",
      width: 390,
      height: 844,
    }),
    studioHighlightPicture: responsivePicture({
      folder: "screens",
      stem: "a05-studio-highlight",
      widths: [640, 960],
      desktopStem: "a05-studio-highlight-desktop",
      desktopWidths: [1440],
      alt: h.progressStudio.highlightCaption,
      sizes: "(min-width: 768px) 70vw, 100vw",
      width: 640,
      height: 400,
    }),
    progressHighlightCaption: h.progressStudio.highlightCaption,
    formPicture: responsivePicture({
      folder: "screens",
      stem: "a06-form-preview",
      widths: [480, 768],
      alt: h.form.figureAlt,
      sizes: "(min-width: 768px) 40vw, 100vw",
      width: 480,
      height: 600,
    }),
    learnPicture: responsivePicture({
      folder: "screens",
      stem: "a07-movement-guide",
      widths: [400, 640],
      alt: h.learnDaily.figureAlt,
      sizes: "(min-width: 768px) 50vw, 100vw",
      width: 400,
      height: 300,
    }),
  };
}

function buildRouteVars(content, route, manifest) {
  const r = content.routes[route.id];
  const base = { ...commonVars(content), routeH1: r?.h1 ?? "", routeIntro: r?.intro ?? "" };

  if (route.id === "trainers") {
    const t = r;
    return {
      ...base,
      trainersPageCta: t.pageCta,
      trainersS1H2: t.s1.h2,
      trainersS1Body: t.s1.body,
      trainersS2H2: t.s2.h2,
      trainersS2Body: t.s2.body,
      trainersS3H2: t.s3.h2,
      trainersS3Body: t.s3.body,
      trainersS4H2: t.s4.h2,
      trainersS4Body: t.s4.body,
      trainersS5H2: t.s5.h2,
      trainersS5Body: t.s5.body,
      trainersS6H2: t.s6.h2,
      trainersS6Body: t.s6.body,
      trainersS7H2: t.s7.h2,
      trainersS7Item1: t.s7.item1,
      trainersS7Item2: t.s7.item2,
      trainersS7Item3: t.s7.item3,
      trainersS8H2: t.s8.h2,
      trainersCheck1: t.s8.check1,
      trainersCheck2: t.s8.check2,
      trainersCheck3: t.s8.check3,
      trainersSyntheticNote: t.syntheticNote,
      syntheticLabel: content.featuresUi.syntheticLabel,
      trainersHeroPicture: responsivePicture({
        folder: "screens",
        stem: "a09-trainer-dashboard",
        widths: [480, 800],
        desktopStem: "a09-trainer-dashboard-desktop",
        alt: t.figureAlt,
        sizes: "(min-width: 768px) 60vw, 100vw",
        width: 480,
        height: 600,
        loading: "eager",
        fetchpriority: "high",
      }),
      trainersClientPicture: responsivePicture({
        folder: "screens",
        stem: "a09-trainer-client-2d",
        widths: [480, 800],
        desktopStem: "a09-trainer-client-2d-desktop",
        alt: t.clientAlt,
        sizes: "(min-width: 768px) 60vw, 100vw",
        width: 480,
        height: 600,
      }),
      trainersClientCaption: t.clientCaption,
    };
  }

  if (route.id === "features") {
    return {
      ...base,
      featuresNote: r.note,
      featuresIndexLabel: r.indexLabel,
      featuresLegend: r.legend,
      featureCatalogue: buildFeatureCatalogue(content, manifest),
      catTraining: content.categories.training,
      catProgress: content.categories.progress,
      catMuscles: content.categories.muscles,
      catStudio: content.categories.studio,
      catTrainers: content.categories.trainers,
      catLearning: content.categories.learning,
      catConnections: content.categories.connections,
      catPlanned: content.categories.planned,
    };
  }

  if (route.id === "pilot") {
    return {
      ...base,
      pilotWalkHeading: r.walkHeading,
      pilotStep1: r.step1,
      pilotStep2: r.step2,
      pilotStep3: r.step3,
      pilotStep4: r.step4,
      pilotStep5: r.step5,
      pilotAvailabilityHeading: r.availabilityHeading,
      pilotAvailabilityBody: r.availabilityBody,
      pilotLimitsHeading: r.limitsHeading,
      pilotLimit1: r.limit1,
      pilotLimit2: r.limit2,
      pilotLimit3: r.limit3,
      pilotLimit4: r.limit4,
      pilotLimit5: r.limit5,
      pilotNoFormNote: r.noFormNote,
      pilotContactCta: r.contactCta,
      pilotHeroPicture: responsivePicture({
        folder: "lifestyle",
        stem: "a10-pilot-gym",
        widths: [480, 800],
        desktopStem: "a10-pilot-gym-desktop",
        alt: r.figureAlt,
        sizes: "(min-width: 768px) 70vw, 100vw",
        width: 480,
        height: 600,
      }),
    };
  }

  if (route.id === "privacy" || route.id === "terms") {
    return {
      ...base,
      legalBanner: r.banner,
      legalBody: r.bodyHtml,
      legalFooterNote: r.footerNote,
    };
  }

  if (route.id === "contact") {
    return {
      ...base,
      contactBody: r.body,
      contactNoFormNote: r.noFormNote,
      contactPilotLink: r.pilotLink,
    };
  }

  return base;
}

function buildMainContent(content, route, manifest) {
  const templateName = route.template;
  const template = readTemplate(templateName);
  const vars =
    route.id === "home"
      ? buildHomeVars(content)
      : buildRouteVars(content, route, manifest);
  return substitute(template, vars);
}

function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function writePage(relFile, html) {
  const out = path.join(PAGES_DIR, relFile);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
}

function renderLocalePage(content, route, manifest, pageShell) {
  const lang = content.lang;
  const meta = content.meta[route.id === "home" ? "home" : route.id];
  const segment = route.segment;
  const mainContent = buildMainContent(content, route, manifest);

  const vars = {
    ...buildSeoVars(lang, segment || "home", segment, content),
    htmlLang: lang,
    pageTitle: meta.title,
    pageDescription: meta.description,
    base: BASE,
    routeId: `${lang}/${segment || "home"}`,
    skipToContent: content.nav.skipToContent,
    homeHref: localeHref(lang, ""),
    trainersHref: localeHref(lang, "trainers"),
    featuresHref: localeHref(lang, "features"),
    pilotHref: localeHref(lang, "pilot"),
    privacyHref: localeHref(lang, "privacy"),
    footerTermsHref: localeHref(lang, "terms"),
    contactHref: localeHref(lang, "contact"),
    navProduct: content.nav.product,
    navForTrainers: content.nav.forTrainers,
    navAllFeatures: content.nav.allFeatures,
    navPilot: content.nav.pilot,
    menuLabel: content.nav.menuLabel,
    menuOpen: content.nav.menuOpen,
    navPrimaryCta: content.nav.primaryCta,
    navPrimaryHref: content.config.demoEmail
      ? demoMailtoUri(content.config.demoEmail, content)
      : localeHref(lang, "pilot"),
    langSwitchHref: swapLangHref(lang, segment),
    langSwitchCode: content.langSwitch.otherCode,
    langSwitchLabel: content.langSwitch.other,
    footerBrandLine: content.footer.brandLine,
    footerPrivacy: content.footer.privacy,
    footerTerms: content.footer.terms,
    footerContact: content.footer.contact,
    footerFeatureNote: content.footer.featureNote,
    footerIllustrationsNote: content.footer.illustrationsNote,
    footerLegalPending: content.footer.legalPending,
    copyrightYear: String(new Date().getFullYear()),
    mainContent,
  };

  return substitute(pageShell, vars);
}

function renderRootChooser(en, nl, pageShell) {
  const body = `<section class="lang-chooser">
  <h1>${nl.root.heading}</h1>
  <ul>
    <li><a href="${url("nl")}">${nl.root.nlLink}</a> — ${nl.root.nlHint}</li>
    <li><a href="${url("en")}">${en.root.enLink}</a> — ${en.root.enHint}</li>
  </ul>
</section>`;

  const vars = {
    ...buildSeoVars("nl", "root", "", nl),
    htmlLang: "nl",
    pageTitle: nl.root.title,
    pageDescription: en.meta.home.description,
    base: BASE,
    routeId: "root",
    skipToContent: nl.nav.skipToContent,
    homeHref: url("nl"),
    trainersHref: url("nl", "trainers"),
    featuresHref: url("nl", "features"),
    pilotHref: url("nl", "pilot"),
    privacyHref: url("nl", "privacy"),
    footerTermsHref: url("nl", "terms"),
    contactHref: url("nl", "contact"),
    navProduct: nl.nav.product,
    navForTrainers: nl.nav.forTrainers,
    navAllFeatures: nl.nav.allFeatures,
    navPilot: nl.nav.pilot,
    menuLabel: nl.nav.menuLabel,
    menuOpen: nl.nav.menuOpen,
    navPrimaryCta: nl.nav.primaryCta,
    navPrimaryHref: nl.config.demoEmail
      ? demoMailtoUri(nl.config.demoEmail, nl)
      : url("nl", "pilot"),
    langSwitchHref: url("en"),
    langSwitchCode: "en",
    langSwitchLabel: en.langSwitch.self,
    footerBrandLine: nl.footer.brandLine,
    footerPrivacy: nl.footer.privacy,
    footerTerms: nl.footer.terms,
    footerContact: nl.footer.contact,
    footerFeatureNote: nl.footer.featureNote,
    footerIllustrationsNote: nl.footer.illustrationsNote,
    footerLegalPending: nl.footer.legalPending,
    copyrightYear: String(new Date().getFullYear()),
    mainContent: body,
  };

  return substitute(pageShell, vars);
}

function render404(en, nl, pageShell) {
  const body = `<section class="lang-chooser">
  <h1>${en.notFound.heading} / ${nl.notFound.heading}</h1>
  <p>${en.notFound.body}</p>
  <p>${nl.notFound.body}</p>
  <p><a href="${url("nl")}">${nl.notFound.nlHome}</a> · <a href="${url("en")}">${en.notFound.enHome}</a></p>
</section>`;

  const vars = {
    ...buildSeoVars("en", "404", "", en),
    htmlLang: "en",
    pageTitle: en.meta.notFound.title,
    pageDescription: en.meta.notFound.description,
    base: BASE,
    routeId: "404",
    skipToContent: en.nav.skipToContent,
    homeHref: url("en"),
    trainersHref: url("en", "trainers"),
    featuresHref: url("en", "features"),
    pilotHref: url("en", "pilot"),
    privacyHref: url("en", "privacy"),
    footerTermsHref: url("en", "terms"),
    contactHref: url("en", "contact"),
    navProduct: en.nav.product,
    navForTrainers: en.nav.forTrainers,
    navAllFeatures: en.nav.allFeatures,
    navPilot: en.nav.pilot,
    menuLabel: en.nav.menuLabel,
    menuOpen: en.nav.menuOpen,
    navPrimaryCta: en.nav.primaryCta,
    navPrimaryHref: en.config.demoEmail
      ? demoMailtoUri(en.config.demoEmail, en)
      : url("en", "pilot"),
    langSwitchHref: url("nl"),
    langSwitchCode: "nl",
    langSwitchLabel: nl.langSwitch.self,
    footerBrandLine: en.footer.brandLine,
    footerPrivacy: en.footer.privacy,
    footerTerms: en.footer.terms,
    footerContact: en.footer.contact,
    footerFeatureNote: en.footer.featureNote,
    footerIllustrationsNote: en.footer.illustrationsNote,
    footerLegalPending: en.footer.legalPending,
    copyrightYear: String(new Date().getFullYear()),
    mainContent: body,
  };

  return substitute(pageShell, vars);
}

function main() {
  const en = readJson("src/content/en.json");
  const nl = readJson("src/content/nl.json");
  const manifest = readJson("docs/content/feature-manifest.json");

  validateLocaleParity(en, nl);
  validateManifest(manifest, en, nl);

  const pageShell = fs.readFileSync(path.join(TEMPLATE_DIR, "page.html"), "utf8");

  emptyDir(PAGES_DIR);

  writePage("index.html", renderRootChooser(en, nl, pageShell));
  writePage("404.html", render404(en, nl, pageShell));

  for (const content of [en, nl]) {
    for (const route of ROUTES) {
      const rel = path.join(content.lang, route.segment, "index.html");
      writePage(rel, renderLocalePage(content, route, manifest, pageShell));
    }
  }

  const manifestPath = path.join(PAGES_DIR, "manifest.json");
  const pageList = ["index.html", "404.html"];
  for (const lang of ["nl", "en"]) {
    for (const route of ROUTES) {
      pageList.push(path.join(lang, route.segment, "index.html"));
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify({ base: BASE, pages: pageList }, null, 2));

  console.log(`Rendered ${pageList.length} pages to .pages/ (BASE=${BASE})`);
}

main();
