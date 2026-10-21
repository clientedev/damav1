import json
import sys
from lxml import html

sys.stdout.reconfigure(encoding='utf-8')

with open('page_projetos_1.html', encoding='utf-8') as f:
    content = f.read()

tree = html.fromstring(content)
warmup_el = tree.xpath('//script[@id="wix-warmup-data"]')
if warmup_el:
    wdata = json.loads(warmup_el[0].text)
    print('warmup keys:', list(wdata.keys()))
    apps = wdata.get('appsWarmupData', {})
    for app_id, data in apps.items():
        print(f'App {app_id}: {list(data.keys())}')
        for k, v in data.items():
            if 'gallery' in k.lower():
                items = v.get('items', [])
                print(f'  {k} has {len(items)} items')
                if items:
                    print('    First item:', json.dumps(items[0], ensure_ascii=False)[:300])

title = tree.xpath('//title/text()')
print('Page Title:', title)

h1 = tree.xpath('//h1//text()')
h2 = tree.xpath('//h2//text()')
print('H1:', h1)
print('H2:', h2)
