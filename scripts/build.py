#!/usr/bin/env python3
"""Build the captured portfolio without changing its authored layout or animations."""
import copy, html, json, re
from pathlib import Path
from mirror import ROOT, PUBLIC, DIST
from crops import exported
SOURCE = ROOT / 'source'
assets = json.loads((SOURCE/'asset-map.json').read_text())
server = json.loads((SOURCE/'server.json').read_text())
project = server['mags']['mag']

def localize(value):
    if isinstance(value, list): return [localize(v) for v in value]
    if isinstance(value, dict):
        return {k:localize(v) for k,v in value.items() if k!='lambdaUrl'}
    if isinstance(value, str):
        if value in assets: return assets[value]
        if value.startswith('/api/fonts/'):
            return assets.get('https://jiyaudenia.com'+value,value)
        if value.endswith(('playlist.m3u8','poster.jpg')) and not value.startswith(('http','/')):
            return assets['https://v-p.rmcdn1.net/'+value]
        return value.replace('https://jiyaudenia.com/', '/').replace('http://jiyaudenia.com/','/')
    return value

for page in project['pages']:
    page['wids'] = [exported(w,json.loads((SOURCE/'crop-map.json').read_text())) for w in json.loads((SOURCE/(page['pagePath']+'.json')).read_text())]
server = localize(server)
project = server['mags']['mag']
project['opts']['favicon']=next(v for k,v in assets.items() if 'Favicon' in k)
server['config']['fontslist_short']=assets['https://st-p.rmcdn.net/fonts/fontslist_short.json']
server['config']['fontslist']=assets['https://st-p.rmcdn.net/fonts/fontslist.json']
server['config']['readymag_viewer_host']=''
server['config']['readymag_video_files_origin']=''
server['config']['readymag_videos_cdn']=''
props={
    'publicPath': '/vendor/st-p.rmcdn1.net/e99f4fe4/dist',
    'project':project, 'isDomainViewer':True, 'domainForUser':False,
    'homepageRewrite':False, 'isDownloadedSource':True, 'exportBasePath':''
}
original=(SOURCE/'viewer.html').read_text()
original=re.sub(r'<script type="application/json".*?</script>',
    lambda _: '<script type="application/json" id="__RM_PROPS__" data-content="'+html.escape(json.dumps(props,separators=(',',':')),quote=True)+'"></script>',original,flags=re.S)
original=re.sub(r'window.ServerData = .*?;\s*\n',
    lambda _: 'window.ServerData = '+json.dumps(server,separators=(',',':')).replace('<', r'\u003c')+';\n',original, count=1,flags=re.S)
original=original.replace('viewerConfig.isDownloadedSource = false','viewerConfig.isDownloadedSource = true')
if (SOURCE/'custom.css').exists():
    (PUBLIC/'custom.css').write_text((SOURCE/'custom.css').read_text())
    original=original.replace('</head>','<link rel="stylesheet" href="/custom.css"/></head>')
if (SOURCE/'experience.js').exists():
    cards=json.loads((SOURCE/'experience.json').read_text())
    work={w['_id']:w for w in json.loads((SOURCE/'work.json').read_text())}
    for card in cards:
        blocks=work[card['hotspot']]['wids'][0]['blocks']
        card.update(heading=blocks[0]['text'],body=blocks[1]['text'])
    script=(SOURCE/'experience.js').read_text().replace('__EXPERIENCE_CARDS__',json.dumps(cards))
    (PUBLIC/'experience.js').write_text(script)
    original=original.replace('</head>','<script src="/experience.js" defer></script></head>')
original=original.replace(DIST,'/vendor/st-p.rmcdn1.net/e99f4fe4/dist')
for url,path in sorted(assets.items(),key=lambda x:len(x[0]),reverse=True):
    original=original.replace(url,path)
original=original.replace('href="/api/fonts/webtype/css"','href="'+assets['https://jiyaudenia.com/api/fonts/webtype/css']+'"')
original=original.replace('href="/api/fonts/typetoday/css"','href="'+assets['https://jiyaudenia.com/api/fonts/typetoday/css']+'"')
# Relative exported video paths already contain the local media origin.
# All versioned module imports and font resources are served from this project.
for file in (PUBLIC/'vendor').rglob('*'):
    if not file.is_file(): continue
    if file.suffix in ['.js','.css'] or file.name.startswith('css'):
        text=file.read_text()
        text=text.replace(DIST,'/vendor/st-p.rmcdn1.net/e99f4fe4/dist')
        for url,path in assets.items():text=text.replace(url,path)
        if file.name=='c-L7ITUCMW.js':
            google=next(v for k,v in assets.items() if k.startswith('https://fonts.googleapis.com/'))
            text=text.replace('u(F+L+T)', 'u('+json.dumps(google)+')')
        # Exported document links must retain root-relative local asset URLs.
        if file.name=='c-KD2U7HTU.js':
            text=text.replace('return i.test(t)?t:`http://${t}`', 'return i.test(t)||t.startsWith("/")?t:`http://${t}`')
        if file.name=='c-47WAEKMH.js':
            text=text.replace('RM.common.isDownloadedSource&&!RM.common.homepageRewrite?this.submitToIframe', 'false?this.submitToIframe')
        file.write_text(text)
PUBLIC.mkdir(exist_ok=True)
(PUBLIC/'index.html').write_text(original)
for page in project['pages']:
    folder=PUBLIC/page['pagePath'];folder.mkdir(exist_ok=True)
    (folder/'index.html').write_text(original)
(PUBLIC/'404.html').write_text(original)
print(f"Built {len(project['pages'])} pages with {sum(len(p['wids']) for p in project['pages'])} widgets.")
