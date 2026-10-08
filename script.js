const menuBtn=document.querySelector('#menuBtn');const nav=document.querySelector('#nav');
const authNavs=[...document.querySelectorAll('#nav,.mobileNav')];
authNavs.forEach(menu=>{if(!menu.querySelector('.navAuth')){const login=document.createElement('a');login.href='login.html';login.textContent='Entrar';login.className='navAuth';login.setAttribute('aria-label','Entrar na conta');menu.appendChild(login)}});
if(menuBtn&&nav&&menuBtn.tagName==="BUTTON"){menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open))});}
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();document.querySelectorAll('#nav a,.mobileNav a').forEach(a=>{if((a.getAttribute('href')||'').split('?')[0].toLowerCase()===current){a.classList.add('active');a.setAttribute('aria-current','page')}});

const firebaseConfig={apiKey:"AIzaSyA-Ti0SOVjh0s8_8rh6SIrP1A9WHYSo6Rs",authDomain:"freefas-d0a9e.firebaseapp.com",projectId:"freefas-d0a9e",storageBucket:"freefas-d0a9e.firebasestorage.app",messagingSenderId:"251003895899",appId:"1:251003895899:web:083e03360c682217853f7e"};
const initGlobalAuth=async()=>{try{
  const [appMod,authMod]=await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
  ]);
  const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
  const auth=authMod.getAuth(app);
  try{await authMod.setPersistence(auth,authMod.browserLocalPersistence)}catch(e){console.error("Persistência:",e)}
  const paintUser=user=>{
    const links=[...document.querySelectorAll('.navAuth')];if(!links.length)return;
    links.forEach(link=>{link.onclick=null;
    if(user){
      link.textContent='Perfil';
      link.href='perfil.html';
      const who=user.displayName||user.email||'sua conta';
      link.title='Perfil de '+who;
      link.setAttribute('aria-label','Abrir meu perfil');
    }else{
      link.textContent='Entrar';
      link.href='login.html';
      link.title='';
      link.setAttribute('aria-label','Entrar na conta');
    }});
  };
  // Não tratar a sessão como desconectada antes da restauração assíncrona do Firebase.
  await auth.authStateReady();
  paintUser(auth.currentUser);
  authMod.onAuthStateChanged(auth,paintUser,error=>console.error('Estado da sessão:',error));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintUser(auth.currentUser)});
  window.addEventListener('pageshow',()=>paintUser(auth.currentUser));
}catch(e){console.error("Autenticação global:",e)}};
if(document.querySelector('.navAuth')){initGlobalAuth();}

// Menu mobile: fecha ao tocar fora, pressionar Escape ou escolher uma página.
const mobileMenu=document.querySelector('.mobileMenu');
if(mobileMenu){
  const mobileSummary=mobileMenu.querySelector('summary');
  const syncMobileMenu=()=>{if(mobileSummary)mobileSummary.setAttribute('aria-expanded',String(mobileMenu.open))};
  syncMobileMenu();mobileMenu.addEventListener('toggle',syncMobileMenu);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')mobileMenu.open=false});
  document.addEventListener('pointerdown',event=>{if(mobileMenu.open&&!mobileMenu.contains(event.target))mobileMenu.open=false});
  mobileMenu.querySelectorAll('.mobileNav a').forEach(link=>link.addEventListener('click',()=>{mobileMenu.open=false}));
}


async function shareArticle(){
  const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};
  try{
    if(navigator.share){await navigator.share(data);return;}
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(location.href);alert('Link da matéria copiado!');return;}
    const temp=document.createElement('textarea');temp.value=location.href;temp.setAttribute('readonly','');temp.style.position='fixed';temp.style.opacity='0';document.body.appendChild(temp);temp.select();document.execCommand('copy');temp.remove();alert('Link da matéria copiado!');
  }catch(e){
    if(e&&e.name==='AbortError')return;
    try{window.prompt('Copie o link da matéria:',location.href)}catch(_){}
  }
}
document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

