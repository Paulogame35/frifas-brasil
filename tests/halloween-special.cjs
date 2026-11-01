const assert=require('node:assert/strict');
const fs=require('node:fs');
const home=fs.readFileSync('index.html','utf8');
const special=fs.readFileSync('halloween.html','utf8');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
assert.match(home,/href="halloween\.html"/,'homepage exposes the special');
assert.doesNotMatch(home,/halloween-day|halloweenScareButton|halloween-2026\.js/,'homepage does not auto-activate the old Halloween overlay');
assert.match(special,/<body class="halloween-page">/,'special page has isolated theme');
assert.match(special,/<details><summary>/,'special has native keyboard accessible interactions');
assert.doesNotMatch(special,/<a\b[^>]*href="https?:\/\/(?!frifasbrasil\.com\.br)/i,'special contains no clickable third party links');
for(const file of ['style.css','halloween-special.css','assets/img/frifas-logo.svg','assets/img/o-oculto-frifas-original.svg','script.js','app-sidebar.js','evento-o-oculto-free-fire-outubro-2026.html','noticias.html','index.html'])assert.ok(fs.existsSync(file),file+' exists');
assert.match(sitemap,/<loc>https:\/\/frifasbrasil\.com\.br\/halloween\.html<\/loc>/,'special is discoverable in sitemap');
const article=fs.readFileSync('evento-o-oculto-free-fire-outubro-2026.html','utf8');
assert.match(article,/dateModified":"2026-10-31/,'updated article metadata is current');
assert.match(article,/Fantoches sinistros/,'reviewed story includes confirmed event details');
console.log('Halloween special route, local links and updated story checks passed.');

