#!/usr/bin/env python3
"""Export female-front plate and front-region highlights for the marketing muscle map."""
from pathlib import Path

from PIL import Image, ImageEnhance

SCULPTA = Path("/agent/repos/sculptalab/apps/web/public/mi-anatomy-v4")
OUT = Path(__file__).resolve().parents[1] / "public/anatomy"
TARGET = (357, 948)
DIM = 0.34
TINT = 0.42
PALETTE = {
    "quads": "#FF3B5C",
    "core": "#6C63FF",
}


def scale(img: Image.Image) -> Image.Image:
    return img.resize(TARGET, Image.Resampling.LANCZOS)


def base_plate(plate_path: Path) -> Image.Image:
    plate = Image.open(plate_path).convert("RGBA")
    dim = ImageEnhance.Color(ImageEnhance.Brightness(plate).enhance(DIM)).enhance(0.75)
    canvas = Image.new("RGBA", plate.size, (7, 8, 11, 255))
    canvas.alpha_composite(dim)
    return scale(canvas.convert("RGB"))


def compose(plate_path: Path, mask_path: Path, hex_color: str) -> Image.Image:
    plate = Image.open(plate_path).convert("RGBA")
    mask = Image.open(mask_path)
    if mask.size != plate.size:
        mask = mask.resize(plate.size, Image.Resampling.BILINEAR)
    alpha = mask.split()[-1].point(
        lambda p: 0 if p < 24 else (255 if p > 200 else int((p - 24) * 255 / (200 - 24)))
    )
    dim = ImageEnhance.Color(ImageEnhance.Brightness(plate).enhance(DIM)).enhance(0.75)
    r, g, b = (int(hex_color[i : i + 2], 16) for i in (1, 3, 5))
    tint = Image.new("RGBA", plate.size, (r, g, b, 255))
    cut = Image.blend(ImageEnhance.Brightness(plate).enhance(1.12), tint, TINT)
    cut.putalpha(alpha)
    canvas = Image.new("RGBA", plate.size, (7, 8, 11, 255))
    canvas.alpha_composite(dim)
    canvas.alpha_composite(cut)
    return scale(canvas.convert("RGB"))


def main() -> None:
    plate = SCULPTA / "plates-skin-tone/female-front.webp"
    masks = SCULPTA / "masks-skin-tone/female-front"
    OUT.mkdir(parents=True, exist_ok=True)
    base_plate(plate).save(OUT / "front.webp", "WEBP", quality=86, method=6)
    for region, color in PALETTE.items():
        compose(plate, masks / f"{region}.webp", color).save(
            OUT / f"front-{region}.webp",
            "WEBP",
            quality=86,
            method=6,
        )
        print(f"wrote front-{region}.webp")


if __name__ == "__main__":
    main()