// Campeonatos: status e contagem regressiva calculados automaticamente pelo horário real.
(()=>{const cards=[...document.querySelectorAll('.champCard[data-start]')];if(!cards.length)return;
const fmt=n=>String(n).padStart(2,'0');
function tick(){const now=Date.now();cards.forEach(card=>{const s=new Date(card.dataset.start).getTime(),e=new Date(card.dataset.end).getTime(),pill=card.querySelector('[data-auto-status]');if(!pill)return;pill.classList.remove('live','done');if(now<s){pill.textContent='AGENDADO'}else if(now<=e){pill.textContent='AO VIVO';pill.classList.add('live')}else{pill.textContent='ENCERRADO';pill.classList.add('done')}});
const upcoming=cards.find(c=>new Date(c.dataset.end).getTime()>now);const main=document.querySelector('#champMainStatus');if(main){if(!upcoming)main.textContent='TEMPORADA CONCLUÍDA';else{const s=new Date(upcoming.dataset.start).getTime(),e=new Date(upcoming.dataset.end).getTime();main.textContent=now>=s&&now<=e?'AO VIVO AGORA':'PRÓXIMO JOGO PROGRAMADO'}}
const box=document.querySelector('.champCountdown');if(box){const s=new Date(box.dataset.start).getTime(),e=new Date(box.dataset.end).getTime(),out=box.querySelector('[data-countdown]'),state=box.querySelector('[data-state]');if(now<s){let d=s-now;const days=Math.floor(d/86400000);d%=86400000;const h=Math.floor(d/3600000);d%=3600000;const m=Math.floor(d/60000);out.textContent=(days?days+'d ':'')+fmt(h)+'h '+fmt(m)+'m';state.textContent='até o início'}else if(now<=e){out.textContent='AO VIVO';state.textContent='programação em andamento'}else{out.textContent='ENCERRADO';state.textContent='aguardando próximo evento confirmado'}}}}
tick();setInterval(tick,30000)})();

// Navegação editorial simplificada: Notícias é a única central de publicações.
(()=>{
  const nav=document.querySelector('#nav');
  if(nav){nav.querySelectorAll('a[href="atualizacoes.html"],a[href="eventos.html"]').forEach(a=>a.remove());}
  
})();


// Resiliência de imagens: evita ícone quebrado sem substituir conteúdo editorial por imagem incorreta.
document.querySelectorAll('img').forEach(img=>{
  img.addEventListener('error',()=>{
    console.warn('Falha de imagem:',img.currentSrc||img.src);
    const visual=img.closest('.newsVisual,.newsThumb,.imageVisual,.imageThumb,.featuredImage,.articleMedia');
    if(visual){visual.classList.add('imageLoadError');}
    img.hidden=true;
  },{once:true});
});


// FRIFAS BRASIL — identidade editorial centralizada
(function frifasEditorialBrand(){
  const article=document.querySelector('article.article');
  if(!article)return;
  const head=article.querySelector('.articleHead');
  if(head&&!head.querySelector('.frifasEditorialSeal')){
    const seal=document.createElement('div');
    seal.className='frifasEditorialSeal';
    seal.setAttribute('aria-label','Conteúdo editorial FRIFAS BRASIL');
    seal.innerHTML='<span>FRIFAS BRASIL</span><small>CONTEÚDO EDITORIAL</small>';
    const meta=head.querySelector('.meta');
    if(meta)meta.insertAdjacentElement('afterend',seal);else head.appendChild(seal);
  }
  const media=article.querySelector('.articleMedia');
  if(media&&!media.querySelector('.frifasMediaBrand')){
    const brand=document.createElement('div');
    brand.className='frifasMediaBrand';
    brand.textContent='FRIFAS BRASIL';
    brand.setAttribute('aria-hidden','true');
    media.appendChild(brand);
  }
  document.querySelectorAll('.sourceBox').forEach(box=>box.remove());
})();

// frifasCleanup2026: remove blocos editoriais legados de fonte da interface
(function frifasCleanup2026(){
  document.querySelectorAll('.sourceBox').forEach(el=>el.remove());
})();


/* Tema sazonal FRIFAS BRASIL: ativo apenas de 7 a 31 de outubro de 2026. */
(function frifasHalloween2026(){
  const now=new Date();
  const active=now.getFullYear()===2026&&now.getMonth()===9&&now.getDate()>=7;
  if(!active)return;
  document.documentElement.dataset.halloween='2026';
  const sheet=document.createElement('link');
  sheet.rel='stylesheet';
  sheet.href='halloween-2026.css?v=1';
  document.head.appendChild(sheet);
  const header=document.querySelector('.siteHeader');
  if(header&&!document.querySelector('.halloweenBanner')){
    const banner=document.createElement('div');
    banner.className='halloweenBanner';
    banner.setAttribute('aria-label','Especial Halloween do FRIFAS BRASIL');
    banner.innerHTML='<span aria-hidden="true">🎃 🦇 👻</span> Especial Halloween 2026 · FRIFAS BRASIL';
    header.insertAdjacentElement('afterend',banner);
  }
})();
