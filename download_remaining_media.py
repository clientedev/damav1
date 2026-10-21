import os
import sys
import json
import requests
import re

sys.stdout.reconfigure(encoding='utf-8')

# Collect all files already downloaded in assets
downloaded_files = set()
for root, dirs, files in os.walk('assets'):
    for f in files:
        downloaded_files.add(f)

print(f"Already downloaded files count: {len(downloaded_files)}")

# Find all media IDs in pages_data
media_id_pattern = re.compile(r'([a-zA-Z0-9_-]+~mv2\.[a-zA-Z0-9]+)')
all_wix_media = set()

for fname in os.listdir('pages_data'):
    if fname.endswith('.html'):
        fpath = os.path.join('pages_data', fname)
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
            for m in media_id_pattern.findall(content):
                all_wix_media.add(m)

print(f"Total unique Wix media IDs found: {len(all_wix_media)}")

other_dir = os.path.join('assets', 'images', 'outros')
os.makedirs(other_dir, exist_ok=True)

downloaded_other = 0
for media_id in sorted(all_wix_media):
    # Check if media_id was already downloaded under some name
    # We can check by downloading into assets/images/outros/ if not found
    target_path = os.path.join(other_dir, media_id)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        continue
    url = f"https://static.wixstatic.com/media/{media_id}"
    try:
        r = requests.get(url, timeout=15)
        if r.status_code == 200 and len(r.content) > 100:
            with open(target_path, 'wb') as f:
                f.write(r.content)
            downloaded_other += 1
            print(f"Downloaded additional media: {media_id} ({len(r.content)} bytes)")
    except Exception as e:
        print(f"Failed {media_id}: {e}")

print(f"Downloaded {downloaded_other} additional media files.")
