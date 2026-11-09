#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const BASE = (process.env.BASE || "/").replace(/\/?$/, "/");

const EXPECTED = [
  "index.html",
  "404.html",
  "nl/index.html",
  "en/index.html",
  "nl/trainers/index.html",
  "en/trainers/index.html",
  "nl/features/index.html",
  "en/features/index.html",
  "nl/pilot/index.html",
  "en/pilot/index.html",
  "nl/privacy/index.html",
  "en/privacy/index.html",
  "nl/terms/index.html",
  "en/terms/index.html",
  "nl/contact/index.html",
  "en/contact/index.html",
];

const FORBIDDEN = [
  /homelab\.local/i,
  /localhost/i,
  /trainer\.sculptalab\.com/i,
  /GLUTE4ALL/i,
  /clinically validated/i,
  /injury prevention/i,
  /guaranteed muscle growth/i,
  /three questions/i,
];

function gzipSize(buffer) {
  return zlib.gzipSync(buffer).length;
}

function readDist(rel) {
  return fs.readFileSync(path.join(DIST, rel));
}

function stripBase(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:")) return null;
  let h = href.split("#")[0];
  if (!h || h === "#") return null;
  if (BASE !== "/" && h.startsWith(BASE)) h = h.slice(BASE.length);
  if (h.startsWith("/")) h = h.slice(1);
  if (!h) return "index.html";
  if (h.endsWith("/")) return `${h}index.html`;
  if (!path.extname(h)) return `${h}/index.html`;
  return h;
}

function resolveAsset(relFromDist) {
  if (!relFromDist) return true;
  if (relFromDist.includes("?")) relFromDist = relFromDist.split("?")[0];
  const candidates = [relFromDist, path.join(relFromDist, "index.html")];
  return candidates.some((c) => fs.existsSync(path.join(DIST, c)));
}

function checkHtml(rel, errors) {
  const html = readDist(rel).toString("utf8");
  for (const re of FORBIDDEN) {
    if (re.test(html)) errors.push(`${rel}: forbidden phrase ${re}`);
  }
  if (!/<main[^>]*id="main"/.test(html)) errors.push(`${rel}: missing #main`);
  if (!/<a[^>]*skip-link/.test(html)) errors.push(`${rel}: missing skip link`);
  const h1s = html.match(/<h1\b/gi) || [];
  if (h1s.length !== 1) errors.push(`${rel}: expected 1 h1, got ${h1s.length}`);
  if (!/<link[^>]+rel="canonical"/.test(html)) errors.push(`${rel}: missing canonical`);
  if (!/hreflang="nl"/.test(html)) errors.push(`${rel}: missing hreflang nl`);

  const attrRe = /(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(html))) {
    const local = stripBase(m[1]);
    if (local && !resolveAsset(local)) {
      if (!local.startsWith("src/") && !local.includes("fonts/")) {
        errors.push(`${rel}: broken ref ${m[1]}`);
      }
    }
  }
}

function checkBudgets(errors) {
  const assetsDir = path.join(DIST, "assets");
  if (!fs.existsSync(assetsDir)) {
    errors.push("dist/assets missing");
    return;
  }
  let jsGzip = 0;
  let cssGzip = 0;
  for (const file of fs.readdirSync(assetsDir)) {
    const buf = fs.readFileSync(path.join(assetsDir, file));
    const gz = gzipSize(buf);
    if (file.endsWith(".js")) jsGzip += gz;
    if (file.endsWith(".css")) cssGzip += gz;
  }
  if (jsGzip > 15 * 1024) errors.push(`JS gzip ${jsGzip} exceeds 15KB`);
  if (cssGzip > 30 * 1024) errors.push(`CSS gzip ${cssGzip} exceeds 30KB`);

  const hero = path.join(DIST, "images/hero/hero-app-480w.webp");
  if (fs.existsSync(hero)) {
    const kb = fs.statSync(hero).size / 1024;
    if (kb > 140) errors.push(`hero mobile ${kb.toFixed(0)}KB exceeds 140KB`);
  }
}

function checkDeps(errors) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const bad of ["gsap", "lenis"]) {
    if (deps[bad]) errors.push(`package.json still lists ${bad}`);
  }
}

function main() {
  const errors = [];
  if (!fs.existsSync(DIST)) {
    console.error("dist/ not found");
    process.exit(1);
  }
  for (const rel of EXPECTED) {
    if (!fs.existsSync(path.join(DIST, rel))) errors.push(`missing ${rel}`);
    else checkHtml(rel, errors);
  }
  checkBudgets(errors);
  checkDeps(errors);

  if (errors.length) {
    console.error("check-static failed:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("check-static: ok");
}

main();
