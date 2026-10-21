import os
import sys
import json
from lxml import html

sys.stdout.reconfigure(encoding='utf-8')

def extract_page_text(html_path):
    with open(html_path, encoding='utf-8') as f:
        tree = html.fromstring(f.read())
    
    # Extract headings and text elements in order
    nodes = tree.xpath('//h1 | //h2 | //h3 | //h4 | //h5 | //h6 | //p | //span | //a')
    texts = []
    seen = set()
    for n in nodes:
        t = " ".join(n.xpath('.//text()')).strip()
        t = " ".join(t.split())
        if t and len(t) > 2 and t not in seen:
            # Skip code/scripts
            if '{' in t or 'function' in t or 'var ' in t or 'window.' in t or 'JSON' in t:
                continue
            seen.add(t)
            texts.append({
                'tag': n.tag,
                'text': t,
                'href': n.get('href') if n.tag == 'a' else None
            })
    return texts

home_texts = extract_page_text('pages_data/home.html')
sobre_texts = extract_page_text('pages_data/sobre.html')

with open('extracted_texts_home.json', 'w', encoding='utf-8') as f:
    json.dump(home_texts, f, indent=2, ensure_ascii=False)

with open('extracted_texts_sobre.json', 'w', encoding='utf-8') as f:
    json.dump(sobre_texts, f, indent=2, ensure_ascii=False)

print(f"Home texts extracted: {len(home_texts)}")
for item in home_texts[:30]:
    print(f"[{item['tag']}] {item['text'][:100]}")

print("\n--- SOBRE TEXTS ---")
for item in sobre_texts[:20]:
    print(f"[{item['tag']}] {item['text'][:100]}")
