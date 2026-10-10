"""Check local navigation, media and executable JavaScript without contacting accounts."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
import subprocess,tempfile
ROOT=Path(__file__).resolve().parents[1]
errors=[];scripts=0;links=0
for path in ROOT.glob('*.html'):
 soup=BeautifulSoup(path.read_text(),'html.parser')
 for node in soup.select('[href],[src]'):
  value=node.get('href') or node.get('src');url=urlsplit(value)
  if url.scheme or url.netloc or not url.path:continue
  target=ROOT/unquote(url.path).lstrip('/');links+=1
  if not target.exists():errors.append(f'{path.name}: missing {value}')
 for node in soup.select('script:not([src])'):
  if node.get('type') not in [None,'module','text/javascript']:continue
  with tempfile.NamedTemporaryFile(suffix='.mjs') as f:
   f.write(node.get_text().encode());f.flush();result=subprocess.run(['node','--check',f.name],capture_output=True,text=True)
   if result.returncode:errors.append(path.name+': '+result.stderr)
  scripts+=1
 related=soup.select('.relatedGrid a')
 if any(a['href']==path.name for a in related):errors.append(path.name+': related self-link')
for path in ROOT.glob('*.js'):
 result=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
 if result.returncode:errors.append(path.name+': '+result.stderr)
print(f'{links} local references; {scripts} inline scripts checked')
for error in errors:print(error)
raise SystemExit(bool(errors))
