#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(ROOT, ".pages");
const TEMPLATE_DIR = path.join(ROOT, "src", "templates");

const BASE = normalizeBase(process.env.BASE || "/");

const ROUTES = [
  { id: "home", segment: "", template: "locale" },
  { id: "trainers", segment: "trainers", template: "locale" },
  { id: "features", segment: "features", template: "locale" },
  { id: "pilot", segment: "pilot", template: "locale" },
  { id: "privacy", segment: "privacy", template: "locale" },
  { id: "terms", segment: "terms", template: "locale" },
  { id: "contact", segment: "contact", template: "locale" },
];

function normalizeBase(base) {
  if (!base.startsWith("/")) base = `/${base}`;
  return base.endsWith("/") ? base : `${base}/`;
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
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

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((acc, part) => acc?.[part], obj);
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

function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function writePage(relFile, html) {
  const out = path.join(PAGES_DIR, relFile);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
}

function buildMainContent(content, route, manifest) {
  const pageTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, "sections.html"), "utf8");
  const lang = content.lang;
  const isHome = route.id === "home";
  const routeCopy = isHome ? null : content.routes[route.id];

  const featureList =
    route.id === "features"
      ? manifest
          .map((row) => {
            const f = content.features[row.id];
            const statusKey =
              row.status === "in_pilot"
                ? "inPilot"
                : row.status === "preview"
                  ? "preview"
                  : "planned";
            return `<article class="feature-card" id="${row.id}">
  <h3>${f.title}</h3>
  <p>${f.description}</p>
  <p class="badge">${content.status[statusKey]}</p>
  <p class="caveat">${f.caveat}</p>
</article>`;
          })
          .join("\n")
      : "";

  const homeSections = isHome
    ? `
<section id="trainers"><h2>${content.home.trainers.h2}</h2><p>${content.home.trainers.body}</p></section>
<section id="plan"><h2>${content.home.planTrain.h2}</h2><p>${content.home.planTrain.row1}</p></section>
<section id="train"><p>${content.home.planTrain.row2}</p></section>
<section id="muscles"><h2>${content.home.muscles.h2}</h2><p>${content.home.muscles.disclaimer}</p></section>
<section id="progress"><h2>${content.home.progressStudio.h2}</h2></section>
<section id="studio"><p>${content.home.progressStudio.body}</p></section>
<section id="form"><h2>${content.home.form.h2}</h2></section>
<section id="learn"><h2>${content.home.learnDaily.h2}</h2></section>
<section id="daily"><p>${content.home.learnDaily.body}</p></section>
<section id="roadmap"><h2>${content.home.roadmap.h2}</h2></section>
<section id="faq"><h2>${content.home.faq.h2}</h2></section>
<section id="pilot"><h2>${content.home.pilotFooter.h2}</h2><p>${content.home.pilotFooter.demoExplanation}</p></section>`
    : "";

  const routeExtra = isHome
    ? homeSections
    : route.id === "features"
      ? `<div class="feature-catalogue">${featureList}</div><p>${routeCopy.placeholder}</p>`
      : route.id === "privacy" || route.id === "terms"
        ? `<p class="legal-banner">${routeCopy.banner}</p><p>${routeCopy.body}</p>`
        : route.id === "contact"
          ? `<p>${routeCopy.body}</p><p>${content.config.demoEmail ?? routeCopy.pending}</p>`
          : `<p>${routeCopy.placeholder}</p>`;

  const sectionVars = {
    heroEyebrow: content.home.hero.eyebrow,
    heroH1: isHome ? content.home.hero.h1 : routeCopy?.h1 ?? content.home.hero.h1,
    heroBody: content.home.hero.body,
    heroPrimaryCta: content.home.hero.primaryCta,
    heroSecondaryCta: content.home.hero.secondaryCta,
    heroMicrocopy: content.home.hero.microcopy,
    heroTranslationNote: content.home.hero.translationNote,
    homeHref: localeHref(lang, ""),
    pilotHref: localeHref(lang, "pilot"),
    routeH1: isHome ? "" : (routeCopy?.h1 ?? ""),
    routeIntro: isHome ? "" : (routeCopy?.intro ?? ""),
    routeExtra,
    configPlay: content.config.play ?? "",
    configIos: content.config.ios ?? "",
    storePlay: content.config.play ? content.config.play : content.store.playPending,
    storeIos: content.config.ios ? content.config.ios : content.store.iosPending,
    demoContact: content.config.demoEmail ?? content.store.demoContactPending,
  };

  return substitute(pageTemplate, sectionVars);
}

function renderLocalePage(content, route, manifest, pageShell) {
  const lang = content.lang;
  const meta = content.meta[route.id === "home" ? "home" : route.id];
  const segment = route.segment;
  const mainContent = buildMainContent(content, route, manifest);

  const vars = {
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
    navPrimaryCta: content.nav.primaryCta,
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
    navPrimaryCta: nl.nav.primaryCta,
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
  const body = `<section>
  <h1>${en.notFound.heading} / ${nl.notFound.heading}</h1>
  <p>${en.notFound.body}</p>
  <p>${nl.notFound.body}</p>
  <p><a href="${url("nl")}">${nl.notFound.nlHome}</a> · <a href="${url("en")}">${en.notFound.enHome}</a></p>
</section>`;

  const vars = {
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
    navPrimaryCta: en.nav.primaryCta,
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
    const lang = content.lang;
    for (const route of ROUTES) {
      const rel = path.join(lang, route.segment, "index.html");
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
