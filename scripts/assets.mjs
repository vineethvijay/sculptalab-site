import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveChromePath, chromeLaunchArgs } from "./lib/chrome-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = null;
}

const executablePath = resolveChromePath();
const b = await puppeteer.launch({
  executablePath,
  args: chromeLaunchArgs(),
});
const p = await b.newPage();
const fav = fs.readFileSync(path.join(ROOT, "public/favicon.svg"), "utf8");
for (const [n, s] of [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await p.setViewport({ width: s, height: s });
  await p.setContent(
    `<style>*{margin:0}svg{width:${s}px;height:${s}px;display:block}</style>${fav}`,
  );
  await p.screenshot({ path: path.join(ROOT, "public", n), omitBackground: true });
}

await b.close();

async function renderOgWithPuppeteer() {
  const chrome = resolveChromePath();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: chromeLaunchArgs(),
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(`file://${path.join(ROOT, "scripts/og.html")}`, {
    waitUntil: "networkidle0",
  });
  await page.screenshot({ path: path.join(ROOT, "public/og.png") });
  await browser.close();
}

const ogNl = path.join(ROOT, "public/og-nl.png");
const ogEn = path.join(ROOT, "public/og-en.png");
if (!fs.existsSync(ogNl) || !fs.existsSync(ogEn)) {
  if (sharp) {
    console.log("Run node scripts/build-marketing-images.mjs to generate localized OG cards.");
  } else {
    await renderOgWithPuppeteer();
  }
}

if (!fs.existsSync(path.join(ROOT, "public/og.png")) && fs.existsSync(ogEn)) {
  await fs.promises.copyFile(ogEn, path.join(ROOT, "public/og.png"));
}

console.log("assets.mjs: icons refreshed");
