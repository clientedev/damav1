import requests
import json
import re
from lxml import html

url = 'https://www.g11conceitofinanceiro.com.br/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

r = requests.get(url, headers=headers)
with open('homepage_raw.html', 'w', encoding='utf-8') as f:
    f.write(r.text)

print(f"Downloaded homepage, length: {len(r.text)} bytes")

tree = html.fromstring(r.content)

scripts = tree.xpath('//script')
print(f"Total script tags: {len(scripts)}")

for i, s in enumerate(scripts):
    sid = s.get('id', '')
    stype = s.get('type', '')
    src = s.get('src', '')
    text = s.text or ''
    if sid or stype:
        print(f"Script #{i}: id='{sid}', type='{stype}', src='{src}', text_len={len(text)}")
        if 'json' in stype.lower() or 'model' in sid.lower():
            try:
                data = json.loads(text)
                with open(f"script_{sid or i}.json", "w", encoding="utf-8") as jf:
                    json.dump(data, jf, indent=2, ensure_ascii=False)
                print(f"  -> Saved script_{sid or i}.json, keys: {list(data.keys())[:10]}")
            except Exception as e:
                print(f"  -> Failed to parse JSON: {e}")

links = tree.xpath('//a/@href')
print("\nUnique links in HTML:")
for l in sorted(set(links)):
    print("  ", l)
