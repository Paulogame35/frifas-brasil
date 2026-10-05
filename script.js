const menuBtn=document.querySelector('#menuBtn');const nav=document.querySelector('#nav');
if(nav&&!nav.querySelector('a[href="login.html"]')){const login=document.createElement('a');login.href='login.html';login.textContent='Entrar';login.className='navAuth';nav.appendChild(login)}
if(menuBtn&&nav&&menuBtn.tagName==="BUTTON"){menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open))});}
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();document.querySelectorAll('#nav a').forEach(a=>{if((a.getAttribute('href')||'').toLowerCase()===current)a.classList.add('active')});

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
  paintUser(auth.currentUser);
  authMod.onAuthStateChanged(auth,paintUser);
}catch(e){console.error("Autenticação global:",e)}};
if(document.querySelector('.navAuth')){initGlobalAuth();}

async function shareArticle(){const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}catch(e){alert(location.href)}}}
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
