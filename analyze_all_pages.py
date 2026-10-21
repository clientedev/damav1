import os
import sys
import json
import requests
from lxml import html
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

# Read routes from script_wix-viewer-model.json
with open('script_wix-viewer-model.json', encoding='utf-8') as f:
    vm = json.load(f)

routes = vm.get('siteFeaturesConfigs', {}).get('router', {}).get('routes', {})

print(f"Total routes found: {len(routes)}")

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

base_url = 'https://www.g11conceitofinanceiro.com.br'

os.makedirs('pages_data', exist_ok=True)

routes_summary = []

for route_key, route_val in routes.items():
    clean_route = route_key.lstrip('./')
    target_url = f"{base_url}/{clean_route}" if clean_route else f"{base_url}/"
    page_id = route_val.get('pageId')
    safe_name = clean_route.replace('/', '_') or 'home'
    
    print(f"\nFetching: {safe_name} -> {target_url} (pageId: {page_id})")
    
    try:
        r = requests.get(target_url, headers=headers, timeout=15)
        raw_html_path = os.path.join('pages_data', f"{safe_name}.html")
        with open(raw_html_path, 'w', encoding='utf-8') as hf:
            hf.write(r.text)
            
        tree = html.fromstring(r.content)
        title = "".join(tree.xpath('//title/text()')).strip()
        h1_list = [x.strip() for x in tree.xpath('//h1//text()') if x.strip()]
        h2_list = [x.strip() for x in tree.xpath('//h2//text()') if x.strip()]
        paragraphs = [x.strip() for x in tree.xpath('//p//text()') if x.strip()]
        
        # Check warmup data for galleries
        galleries_info = []
        warmup_scripts = tree.xpath('//script[@id="wix-warmup-data"]')
        if warmup_scripts and warmup_scripts[0].text:
            try:
                wdata = json.loads(warmup_scripts[0].text)
                apps = wdata.get('appsWarmupData', {})
                for app_id, app_content in apps.items():
                    if isinstance(app_content, dict):
                        for comp_key, comp_data in app_content.items():
                            if isinstance(comp_data, dict) and 'items' in comp_data:
                                items = comp_data.get('items', [])
                                galleries_info.append({
                                    'app_id': app_id,
                                    'comp_key': comp_key,
                                    'item_count': len(items),
                                    'sample_item': items[0] if items else None,
                                    'all_items': items
                                })
            except Exception as e:
                print(f"  Error parsing warmup data: {e}")
                
        # Also find all image tags and wix image urls in html
        img_srcs = tree.xpath('//img/@src')
        wix_images = []
        for src in img_srcs:
            if 'wixstatic.com' in src:
                wix_images.append(src)
                
        summary_item = {
            'route_key': route_key,
            'clean_route': clean_route,
            'url': target_url,
            'page_id': page_id,
            'safe_name': safe_name,
            'title': title,
            'h1': h1_list,
            'h2': h2_list,
            'paragraphs_count': len(paragraphs),
            'galleries': galleries_info,
            'wix_images_in_html': len(wix_images)
        }
        routes_summary.append(summary_item)
        
        print(f"  Title: {title}")
        print(f"  H1: {h1_list}")
        print(f"  H2: {h2_list}")
        print(f"  Galleries found: {len(galleries_info)}")
        for g in galleries_info:
            print(f"    Gallery {g['comp_key']}: {g['item_count']} items")
            
    except Exception as e:
        print(f"  Failed: {e}")

with open('routes_summary.json', 'w', encoding='utf-8') as f:
    json.dump(routes_summary, f, indent=2, ensure_ascii=False)

print("\nFinished analyzing all pages! Saved to routes_summary.json")
