import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
base = Image.new('RGB', (W, H), color='#050a14')

# 1. Ambient radial glows
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)

center_x, center_y = W // 2, H // 2 - 25
for r in range(380, 0, -10):
    alpha = int(40 * (1 - r / 380))
    glow_draw.ellipse([center_x - r, center_y - int(r * 0.7), center_x + r, center_y + int(r * 0.7)], fill=(0, 71, 171, alpha))

for r in range(200, 0, -8):
    alpha = int(50 * (1 - r / 200))
    glow_draw.ellipse([center_x - r, center_y - int(r * 0.6), center_x + r, center_y + int(r * 0.6)], fill=(56, 189, 248, alpha))

base.paste(glow, (0, 0), glow)

# 2. Border & Accents
draw = ImageDraw.Draw(base)
margin = 28
draw.rounded_rectangle([margin, margin, W - margin, H - margin], radius=16, outline=(56, 189, 248, 70), width=1)

corner_len = 36
draw.line([margin, margin, margin + corner_len, margin], fill=(56, 189, 248, 240), width=2)
draw.line([margin, margin, margin, margin + corner_len], fill=(56, 189, 248, 240), width=2)
draw.line([W - margin - corner_len, margin, W - margin, margin], fill=(56, 189, 248, 240), width=2)
draw.line([W - margin, margin, W - margin, margin + corner_len], fill=(56, 189, 248, 240), width=2)
draw.line([margin, H - margin, margin + corner_len, H - margin], fill=(56, 189, 248, 240), width=2)
draw.line([margin, H - margin, margin, H - margin - corner_len], fill=(56, 189, 248, 240), width=2)
draw.line([W - margin - corner_len, H - margin, W - margin, H - margin], fill=(56, 189, 248, 240), width=2)
draw.line([W - margin, H - margin, W - margin, H - margin - corner_len], fill=(56, 189, 248, 240), width=2)

# 3. Fonts
font_dir = 'C:/Windows/Fonts/'
font_tag = ImageFont.truetype(font_dir + 'segoeuib.ttf', 13)
font_title = ImageFont.truetype(font_dir + 'segoeuib.ttf', 28)
font_subtitle = ImageFont.truetype(font_dir + 'segoeui.ttf', 18)
font_badge = ImageFont.truetype(font_dir + 'segoeuib.ttf', 12)
font_url = ImageFont.truetype(font_dir + 'segoeuib.ttf', 14)

# 4. Top Tagline (Fits safely within central 580px zone)
tag_text = "G11 CONCEITO FINANCEIRO  •  ALTA PERFORMANCE"
bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
tw = bbox[2] - bbox[0]
tag_x = (W - tw) // 2
tag_y = 55
draw.text((tag_x, tag_y), tag_text, font=font_tag, fill=(56, 189, 248))

line_len = 60
draw.line([tag_x - line_len - 14, tag_y + 8, tag_x - 14, tag_y + 8], fill=(56, 189, 248, 120), width=1)
draw.line([tag_x + tw + 14, tag_y + 8, tag_x + tw + line_len + 14, tag_y + 8], fill=(56, 189, 248, 120), width=1)

# 5. Logo
logo_path = 'client/public/uploads/branding/logo_hero_central.png'
logo = Image.open(logo_path).convert('RGBA')

# Target width 540px (completely within 630px square safe zone)
target_w = 540
target_h = int(logo.height * (target_w / logo.width))
logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

logo_pos_x = (W - target_w) // 2
logo_pos_y = 100

logo_shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
logo_shadow.paste(logo, (logo_pos_x, logo_pos_y), logo)
glow_layer = logo_shadow.filter(ImageFilter.GaussianBlur(18))
glow_enh = Image.new('RGBA', (W, H), (56, 189, 248, 160))
glow_comp = Image.composite(glow_enh, glow_layer, glow_layer.split()[3])
glow_final = glow_comp.filter(ImageFilter.GaussianBlur(12))

base.paste(glow_final, (0, 0), glow_final)
base.paste(logo, (logo_pos_x, logo_pos_y), logo)

