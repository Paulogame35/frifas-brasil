"""Check local navigation, media and executable JavaScript without contacting accounts."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
import subprocess,tempfile
ROOT=Path(__file__).resolve().parents[1]
errors=[];scripts=0;links=0
for path in ROOT.rglob('*.html'):
 soup=BeautifulSoup(path.read_text(),'html.parser')
 for node in soup.select('[href],[src]'):
  value=node.get('href') or node.get('src');url=urlsplit(value)
  if url.scheme or url.netloc or not url.path:continue
  raw_path=unquote(url.path);target=(ROOT/raw_path.lstrip('/')) if raw_path.startswith('/') else (path.parent/raw_path);links+=1
  if not target.exists():errors.append(f'{path.name}: missing {value}')
 for node in soup.select('script:not([src])'):
  if node.get('type') not in [None,'module','text/javascript']:continue
  with tempfile.NamedTemporaryFile(suffix='.mjs') as f:
   f.write(node.get_text().encode());f.flush();result=subprocess.run(['node','--check',f.name],capture_output=True,text=True)
   if result.returncode:errors.append(path.name+': '+result.stderr)
  scripts+=1
 related=soup.select('.relatedGrid a')
 if any(a['href']==path.name for a in related):errors.append(path.name+': related self-link')
for path in ROOT.rglob('*.js'):
 result=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
 if result.returncode:errors.append(path.name+': '+result.stderr)

# Validate the published sitemap against real, indexable local HTML pages.
sitemap_path=ROOT/'sitemap.xml'
if not sitemap_path.exists():
 errors.append('sitemap.xml: missing')
else:
 sitemap=BeautifulSoup(sitemap_path.read_text(),'html.parser')
 locations=[tag.get_text(strip=True) for tag in sitemap.find_all('loc')]
 if len(locations)!=len(set(locations)):errors.append('sitemap.xml: duplicate URLs')
 for entry in sitemap.find_all('url'):
  loc=entry.find('loc')
  if not loc:errors.append('sitemap.xml: URL entry without loc');continue
  url=urlsplit(loc.get_text(strip=True))
  raw_path=unquote(url.path)
  target=ROOT/(raw_path.lstrip('/') or 'index.html')
  if not target.is_file():errors.append(f'sitemap.xml: missing target {raw_path}')
  elif target.suffix.lower()=='.html':
   page=BeautifulSoup(target.read_text(),'html.parser')
   if page.find('meta',attrs={'name':'robots','content':lambda value:value and 'noindex' in value.lower()}):
    errors.append(f'sitemap.xml: noindex page listed: {raw_path}')
   if not page.title or not page.title.get_text(strip=True):errors.append(f'{raw_path}: missing title')
   if not page.find('meta',attrs={'name':'description'}):errors.append(f'{raw_path}: missing meta description')
   canonical=page.find('link',attrs={'rel':lambda value:value and 'canonical' in value})
   if not canonical or canonical.get('href')!=loc.get_text(strip=True):
    errors.append(f'{raw_path}: canonical does not match sitemap URL')
# Ensure editorial images are hosted by the site, not hotlinked from other domains.
for path in ROOT.rglob('*.html'):
 soup=BeautifulSoup(path.read_text(),'html.parser')
 for img in soup.find_all('img',src=True):
  url=urlsplit(img['src'])
  if url.scheme in ('http','https') and url.netloc.lower() not in ('frifasbrasil.com.br','www.frifasbrasil.com.br'):
   errors.append(f'{path.name}: external image source {img["src"]}')
print(f'{links} local references; {scripts} inline scripts checked')
for error in errors:print(error)
raise SystemExit(bool(errors))
