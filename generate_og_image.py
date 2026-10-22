import math
from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 630

# 1. Load Background Poster (slide_1_poster.jpg)
bg_path = 'client/public/uploads/hero/slide_1_poster.jpg'
bg = Image.open(bg_path).convert('RGBA')

# Center crop and resize to 1200x630
bg_ratio = bg.width / bg.height
target_ratio = W / H

if bg_ratio > target_ratio:
    new_h = H
    new_w = int(H * bg_ratio)
    bg_resized = bg.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - W) // 2
    canvas = bg_resized.crop((left, 0, left + W, H))
else:
    new_w = W
    new_h = int(W / bg_ratio)
    bg_resized = bg.resize((new_w, new_h), Image.Resampling.LANCZOS)
    top = (new_h - H) // 2
    canvas = bg_resized.crop((0, top, W, top + H))

# 2. Base Dark Navy Film Layer (#050a14 at 55% opacity)
navy_overlay = Image.new('RGBA', (W, H), (5, 10, 20, int(255 * 0.58)))
canvas = Image.alpha_composite(canvas, navy_overlay)

# 3. Silky Smooth Top/Bottom Gradient Layer
grad_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
grad_draw = ImageDraw.Draw(grad_layer)
for y in range(H):
    # Top 30% soft dark gradient
    if y < H * 0.35:
        alpha = int(170 * (1 - (y / (H * 0.35))))
    # Bottom 45% deep navy fade
    elif y > H * 0.55:
        alpha = int(220 * ((y - H * 0.55) / (H * 0.45)))
    else:
        alpha = 0
    grad_draw.line([(0, y), (W, y)], fill=(5, 10, 20, alpha))

canvas = Image.alpha_composite(canvas, grad_layer)

# 4. Perfectly Smooth Radial Vignette (No rings or banding)
# Create vignette using Gaussian blurred elliptical mask
vig_mask = Image.new('L', (W, H), 0)
vig_draw = ImageDraw.Draw(vig_mask)
cx, cy = W // 2, H // 2
# Inner clear area
vig_draw.ellipse([cx - 420, cy - 240, cx + 420, cy + 240], fill=255)
# Invert and blur heavily for continuous, smooth falloff
vig_mask_inverted = Image.eval(vig_mask, lambda a: 255 - a)
vig_mask_smooth = vig_mask_inverted.filter(ImageFilter.GaussianBlur(90))

# Create deep navy fill with variable opacity based on mask
deep_navy = Image.new('RGBA', (W, H), (5, 10, 20, 210))
vignette_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
vignette_layer.paste(deep_navy, (0, 0), vig_mask_smooth)
canvas = Image.alpha_composite(canvas, vignette_layer)

# 5. Ambient Cyan & Cobalt Radial Glow
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)

glow_draw.ellipse([cx - 280, cy - 180, cx + 280, cy + 180], fill=(0, 71, 171, 70))
glow_draw.ellipse([cx - 150, cy - 100, cx + 150, cy + 100], fill=(56, 189, 248, 90))
glow_blurred = glow.filter(ImageFilter.GaussianBlur(65))
canvas = Image.alpha_composite(canvas, glow_blurred)

# 6. Official Brand Logo
logo_path = 'client/public/uploads/branding/logo_hero_central.png'
logo = Image.open(logo_path).convert('RGBA')

# Target width 620px - perfectly framed, grand and luxury
target_w = 620
target_h = int(logo.height * (target_w / logo.width))
logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

logo_x = (W - target_w) // 2
logo_y = (H - target_h) // 2

# Subtle cyan drop-shadow
shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
logo_alpha = logo.split()[3]
cyan_fill = Image.new('RGBA', (target_w, target_h), (56, 189, 248, 140))
cyan_logo = Image.composite(cyan_fill, Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0)), logo_alpha)
shadow.paste(cyan_logo, (logo_x, logo_y + 10), cyan_logo)
shadow_blurred = shadow.filter(ImageFilter.GaussianBlur(25))

canvas = Image.alpha_composite(canvas, shadow_blurred)
canvas.paste(logo, (logo_x, logo_y), logo)

# Save high quality JPEG and PNG
final_rgb = canvas.convert('RGB')
final_rgb.save('client/public/og-image.jpg', format='JPEG', quality=92, optimize=True)
final_rgb.save('client/public/og-image.png', format='PNG', optimize=True)

# 7. Create 600x600 Square Card for WhatsApp Android
sq_side = min(W, H)
sq_left = (W - sq_side) // 2
sq_crop = canvas.crop((sq_left, 0, sq_left + sq_side, H))
sq_final = sq_crop.resize((600, 600), Image.Resampling.LANCZOS).convert('RGB')
sq_final.save('client/public/og-image-square.jpg', format='JPEG', quality=92, optimize=True)

print("Regenerated seamless, cinema-grade Hero preview card.")
