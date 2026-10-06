#!/usr/bin/env python3
"""Prepare the static portfolio for a GitHub Pages repository subdirectory."""
import argparse
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-path', default='/JiyaWebsite')
args = parser.parse_args()
base = '/' + args.base_path.strip('/') if args.base_path.strip('/') else ''
if base and not re.fullmatch(r'/[A-Za-z0-9_./-]+', base):
    raise SystemExit('Invalid Pages base path')
public, output = ROOT / 'public', ROOT / '_site'
revision = subprocess.check_output(['git','rev-parse','--short','HEAD'], cwd=ROOT, text=True).strip()
if output.exists():
    shutil.rmtree(output)
shutil.copytree(public, output)
# Pages needs a .css suffix to serve font stylesheets with the correct MIME type.
renamed_styles = {}
for style in list(output.rglob('*')):
    if style.is_file() and style.name.startswith('css') and not style.suffix:
        old='/' + style.relative_to(output).as_posix()
        style.rename(style.with_name(style.name+'.css'))
        renamed_styles[old]=old+'.css'
paths = ['vendor', 'media', 'custom.css', 'experience.js']
paths += [p['pagePath'] for p in json.loads((ROOT/'source/server.json').read_text())['mags']['mag']['pages']]
# Only root-relative resource/route strings are rewritten; external links stay intact.
pattern = re.compile(r'(["\'(]|&quot;)/(' + '|'.join(re.escape(p) for p in paths) + r')(?=[/"\')?]|&quot;)')
for file in output.rglob('*'):
    if not file.is_file() or file.suffix not in ('.html', '.js', '.css') and not file.name.startswith('css'):
        continue
    text = file.read_text()
    if base:
        text = pattern.sub(lambda m: m[1] + base + '/' + m[2], text)
    # Version module URLs so browsers receive updates immediately after deployment.
    text=re.sub(r'([\"\'(])('+re.escape(base)+r'/vendor/[^\"\'<>\s)]+\.js)(?=[\"\')])', lambda m:m[1]+m[2]+'?v='+revision, text)
    for old,new in renamed_styles.items():
        text=text.replace(old,new)
    if file.suffix == '.html':
        text=text.replace('<head>', '<head><base href="'+base+'/"><script src="'+base+'/pages-navigation.js" defer></script>', 1)
        match = re.search(r'(id="__RM_PROPS__" data-content=")([^"]*)(")', text)
        if match:
            props = json.loads(html.unescape(match[2]))
            props['exportBasePath'] = base
            text = text[:match.start(2)] + html.escape(json.dumps(props,separators=(',',':')), quote=True) + text[match.end(2):]
        match = re.search(r'window.ServerData = (.*?);\s*\n', text, re.S)
        if match:
            server = json.loads(match[1])
            server['config']['root'] = base
            value = json.dumps(server,separators=(',',':')).replace('<', r'\u003c')
            text = text[:match.start(1)] + value + text[match.end(1):]
    file.write_text(text)
(output / '.nojekyll').touch()
# The captured viewer generates root-relative navigation after rendering. Keep
# those links inside the repository path without changing the local preview.
(output / 'pages-navigation.js').write_text('''(() => {
  const base = '''+json.dumps(base)+''';
  const routes = new Set('''+json.dumps(paths[4:])+''');
  function destination(link) {
    const raw=link.getAttribute('href');
    if(!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
    const part=raw.split('/')[1];
    return routes.has(part) ? base+raw : null;
  }
  function fixLinks() {document.querySelectorAll('a[href]').forEach(link=>{const url=destination(link);if(url)link.setAttribute('href',url)});}
  new MutationObserver(fixLinks).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target==='_blank' || link.classList.contains('back-to-top')) return;
    const url=destination(link) || link.getAttribute('href');
    if(base && url.startsWith(base+'/') && routes.has(url.slice(base.length+1).split('/')[0])) {event.preventDefault();event.stopImmediatePropagation();location.assign(url);}
  },true);
  fixLinks();
})();''')
# Verify every prefixed local resource and module import in the deployable artifact.
references = re.compile(re.escape(base) + r'/(?:vendor|media)/[^\s"\'<>;)]+')
missing = set()
for file in output.rglob('*'):
    if file.is_file() and (file.suffix in ('.html','.js','.css') or file.name.startswith('css')):
        for ref in references.findall(html.unescape(file.read_text())):
            path = ref[len(base):].split('?',1)[0]
            if not (output/path.lstrip('/')).exists() and not any((output/path.lstrip('/')).parent.glob((output/path.lstrip('/')).name+' *')):
                missing.add(path)
if missing:
    raise SystemExit('Missing deployed assets: ' + ', '.join(sorted(missing)))
print(f'GitHub Pages artifact ready at {output}, base path {base or "/"}.')
