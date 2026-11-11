const assert = require('node:assert/strict');
const fs = require('node:fs');

const home = fs.readFileSync('index.html', 'utf8');
const events = fs.readFileSync('eventos.html', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const news = fs.readFileSync('noticias.html', 'utf8');
const championships = fs.readFileSync('campeonatos.html', 'utf8');
const ffws = fs.readFileSync('ffws-global-finals-2026-bangkok-novembro.html', 'utf8');
const seasonalArchive = fs.readFileSync('halloween.html', 'utf8');

assert.doesNotMatch(home, /halloween-teaser|O Oculto|evento-o-oculto|halloween\.html/i, 'homepage must not promote expired seasonal content');
assert.doesNotMatch(news, /href="(?:evento-o-oculto-free-fire-outubro-2026|o-oculto-se-revela-agora-missoes-recompensas-outubro-2026)\.html"/i, 'current news listing must not promote expired O Oculto stories');
assert.doesNotMatch(events, /href="(?:evento-o-oculto-free-fire-outubro-2026|o-oculto-se-revela-agora-missoes-recompensas-outubro-2026)\.html"/i, 'event agenda must not list expired O Oculto cards');
assert.match(home, /<div class="contentGrid">\s*<a class="newsCard reveal currentLead"[^>]*href="ffws-global-finals-2026-bangkok-novembro\.html"/, 'current FFWS coverage must lead the homepage source order');

assert.ok(fs.existsSync('halloween.html'), 'legacy seasonal URL must remain available for compatibility');
assert.match(seasonalArchive, /name="robots" content="noindex,follow"/, 'retired seasonal landing page must not remain indexed');
assert.match(seasonalArchive, /Arquivo de eventos anteriores/, 'retired page must become a neutral archive notice');
assert.doesNotMatch(seasonalArchive, /halloween-special\.css|halloween-page|halloween-hero|O Oculto chegou/i, 'retired page must not load seasonal presentation');
assert.doesNotMatch(sitemap, /https:\/\/frifasbrasil\.com\.br\/halloween\.html/, 'retired seasonal landing page must be removed from sitemap');

for (const path of [
  'evento-o-oculto-free-fire-outubro-2026.html',
  'o-oculto-se-revela-agora-missoes-recompensas-outubro-2026.html'
]) {
  assert.ok(fs.existsSync(path), 'historical article must be preserved: ' + path);
  assert.ok(sitemap.includes('https://frifasbrasil.com.br/' + path), 'historical article must remain in sitemap: ' + path);
}
assert.match(events, /state==='ended'\?'PERÍODO ENCERRADO'/, 'ended events must receive an accurate visual badge');
assert.match(events, /badge\.dataset\.original/, 'original event labels must be preserved for non-ended states');
assert.match(ffws, /FFWS Global Finals 2026: competição em andamento em Bangkok/, 'FFWS headline must reflect that the competition has started');
assert.match(news, /FFWS Global Finals 2026 está em andamento em Bangkok/, 'news listing must use current FFWS status');
assert.match(championships, /O Mundial começou em 6 de novembro/, 'championship page must use past tense for the start date');
assert.match(ffws, /dateModified":"2026-11-11T00:00:00-03:00"/, 'FFWS structured modified date must match the editorial update');
assert.match(sitemap, /ffws-global-finals-2026-bangkok-novembro\.html<\/loc>\s*<lastmod>2026-11-11<\/lastmod>/, 'FFWS sitemap lastmod must match the editorial update');
console.log('Editorial regression checks passed: seasonal cleanup, archive preservation, current lead, event labels, FFWS metadata and sitemap.');
