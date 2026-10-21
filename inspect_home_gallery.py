import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('script_wix-warmup-data.json', encoding='utf-8') as f:
    warmup = json.load(f)

gallery = warmup['appsWarmupData']['14271d6f-ba62-d045-549b-ab972ae1f70e']['comp-lkjsznem_galleryData']

print(f"Total items in Home Gallery: {len(gallery['items'])}")
for i, item in enumerate(gallery['items']):
    meta = item.get('metaData', {})
    link_data = meta.get('link', {}).get('data', {})
    print(f"\nItem #{i}:")
    print("  itemId:", item.get('itemId'))
    print("  mediaUrl:", item.get('mediaUrl'))
    print("  fileName:", meta.get('fileName'))
    print("  title:", meta.get('title'))
    print("  description:", meta.get('description'))
    print("  link target pageId:", link_data.get('pageId'))
