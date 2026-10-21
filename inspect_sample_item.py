import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('routes_summary.json', encoding='utf-8') as f:
    routes = json.load(f)

for r in routes:
    if r['galleries']:
        print(f"=== {r['title']} ({r['clean_route']}) ===")
        g = r['galleries'][0]
        sample = g['sample_item']
        print("Sample item keys:", list(sample.keys()) if sample else None)
        print("sample:", json.dumps(sample, indent=2, ensure_ascii=False))
        break
