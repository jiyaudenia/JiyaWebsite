#!/usr/bin/env python3
"""Capture the public portfolio and its versioned Readymag viewer assets."""
import concurrent.futures, hashlib, html, json, re, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
ORIGIN = 'https://jiyaudenia.com'
DIST = 'https://st-p.rmcdn1.net/e99f4fe4/dist'
HEADERS = {'User-Agent': 'Mozilla/5.0'}
def get(url):
    from urllib.parse import quote
    req = urllib.request.Request(quote(url, safe=':/?=&%,+'), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r: return r.read()
def vendor_path(url):
    from urllib.parse import urlsplit
    p = urlsplit(url)
    suffix = ('-' + hashlib.sha256(p.query.encode()).hexdigest()[:10]) if p.query else ''
    return '/vendor/' + p.netloc + p.path + suffix

def fetch_vendor(url):
    target = PUBLIC / vendor_path(url).lstrip('/')
    if target.exists(): return url, target.read_bytes()
    try: data = get(url)
    except Exception as e: raise RuntimeError(f"Could not download {url}: {e}") from e
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return url, data

def runtime():
    source = (ROOT/'source/viewer.html').read_text()
    pending = set(re.findall(re.escape(DIST) + r'/[a-zA-Z0-9_./-]+\.(?:js|css)', source))
    pending.add(DIST + '/viewer.js')
    seen = set()
    while pending:
        batch = pending - seen
        if not batch: break
        seen |= batch
        pending = set()
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
            for url, data in pool.map(fetch_vendor, sorted(batch)):
                if url.endswith(('.js', '.css')):
                    pending.update(re.findall(re.escape(DIST) + r'/[a-zA-Z0-9_./-]+\.(?:js|css)', data.decode()))
        print(f'Runtime files: {len(seen)}', flush=True)
    return seen
if __name__ == '__main__': runtime()

def capture_pages():
    source = ROOT / 'source'
    source.mkdir(exist_ok=True)
    home = get(ORIGIN + '/').decode()
    (source / 'viewer.html').write_text(home)
    server, _ = json.JSONDecoder().raw_decode(home.split('window.ServerData = ')[1])
    def capture(page):
        slug = page['pagePath']
        data = get(f"{ORIGIN}/api/viewer/project/5795839/widgets?pageId={page['_id']}")
        (source / (slug + '.json')).write_bytes(data)
        snippet = get(page['htmlUrl'])
        (source / (slug + '.html')).write_bytes(snippet)
        return slug, json.loads(data)
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for slug, widgets in pool.map(capture, server['mags']['mag']['pages']):
            print(slug, len(widgets), 'widgets', flush=True)
    (source / 'server.json').write_text(json.dumps(server, indent=2))

def assets():
    from urllib.parse import urljoin
    server = json.loads((ROOT/'source/server.json').read_text())
    widgets = [json.loads(p.read_text()) for p in (ROOT/'source').glob('*.json') if p.stem in [x['pagePath'] for x in server['mags']['mag']['pages']]]
    urls=set()
    def walk(v):
        if isinstance(v,dict):
            for k,x in v.items():
                if k in ['lambdaUrl', 'screenshot']: continue
                walk(x)
        elif isinstance(v,list):
            for x in v:walk(x)
        elif isinstance(v,str):
            for u in re.findall(r'https://c-p\.rmcdn\.net/[^"\s<>]+',v):urls.add(u)
            if v.endswith(('playlist.m3u8','poster.jpg')) and not v.startswith('http'): urls.add('https://v-p.rmcdn1.net/'+v)
    walk(widgets)
    walk(server['mags']['mag']['pages'])
    walk(server['mags']['mag']['opts'])
    urls.discard(server['mags']['mag']['opts']['favicon'])
    urls.add(server['mags']['mag']['opts']['favicon'].replace('.png','_144.png'))
    urls.add(ORIGIN+'/api/fonts/68bc975954434bf0d40da6b3/css')
    urls.update(ORIGIN+u for u in ['/api/fonts/webtype/css','/api/fonts/typetoday/css'])
    urls.update(server['fonts']['google'])
    seen=set()
    while urls-seen:
        batch=urls-seen;seen |=batch
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
            for url,data in pool.map(fetch_vendor,sorted(batch)):
                if url.endswith('.m3u8'):
                    for line in data.decode().splitlines():
                        if line and not line.startswith('#'):urls.add(urljoin(url,line))
                        for u in re.findall(r'URI="([^"]+)"',line):urls.add(urljoin(url,u))
                if '/css' in url:
                    for u in re.findall(r'url\([\x27"]?([^\)\x27"]+)',data.decode()):urls.add(urljoin(url,u))
        print(f'Media/font files: {len(seen)}',flush=True)
    (ROOT/'source/asset-map.json').write_text(json.dumps({u:vendor_path(u) for u in sorted(seen)},indent=2))
