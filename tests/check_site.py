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
 for anchor in soup.find_all('a',href=True):
  url=urlsplit(anchor['href'])
  if url.scheme in ('http','https') and url.netloc.lower() not in ('frifasbrasil.com.br','www.frifasbrasil.com.br','paulogame35.github.io'):
   errors.append(f'{path.name}: external clickable link {anchor["href"]}')
 for img in soup.find_all('img',src=True):
  url=urlsplit(img['src'])
  if url.scheme in ('http','https') and url.netloc.lower() not in ('frifasbrasil.com.br','www.frifasbrasil.com.br'):
   errors.append(f'{path.name}: external image source {img["src"]}')

# Ensure the retired Codiguins section is removed; the old route only redirects and is noindex.
if (ROOT/'codiguins-free-fire-outubro-2026.html').exists():
 errors.append('codiguins-free-fire-outubro-2026.html: retired article still exists')
legacy=ROOT/'codigos.html'
if not legacy.exists():errors.append('codigos.html: compatibility redirect missing')
else:
 legacy_soup=BeautifulSoup(legacy.read_text(),'html.parser')
 robots=legacy_soup.find('meta',attrs={'name':'robots'})
 if not robots or 'noindex' not in robots.get('content','').lower():errors.append('codigos.html: compatibility route must be noindex')
 if legacy_soup.find('a',href=lambda value:value and value in ('codigos.html','codiguins-free-fire-outubro-2026.html')):errors.append('codigos.html: self/retired link remains')
 if 'http-equiv="refresh"' not in legacy.read_text().lower():errors.append('codigos.html: compatibility redirect missing refresh')
for retired in ('codigos.html','codiguins-free-fire-outubro-2026.html'):
 if retired in (ROOT/'sitemap.xml').read_text():errors.append(f'sitemap.xml: retired URL remains: {retired}')
for page in ('index.html','eventos.html','noticias.html','free-fire-controle-parental-13-outubro-2026.html'):
 soup=BeautifulSoup((ROOT/page).read_text(),'html.parser')
 for nav in soup.find_all('nav'):nav.decompose()
 if soup.find('a',href=lambda value:value and value in ('codigos.html','codiguins-free-fire-outubro-2026.html')):
  errors.append(f'{page}: retired Codiguins content link remains')
if "'codigos.html','Codiguins'" in (ROOT/'script.js').read_text():
 errors.append('script.js: Codiguins remains in global navigation')

# Validate that every public page uses the same cache-busted navigation runtime.
global_script=(ROOT/'script.js').read_text()
sidebar_css=(ROOT/'app-sidebar.css').read_text()
sidebar_compat=(ROOT/'app-sidebar.js').read_text()
if global_script.count('function initUnifiedSidebar')!=1:
 errors.append('script.js: expected exactly one unified sidebar initializer')
if 'cloneNode(true)' in global_script or 'function initAppSidebar' in global_script:
 errors.append('script.js: legacy duplicate menu implementation remains')
if 'window.__FRIFAS_SIDEBAR_READY__=true' not in global_script:
 errors.append('script.js: unified sidebar readiness flag missing')
if "new URL('/sitemap.xml',location.origin)" not in global_script:
 errors.append('script.js: search sitemap path must be domain-root relative')
if "new URL('/index.html',location.origin)" not in global_script:
 errors.append('script.js: related-news fetch must use the domain root')
if "searchSequence++" not in global_script:
 errors.append('script.js: cleared search input must cancel pending results')
if "createElement('aside')" in sidebar_compat or "className = 'appSidebar'" in sidebar_compat:
 errors.append('app-sidebar.js: duplicate sidebar builder must be retired')
if 'body.appSidebarOpen .appSidebar' not in sidebar_css or '@media(max-width:760px)' not in sidebar_css:
 errors.append('app-sidebar.css: responsive open-state rules missing')
for page in ROOT.rglob('*.html'):
 soup=BeautifulSoup(page.read_text(),'html.parser')
 if soup.select_one('.siteHeader'):
  sources=[tag.get('src','') for tag in soup.find_all('script') if tag.get('src')]
  shared=[src for src in sources if 'script.js' in urlsplit(src).path]
  if not shared:
   errors.append(f'{page.relative_to(ROOT)}: shared header has no global script.js')
  elif not any('20261031-nav-unified1' in src for src in shared):
   errors.append(f'{page.relative_to(ROOT)}: stale global navigation cache key')

print(f'{links} local references; {scripts} inline scripts checked')
for error in errors:print(error)
raise SystemExit(bool(errors))
