import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.join(__dirname, ".pages");
const LEGACY_INDEX = path.join(__dirname, "index.html");

function collectPageInputs() {
  const input = {};
  if (fs.existsSync(LEGACY_INDEX)) {
    input.legacy = LEGACY_INDEX;
  }
  const manifestPath = path.join(PAGES_DIR, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const { pages } = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const rel of pages) {
      const abs = path.join(PAGES_DIR, rel);
      if (!fs.existsSync(abs)) continue;
      const key = rel.replace(/\.html$/, "").replace(/\//g, "_") || "root";
      input[key] = abs;
    }
  }
  return input;
}

// BASE=/sculptalab-site/ for GitHub project pages; default "/" for a custom domain (sculptalab.com).
export default defineConfig({
  base: process.env.BASE || "/",
  build: {
    target: "es2020",
    rollupOptions: {
      input: collectPageInputs(),
    },
  },
});
