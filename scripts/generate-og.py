#!/usr/bin/env python3
"""
Generate a minimalist, high-resolution OG image (1200x630) for Sour Lighthouse.
Inspired by the clean grid and thin typography in the reference screenshot.
No badges, no pills, no tags, no dots, no shadows, no borders, no nanobanana.
"""

from PIL import Image, ImageDraw, ImageFont

WIDTH = 1200
HEIGHT = 630

# High-resolution 2x rendering for ultra-crisp lines, then downsampled
SCALE = 2
W = WIDTH * SCALE
H = HEIGHT * SCALE

img = Image.new("RGBA", (W, H), (255, 255, 255, 255))
draw = ImageDraw.Draw(img)

# Subtle grid lines (inspired by screenshot)
grid_color = (240, 240, 243, 255)
grid_w = int(1.5 * SCALE)

# Vertical grid lines
for x_norm in [160, 480, 800, 1040]:
    x = int(x_norm * SCALE)
    draw.line([(x, 0), (x, H)], fill=grid_color, width=grid_w)

# Horizontal grid lines
for y_norm in [130, 315, 500]:
    y = int(y_norm * SCALE)
    draw.line([(0, y), (fill_w := W, y)], fill=grid_color, width=grid_w)

# Load Inter font
font_path = "Inter-Variable.ttf"

def get_font(size):
    try:
        return ImageFont.truetype(font_path, int(size * SCALE))
    except Exception:
        return ImageFont.load_default()

font_brand = get_font(68)
font_sub = get_font(24)
font_lead = get_font(30)
font_domain = get_font(20)

text_primary = (15, 15, 15, 255)
text_muted = (130, 130, 135, 255)
text_secondary = (75, 75, 80, 255)

# Left column text content
left_x = int(160 * SCALE) + int(50 * SCALE)

# Brand name
draw.text((left_x, int(185 * SCALE)), "Lighthouse", fill=text_primary, font=font_brand)

# Category / descriptor
draw.text((left_x, int(275 * SCALE)), "Lightweight website auditor", fill=text_muted, font=font_sub)

# Value proposition in plain words
draw.text((left_x, int(355 * SCALE)), "Understand how your website performs.", fill=text_secondary, font=font_lead)
draw.text((left_x, int(398 * SCALE)), "Instant speed, search visibility, and ease of access.", fill=text_muted, font=font_lead)

# Domain in bottom section
draw.text((left_x, int(535 * SCALE)), "sour-lighthouse.pages.dev", fill=text_muted, font=font_domain)

# Right column: Minimalist Lighthouse Beacon Mark
# Bounded in grid cell from x=800 to 1040, y=130 to 315
cx = int(920 * SCALE)
cy = int(285 * SCALE)
mark_scale = 3.6 * SCALE
sw = int(2.0 * mark_scale)

# Light source (beacon circle)
source_y = cy - int(45 * mark_scale)
r = int(7 * mark_scale)
draw.ellipse([cx - r, source_y - r, cx + r, source_y + r], fill=text_primary)

# Sweeping light beam rays
draw.line([cx + int(12 * mark_scale), source_y - int(2 * mark_scale), cx + int(48 * mark_scale), source_y - int(14 * mark_scale)], fill=text_primary, width=sw)
draw.line([cx + int(15 * mark_scale), source_y + int(5 * mark_scale), cx + int(54 * mark_scale), source_y + int(8 * mark_scale)], fill=text_primary, width=sw)
draw.line([cx + int(12 * mark_scale), source_y + int(12 * mark_scale), cx + int(44 * mark_scale), source_y + int(28 * mark_scale)], fill=text_primary, width=sw)

# Sleek tower silhouette
ty = source_y + int(18 * mark_scale)
draw.line([cx - int(14 * mark_scale), ty, cx + int(14 * mark_scale), ty], fill=text_primary, width=sw)
draw.line([cx - int(10 * mark_scale), ty, cx - int(18 * mark_scale), ty + int(55 * mark_scale)], fill=text_primary, width=sw)
draw.line([cx + int(10 * mark_scale), ty, cx + int(18 * mark_scale), ty + int(55 * mark_scale)], fill=text_primary, width=sw)
draw.line([cx - int(24 * mark_scale), ty + int(55 * mark_scale), cx + int(24 * mark_scale), ty + int(55 * mark_scale)], fill=text_primary, width=sw)
draw.line([cx - int(7 * mark_scale), ty + int(24 * mark_scale), cx + int(7 * mark_scale), ty + int(24 * mark_scale)], fill=text_primary, width=max(1, int(1.5 * mark_scale)))

# Downsample to 1200x630 using high quality Lanczos filter
final_img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
final_img.save("public/og.png", "PNG", optimize=True)

print("Saved public/og.png (1200x630)")
