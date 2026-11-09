/**
 * Batch 3: generate public/images/* and OG cards from sanitized QA sources.
 * Run: node scripts/build-marketing-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const QA =
  process.env.SCULPTALAB_QA_ROOT ||
  path.join(ROOT, "../sculptalab/docs/build/visual-qa-2026-11-08");
const OUT = path.join(ROOT, "public/images");
const MANIFEST_PATH = path.join(ROOT, "docs/assets/site-image-manifest.json");
const GEN_DATE = "2026-11-08";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp is required for image build. Run: npm install sharp");
  process.exit(1);
}

const manifestAssets = [];

function aspectSize(w, rw, rh) {
  return { width: w, height: Math.round((w * rh) / rw) };
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function fitCover(input, w, h) {
  return sharp(input).resize(w, h, { fit: "cover", position: "centre" });
}

async function writeResponsive(
  pipeline,
  dir,
  baseName,
  { maxMobileBytes = null, mobileVariant = false } = {},
) {
  const paths = { webp: [], avif: [] };
  let mobileBytes = null;

  async function encodeWebp(img, q) {
    return img.clone().webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer();
  }

  let q = 82;
  for (;;) {
    const webpPath = path.join(dir, `${baseName}.webp`);
    const buf = await encodeWebp(pipeline, q);
    if (!mobileVariant || !maxMobileBytes || buf.length <= maxMobileBytes || q <= 48) {
      await fs.promises.writeFile(webpPath, buf);
      paths.webp.push(`public/images/${path.relative(path.join(ROOT, "public/images"), dir)}/${baseName}.webp`.replace(/\\/g, "/"));
      if (mobileVariant) mobileBytes = buf.length;
      break;
    }
    q -= 5;
  }

  try {
    const avifPath = path.join(dir, `${baseName}.avif`);
    const avifBuf = await pipeline
      .clone()
      .avif({ quality: Math.min(q, 50), effort: 4 })
      .toBuffer();
    await fs.promises.writeFile(avifPath, avifBuf);
    paths.avif.push(
      `public/images/${path.relative(path.join(ROOT, "public/images"), dir)}/${baseName}.avif`.replace(/\\/g, "/"),
    );
  } catch {
  }

  const meta = await pipeline.clone().toBuffer({ resolveWithObject: true });
  return {
    paths,
    width: meta.info.width,
    height: meta.info.height,
    mobileBytes,
  };
}

async function phoneComposite(screenPath, canvasW, canvasH, { anchor = "centre" } = {}) {
  const canvas = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 18, g: 13, b: 11 },
    },
  });
  const glowSvg = Buffer.from(
    `<svg width="${canvasW}" height="${canvasH}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="72%" cy="38%"><stop offset="0%" stop-color="#FF7A3D" stop-opacity="0.18"/><stop offset="55%" stop-color="#120D0B" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="#120D0B"/><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );

  const phoneH = Math.round(canvasH * 0.8);
  const phoneW = Math.round(phoneH * (9 / 19.5));
  const insetW = Math.round(phoneW * 0.9);
  const insetH = Math.round(phoneH * 0.945);
  const screenBuf = await (await fitCover(screenPath, insetW, insetH)).toBuffer();

  const rx = Math.round(phoneW * 0.1);
  const bezelSvg = Buffer.from(
    `<svg width="${phoneW}" height="${phoneH}" xmlns="http://www.w3.org/2000/svg"><rect width="${phoneW}" height="${phoneH}" rx="${rx}" fill="#1C1512" stroke="rgba(255,255,255,0.12)" stroke-width="2"/><rect x="${Math.round(phoneW * 0.05)}" y="${Math.round(phoneH * 0.018)}" width="${insetW}" height="${insetH}" rx="${Math.round(rx * 0.7)}" fill="#07080B"/></svg>`,
  );
  const bezelBuf = await sharp(bezelSvg).png().toBuffer();

  let px = Math.round((canvasW - phoneW) / 2);
  if (anchor === "right") px = Math.round(canvasW - phoneW - canvasW * 0.06);
  const py = Math.round((canvasH - phoneH) / 2);
  const sx = px + Math.round((phoneW - insetW) / 2);
  const sy = py + Math.round(phoneH * 0.02);

  const base = await canvas.png().toBuffer();
  return sharp(base).composite([
    { input: await sharp(glowSvg).png().toBuffer(), top: 0, left: 0 },
    { input: screenBuf, top: sy, left: sx },
    { input: bezelBuf, top: py, left: px },
  ]);
}

async function browserComposite(screenPath, w, h) {
  const chrome = Math.round(h * 0.055);
  const frameSvg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#120D0B"/><rect x="${w * 0.04}" y="${h * 0.06}" width="${w * 0.92}" height="${h * 0.88}" rx="14" fill="#1C1512" stroke="rgba(255,255,255,0.08)"/><rect x="${w * 0.04}" y="${h * 0.06}" width="${w * 0.92}" height="${chrome + 8}" rx="14" fill="#2A211D"/><circle cx="${w * 0.07}" cy="${h * 0.06 + chrome / 2 + 4}" r="5" fill="#FF5E6C"/><circle cx="${w * 0.1}" cy="${h * 0.06 + chrome / 2 + 4}" r="5" fill="#FFB020"/><circle cx="${w * 0.13}" cy="${h * 0.06 + chrome / 2 + 4}" r="5" fill="#3DFF8A"/></svg>`,
  );
  const innerW = Math.round(w * 0.92);
  const innerH = Math.round(h * 0.88 - chrome - 8);
  const screenBuf = await (await fitCover(screenPath, innerW, innerH)).toBuffer();
  const top = Math.round(h * 0.06 + chrome + 8);
  const left = Math.round(w * 0.04);
  return sharp(await sharp(frameSvg).png().toBuffer()).composite([
    { input: screenBuf, top, left },
  ]);
}

function lifestyleSvg(w, h, kind) {
  const palettes = {
    trainer: ["#1A1512", "#2A211D", "#FF7A3D"],
    gym: ["#14100E", "#221C18", "#C4B3A8"],
    form: ["#10100E", "#1C1714", "#6C63FF"],
  };
  const [a, b, accent] = palettes[kind] || palettes.gym;
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><ellipse cx="${w * 0.68}" cy="${h * 0.32}" rx="${w * 0.32}" ry="${h * 0.22}" fill="${accent}" fill-opacity="0.22"/><rect x="${w * 0.1}" y="${h * 0.58}" width="${w * 0.42}" height="${h * 0.1}" rx="10" fill="#2A211D" fill-opacity="0.9"/><rect x="${w * 0.1}" y="${h * 0.72}" width="${w * 0.55}" height="${h * 0.07}" rx="8" fill="#1C1512"/></svg>`,
  );
}

async function movementGuide(w, h) {
  const svg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#120D0B"/><ellipse cx="${w / 2}" cy="${h * 0.9}" rx="${w * 0.38}" ry="${h * 0.07}" fill="#1A1512"/><circle cx="${w * 0.42}" cy="${h * 0.2}" r="${w * 0.035}" fill="#2A211D"/><path d="M ${w * 0.42} ${h * 0.24} L ${w * 0.4} ${h * 0.46} L ${w * 0.36} ${h * 0.72} L ${w * 0.32} ${h * 0.88} M ${w * 0.36} ${h * 0.72} L ${w * 0.46} ${h * 0.88} M ${w * 0.4} ${h * 0.46} L ${w * 0.54} ${h * 0.38} L ${w * 0.62} ${h * 0.42}" stroke="#C4B3A8" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="${w * 0.6}" y="${h * 0.4}" width="${w * 0.1}" height="${h * 0.035}" rx="4" fill="#FF7A3D" opacity="0.85"/></svg>`,
  );
  return sharp(svg);
}

async function trainerDashboardSvg(w, h) {
  const fsz = Math.max(12, Math.round(w * 0.028));
  const svg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#120D0B"/><rect x="${w * 0.05}" y="${h * 0.07}" width="${w * 0.9}" height="${h * 0.86}" rx="18" fill="#1C1512" stroke="rgba(255,255,255,0.1)"/><text x="${w * 0.09}" y="${h * 0.15}" font-family="system-ui,sans-serif" font-size="${fsz + 4}" font-weight="600" fill="#F5ECE6">Sanne (Demo)</text><rect x="${w * 0.09}" y="${h * 0.18}" width="${w * 0.5}" height="${h * 0.06}" rx="8" fill="#2A211D"/><text x="${w * 0.11}" y="${h * 0.225}" font-family="system-ui" font-size="${fsz}" fill="#C4B3A8">Consent: workouts, volume, records</text>${[0.32, 0.44, 0.56, 0.68].map((y) => `<rect x="${w * 0.09}" y="${h * y}" width="${w * 0.82}" height="${h * 0.08}" rx="8" fill="#14110F"/>`).join("")}</svg>`,
  );
  return sharp(svg);
}

async function formPreview(w, h) {
  const base = await sharp(lifestyleSvg(w, h, "form")).png().toBuffer();
  const overlay = Buffer.from(
    `<svg width="${w}" height="${h}"><path d="M ${w * 0.32} ${h * 0.22} Q ${w * 0.38} ${h * 0.5} ${w * 0.34} ${h * 0.78}" stroke="#FF7A3D" stroke-width="2.5" fill="none" opacity="0.55"/><rect x="${w - 118}" y="20" width="98" height="30" rx="15" fill="#FF7A3D"/><text x="${w - 69}" y="40" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#1A110D">Preview</text></svg>`,
  );
  return sharp(base).composite([{ input: await sharp(overlay).png().toBuffer(), top: 0, left: 0 }]);
}

async function exportWidths(
  id,
  meta,
  dir,
  namePrefix,
  widths,
  rw,
  rh,
  build,
  opts,
) {
  const variantStats = [];
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    const { width, height } = aspectSize(w, rw, rh);
    const img = await build(width, height, w, i);
    const isMobile = w <= 640 || (id === "A01" && w <= 768);
    const stat = await writeResponsive(img, dir, `${namePrefix}-${w}w`, {
      maxMobileBytes: opts.maxMobileBytes,
      mobileVariant: isMobile && opts.trackMobile,
    });
    variantStats.push({ w, width, height, ...stat });
  }
  const mobile = variantStats.find((v) => v.mobileBytes != null) || variantStats[0];
  manifestAssets.push({
    id,
    ...meta,
    aspectRatio: `${rw}:${rh}`,
    dimensions: variantStats.map((v) => ({ width: v.width, height: v.height, suffix: `${v.w}w` })),
    publicPaths: {
      webp: variantStats.flatMap((v) => v.paths.webp),
      avif: variantStats.flatMap((v) => v.paths.avif),
    },
    maxMobileBytes: opts.maxMobileBytes,
    actualMobileBytes: mobile?.mobileBytes ?? null,
  });
}

async function buildOg(locale, title, tagline) {
  const w = 1200;
  const h = 630;
  const heroSrc = path.join(OUT, "hero", "a01-hero-app-480w.webp");
  const anatomySrc = path.join(OUT, "anatomy", "a04-muscle-front-480w.webp");
  const heroThumb = fs.existsSync(heroSrc)
    ? await (await fitCover(heroSrc, 200, 250)).toBuffer()
    : null;
  const anatomyThumb = fs.existsSync(anatomySrc)
    ? await (await fitCover(anatomySrc, 180, 225)).toBuffer()
    : null;

  const logo = fs.readFileSync(path.join(ROOT, "public/favicon.svg"), "utf8");
  const textSvg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#120D0B"/><stop offset="100%" stop-color="#1C1512"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><rect x="0" y="0" width="55%" height="100%" fill="#120D0B"/><text x="80" y="120" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="#F5ECE6">SculptaLab</text><text x="80" y="280" font-family="system-ui,sans-serif" font-size="52" font-weight="800" fill="#F5ECE6">${title.replace(/&/g, "&amp;")}</text><text x="80" y="340" font-family="system-ui,sans-serif" font-size="24" fill="#C4B3A8">${tagline.replace(/&/g, "&amp;")}</text><rect x="80" y="380" width="140" height="36" rx="18" fill="#FF7A3D"/><text x="150" y="404" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="#1A110D">Pilot</text></svg>`,
  );
  const composites = [{ input: await sharp(textSvg).png().toBuffer(), top: 0, left: 0 }];
  if (heroThumb) composites.push({ input: heroThumb, top: 200, left: 880 });
  if (anatomyThumb) composites.push({ input: anatomyThumb, top: 380, left: 920 });

  const out = path.join(ROOT, "public", `og-${locale}.png`);
  await sharp({
    create: { width: w, height: h, channels: 3, background: "#120D0B" },
  })
    .composite(composites)
    .png({ compressionLevel: 9, palette: true })
    .toFile(out);
  if (fs.statSync(out).size > 250000) {
    await sharp(out).png({ compressionLevel: 9, colors: 128 }).toFile(out);
  }
  return { path: `public/og-${locale}.png`, bytes: fs.statSync(out).size };
}

async function main() {
  for (const d of ["hero", "anatomy", "screens", "lifestyle"]) {
    ensureDir(path.join(OUT, d));
  }
  ensureDir(path.join(ROOT, "docs/assets"));

  const src = {
    home: path.join(QA, "systest/02_home.png"),
    plan: path.join(QA, "systest/05_plan.png"),
    workout: path.join(QA, "systest/04_workouts_sessions.png"),
    studioWide: path.join(QA, "systest/04b_workouts_activities.png"),
    progressHero: path.join(QA, "systest/03b_progress_mi_hero.png"),
    anatomyFront: path.join(QA, "mi-anatomy-v4/mobile-front.png"),
    anatomyBack: path.join(QA, "mi-anatomy-v4/laptop-back.png"),
    anatomyFrontWide: path.join(QA, "mi-anatomy-v4/laptop-front.png"),
  };

  for (const [k, p] of Object.entries(src)) {
    if (!fs.existsSync(p)) {
      console.error(`Missing source ${k}: ${p}`);
      process.exit(1);
    }
  }

  const prov = (tool, srcPath, classification) => ({
    provenance: {
      modelOrTool: tool,
      generationDate: GEN_DATE,
      promptSummary: "Batch 3 sanitized composite per site-rebuild-brief §7",
      sourceScreenshotCommit: "visual-qa-2026-11-08",
      sourceScreenshotPath: srcPath ? path.relative(path.join(ROOT, ".."), pAbs(srcPath)) : null,
    },
    classification,
    privacyReviewStatus: "sanitized_demo_only",
  });

  function pAbs(p) {
    return path.isAbsolute(p) ? p : path.join(QA, p);
  }

  await exportWidths(
    "A01",
    {
      role: "hero-app",
      altKey: "images.a01.alt",
      captionKey: "images.a01.caption",
      ...prov("sharp+device-frame", src.home, "sanitized_app_composite"),
    },
    path.join(OUT, "hero"),
    "a01-hero-app",
    [480, 768],
    4,
    5,
    async (width, height) => phoneComposite(src.home, width, height),
    { maxMobileBytes: 140 * 1024, trackMobile: true },
  );

  {
    const { width, height } = aspectSize(1200, 16, 10);
    const img = await phoneComposite(src.progressHero, width, height, { anchor: "right" });
    const stat = await writeResponsive(img, path.join(OUT, "hero"), "a01-hero-app-desktop-1200w", {});
    const existing = manifestAssets.find((a) => a.id === "A01");
    if (existing) {
      existing.publicPaths.webp.push(...stat.paths.webp);
      existing.publicPaths.avif.push(...stat.paths.avif);
      existing.dimensions.push({ width: stat.width, height: stat.height, suffix: "desktop-1200w" });
    }
  }

  await exportWidths(
    "A02",
    {
      role: "plan",
      altKey: "images.a02.alt",
      captionKey: "images.a02.caption",
      ...prov("sharp+device-frame", src.plan, "sanitized_app_composite"),
    },
    path.join(OUT, "screens"),
    "a02-plan",
    [400, 640, 960],
    3,
    4,
    async (width, height) => phoneComposite(src.plan, width, height),
    { maxMobileBytes: 100 * 1024, trackMobile: true },
  );

  await exportWidths(
    "A03",
    {
      role: "workout",
      altKey: "images.a03.alt",
      captionKey: "images.a03.caption",
      ...prov("sharp+device-frame", src.workout, "sanitized_app_composite"),
    },
    path.join(OUT, "screens"),
    "a03-workout",
    [400, 640, 960],
    3,
    4,
    async (width, height) => phoneComposite(src.workout, width, height),
    { maxMobileBytes: 100 * 1024, trackMobile: true },
  );

  for (const [view, file, idSuffix] of [
    ["front", src.anatomyFront, "muscle-front"],
    ["back", src.anatomyBack, "muscle-back"],
  ]) {
    await exportWidths(
      "A04",
      {
        role: `muscle-${view}`,
        altKey: `images.a04.${view}.alt`,
        captionKey: "images.a04.caption",
        ...prov("sharp+cover", file, "sanitized_app_composite"),
      },
      path.join(OUT, "anatomy"),
      `a04-${idSuffix}`,
      [480, 800, 1200],
      4,
      5,
      async (width, height) => fitCover(file, width, height),
      { maxMobileBytes: 160 * 1024, trackMobile: true },
    );
  }

  await exportWidths(
    "A05",
    {
      role: "studio-overview",
      altKey: "images.a05.alt",
      captionKey: "images.a05.caption",
      ...prov("sharp+browser-frame", src.home, "sanitized_app_composite"),
    },
    path.join(OUT, "screens"),
    "a05-studio",
    [640, 960],
    4,
    5,
    async (width, height) => phoneComposite(src.home, width, height),
    { maxMobileBytes: 160 * 1024, trackMobile: true },
  );

  {
    const { width, height } = aspectSize(1440, 16, 10);
    const img = await browserComposite(src.studioWide, width, height);
    const stat = await writeResponsive(img, path.join(OUT, "screens"), "a05-studio-desktop-1440w", {});
    manifestAssets
      .filter((a) => a.id === "A05")
      .forEach((a) => {
        a.publicPaths.webp.push(...stat.paths.webp);
        a.publicPaths.avif.push(...stat.paths.avif);
        a.dimensions.push({ width: stat.width, height: stat.height, suffix: "desktop-1440w" });
        a.aspectRatio = "4:5 / 16:10";
      });
  }

  await exportWidths(
    "A06",
    {
      role: "form-preview",
      altKey: "images.a06.alt",
      captionKey: "images.a06.caption",
      ...prov("sharp+svg-mockup", null, "synthetic_illustration"),
    },
    path.join(OUT, "screens"),
    "a06-form-preview",
    [480, 768, 1200],
    4,
    5,
    async (width, height) => formPreview(width, height),
    { maxMobileBytes: 130 * 1024, trackMobile: true },
  );

  await exportWidths(
    "A07",
    {
      role: "movement-guide",
      altKey: "images.a07.alt",
      captionKey: "images.a07.caption",
      ...prov("sharp+svg", null, "synthetic_illustration"),
    },
    path.join(OUT, "screens"),
    "a07-movement-guide",
    [400, 640, 960],
    4,
    3,
    async (width, height) => movementGuide(width, height),
    { maxMobileBytes: 90 * 1024, trackMobile: true },
  );

  await exportWidths(
    "A08",
    {
      role: "trainer-conversation",
      altKey: "images.a08.alt",
      captionKey: "images.a08.caption",
      ...prov("sharp+svg-lifestyle", null, "synthetic_illustration"),
    },
    path.join(OUT, "lifestyle"),
    "a08-trainer-conversation",
    [480, 800],
    4,
    5,
    async (width, height) => sharp(lifestyleSvg(width, height, "trainer")),
    { maxMobileBytes: 130 * 1024, trackMobile: true },
  );

  {
    const { width, height } = aspectSize(1280, 3, 2);
    const img = sharp(lifestyleSvg(width, height, "trainer"));
    const stat = await writeResponsive(img, path.join(OUT, "lifestyle"), "a08-trainer-conversation-desktop-1280w", {});
    const a08 = manifestAssets.filter((a) => a.id === "A08");
    if (a08.length) {
      const last = a08[a08.length - 1];
      last.publicPaths.webp.push(...stat.paths.webp);
      last.publicPaths.avif.push(...stat.paths.avif);
      last.dimensions.push({ width: stat.width, height: stat.height, suffix: "desktop-1280w" });
    }
  }

  await exportWidths(
    "A09",
    {
      role: "trainer-dashboard",
      altKey: "images.a09.alt",
      captionKey: "images.a09.caption",
      ...prov("sharp+svg-mockup", null, "synthetic_illustration"),
    },
    path.join(OUT, "screens"),
    "a09-trainer-dashboard",
    [480, 800],
    4,
    5,
    async (width, height) => trainerDashboardSvg(width, height),
    { maxMobileBytes: 140 * 1024, trackMobile: true },
  );

  {
    const { width, height } = aspectSize(1280, 16, 10);
    const img = await trainerDashboardSvg(width, height);
    const stat = await writeResponsive(img, path.join(OUT, "screens"), "a09-trainer-dashboard-desktop-1280w", {});
    const a09 = manifestAssets.filter((a) => a.id === "A09");
    if (a09.length) {
      const last = a09[a09.length - 1];
      last.publicPaths.webp.push(...stat.paths.webp);
      last.publicPaths.avif.push(...stat.paths.avif);
    }
  }

  await exportWidths(
    "A10",
    {
      role: "pilot-gym",
      altKey: "images.a10.alt",
      captionKey: "images.a10.caption",
      ...prov("sharp+svg-lifestyle", null, "synthetic_illustration"),
    },
    path.join(OUT, "lifestyle"),
    "a10-pilot-gym",
    [480, 800],
    4,
    5,
    async (width, height) => sharp(lifestyleSvg(width, height, "gym")),
    { maxMobileBytes: 120 * 1024, trackMobile: true },
  );

  {
    const { width, height } = aspectSize(1280, 16, 9);
    const img = sharp(lifestyleSvg(width, height, "gym"));
    const stat = await writeResponsive(img, path.join(OUT, "lifestyle"), "a10-pilot-gym-desktop-1280w", {});
    const a10 = manifestAssets.filter((a) => a.id === "A10");
    if (a10.length) {
      const last = a10[a10.length - 1];
      last.publicPaths.webp.push(...stat.paths.webp);
      last.publicPaths.avif.push(...stat.paths.avif);
    }
  }

  const ogNl = await buildOg("nl", "Meer inzicht in je training", "Android-pilot · Web Studio");
  const ogEn = await buildOg("en", "Understand your training", "Android pilot · Web Studio");

  manifestAssets.push({
    id: "A11",
    role: "og-social",
    aspectRatio: "1200:630",
    dimensions: [{ width: 1200, height: 630, suffix: "og" }],
    publicPaths: { webp: [], avif: [], png: ["public/og-nl.png", "public/og-en.png"] },
    maxMobileBytes: null,
    actualMobileBytes: null,
    altKey: "meta.og.imageAlt",
    captionKey: null,
    provenance: {
      modelOrTool: "sharp-composite",
      generationDate: GEN_DATE,
      promptSummary: "Deterministic OG cards brief §7 A11",
      sourceScreenshotCommit: null,
      sourceScreenshotPath: null,
    },
    classification: "brand_mark",
    privacyReviewStatus: "sanitized_demo_only",
    ogBytes: { nl: ogNl.bytes, en: ogEn.bytes },
  });

  manifestAssets.push({
    id: "A12",
    role: "logo-favicon",
    aspectRatio: "1:1",
    dimensions: [
      { width: 32, height: 32, suffix: "favicon-32" },
      { width: 180, height: 180, suffix: "apple-touch" },
      { width: 192, height: 192, suffix: "icon-192" },
      { width: 512, height: 512, suffix: "icon-512" },
    ],
    publicPaths: {
      svg: ["public/favicon.svg"],
      png: [
        "public/favicon-32.png",
        "public/apple-touch-icon.png",
        "public/icon-192.png",
        "public/icon-512.png",
      ],
    },
    maxMobileBytes: null,
    actualMobileBytes: null,
    altKey: "brand.logoAlt",
    captionKey: null,
    provenance: {
      modelOrTool: "existing-brand",
      generationDate: GEN_DATE,
      promptSummary: "Reused approved favicon family",
      sourceScreenshotCommit: null,
      sourceScreenshotPath: null,
    },
    classification: "brand_mark",
    privacyReviewStatus: "ownerPublishApproved",
  });

  const collapsed = [];
  const byId = new Map();
  for (const entry of manifestAssets) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, { ...entry, publicPaths: { webp: [], avif: [], png: [], svg: [] } });
    }
    const agg = byId.get(entry.id);
    for (const kind of ["webp", "avif", "png", "svg"]) {
      if (entry.publicPaths?.[kind]) agg.publicPaths[kind].push(...entry.publicPaths[kind]);
    }
    if (entry.dimensions) {
      agg.dimensions = [...(agg.dimensions || []), ...entry.dimensions];
    }
    if (entry.actualMobileBytes != null) {
      agg.actualMobileBytes =
        agg.actualMobileBytes == null
          ? entry.actualMobileBytes
          : Math.min(agg.actualMobileBytes, entry.actualMobileBytes);
    }
    if (entry.ogBytes) agg.ogBytes = entry.ogBytes;
  }
  for (const v of byId.values()) {
    for (const kind of Object.keys(v.publicPaths)) {
      v.publicPaths[kind] = [...new Set(v.publicPaths[kind])];
    }
    collapsed.push(v);
  }
  collapsed.sort((a, b) => a.id.localeCompare(b.id));

  const manifest = {
    schemaVersion: 1,
    generatedAt: GEN_DATE,
    qaRoot: QA,
    assets: collapsed,
  };
  await fs.promises.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${MANIFEST_PATH} (${collapsed.length} assets)`);
  console.log("Marketing images built under public/images/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
