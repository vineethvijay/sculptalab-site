import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const base = process.argv[2] || "http://127.0.0.1:4173/sculptalab-site/";
const outDir = path.resolve("docs/build/shots-2d");
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(name, vp, urlPath, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  const url = new URL(urlPath, base).toString();
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(opts.wait || 900);
  if (opts.scrollTo) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: "start" });
    }, opts.scrollTo);
    await sleep(700);
  }
  if (opts.clickMuscle) {
    await page.evaluate((m) => {
      const el = document.querySelector(`[data-muscle="${m}"]`);
      if (el) el.click();
    }, opts.clickMuscle);
    await sleep(900);
  }
  if (opts.fullPage) {
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  } else {
    await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  }
  await page.close();
  console.log("wrote", name);
}

const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const desktop = { width: 1280, height: 800, deviceScaleFactor: 1 };

await shot("01-mobile-nl-hero", mobile, "nl/");
await shot("02-mobile-nl-muscles", mobile, "nl/", { scrollTo: "#muscles", wait: 1200 });
await shot("03-mobile-nl-muscles-quads", mobile, "nl/", { scrollTo: "#muscles", clickMuscle: "quads", wait: 800 });
await shot("04-mobile-nl-progress", mobile, "nl/", { scrollTo: "#progress" });
await shot("05-mobile-nl-trainers-page", mobile, "nl/trainers/");
await shot("06-desktop-nl-hero", desktop, "nl/");
await shot("07-desktop-nl-muscles", desktop, "nl/", { scrollTo: "#muscles", wait: 1200 });
await shot("08-desktop-nl-muscles-arms", desktop, "nl/", { scrollTo: "#muscles", clickMuscle: "arms" });
await shot("09-desktop-nl-trainers", desktop, "nl/trainers/");
await shot("10-desktop-en-muscles", desktop, "en/", { scrollTo: "#muscles" });

await browser.close();
console.log("done", outDir);
