/**
 * Build polished 2D MI marketing screens for sculptalab-site.
 * Sources: /workspace/v4 artwork + live app screenshots (demo data only).
 * Swap list written to docs/assets/SCREEN-SWAP.md
 *
 * Run: node scripts/build-2d-screens.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/images");
const V4 = process.env.V4_ROOT || "/workspace/v4";
const ASSETS = path.join(V4, "site-2d-assets");
const LIVE = path.join(V4, "mi-2d-96abc02");
const SETTINGS = path.join(V4, "settings-6a7d220");

const sharp = (await import("sharp")).default;

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function writeVariants(pipeline, dir, stem, widths, { maxMobileBytes = 160 * 1024 } = {}) {
  ensureDir(dir);
  const paths = { webp: [], avif: [] };
  for (const w of widths) {
    const resized = pipeline.clone().resize({ width: w, withoutEnlargement: false });
    let q = 82;
    let webpBuf;
    for (;;) {
      webpBuf = await resized.clone().webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer();
      const isMobile = w <= 640;
      if (!isMobile || webpBuf.length <= maxMobileBytes || q <= 48) break;
      q -= 6;
    }
    const webpName = `${stem}-${w}w.webp`;
    const avifName = `${stem}-${w}w.avif`;
    await fs.promises.writeFile(path.join(dir, webpName), webpBuf);
    paths.webp.push(`public/images/${path.basename(dir)}/${webpName}`);
    try {
      const avifBuf = await resized
        .clone()
        .avif({ quality: Math.min(q, 52), effort: 4 })
        .toBuffer();
      await fs.promises.writeFile(path.join(dir, avifName), avifBuf);
      paths.avif.push(`public/images/${path.basename(dir)}/${avifName}`);
    } catch {
      /* optional */
    }
    console.log(`  ${stem}-${w}w.webp ${(webpBuf.length / 1024).toFixed(1)}KB q=${q}`);
  }
  return paths;
}

async function placeOnCanvas(inputPath, { width, height, pad = 0.08, bg = "#07080B" }) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const maxW = Math.round(width * (1 - pad * 2));
  const maxH = Math.round(height * (1 - pad * 2));
  const scale = Math.min(maxW / meta.width, maxH / meta.height);
  const nw = Math.round(meta.width * scale);
  const nh = Math.round(meta.height * scale);
  const left = Math.round((width - nw) / 2);
  const top = Math.round((height - nh) / 2);
  const resized = await img.resize(nw, nh, { fit: "inside" }).png().toBuffer();
  return sharp({
    create: { width, height, channels: 3, background: bg },
  })
    .composite([{ input: resized, left, top }]);
}

