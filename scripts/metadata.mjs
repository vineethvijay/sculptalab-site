#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const SITE_URL = (process.env.SITE_URL || "https://vineethvijay.github.io/sculptalab-site/").replace(
  /\/?$/,
  "/"
);
const BASE = process.env.BASE || "/";
const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";

const ROUTES = [
  "",
  "trainers",
  "features",
  "pilot",
  "privacy",
  "terms",
  "contact",
];

function distExists(rel) {
  const abs = path.join(DIST, rel);
  return fs.existsSync(abs);
}

function buildSitemap() {
  const urls = [
    { loc: SITE_URL, alternates: { nl: `${SITE_URL}nl/`, en: `${SITE_URL}en/`, "x-default": SITE_URL } },
  ];
  for (const lang of ["nl", "en"]) {
    for (const segment of ROUTES) {
      if (segment === "" && lang) {
        urls.push({
          loc: `${SITE_URL}${lang}/`,
          alternates: {
            nl: `${SITE_URL}nl/`,
            en: `${SITE_URL}en/`,
            "x-default": SITE_URL,
          },
        });
        continue;
      }
      if (!segment) continue;
      urls.push({
        loc: `${SITE_URL}${lang}/${segment}/`,
        alternates: {
          nl: `${SITE_URL}nl/${segment}/`,
          en: `${SITE_URL}en/${segment}/`,
          "x-default": SITE_URL,
        },
      });
    }
  }

  const body = urls
    .map((entry) => {
      const altLinks = Object.entries(entry.alternates)
        .map(
          ([hreflang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`
        )
        .join("\n");
      return `  <url>
    <loc>${entry.loc}</loc>
${altLinks}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function buildRobots() {
  const lines = [ALLOW_INDEXING ? "User-agent: *" : "User-agent: *", ALLOW_INDEXING ? "Allow: /" : "Disallow: /"];
  if (!ALLOW_INDEXING) {
    lines[1] = "Disallow: /";
  } else {
    lines[1] = "Allow: /";
  }
  lines.push(`Sitemap: ${SITE_URL}sitemap.xml`);
  return `${lines.join("\n")}\n`;
}

function buildManifest() {
  const base = BASE.endsWith("/") ? BASE : `${BASE}/`;
  const start = base === "/" ? "/" : `${base}nl/`;
  return {
    name: "SculptaLab",
    short_name: "SculptaLab",
    start_url: start,
    display: "browser",
    theme_color: "#120D0B",
    background_color: "#120D0B",
    icons: [
      { src: `${base}icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${base}icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}

function flattenPagesOutput() {
  const nested = path.join(DIST, ".pages");
  if (!fs.existsSync(nested)) return;
  const moveTree = (src, dest) => {
    for (const name of fs.readdirSync(src)) {
      const from = path.join(src, name);
      const to = path.join(dest, name);
      if (fs.statSync(from).isDirectory()) {
        fs.mkdirSync(to, { recursive: true });
        moveTree(from, to);
      } else {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.renameSync(from, to);
      }
    }
  };
  moveTree(nested, DIST);
  fs.rmSync(nested, { recursive: true, force: true });
}

function main() {
  flattenPagesOutput();
  if (!distExists("index.html")) {
    console.error("dist/index.html missing after vite build");
    process.exit(1);
  }

  fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap());
  fs.writeFileSync(path.join(DIST, "robots.txt"), buildRobots());
  fs.writeFileSync(path.join(DIST, "site.webmanifest"), JSON.stringify(buildManifest(), null, 2));
  console.log(`Wrote metadata (SITE_URL=${SITE_URL}, BASE=${BASE})`);
}

main();
