import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 1200 x 630 is standard Facebook, WhatsApp, LinkedIn, Twitter large card
W, H = 1200, 630
base = Image.new('RGB', (W, H), color='#050a14')

# 1. Background Gradient & Ambient Glows
# Create a radial glow in the center
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)

# Center cobalt glow
center_x, center_y = W // 2, H // 2 - 20
for r in range(350, 0, -10):
    alpha = int(35 * (1 - r / 350))
    glow_draw.ellipse([center_x - r, center_y - int(r * 0.7), center_x + r, center_y + int(r * 0.7)], fill=(0, 71, 171, alpha))

# Center vibrant cyan highlight
for r in range(180, 0, -8):
    alpha = int(45 * (1 - r / 180))
    glow_draw.ellipse([center_x - r, center_y - int(r * 0.6), center_x + r, center_y + int(r * 0.6)], fill=(56, 189, 248, alpha))

base.paste(glow, (0, 0), glow)

# 2. Luxury Subtle Border & Corner Accents
draw = ImageDraw.Draw(base)
margin = 28
# Outer border
draw.rounded_rectangle([margin, margin, W - margin, H - margin], radius=16, outline=(56, 189, 248, 60), width=1)

# Subtle corner accent lines
corner_len = 36
# Top Left
draw.line([margin, margin, margin + corner_len, margin], fill=(56, 189, 248, 220), width=2)
draw.line([margin, margin, margin, margin + corner_len], fill=(56, 189, 248, 220), width=2)
# Top Right
draw.line([W - margin - corner_len, margin, W - margin, margin], fill=(56, 189, 248, 220), width=2)
draw.line([W - margin, margin, W - margin, margin + corner_len], fill=(56, 189, 248, 220), width=2)
# Bottom Left
draw.line([margin, H - margin, margin + corner_len, H - margin], fill=(56, 189, 248, 220), width=2)
draw.line([margin, H - margin, margin, H - margin - corner_len], fill=(56, 189, 248, 220), width=2)
# Bottom Right
draw.line([W - margin - corner_len, H - margin, W - margin, H - margin], fill=(56, 189, 248, 220), width=2)
draw.line([W - margin, H - margin, W - margin, H - margin - corner_len], fill=(56, 189, 248, 220), width=2)

# 3. Fonts
font_dir = 'C:/Windows/Fonts/'
font_tag = ImageFont.truetype(font_dir + 'segoeuib.ttf', 13)
font_title = ImageFont.truetype(font_dir + 'segoeuib.ttf', 32)
font_subtitle = ImageFont.truetype(font_dir + 'segoeui.ttf', 20)
font_badge = ImageFont.truetype(font_dir + 'segoeuib.ttf', 13)
font_url = ImageFont.truetype(font_dir + 'segoeuib.ttf', 14)

# 4. Top Tagline with Cyan Lines
tag_text = "G11 CONCEITO FINANCEIRO  •  ASSESSORIA DE ALTA PERFORMANCE"
bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
tw = bbox[2] - bbox[0]
tag_x = (W - tw) // 2
tag_y = 52
draw.text((tag_x, tag_y), tag_text, font=font_tag, fill=(56, 189, 248))

# Line left and right of tag
line_len = 80
draw.line([tag_x - line_len - 18, tag_y + 8, tag_x - 18, tag_y + 8], fill=(56, 189, 248, 120), width=1)
draw.line([tag_x + tw + 18, tag_y + 8, tag_x + tw + line_len + 18, tag_y + 8], fill=(56, 189, 248, 120), width=1)

# 5. Place Central Logo
logo_path = 'client/public/uploads/branding/logo_hero_central.png'
logo = Image.open(logo_path).convert('RGBA')

# Target logo dimensions: width ~ 580px
target_w = 580
target_h = int(logo.height * (target_w / logo.width))
logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Create logo glow shadow
logo_shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
logo_pos_x = (W - target_w) // 2
logo_pos_y = 95
# Paste into shadow canvas
logo_shadow.paste(logo, (logo_pos_x, logo_pos_y), logo)
# Apply blur for drop glow
glow_layer = logo_shadow.filter(ImageFilter.GaussianBlur(16))
# Enhance cyan tint in glow
glow_enh = Image.new('RGBA', (W, H), (56, 189, 248, 140))
glow_comp = Image.composite(glow_enh, glow_layer, glow_layer.split()[3])
glow_final = glow_comp.filter(ImageFilter.GaussianBlur(10))

base.paste(glow_final, (0, 0), glow_final)
base.paste(logo, (logo_pos_x, logo_pos_y), logo)

# 6. Headline / Subtitle
headline_y = logo_pos_y + target_h + 16
headline_text = "Soluções Estratégicas para Corretores e Clientes Exclusivos"
bbox_hl = draw.textbbox((0, 0), headline_text, font=font_title)
hl_w = bbox_hl[2] - bbox_hl[0]
draw.text(((W - hl_w) // 2, headline_y), headline_text, font=font_title, fill=(255, 255, 255))

sub_text = "Seguros de Vida • Previdência Privada • Planos de Saúde • Planejamento Patrimonial"
bbox_sub = draw.textbbox((0, 0), sub_text, font=font_subtitle)
sub_w = bbox_sub[2] - bbox_sub[0]
draw.text(((W - sub_w) // 2, headline_y + 44), sub_text, font=font_subtitle, fill=(186, 230, 253))

# 7. Badges row at bottom
badges = [
    "PARCEIRO DAS MAIORES SEGURADORAS",
    "ATENDIMENTO VIP E DEDICADO",
    "ALTA PERFORMANCE ESTRATÉGICA"
]

badge_y = H - 98
# Calculate total width of badges to center them
badge_paddings = 24
badge_boxes = []
total_b_width = 0
for b in badges:
    bb = draw.textbbox((0, 0), b, font=font_badge)
    bw = (bb[2] - bb[0]) + badge_paddings * 2
    badge_boxes.append((b, bw, bb[3] - bb[1]))
    total_b_width += bw

gap = 14
total_row_w = total_b_width + gap * (len(badges) - 1)
start_bx = (W - total_row_w) // 2

cur_x = start_bx
for b, bw, bh in badge_boxes:
    # draw rounded box
    rect = [cur_x, badge_y, cur_x + bw, badge_y + 32]
    draw.rounded_rectangle(rect, radius=16, fill=(9, 40, 61, 220), outline=(56, 189, 248, 100), width=1)
    # text
    bb = draw.textbbox((0, 0), b, font=font_badge)
    tw = bb[2] - bb[0]
    draw.text((cur_x + (bw - tw) // 2, badge_y + 8), b, font=font_badge, fill=(224, 242, 254))
    cur_x += bw + gap

# 8. Bottom URL badge
url_text = "www.g11conceitofinanceiro.com.br"
bbox_url = draw.textbbox((0, 0), url_text, font=font_url)
url_w = bbox_url[2] - bbox_url[0]
url_x = (W - url_w) // 2
draw.text((url_x, H - 46), url_text, font=font_url, fill=(56, 189, 248))

# Save high-quality optimized PNG and JPEG
base.save('client/public/og-image.png', format='PNG', optimize=True)
base.save('client/public/og-image.jpg', format='JPEG', quality=92, optimize=True)
print("Successfully generated client/public/og-image.png and og-image.jpg")
