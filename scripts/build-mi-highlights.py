#!/usr/bin/env python3
"""Build per-region highlight frames from mi-v4 plates + masks."""
from PIL import Image, ImageEnhance
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public/images/anatomy/mi-v4"
OUT = ROOT / "highlights"
OUT.mkdir(exist_ok=True)
DIM = 0.34
REGIONS = {
    "female-front": ["quads", "core", "calves", "shoulders", "arms"],
    "female-back": ["glutes", "hamstrings", "back", "calves", "shoulders", "arms"],
}

def compose(view: str, region: str):
    plate_path = ROOT / "plates" / f"{view}-800w.webp"
    if not plate_path.exists():
        plate_path = ROOT / "plates" / f"{view}.webp"
    plate = Image.open(plate_path).convert("RGBA")
    mask = Image.open(ROOT / "masks" / view / f"{region}.webp")
    if mask.size != plate.size:
        mask = mask.resize(plate.size, Image.Resampling.BILINEAR)
    alpha = mask.split()[-1].point(
        lambda p: 0 if p < 24 else (255 if p > 200 else int((p - 24) * 255 / (200 - 24)))
    )
    dim = ImageEnhance.Color(ImageEnhance.Brightness(plate).enhance(DIM)).enhance(0.75)
    cut = plate.copy()
    cut.putalpha(alpha)
    canvas = Image.new("RGBA", plate.size, (7, 8, 11, 255))
    canvas.alpha_composite(dim)
    canvas.alpha_composite(cut)
    rgb = canvas.convert("RGB")
    for w, q in ((480, 86), (800, 84)):
        h = int(w * plate.size[1] / plate.size[0])
        rgb.resize((w, h), Image.Resampling.LANCZOS).save(
            OUT / f"{view}-{region}-{w}w.webp", "WEBP", quality=q, method=6
        )
        print(f"{view}-{region}-{w}w")

if __name__ == "__main__":
    for view, regs in REGIONS.items():
        for r in regs:
            compose(view, r)
