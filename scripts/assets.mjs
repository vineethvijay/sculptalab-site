import puppeteer from "puppeteer-core"; import fs from "fs";
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage();
const fav = fs.readFileSync("public/favicon.svg", "utf8");
for (const [n, s] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  await p.setViewport({ width: s, height: s });
  await p.setContent(`<style>*{margin:0}svg{width:${s}px;height:${s}px;display:block}</style>${fav}`);
  await p.screenshot({ path: "public/" + n, omitBackground: true });
}
await p.setViewport({ width: 1200, height: 630 });
await p.goto("file://" + process.cwd() + "/scripts/og.html", { waitUntil: "networkidle0" });
await p.screenshot({ path: "public/og.png" });
await b.close();
