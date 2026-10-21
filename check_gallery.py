import requests
import json
import sys

# Ensure utf-8 output in Windows console
sys.stdout.reconfigure(encoding='utf-8')

with open('script_wix-warmup-data.json', encoding='utf-8') as f:
    warmup = json.load(f)

gallery_app = warmup.get('appsWarmupData', {}).get('14271d6f-ba62-d045-549b-ab972ae1f70e', {})
print("Gallery app keys:", list(gallery_app.keys()))

gallery_data = gallery_app.get('comp-lkjsznem_galleryData', {})
print("gallery_data type:", type(gallery_data))
if isinstance(gallery_data, dict):
    print("gallery_data keys:", list(gallery_data.keys()))
    items = gallery_data.get('items', [])
    print(f"Number of items in comp-lkjsznem_galleryData: {len(items)}")
    for i, it in enumerate(items[:5]):
        print(f"Item #{i}:", json.dumps(it, ensure_ascii=False)[:300])

with open('script_wix-viewer-model.json', encoding='utf-8') as f:
    vm = json.load(f)

routes = vm.get('siteFeaturesConfigs', {}).get('router', {}).get('routes', {})
print("\n--- ROUTES FOUND ---")
for r_path, r_info in routes.items():
    print(f"{r_path} -> {r_info}")
