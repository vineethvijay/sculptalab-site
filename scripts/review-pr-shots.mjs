import puppeteer from "puppeteer-core";
import fs from "fs";

const url = process.argv[2] || "http://localhost:4173/";
const outDir = process.argv[3] || "/opt/cursor/artifacts";
fs.mkdirSync(outDir, { recursive: true });

const launch = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page, name) {
  await page.screenshot({ path: `${outDir}/${name}.png` });
  console.log(name);
}

for (const [prefix, vp] of [
  ["desktop", { width: 1280, height: 800 }],
  ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const page = await launch.newPage();
  await page.setViewport(vp);
  await page.goto(url, { waitUntil: "networkidle0" });
  await sleep(1500);

  const researchY = await page.evaluate(() => {
    const el = document.querySelector("#research");
    return el ? el.getBoundingClientRect().top + scrollY : 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, researchY - 40));
  await sleep(1200);
  await snap(page, `${prefix}-07d-research`);

  const scoresY = await page.evaluate(() => {
    const el = document.querySelector("#scores .sbox-map");
    return el ? el.getBoundingClientRect().top + scrollY : 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, scoresY - 20));
  await sleep(800);
  await page.evaluate(() => {
    const fig = document.querySelector(".body2d");
    if (!fig) return;
    fig.classList.add("is-front");
    fig.classList.remove("is-back");
    const quads = document.querySelector('.mmap .mlist li[data-m="front-quads"]');
    quads?.click();
  });
  await sleep(1000);
  await snap(page, `${prefix}-07-scores-front`);

  await page.close();
}

await launch.close();
