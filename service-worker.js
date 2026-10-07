const CACHE='frifas-shell-v1';
const CORE=['./','./index.html','./noticias.html','./campeonatos.html','./guias.html','./comunidade.html','./style.css','./script.js','./assets/img/frifas-logo.svg','./favicon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
 const url=new URL(req.url);
 if(/login\.html|cadastro\.html|perfil\.html|comunidade\.html/.test(url.pathname))return;
 event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res}).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
});