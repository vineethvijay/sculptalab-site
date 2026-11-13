import puppeteer from "puppeteer-core";
import fs from "fs";

const url = process.argv[2] || "http://127.0.0.1:4173/";
const outDir = process.argv[3] || "/opt/cursor/artifacts";
fs.mkdirSync(outDir, { recursive: true });

const launch = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitReady(page) {
  await page.waitForFunction(() => !document.body.classList.contains("loading"), { timeout: 20000 });
  await page.waitForFunction(
    () => {
      const fig = document.querySelector(".body2d");
      if (!fig) return false;
      const r = fig.getBoundingClientRect();
      if (r.width < 120) return false;
      const imgs = [...document.querySelectorAll(".body2d img")];
      return imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0);
    },
    { timeout: 20000 },
  );
  await sleep(1200);
}

async function snap(page, name) {
  await page.screenshot({ path: `${outDir}/${name}.png` });
  console.log(name);
}

async function goScores(page) {
  const y = await page.evaluate(() => {
    const el = document.querySelector("#scores .sbox-map");
    return el ? el.getBoundingClientRect().top + scrollY - 24 : 0;
  });
  await page.evaluate((top) => window.scrollTo(0, top), Math.max(0, y));
  await sleep(1600);
  await waitReady(page);
}

async function setMuscleView(page, side, muscleKey) {
  await page.evaluate(
    ({ side, muscleKey }) => {
      const fig = document.querySelector(".body2d");
      if (!fig) return;
      fig.classList.toggle("is-front", side === "front");
      fig.classList.toggle("is-back", side === "back");
      const li = document.querySelector(`.mmap .mlist li[data-m="${muscleKey}"]`);
      li?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    },
    { side, muscleKey },
  );
  await sleep(900);
}

for (const [prefix, vp] of [
  ["desktop", { width: 1280, height: 800 }],
  ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const page = await launch.newPage();
  await page.setViewport(vp);
  await page.goto(url, { waitUntil: "networkidle0" });
  await waitReady(page);

  await goScores(page);
  await setMuscleView(page, "back", "back-glutes");
  await snap(page, `${prefix}-07-scores-back`);

  await setMuscleView(page, "front", "front-quads");
  await snap(page, `${prefix}-07-scores-front`);

  const researchY = await page.evaluate(() => {
    const el = document.querySelector("#research");
    return el ? el.getBoundingClientRect().top + scrollY - 32 : 0;
  });
  await page.evaluate((top) => window.scrollTo(0, top), Math.max(0, researchY));
  await sleep(1400);
  await snap(page, `${prefix}-07d-research`);

  await page.close();
}

await launch.close();
