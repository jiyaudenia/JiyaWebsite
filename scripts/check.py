#!/usr/bin/env python3
"""Check original content fidelity, module imports, media references, and HLS segments."""
import html, json, re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public';SOURCE=ROOT/'source'
class Props(HTMLParser):
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if attrs.get('id')=='__RM_PROPS__':self.value=json.loads(attrs['data-content'])
parser=Props();parser.feed((PUBLIC/'index.html').read_text())
project=parser.value['project'];widgets=0;animations=0
assert project['opts']['scalewidth'] == 1024, 'All desktop pages must use the same maximum artboard width'
assert (PUBLIC/'responsive.js').is_file() and (PUBLIC/'responsive.css').is_file()
assert '__RESPONSIVE_PAGES__' not in (PUBLIC/'responsive.js').read_text()
assert '__PORTFOLIO_LINK_STYLES__' not in (PUBLIC/'responsive.js').read_text()
for page in project['pages']:
    assert not page['viewport_phone_portrait']['enabled'], 'Use flowing phone layouts instead of clipped captured coordinates'
    assert not page['viewport_tablet_portrait']['enabled']
    assert (PUBLIC/page['pagePath']/'index.html').exists(),page['pagePath']
    original=json.loads((SOURCE/(page['pagePath']+'.json')).read_text())
    assert len(page['wids'])==len(original)
    for actual,expected in zip(page['wids'],original):
        for key in ['_id','type','x','y','w','h','z','blocks','styles','animation','theme_data']:
            assert actual.get(key)==expected.get(key),(page['pagePath'],key,actual['_id'])
        widgets+=1;animations+=len(actual.get('animation',[]))
missing=set()
def inspect(value):
    if isinstance(value,dict):
        for v in value.values():inspect(v)
    elif isinstance(value,list):
        for v in value:inspect(v)
    elif isinstance(value,str):
        paths = [value] if value.startswith(('/vendor/', '/media/')) else re.findall(r'["\x27](/vendor/[^"\x27]+)["\x27]', value)
        for path in paths:
            file=PUBLIC/unquote(urlsplit(path).path).lstrip('/')
            if not file.exists():missing.add(str(file.relative_to(PUBLIC)))
inspect(project)
for file in (PUBLIC/'vendor').rglob('*'):
    if not file.is_file():continue
    if file.suffix in ['.js','.css'] or file.name.startswith('css'):inspect(file.read_text())
    if file.suffix=='.m3u8':
        for line in file.read_text().splitlines():
            if line and not line.startswith('#'):assert (file.parent/line).is_file(),str(file.parent/line)
assert not missing,sorted(missing)
assert (PUBLIC/'index.html').read_text().count('<script') == (PUBLIC/'index.html').read_text().count('</script>')
print(f'PASS: {len(project["pages"])} pages, {widgets} content widgets, {animations} animation definitions; all referenced local assets and HLS segments exist.')
