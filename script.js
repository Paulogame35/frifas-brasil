const menuBtn=document.querySelector('#menuBtn');const nav=document.querySelector('#nav');
if(nav&&!nav.querySelector('a[href="login.html"]')){const login=document.createElement('a');login.href='login.html';login.textContent='Entrar';login.className='navAuth';nav.appendChild(login)}
if(menuBtn&&nav){menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&e.target!==menuBtn){nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}})}
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();document.querySelectorAll('#nav a').forEach(a=>{if((a.getAttribute('href')||'').toLowerCase()===current)a.classList.add('active')});

const firebaseConfig={apiKey:"AIzaSyA-Ti0SOVjh0s8_8rh6SIrP1A9WHYSo6Rs",authDomain:"freefas-d0a9e.firebaseapp.com",projectId:"freefas-d0a9e",storageBucket:"freefas-d0a9e.firebasestorage.app",messagingSenderId:"251003895899",appId:"1:251003895899:web:083e03360c682217853f7e"};
(async()=>{try{
  const [appMod,authMod]=await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
  ]);
  const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
  const auth=authMod.getAuth(app);
  try{await authMod.setPersistence(auth,authMod.browserLocalPersistence)}catch(e){}
  authMod.onAuthStateChanged(auth,user=>{
    const link=nav?.querySelector('.navAuth');if(!link)return;
    link.onclick=null;
    if(user){
      link.textContent='Sair';
      link.href='#';
      const who=user.displayName||user.email||'sua conta';
      link.title='Logado como '+who;
      link.setAttribute('aria-label','Sair da conta');
      link.onclick=async e=>{e.preventDefault();try{await authMod.signOut(auth)}finally{location.reload()}};
    }else{
      link.textContent='Entrar';
      link.href='login.html';
      link.title='';
      link.setAttribute('aria-label','Entrar na conta');
    }
  });
}catch(e){}})();

async function shareArticle(){const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}catch(e){alert(location.href)}}}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const items=document.querySelectorAll('.reveal');if(reduced||!('IntersectionObserver'in window)){items.forEach(el=>el.classList.add('visible'))}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -4% 0px'});items.forEach(el=>observer.observe(el))}