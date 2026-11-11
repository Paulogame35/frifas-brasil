const assert = require('node:assert/strict');
const fs = require('node:fs');

const home = fs.readFileSync('index.html', 'utf8');
const events = fs.readFileSync('eventos.html', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const ffws = fs.readFileSync('ffws-global-finals-2026-bangkok-novembro.html', 'utf8');

assert.equal(home.includes('halloween-teaser'), false, 'home must not show the expired seasonal teaser');
assert.match(home, /<div class="contentGrid">\s*<a class="newsCard reveal currentLead"[^>]*href="ffws-global-finals-2026-bangkok-novembro\.html"/, 'current FFWS coverage must lead the homepage source order');
for (const path of [
  'halloween.html',
  'evento-o-oculto-free-fire-outubro-2026.html',
  'o-oculto-se-revela-agora-missoes-recompensas-outubro-2026.html'
]) {
  assert.ok(fs.existsSync(path), 'historical route must be preserved: ' + path);
}
assert.match(events, /state==='ended'\?'PERÍODO ENCERRADO'/, 'ended events must receive an accurate visual badge');
assert.match(events, /badge\.dataset\.original/, 'original event labels must be preserved for non-ended states');
assert.match(ffws, /FFWS Global Finals 2026: competição em andamento em Bangkok/, 'FFWS headline must reflect that the competition has started');
assert.match(ffws, /dateModified":"2026-11-11T00:00:00-03:00"/, 'FFWS structured modified date must match the editorial update');
assert.match(sitemap, /ffws-global-finals-2026-bangkok-novembro\.html<\/loc>\s*<lastmod>2026-11-11<\/lastmod>/, 'FFWS sitemap lastmod must match the editorial update');
console.log('Editorial regression checks passed: current lead, seasonal teaser, historical routes, event labels, FFWS metadata and sitemap.');