async function frameScreenshot(inputPath, { width, height, kind = "laptop" }) {
  // Dark device/browser chrome around the screenshot
  const chrome = kind === "phone" ? 18 : 22;
  const radius = kind === "phone" ? 36 : 16;
  const innerW = width - chrome * 2;
  const innerH = height - chrome * 2 - (kind === "laptop" ? 28 : 0);
  const shot = await sharp(inputPath)
    .resize(innerW, innerH, { fit: "cover", position: "north" })
    .png()
    .toBuffer();

  const svg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="${radius}" fill="#0c0d12"/>
      <rect x="${chrome}" y="${kind === "laptop" ? chrome + 18 : chrome}" width="${innerW}" height="${innerH}" rx="10" fill="#07080B"/>
      ${
        kind === "laptop"
          ? `<circle cx="${chrome + 10}" cy="${chrome + 6}" r="4" fill="#ff5f57"/>
             <circle cx="${chrome + 26}" cy="${chrome + 6}" r="4" fill="#febc2e"/>
             <circle cx="${chrome + 42}" cy="${chrome + 6}" r="4" fill="#28c840"/>`
          : `<rect x="${width / 2 - 28}" y="8" width="56" height="6" rx="3" fill="#1a1b22"/>`
      }
    </svg>`);

  const y = kind === "laptop" ? chrome + 18 : chrome;
  return sharp(svg).composite([{ input: shot, left: chrome, top: y }]);
}

async function sanitizeRoster(inputPath) {
  // Demo names are OK; obscure any email-looking glyphs by slight crop of top-right if needed.
  // Current roster shot has no emails. Return as-is via sharp pipeline.
  return sharp(inputPath);
}

const swapList = [];

async function main() {
  console.log("Building 2D MI marketing screens…");

  // --- A04 anatomy (female default) ---
  const anatomyDir = path.join(OUT, "anatomy");
  ensureDir(anatomyDir);
  for (const [stem, src] of [
    ["a04-muscle-front", path.join(ASSETS, "female-front-raw.png")],
    ["a04-muscle-back", path.join(ASSETS, "female-back-raw.png")],
  ]) {
    console.log(stem);
    const base = await placeOnCanvas(src, { width: 1200, height: 1500, pad: 0.06 });
    // write master then variants from buffer
    const master = await base.png().toBuffer();
    await writeVariants(sharp(master), anatomyDir, stem, [480, 800, 1200], {
      maxMobileBytes: 150 * 1024,
    });
    swapList.push({
      slot: stem,
      files: [480, 800, 1200].flatMap((w) => [
        `public/images/anatomy/${stem}-${w}w.webp`,
        `public/images/anatomy/${stem}-${w}w.avif`,
      ]),
      replaceWith: "polished 2D female artwork after polish round lands",
      interimSource: src,
    });
  }

  // Highlight stills (for demo / future swap) — crop body panel from live shots
  for (const [stem, src, box] of [
    [
      "a04-highlight-glutes",
      path.join(LIVE, "b-laptop-glutes-row.png"),
      // right panel approximate: body map
      { left: 820, top: 120, width: 560, height: 720 },
    ],
    [
      "a04-highlight-arms",
      path.join(LIVE, "e-mobile-arms-row.png"),
      { left: 40, top: 420, width: 700, height: 900 },
    ],
  ]) {
    console.log(stem);
    const cropped = await sharp(src).extract(box).toBuffer();
    const placed = await placeOnCanvas(cropped, { width: 960, height: 1200, pad: 0.04 });
    const master = await placed.png().toBuffer();
    await writeVariants(sharp(master), anatomyDir, stem, [480, 800], {
      maxMobileBytes: 140 * 1024,
    });
    swapList.push({
      slot: stem,
      files: [480, 800].flatMap((w) => [
        `public/images/anatomy/${stem}-${w}w.webp`,
        `public/images/anatomy/${stem}-${w}w.avif`,
      ]),
      replaceWith: "polished highlight stills from next 2D polish deploy",
      interimSource: src,
    });
  }

  // --- A05 studio overview (laptop + mobile) ---
  const screensDir = path.join(OUT, "screens");
  ensureDir(screensDir);
  console.log("a05-studio");
  {
    const desk = await frameScreenshot(path.join(LIVE, "a-laptop-default-2d-female.png"), {
      width: 1440,
      height: 900,
      kind: "laptop",
    });
    const deskBuf = await desk.png().toBuffer();
    await writeVariants(sharp(deskBuf), screensDir, "a05-studio-desktop", [1440], {
      maxMobileBytes: 220 * 1024,
    });
    // also write as a05-studio-960 from same
    await writeVariants(sharp(deskBuf), screensDir, "a05-studio", [640, 960], {
      maxMobileBytes: 150 * 1024,
    });
    swapList.push({
      slot: "a05-studio",
      files: [
        "public/images/screens/a05-studio-640w.webp",
        "public/images/screens/a05-studio-640w.avif",
        "public/images/screens/a05-studio-960w.webp",
        "public/images/screens/a05-studio-960w.avif",
        "public/images/screens/a05-studio-desktop-1440w.webp",
        "public/images/screens/a05-studio-desktop-1440w.avif",
      ],
      replaceWith: "fresh Studio laptop/mobile screenshots after 2D polish",
      interimSource: `${LIVE}/a-laptop-default-2d-female.png`,
    });
  }

  // Studio highlight (glutes selected) as companion asset
  console.log("a05-studio-highlight");
  {
    const desk = await frameScreenshot(path.join(LIVE, "b-laptop-glutes-row.png"), {
      width: 1440,
      height: 900,
      kind: "laptop",
    });
    const buf = await desk.png().toBuffer();
    await writeVariants(sharp(buf), screensDir, "a05-studio-highlight", [640, 960], {
      maxMobileBytes: 150 * 1024,
    });
    await writeVariants(sharp(buf), screensDir, "a05-studio-highlight-desktop", [1440], {
      maxMobileBytes: 220 * 1024,
    });
    swapList.push({
      slot: "a05-studio-highlight",
      files: [
        "public/images/screens/a05-studio-highlight-640w.webp",
        "public/images/screens/a05-studio-highlight-960w.webp",
        "public/images/screens/a05-studio-highlight-desktop-1440w.webp",
      ],
      replaceWith: "list-click highlight screenshot after polish",
      interimSource: `${LIVE}/b-laptop-glutes-row.png`,
    });
  }

  // Mobile MI phone frame
  console.log("a05-studio-mobile");
  {
    const phone = await frameScreenshot(path.join(LIVE, "e-mobile-arms-row.png"), {
      width: 780,
      height: 1688,
      kind: "phone",
    });
    const buf = await phone.png().toBuffer();
    // store under screens for optional use; also refresh a01 hero mobile feel later if needed
    await writeVariants(sharp(buf), screensDir, "a05-studio-mobile", [390, 640], {
      maxMobileBytes: 140 * 1024,
    });
    swapList.push({
      slot: "a05-studio-mobile",
      files: [
        "public/images/screens/a05-studio-mobile-390w.webp",
        "public/images/screens/a05-studio-mobile-640w.webp",
      ],
      replaceWith: "mobile MI screenshot after polish (arms/glutes tap)",
      interimSource: `${LIVE}/e-mobile-arms-row.png`,
    });
  }

  // --- A09 trainer dashboard ---
  console.log("a09-trainer-dashboard");
  {
    const src = path.join(SETTINGS, "a-trainer-roster-nl-first-paint.png");
    const framed = await frameScreenshot(src, { width: 1440, height: 900, kind: "laptop" });
    const buf = await framed.png().toBuffer();
    await writeVariants(sharp(buf), screensDir, "a09-trainer-dashboard", [480, 800], {
      maxMobileBytes: 140 * 1024,
    });
    await writeVariants(sharp(buf), screensDir, "a09-trainer-dashboard-desktop", [1280], {
      maxMobileBytes: 200 * 1024,
    });
    swapList.push({
      slot: "a09-trainer-dashboard",
      files: [
        "public/images/screens/a09-trainer-dashboard-480w.webp",
        "public/images/screens/a09-trainer-dashboard-800w.webp",
        "public/images/screens/a09-trainer-dashboard-desktop-1280w.webp",
      ],
      replaceWith: "trainer roster (NL) after UI polish",
      interimSource: src,
    });
  }

  // Trainer client detail with 2D map
  console.log("a09-trainer-client-2d");
  {
    const src = path.join(LIVE, "f-trainer-sanne-detail.png");
    const framed = await frameScreenshot(src, { width: 1440, height: 900, kind: "laptop" });
    const buf = await framed.png().toBuffer();
    await writeVariants(sharp(buf), screensDir, "a09-trainer-client-2d", [480, 800], {
      maxMobileBytes: 140 * 1024,
    });
    await writeVariants(sharp(buf), screensDir, "a09-trainer-client-2d-desktop", [1280], {
      maxMobileBytes: 200 * 1024,
    });
    swapList.push({
      slot: "a09-trainer-client-2d",
      files: [
        "public/images/screens/a09-trainer-client-2d-480w.webp",
        "public/images/screens/a09-trainer-client-2d-800w.webp",
        "public/images/screens/a09-trainer-client-2d-desktop-1280w.webp",
      ],
      replaceWith: "trainer client detail with polished 2D map",
      interimSource: src,
    });
  }

  // Write swap doc
  const md = [
    "# Screen swap list (interim → polish)",
    "",
    "Interim screens were built from live app shots at `mi-2d-96abc02` / `settings-6a7d220` plus artwork in `v4/artwork`.",
    "When the 2D polish round lands, replace these files in place (same names/sizes) and re-run `npm run build`.",
    "",
    "| Slot | Files to replace | Replace with |",
    "| --- | --- | --- |",
    ...swapList.map(
      (s) =>
        `| \`${s.slot}\` | ${s.files.map((f) => `\`${f}\``).join("<br>")} | ${s.replaceWith} |`,
    ),
    "",
    "## Quick command",
    "",
    "```bash",
    "node scripts/build-2d-screens.mjs",
    "BASE=/sculptalab-site/ SITE_URL=https://vineethvijay.github.io/sculptalab-site/ npm run build",
    "```",
    "",
  ].join("\n");
  ensureDir(path.join(ROOT, "docs/assets"));
  fs.writeFileSync(path.join(ROOT, "docs/assets/SCREEN-SWAP.md"), md);
  fs.writeFileSync(
    path.join(ROOT, "docs/assets/screen-swap.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), slots: swapList }, null, 2),
  );
  console.log("Wrote docs/assets/SCREEN-SWAP.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
