"""Draws the RECALL/OS launcher icons. Called by scripts/make-icons.mjs."""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont

out = pathlib.Path(sys.argv[1])
BG, FRAME, INK = (29, 31, 32), (148, 188, 227), (242, 242, 243)


def font_for(size):
    for name in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if pathlib.Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def draw(size, *, padded):
    # Maskable icons get cropped to a circle, so keep the art inside ~80%.
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    inset = size * (0.18 if padded else 0.125)
    d.rectangle([inset, inset, size - inset, size - inset], outline=FRAME, width=max(1, size // 96))
    f = font_for(int(size * (0.20 if padded else 0.24)))
    d.text((size / 2, size / 2), "R/OS", font=f, fill=INK, anchor="mm")
    return img


draw(192, padded=False).save(out / "icon-192.png")
draw(512, padded=False).save(out / "icon-512.png")
draw(512, padded=True).save(out / "icon-maskable-512.png")
draw(180, padded=False).save(out / "apple-touch-icon.png")
print("icons written to", out)
