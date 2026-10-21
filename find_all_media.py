import os
import re
import json


# Find all wixstatic image URLs across all downloaded HTML files
all_wix_media = set()

# Pattern for wix image files:
# e.g., 41c832_..., d4f942_..., etc.
media_id_pattern = re.compile(r'([a-zA-Z0-9_-]+~mv2\.[a-zA-Z0-9]+)')

for fname in os.listdir('pages_data'):
    if fname.endswith('.html'):
        fpath = os.path.join('pages_data', fname)
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
            matches = media_id_pattern.findall(content)
            for m in matches:
                all_wix_media.add(m)

print(f"Total unique Wix media files found across all HTMLs: {len(all_wix_media)}")
for m in sorted(all_wix_media):
    print(" ", m)
