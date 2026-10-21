import os

os.makedirs('client/public/uploads/seguradoras', exist_ok=True)
os.makedirs('uploads/seguradoras', exist_ok=True)

svgs = {
    'porto.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <rect x="172" y="10" width="56" height="42" rx="6" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
  <path d="M178 22 C194 19 208 24 220 30 C206 28 192 27 178 29" fill="#38bdf8"/>
  <path d="M178 30 C195 28 210 33 222 40 C207 37 193 35 178 36" fill="#38bdf8"/>
  <path d="M178 38 C194 37 207 41 218 46 C205 44 193 43 178 44" fill="#38bdf8"/>
  <text x="8" y="32" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="1.5">PORTO</text>
  <text x="8" y="49" fill="#38bdf8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="700" letter-spacing="3">SEGURO</text>
</svg>''',

    'allianz.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" fill="none">
  <text x="10" y="40" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="30" font-weight="700" letter-spacing="0.5">Allianz</text>
  <circle cx="185" cy="32" r="18" stroke="#38bdf8" stroke-width="3" fill="none"/>
  <path d="M177 40 V24 M185 40 V20 M193 40 V24" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
</svg>''',

    'omint.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
  <circle cx="30" cy="30" r="16" stroke="#38bdf8" stroke-width="3.5" fill="none"/>
  <path d="M30 18 C33 24 33 28 30 38 C27 28 27 24 30 18 Z" fill="#38bdf8"/>
  <text x="58" y="40" fill="#ffffff" font-family="'Outfit', Georgia, serif" font-size="34" font-weight="600" letter-spacing="0.5">Omint</text>
</svg>''',

    'sulamerica.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <path d="M15 18 Q 45 6 75 18 T 135 18" stroke="#f97316" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <text x="10" y="45" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="24" font-weight="700" letter-spacing="-0.5">SulAmérica</text>
</svg>''',

    'bradesco.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 60" fill="none">
  <g transform="translate(10, 12)">
    <path d="M5 32 V10 C5 4 12 0 18 0 C24 0 31 4 31 10 V32" stroke="#ef4444" stroke-width="3.5" fill="none"/>
    <path d="M18 10 V32" stroke="#ef4444" stroke-width="3.5"/>
    <circle cx="18" cy="3" r="3" fill="#ef4444"/>
  </g>
  <text x="55" y="32" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="700">Bradesco</text>
  <text x="55" y="48" fill="#94a3b8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="2">SEGUROS</text>
</svg>''',

    'prudential.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <circle cx="28" cy="30" r="16" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
  <path d="M20 38 L25 24 L29 28 L32 20 L37 38 Z" fill="#38bdf8"/>
  <text x="55" y="38" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="23" font-weight="700" letter-spacing="0.5">Prudential</text>
</svg>''',

    'mag.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
  <text x="10" y="36" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="32" font-weight="900" letter-spacing="1">MAG</text>
  <text x="12" y="50" fill="#38bdf8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="4">SEGUROS</text>
</svg>''',

    'icatu.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
  <text x="10" y="38" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="30" font-weight="800" letter-spacing="2">ICATU</text>
  <circle cx="110" cy="16" r="4.5" fill="#22c55e"/>
  <text x="10" y="51" fill="#94a3b8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="3">SEGUROS</text>
</svg>''',

    'tokio.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 60" fill="none">
  <circle cx="26" cy="30" r="15" stroke="#38bdf8" stroke-width="3" fill="none"/>
  <circle cx="26" cy="30" r="7" fill="#ef4444"/>
  <text x=\"52\" y=\"30\" fill=\"#ffffff\" font-family=\"'Plus Jakarta Sans', system-ui, sans-serif\" font-size=\"18\" font-weight=\"800\" letter-spacing=\"1\">TOKIO MARINE</text>
  <text x=\"52\" y=\"46\" fill=\"#38bdf8\" font-family=\"'Plus Jakarta Sans', system-ui, sans-serif\" font-size=\"12\" font-weight=\"700\" letter-spacing=\"2\">SEGURADORA</text>
</svg>''',

    'mapfre.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 60" fill="none">
  <g transform="translate(10, 14)">
    <circle cx="16" cy="16" r="14" stroke="#ef4444" stroke-width="3" fill="none"/>
    <path d="M16 6 V26 M6 16 H26" stroke="#ef4444" stroke-width="3"/>
  </g>
  <text x="50" y="39" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="2">MAPFRE</text>
</svg>''',

    'unimed.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 60" fill="none">
  <path d="M12 36 L24 16 L36 36 Z" fill="#10b981"/>
  <text x="48" y="32" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="800">Seguros</text>
  <text x="48" y="49" fill="#10b981" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="0.5">Unimed</text>
</svg>''',

    'embracon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" fill="none">
  <g transform="translate(10, 10)">
    <path d="M22 6 C12 6 6 14 6 22 C6 30 12 38 22 38 C30 38 36 32 38 24" stroke="#38bdf8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M16 16 L24 24 M20 12 L28 20 M24 8 L32 16" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  </g>
  <text x="58" y="38" fill="#ffffff" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="24" font-weight="700">Embracon</text>
</svg>''',

    'azos.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 60" fill="none">
  <text x="10" y="41" fill="#22c55e" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="36" font-weight="900" letter-spacing="2">AZOS</text>
</svg>'''
}

for fname, content in svgs.items():
    with open(os.path.join('uploads', 'seguradoras', fname), 'w', encoding='utf-8') as f:
        f.write(content)
    with open(os.path.join('client', 'public', 'uploads', 'seguradoras', fname), 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Wrote {fname}')
