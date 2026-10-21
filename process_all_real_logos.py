import os
import shutil

os.makedirs('uploads/seguradoras', exist_ok=True)
os.makedirs('client/public/uploads/seguradoras', exist_ok=True)

# 1. Allianz: Remove background rectangle, generate dark (white) and light (#002F87)
with open('uploads/seguradoras/allianz_real.svg', 'r', encoding='utf-8') as f:
    allianz_raw = f.read()

# Strip <rect fill="#002F87" .../>
allianz_clean = allianz_raw.replace('<rect fill="#002F87" width="300" height="134.311"/>', '')

# Light version (Blue text)
allianz_light = allianz_clean.replace('fill="#FFFFFF"', 'fill="#002F87"')
with open('uploads/seguradoras/allianz_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(allianz_light)

# Dark version (White text)
allianz_dark = allianz_clean.replace('fill="#002F87"', 'fill="#FFFFFF"')
with open('uploads/seguradoras/allianz_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(allianz_dark)

# 2. SulAmérica: orange waves + white (dark mode) / navy (light mode)
with open('uploads/seguradoras/sulamerica_real.svg', 'r', encoding='utf-8') as f:
    sul_raw = f.read()

# Dark version: text is white
sul_dark = sul_raw.replace('fill="#001e64"', 'fill="#FFFFFF"')
with open('uploads/seguradoras/sulamerica_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(sul_dark)

# Light version: text is official navy #001e64
sul_light = sul_raw
with open('uploads/seguradoras/sulamerica_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(sul_light)

# 3. Porto:
with open('uploads/seguradoras/porto_real.svg', 'r', encoding='utf-8') as f:
    porto_raw = f.read()

porto_dark = porto_raw.replace('.A{fill:#00a1fc}', '.A{fill:#ffffff}')
with open('uploads/seguradoras/porto_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(porto_dark)

porto_light = porto_raw.replace('.A{fill:#00a1fc}', '.A{fill:#003882}')
with open('uploads/seguradoras/porto_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(porto_light)

# 4. Prudential:
with open('uploads/seguradoras/prudential_real.svg', 'r', encoding='utf-8') as f:
    pru_raw = f.read()

pru_dark = pru_raw.replace('fill="#007AC1"', 'fill="#FFFFFF"')
with open('uploads/seguradoras/prudential_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(pru_dark)

pru_light = pru_raw.replace('fill="#007AC1"', 'fill="#003366"')
with open('uploads/seguradoras/prudential_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(pru_light)

# 5. Bradesco:
with open('uploads/seguradoras/bradesco_real.svg', 'r', encoding='utf-8') as f:
    brad_raw = f.read()

brad_dark = brad_raw.replace('fill=\"#E5173F\"', 'fill=\"#FFFFFF\"')
with open('uploads/seguradoras/bradesco_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(brad_dark)

brad_light = brad_raw
with open('uploads/seguradoras/bradesco_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(brad_light)

# 6. Mapfre:
with open('uploads/seguradoras/mapfre_real.svg', 'r', encoding='utf-8') as f:
    map_raw = f.read()

map_dark = map_raw.replace('fill=\"#be002f\"', 'fill=\"#FFFFFF\"')
with open('uploads/seguradoras/mapfre_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(map_dark)

map_light = map_raw
with open('uploads/seguradoras/mapfre_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(map_light)

# 7. Tokio Marine:
with open('uploads/seguradoras/tokio_real.svg', 'r', encoding='utf-8') as f:
    tokio_raw = f.read()

with open('uploads/seguradoras/tokio_real_dark.svg', 'w', encoding='utf-8') as f:
    f.write(tokio_raw)

with open('uploads/seguradoras/tokio_real_light.svg', 'w', encoding='utf-8') as f:
    f.write(tokio_raw)

# Copy everything into client/public/uploads/seguradoras/
for f in os.listdir('uploads/seguradoras'):
    if 'real' in f:
        shutil.copy2(os.path.join('uploads/seguradoras', f), os.path.join('client/public/uploads/seguradoras', f))

print('All real logos processed and synced successfully!')
