/**
 * Validate A01–A12 marketing assets, dimensions, budgets, and manifest parity.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "docs/assets/site-image-manifest.json");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp required for dimension checks");
  process.exit(1);
}

const REQUIRED_IDS = [
  "A01",
  "A02",
  "A03",
  "A04",
  "A05",
  "A06",
  "A07",
  "A08",
  "A09",
  "A10",
  "A11",
  "A12",
];

function parseRatio(ratio) {
  const s = String(ratio).split(/[/:\s]+/).filter(Boolean);
  if (s.length >= 2) return [Number(s[0]), Number(s[1])];
  return [1, 1];
}

function ratioOk(w, h, rw, rh, tolerance = 0.04) {
  const expected = rw / rh;
  const actual = w / h;
  return Math.abs(actual - expected) / expected <= tolerance;
}

async function fileMeta(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return { missing: true, relPath };
  const st = fs.statSync(abs);
  const meta = await sharp(abs).metadata();
  return {
    relPath,
    bytes: st.size,
    width: meta.width,
    height: meta.height,
  };
}

function collectRasterPaths(asset) {
  const paths = [];
  const pp = asset.publicPaths || {};
  for (const kind of ["webp", "avif", "png"]) {
    for (const p of pp[kind] || []) paths.push(p);
  }
  for (const p of pp.svg || []) {
    if (asset.id === "A12") paths.push(p);
  }
  return paths;
}

async function errors() {
  const errs = [];

  if (!fs.existsSync(MANIFEST_PATH)) {
    errs.push(`Missing manifest: ${MANIFEST_PATH}`);
    return errs;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const assets = manifest.assets || [];
  const ids = new Set(assets.map((a) => a.id));

  for (const id of REQUIRED_IDS) {
    if (!ids.has(id)) errs.push(`Manifest missing asset ${id}`);
  }

  for (const asset of assets) {
    const paths = collectRasterPaths(asset);
    if (asset.id === "A12") {
      for (const p of ["public/favicon.svg", "public/favicon-32.png", "public/icon-192.png"]) {
        if (!fs.existsSync(path.join(ROOT, p))) errs.push(`A12 missing ${p}`);
      }
      continue;
    }
    if (asset.id === "A11") {
      for (const p of ["public/og-nl.png", "public/og-en.png"]) {
        if (!fs.existsSync(path.join(ROOT, p))) errs.push(`A11 missing ${p}`);
        else {
          const st = fs.statSync(path.join(ROOT, p));
          if (st.size > 250 * 1024) errs.push(`A11 ${p} exceeds 250 KB (${st.size} bytes)`);
        }
      }
      for (const dim of asset.dimensions || []) {
        if (dim.width !== 1200 || dim.height !== 630) {
          errs.push(`A11 expected 1200×630, got ${dim.width}×${dim.height}`);
        }
      }
      continue;
    }

    if (!paths.length) {
      errs.push(`${asset.id}: no publicPaths`);
      continue;
    }

    const [rw, rh] = parseRatio(asset.aspectRatio || "1:1");
    let smallestMobile = null;

    for (const rel of paths) {
      if (rel.endsWith(".svg")) continue;
      const meta = await fileMeta(rel);
      if (meta.missing) {
        errs.push(`${asset.id}: missing file ${rel}`);
        continue;
      }
      const desktopVariant = /-desktop-|-desktop\./.test(rel);
      if (
        rw &&
        rh &&
        !desktopVariant &&
        !ratioOk(meta.width, meta.height, rw, rh, 0.05)
      ) {
        errs.push(
          `${asset.id}: ${rel} aspect ${meta.width}×${meta.height} outside ${rw}:${rh}`,
        );
      }
      const isWebpMobile =
        rel.endsWith(".webp") &&
        (rel.includes("-480w") || rel.includes("-400w") || rel.includes("-640w"));
      if (isWebpMobile) {
        if (!smallestMobile || meta.bytes < smallestMobile.bytes) smallestMobile = meta;
      }
    }

    if (asset.maxMobileBytes && smallestMobile) {
      if (smallestMobile.bytes > asset.maxMobileBytes) {
        errs.push(
          `${asset.id}: mobile webp ${smallestMobile.relPath} ${smallestMobile.bytes} B > budget ${asset.maxMobileBytes} B`,
        );
      }
    }

    if (asset.maxMobileBytes && asset.id === "A04") {
      for (const rel of paths) {
        if (!rel.includes("480w") || !rel.endsWith(".webp")) continue;
        const meta = await fileMeta(rel);
        if (meta.missing) continue;
        if (meta.bytes > asset.maxMobileBytes) {
          errs.push(`${asset.id}: ${rel} ${meta.bytes} B > per-view budget`);
        }
      }
    }
  }

  for (const dir of ["hero", "anatomy", "screens", "lifestyle"]) {
    const d = path.join(ROOT, "public/images", dir);
    if (!fs.existsSync(d)) errs.push(`Missing directory public/images/${dir}`);
  }

  return errs;
}

const failures = await errors();
if (failures.length) {
  console.error("images.mjs failed:\n" + failures.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("images.mjs: all A01–A12 assets OK");
