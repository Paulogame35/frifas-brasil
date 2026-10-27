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
locations=[]
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
# Public editorial pages should load the AdSense library exactly once; private, legal, and utility pages are excluded.
ad_excluded_pages={'sobre.html','politica-editorial.html','privacidade.html','termos.html','contato.html','premium.html','comunidade.html','codigos.html'}
adsense_src='pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
for page_url in locations:
 page_path=urlsplit(page_url).path.lstrip('/') or 'index.html'
 if page_path in ad_excluded_pages or page_path.startswith('noticias/') or page_path.startswith('guias/'):
  continue
 if page_path.endswith('.html'):
  page_file=ROOT/page_path
  if page_file.is_file():
   count=page_file.read_text().count(adsense_src)
   if count!=1:errors.append(f'{page_path}: expected one AdSense library reference, found {count}')

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

# Regression checks: Eventos remains visible on mobile; retired Codiguins stays out of menus.
style_text=(ROOT/'style.css').read_text()
if '.siteHeader .mobileNav a[href="eventos.html"] { display: none !important; }' in style_text:
 errors.append('style.css: Eventos is hidden from the mobile navigation')
if '.siteHeader nav a[href="codigos.html"] { display: none !important; }' in style_text:
 errors.append('style.css: obsolete Codiguins hiding rule remains')

if "['eventos.html','Eventos','']" not in (ROOT/'script.js').read_text():
 errors.append('script.js: Eventos is missing from the global navigation')

# Legacy Search Console paths must remain noindex compatibility pages with valid canonical targets.
legacy_routes={
 'noticias/evento-o-oculto.html':'https://frifasbrasil.com.br/evento-o-oculto-free-fire-outubro-2026.html',
 'noticias/passe-booyah.html':'https://frifasbrasil.com.br/passe-booyah-poder-escorpiao-novembro-2026.html',
 'noticias/atualizacao-ob55.html':'https://frifasbrasil.com.br/atualizacao-ob55.html',
 'guias/controle-parental.html':'https://frifasbrasil.com.br/free-fire-controle-parental-13-outubro-2026.html',
}
for legacy_path,destination in legacy_routes.items():
 legacy_file=ROOT/legacy_path
 if not legacy_file.is_file():
  errors.append(f'{legacy_path}: compatibility page missing')
  continue
 legacy_soup=BeautifulSoup(legacy_file.read_text(),'html.parser')
 robots=legacy_soup.find('meta',attrs={'name':'robots'})
 canonical=legacy_soup.find('link',attrs={'rel':lambda value:value and 'canonical' in value})
 if not robots or 'noindex' not in robots.get('content','').lower():
  errors.append(f'{legacy_path}: compatibility page must be noindex')
 if not canonical or canonical.get('href')!=destination:
  errors.append(f'{legacy_path}: canonical destination mismatch')
 if 'http-equiv="refresh"' not in legacy_file.read_text().lower():
  errors.append(f'{legacy_path}: meta refresh missing')
 if not legacy_soup.find('a',href=destination):
  errors.append(f'{legacy_path}: fallback link missing')
 target=ROOT/destination.replace('https://frifasbrasil.com.br/','')
 if not target.is_file():
  errors.append(f'{legacy_path}: canonical target is missing')

print(f'{links} local references; {scripts} inline scripts checked')
for error in errors:print(error)
raise SystemExit(bool(errors))
