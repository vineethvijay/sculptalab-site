import fs from "fs";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export function resolveChromePath() {
  for (const p of CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "Chrome/Chromium not found. Set CHROME_PATH to your browser executable.",
  );
}

export function chromeLaunchArgs() {
  const args = ["--disable-dev-shm-usage"];
  if (process.env.CI || process.env.CHROME_NO_SANDBOX === "1") {
    args.push("--no-sandbox");
  }
  return args;
}