# 6. Headline & Subtitle within central 580px zone
headline_y = logo_pos_y + target_h + 18
headline_text = "Soluções Estratégicas para Clientes e Corretores"
bbox_hl = draw.textbbox((0, 0), headline_text, font=font_title)
hl_w = bbox_hl[2] - bbox_hl[0]
draw.text(((W - hl_w) // 2, headline_y), headline_text, font=font_title, fill=(255, 255, 255))

sub_text = "Seguros • Previdência Privada • Saúde • Planejamento"
bbox_sub = draw.textbbox((0, 0), sub_text, font=font_subtitle)
sub_w = bbox_sub[2] - bbox_sub[0]
draw.text(((W - sub_w) // 2, headline_y + 40), sub_text, font=font_subtitle, fill=(186, 230, 253))

# 7. Badges row
badges = [
    "SEGURADORAS DE ELITE",
    "ASSESSORIA EXCLUSIVA",
    "ALTA PERFORMANCE"
]

badge_y = H - 98
badge_boxes = []
total_b_width = 0
for b in badges:
    bb = draw.textbbox((0, 0), b, font=font_badge)
    bw = (bb[2] - bb[0]) + 36
    badge_boxes.append((b, bw))
    total_b_width += bw

gap = 14
total_row_w = total_b_width + gap * (len(badges) - 1)
start_bx = (W - total_row_w) // 2

cur_x = start_bx
for b, bw in badge_boxes:
    rect = [cur_x, badge_y, cur_x + bw, badge_y + 30]
    draw.rounded_rectangle(rect, radius=15, fill=(9, 40, 61, 230), outline=(56, 189, 248, 110), width=1)
    bb = draw.textbbox((0, 0), b, font=font_badge)
    tw = bb[2] - bb[0]
    draw.text((cur_x + (bw - tw) // 2, badge_y + 7), b, font=font_badge, fill=(224, 242, 254))
    cur_x += bw + gap

# 8. Bottom URL
url_text = "www.g11conceitofinanceiro.com.br"
bbox_url = draw.textbbox((0, 0), url_text, font=font_url)
url_w = bbox_url[2] - bbox_url[0]
draw.text(((W - url_w) // 2, H - 46), url_text, font=font_url, fill=(56, 189, 248))

# Save landscape 1200x630
base.save('client/public/og-image.jpg', format='JPEG', quality=90, optimize=True)
base.save('client/public/og-image.png', format='PNG', optimize=True)

# 9. Create 600x600 Square Thumbnail for WhatsApp Android / Square Card previews
sq_w, sq_h = 600, 600
sq = Image.new('RGB', (sq_w, sq_h), color='#050a14')
sq_glow = Image.new('RGBA', (sq_w, sq_h), (0, 0, 0, 0))
sq_gdraw = ImageDraw.Draw(sq_glow)

for r in range(260, 0, -8):
    alpha = int(45 * (1 - r / 260))
    sq_gdraw.ellipse([300 - r, 300 - r, 300 + r, 300 + r], fill=(0, 71, 171, alpha))
for r in range(140, 0, -6):
    alpha = int(60 * (1 - r / 140))
    sq_gdraw.ellipse([300 - r, 300 - r, 300 + r, 300 + r], fill=(56, 189, 248, alpha))
sq.paste(sq_glow, (0, 0), sq_glow)

sq_draw = ImageDraw.Draw(sq)
sq_draw.rounded_rectangle([16, 16, sq_w - 16, sq_h - 16], radius=16, outline=(56, 189, 248, 80), width=1)

# Central logo on square
sq_logo_w = 460
sq_logo_h = int(logo.height * (sq_logo_w / logo.width))
sq_logo = logo.resize((sq_logo_w, sq_logo_h), Image.Resampling.LANCZOS)
sq_logo_x = (sq_w - sq_logo_w) // 2
sq_logo_y = 130
sq.paste(sq_logo, (sq_logo_x, sq_logo_y), sq_logo)

# Subtitle on square
font_sq_t = ImageFont.truetype(font_dir + 'segoeuib.ttf', 20)
sq_text = "Assessoria de Alta Performance"
bbox_sq = sq_draw.textbbox((0, 0), sq_text, font=font_sq_t)
sq_tw = bbox_sq[2] - bbox_sq[0]
sq_draw.text(((sq_w - sq_tw) // 2, sq_logo_y + sq_logo_h + 30), sq_text, font=font_sq_t, fill=(255, 255, 255))

font_sq_sub = ImageFont.truetype(font_dir + 'segoeui.ttf', 15)
sq_sub = "Seguros • Previdência • Saúde"
bbox_sqs = sq_draw.textbbox((0, 0), sq_sub, font=font_sq_sub)
sq_sw = bbox_sqs[2] - bbox_sqs[0]
sq_draw.text(((sq_w - sq_sw) // 2, sq_logo_y + sq_logo_h + 60), sq_sub, font=font_sq_sub, fill=(56, 189, 248))

sq.save('client/public/og-image-square.jpg', format='JPEG', quality=90, optimize=True)

print("Generated og-image.jpg, og-image.png, og-image-square.jpg")
