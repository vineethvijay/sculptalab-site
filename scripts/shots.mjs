import puppeteer from "puppeteer-core";
const url = process.argv[2] || "http://localhost:4173/";
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  await p.goto(url, { waitUntil: "networkidle0" });
  await sleep(1200); await p.screenshot({ path: `shots/${name}-00-loader.png` });
  await sleep(4200); await p.screenshot({ path: `shots/${name}-01-hero.png` });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const sel = { "02-manifesto": ".manifesto", "03-story-a": ".story", "07-scores": ".scores", "07b-form": ".formai", "08-bento": ".bento-sec", "09-bento-b": ".bx-dutch", "09b-trainer": ".trainer", "09c-dash": ".browser", "10-soon": ".soon", "11-download": ".download" };
  const extra = { "04-story-b": 1.15, "05-story-c": 2.1, "06-story-d": 3.0 };
  const go = async (y) => { await p.evaluate((y) => window.scrollTo(0, y), y); await sleep(1800); };
  for (const [k, s] of Object.entries(sel)) {
    const y = await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY - (s === ".manifesto" ? -150 : 0), s);
    await go(y); await p.screenshot({ path: `shots/${name}-${k}.png` });
    if (k === "03-story-a") for (const [e, f] of Object.entries(extra)) {
      await go(y + f * vp.height * (name === "mobile" ? 0.75 : 1)); await p.screenshot({ path: `shots/${name}-${e}.png` });
    }
  }
  await p.close();
}
await b.close();
