"""Capture versioned viewer icons and font metadata referenced by the bundled runtime."""
import concurrent.futures, json, re
from mirror import ROOT,PUBLIC,DIST,fetch_vendor,vendor_path
urls=set()
for file in (PUBLIC/'vendor/st-p.rmcdn1.net/e99f4fe4/dist').rglob('*'):
    if file.suffix not in ['.js','.css']:continue
    for path in re.findall(r'["\x27](/vendor/st-p\.rmcdn1\.net/e99f4fe4/dist/[^"\x27]+)["\x27]',file.read_text()):
        if not (PUBLIC/path.lstrip('/')).exists():urls.add(path.replace('/vendor/st-p.rmcdn1.net','https://st-p.rmcdn1.net'))
urls.update(['https://st-p.rmcdn.net/fonts/fontslist_short.json','https://st-p.rmcdn.net/fonts/fontslist.json'])
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    results=list(pool.map(fetch_vendor,sorted(urls)))
mapping=json.loads((ROOT/'source/asset-map.json').read_text())
for url,data in results:mapping[url]=vendor_path(url)
(ROOT/'source/asset-map.json').write_text(json.dumps(mapping,indent=2))
print(f'Captured {len(results)} viewer support assets.')
