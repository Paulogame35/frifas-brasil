const assert = require('node:assert/strict');
const fs = require('node:fs');

const mobile = fs.readFileSync('mobile-ux.css', 'utf8');
const sidebar = fs.readFileSync('app-sidebar.css', 'utf8');
const runtime = fs.readFileSync('script.js', 'utf8');
const auth = fs.readFileSync('auth.css', 'utf8');
const profile = fs.readFileSync('perfil.css', 'utf8');

assert.match(runtime, /mobile-ux\.css/, 'shared navigation runtime must load the responsive stylesheet');
assert.match(runtime, /app-sidebar\.css/, 'shared navigation runtime must load the sidebar stylesheet');
assert.match(mobile, /@media\s*\(max-width:\s*760px\)/, 'mobile layout breakpoint must exist');
assert.match(mobile, /env\(safe-area-inset-bottom/, 'mobile layout must respect device safe areas');
assert.match(mobile, /font-size:\s*16px/, 'form controls must avoid mobile browser zoom on focus');
assert.match(mobile, /grid-template-columns:\s*minmax\(0,\s*1fr\)/, 'mobile content grids must collapse without horizontal overflow');
assert.match(mobile, /\.chatMessages/, 'chat layout must be covered by responsive styles');
assert.match(mobile, /\.authShell/, 'account entry layouts must have mobile sizing rules');
assert.match(mobile, /\.profileShell/, 'profile layouts must have mobile sizing rules');
assert.match(sidebar, /body\.appSidebarOpen \.appSidebar/, 'sidebar open state must be styled');
assert.match(sidebar, /@media\s*\(max-width:\s*760px\)/, 'sidebar must have a dedicated mobile layout');
assert.match(sidebar, /aria-current="page"/, 'current navigation item must be visually identifiable');
assert.match(auth, /@media\s*\(max-width:\s*520px\)/, 'login and registration pages must retain their small-screen layout');
assert.match(profile, /@media\s*\(max-width:\s*700px\)/, 'profile page must retain its small-screen layout');

for (const page of ['index.html','noticias.html','eventos.html','campeonatos.html','guias.html','comunidade.html']) {
  const html = fs.readFileSync(page, 'utf8');
  assert.match(html, /class=["'][^"']*siteHeader/, page + ' must retain the shared site header');
  assert.match(html, /script\.js/, page + ' must load the shared navigation runtime');
}
console.log('Mobile layout checks passed: shared styles, responsive breakpoints, touch-safe forms, safe areas, chat, account pages and navigation.');
