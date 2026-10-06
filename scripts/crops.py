"""Capture the exact crop transformations used by the published image renderer."""
import concurrent.futures, hashlib, json, math, re
from pathlib import Path
from mirror import ROOT, PUBLIC, get, fetch_vendor, vendor_path

def crop_url(widget):
    picture=widget.get('picture',{})
    if not picture.get('lambdaUrl') or not widget.get('cropW') or not widget.get('cropH'):return None
    params={'w':max(1,math.ceil(widget['w']*3)),'e':'webp',
            'cX':math.floor(widget.get('cropX',0)+.5),'cY':math.floor(widget.get('cropY',0)+.5),
            'cW':math.floor(widget['cropW']+.5),'cH':math.floor(widget['cropH']+.5)}
    if params['w'] >= widget.get('originalW',99999): params.pop('w')
    if picture.get('type')=='png':params['nll']=True
    return picture['lambdaUrl']+'?'+'&'.join(f'{k}={str(v).lower()}' for k,v in params.items())

def exported(widget,mapping):
    widget=json.loads(json.dumps(widget))
    def change(node):
        url=crop_url(node)
        if url in mapping:
            p=node['picture'];p['url']=mapping[url];p['unscaledUrl']=mapping[url];p.pop('lambdaUrl',None)
    # Viewport overrides inherit the base crop when they omit a setting.
    for k,v in widget.items():
        if k.startswith('viewport_') and isinstance(v,dict):
            merged={**widget,**v}
            if isinstance(merged.get('picture'),dict):
                v['picture']=dict(merged['picture']);change({**merged,'picture':v['picture']})
    change(widget)
    return widget

if __name__=='__main__':
    server=json.loads((ROOT/'source/server.json').read_text())
    urls=set()
    for page in server['mags']['mag']['pages']:
        for widget in json.loads((ROOT/'source'/f"{page['pagePath']}.json").read_text()):
            url=crop_url(widget)
            if url:urls.add(url)
            for k,v in widget.items():
                if k.startswith('viewport_') and isinstance(v,dict):
                    url=crop_url({**widget,**v})
                    if url:urls.add(url)
    mapping={}
    def capture(url):
        path='/media/'+hashlib.sha256(url.encode()).hexdigest()[:20]+'.webp'
        target=PUBLIC/path.lstrip('/');target.parent.mkdir(exist_ok=True)
        if not target.exists():
            try: target.write_bytes(get(url))
            except Exception as exc: raise RuntimeError(url) from exc
        return url,path
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        for url,path in pool.map(capture,sorted(urls)):mapping[url]=path
    (ROOT/'source/crop-map.json').write_text(json.dumps(mapping,indent=2))
    css=(ROOT/'source/bodoni-browser.css').read_text()
    assets=json.loads((ROOT/'source/asset-map.json').read_text())
    for url in set(re.findall(r'url\(([^)]+)',css)):
        fetch_vendor(url);assets[url]=vendor_path(url);css=css.replace(url,assets[url])
    google=next(v for k,v in assets.items() if k.startswith('https://fonts.googleapis.com/'))
    (PUBLIC/google.lstrip('/')).write_text(css)
    (ROOT/'source/asset-map.json').write_text(json.dumps(assets,indent=2))
    print(f'Captured {len(mapping)} image crops and browser variable fonts.')
