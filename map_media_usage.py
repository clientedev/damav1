import os
import sys
import json
import re
from lxml import html

sys.stdout.reconfigure(encoding='utf-8')

# Search HTMLs for where each image is used
pages_dir = 'pages_data'
media_usage = {}

for fname in os.listdir(pages_dir):
    if fname.endswith('.html'):
        fpath = os.path.join(pages_dir, fname)
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
            tree = html.fromstring(content)
            
            # Find all img tags
            for img in tree.xpath('//img'):
                src = img.get('src', '')
                alt = img.get('alt', '')
                parent = img.getparent()
                context = parent.tag if parent is not None else ''
                
                # Check media ID in src
                match = re.search(r'([a-zA-Z0-9_-]+~mv2\.[a-zA-Z0-9]+)', src)
                if match:
                    mid = match.group(1)
                    if mid not in media_usage:
                        media_usage[mid] = []
                    media_usage[mid].append({
                        'page': fname,
                        'alt': alt,
                        'tag': 'img'
                    })
                    
            # Check style background-image
            for el in tree.xpath('//*[@style]'):
                style = el.get('style', '')
                match = re.search(r'([a-zA-Z0-9_-]+~mv2\.[a-zA-Z0-9]+)', style)
                if match:
                    mid = match.group(1)
                    if mid not in media_usage:
                        media_usage[mid] = []
                    media_usage[mid].append({
                        'page': fname,
                        'tag': f"style in <{el.tag}>"
                    })

print("Media usage mapping:")
for mid, usages in sorted(media_usage.items()):
    pages_list = set(u['page'] for u in usages)
    alts = set(u.get('alt') for u in usages if u.get('alt'))
    print(f"{mid}: pages={list(pages_list)}, alts={list(alts)}")

with open('media_usage.json', 'w', encoding='utf-8') as f:
    json.dump(media_usage, f, indent=2, ensure_ascii=False)
