import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('extracted_texts_home.json', encoding='utf-8') as f:
    texts = json.load(f)

for i, t in enumerate(texts):
    print(f"{i:02d} [{t['tag']}] {t['text']}")
    if t.get('href'):
        print(f"    href: {t['href']}")
