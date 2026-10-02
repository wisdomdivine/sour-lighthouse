#!/usr/bin/env python3
"""
Generate minimalist logo assets:
- public/logo.svg (currentColor adaptive)
- public/logo-light.svg (dark mark for light backgrounds)
- public/logo-dark.svg (light mark for dark backgrounds)
- public/logo-light.png (512x512 transparent)
- public/logo-dark.png (512x512 transparent)
- public/favicon.ico (16, 32, 48, 64)
- src/app/favicon.ico (Next.js app icon)
"""

import os
from PIL import Image, ImageDraw

# Create SVGs
SVG_CONTENT_ADAPTIVE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor">
  <!-- Minimalist Lighthouse Beacon -->
  <!-- Light source -->
  <circle cx="32" cy="16" r="3.5" fill="currentColor" stroke="none" />
  <!-- Sweeping light beam rays -->
  <path d="M38 15 L54 10 M39 18 L56 20 M38 21 L52 29" stroke-width="1.75" stroke-linecap="round" />
  <!-- Sleek tower silhouette -->
  <path d="M26 24 L38 24 M28 24 L25 50 M36 24 L39 50 M22 50 L42 50" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M30 35 L34 35" stroke-width="1.5" stroke-linecap="round" />
</svg>
'''

SVG_CONTENT_LIGHT = SVG_CONTENT_ADAPTIVE.replace('stroke="currentColor"', 'stroke="#0a0a0a"').replace('fill="currentColor"', 'fill="#0a0a0a"')
SVG_CONTENT_DARK = SVG_CONTENT_ADAPTIVE.replace('stroke="currentColor"', 'stroke="#f5f5f5"').replace('fill="currentColor"', 'fill="#f5f5f5"')

os.makedirs("public", exist_ok=True)
os.makedirs("src/app", exist_ok=True)

with open("public/logo.svg", "w") as f:
    f.write(SVG_CONTENT_ADAPTIVE)

with open("public/logo-light.svg", "w") as f:
    f.write(SVG_CONTENT_LIGHT)

with open("public/logo-dark.svg", "w") as f:
    f.write(SVG_CONTENT_DARK)

def draw_logo_image(size, color):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size / 64.0
    sw = max(1, int(round(1.75 * scale)))
    
    # Draw light source circle
    cx, cy, r = 32 * scale, 16 * scale, 3.5 * scale
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    
    # Sweeping light beam rays
    draw.line([38 * scale, 15 * scale, 54 * scale, 10 * scale], fill=color, width=sw)
    draw.line([39 * scale, 18 * scale, 56 * scale, 20 * scale], fill=color, width=sw)
    draw.line([38 * scale, 21 * scale, 52 * scale, 29 * scale], fill=color, width=sw)
    
    # Tower lines
    draw.line([26 * scale, 24 * scale, 38 * scale, 24 * scale], fill=color, width=sw)
    draw.line([28 * scale, 24 * scale, 25 * scale, 50 * scale], fill=color, width=sw)
    draw.line([36 * scale, 24 * scale, 39 * scale, 50 * scale], fill=color, width=sw)
    draw.line([22 * scale, 50 * scale, 42 * scale, 50 * scale], fill=color, width=sw)
    draw.line([30 * scale, 35 * scale, 34 * scale, 35 * scale], fill=color, width=max(1, int(round(1.5 * scale))))
    
    return img

# Generate PNGs (512x512)
light_color = (10, 10, 10, 255)
dark_color = (245, 245, 245, 255)

png_light = draw_logo_image(512, light_color)
png_light.save("public/logo-light.png", "PNG")

png_dark = draw_logo_image(512, dark_color)
png_dark.save("public/logo-dark.png", "PNG")

# Generate multi-size favicon.ico
ico_sizes = [16, 32, 48, 64]
ico_images = [draw_logo_image(s, light_color) for s in ico_sizes]
ico_images[0].save(
    "public/favicon.ico",
    format="ICO",
    sizes=[(s, s) for s in ico_sizes],
    append_images=ico_images[1:]
)
ico_images[0].save(
    "src/app/favicon.ico",
    format="ICO",
    sizes=[(s, s) for s in ico_sizes],
    append_images=ico_images[1:]
)

print("Generated all logo assets successfully.")
