#!/usr/bin/env python3
"""Export female skin-tone mi-anatomy-v4 plates + highlights for the marketing muscle map."""
from pathlib import Path

from PIL import Image, ImageEnhance

SCULPTA = Path("/agent/repos/sculptalab/apps/web/public/mi-anatomy-v4")
OUT = Path(__file__).resolve().parents[1] / "public/anatomy"
TARGET = (357, 948)
BRIGHT = 0.72
COLOR = 0.92
TINT = 0.42
PALETTE = {
    "glutes": "#B44DFF",
    "hamstrings": "#FDE047",
    "quads": "#FF3B5C",
    "back": "#22D3EE",
    "shoulders": "#FF5FA2",
    "core": "#6C63FF",
    "arms": "#84CC16",
    "calves": "#3DFF8A",
}
BACK = SCULPTA / "plates-skin-tone/female-back.webp"
FRONT = SCULPTA / "plates-skin-tone/female-front.webp"
MASKS = SCULPTA / "masks-skin-tone"
EXPORTS = {
    "back.webp": ("back", None),
    "front.webp": ("front", None),
    "back-glutes.webp": ("back", "glutes"),
    "back-hamstrings.webp": ("back", "hamstrings"),
    "back-back.webp": ("back", "back"),
    "back-calves.webp": ("back", "calves"),
    "back-shoulders.webp": ("back", "shoulders"),
    "back-arms.webp": ("back", "arms"),
    "front-quads.webp": ("front", "quads"),
    "front-core.webp": ("front", "core"),
}


def grade(plate: Image.Image) -> Image.Image:
    out = ImageEnhance.Brightness(plate).enhance(BRIGHT)
    return ImageEnhance.Color(out).enhance(COLOR)


def load_plate(path: Path) -> Image.Image:
    return grade(path.convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS))


def base(plate_path: Path) -> Image.Image:
    canvas = Image.new("RGBA", TARGET, (7, 8, 11, 255))
    canvas.alpha_composite(load_plate(Image.open(plate_path)))
    return canvas.convert("RGB")


def highlight(plate_path: Path, mask_path: Path, hex_color: str) -> Image.Image:
    plate = load_plate(Image.open(plate_path))
    mask = Image.open(mask_path)
    if mask.size != plate.size:
        mask = mask.resize(plate.size, Image.Resampling.BILINEAR)
    alpha = mask.split()[-1].point(
        lambda p: 0 if p < 24 else (255 if p > 200 else int((p - 24) * 255 / (200 - 24)))
    )
    r, g, b = (int(hex_color[i : i + 2], 16) for i in (1, 3, 5))
    tint = Image.new("RGBA", plate.size, (r, g, b, 255))
    cut = Image.blend(ImageEnhance.Brightness(plate).enhance(1.08), tint, TINT)
    cut.putalpha(alpha)
    canvas = Image.new("RGBA", plate.size, (7, 8, 11, 255))
    canvas.alpha_composite(plate)
    canvas.alpha_composite(cut)
    return canvas.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for fname, (view, region) in EXPORTS.items():
        plate = BACK if view == "back" else FRONT
        if region is None:
            base(plate).save(OUT / fname, "WEBP", quality=86, method=6)
        else:
            mask = MASKS / f"female-{view}" / f"{region}.webp"
            highlight(plate, mask, PALETTE[region]).save(OUT / fname, "WEBP", quality=86, method=6)
        print(fname)


if __name__ == "__main__":
    main()
