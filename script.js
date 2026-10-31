/* FRIFAS BRASIL — navegação única, sem menus duplicados. */
(function loadMobileExperienceStyles(){
  if(document.querySelector('link[data-mobile-ux]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/mobile-ux.css?v=20261031-nav-unified1';
  link.dataset.mobileUx='true';
  document.head.appendChild(link);
})();

const standardNavItems=[
  ['/index.html','Início',''],
  ['/noticias.html','Notícias',''],
  ['/eventos.html','Eventos',''],
  ['/campeonatos.html','Campeonatos',''],
  ['/guias.html','Guias',''],
  ['/comunidade.html','Comunidade',''],
  ['/premium.html','Premium',''],
  ['/contato.html','Ajuda',''],
  ['/login.html','Entrar','navAuth']
];

function normalizeMenu(menu){
  menu.setAttribute('aria-label','Navegação principal');
  const existing=[...menu.querySelectorAll('a')];
  const links=standardNavItems.map(([href,label,className])=>{
    const existingLink=existing.find(link=>{
      try{return new URL(link.getAttribute('href')||'',location.href).pathname===href}catch(_){return false}
    });
    const link=existingLink||document.createElement('a');
    link.setAttribute('href',href);
    link.textContent=label;
    link.classList.remove('active');
    link.removeAttribute('aria-current');
    if(className){
      link.classList.add(className);
      link.setAttribute('aria-label','Entrar na conta');
    }else{
      link.classList.remove('navAuth');
      if(href==='/index.html')link.setAttribute('aria-label','Página inicial FRIFAS BRASIL');
      else link.removeAttribute('aria-label');
    }
    return link;
  });
  menu.replaceChildren(...links);
}

(function initUnifiedSidebar(){
  if(window.__FRIFAS_SIDEBAR_READY__)return;
  const header=document.querySelector('.siteHeader');
  const headerInner=header?.querySelector('.headerInner');
  if(!header||!headerInner||!document.body)return;

  const candidates=[...header.querySelectorAll('nav.mobileNav,nav.desktopNav,nav#nav')];
  const nav=candidates[0];
  if(!nav)return;

  normalizeMenu(nav);
  candidates.filter(candidate=>candidate!==nav).forEach(candidate=>candidate.remove());

  const sidebar=document.createElement('aside');
  sidebar.className='appSidebar';
  sidebar.id='appSidebar';
  sidebar.setAttribute('aria-label','Menu principal do FRIFAS BRASIL');
  sidebar.setAttribute('aria-hidden','true');
  sidebar.tabIndex=-1;

  const sidebarHeader=document.createElement('div');
  sidebarHeader.className='appSidebarHeader';
  const mark=document.createElement('span');
  mark.className='appSidebarMark';
  mark.setAttribute('aria-hidden','true');
  mark.textContent='F';
  const brand=document.createElement('span');
  brand.className='appSidebarBrand';
  brand.append(document.createTextNode('FRIFAS BRASIL'));
  const subtitle=document.createElement('small');
  subtitle.textContent='PORTAL DA COMUNIDADE';
  brand.appendChild(subtitle);
  sidebarHeader.append(mark,brand);
  sidebar.appendChild(sidebarHeader);

  nav.classList.remove('mobileNav');
  nav.classList.add('desktopNav');
  nav.id='appSidebarNav';
  nav.setAttribute('aria-label','Navegação principal');
  sidebar.appendChild(nav);

  const footer=document.createElement('div');
  footer.className='appSidebarFooter';
  const footerStrong=document.createElement('strong');
  footerStrong.textContent='FRIFAS BRASIL';
  footer.append(footerStrong,document.createTextNode('Notícias, guias e comunidade'));
  sidebar.appendChild(footer);

  const oldWrapper=header.querySelector('.mobileMenu');
  if(oldWrapper)oldWrapper.remove();
  header.querySelectorAll('#menuBtn,.menuToggle').forEach(element=>element.remove());
  header.querySelectorAll('label[for="menuBtn"]').forEach(element=>element.remove());

  if(!document.querySelector('link[data-app-sidebar-css]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='/app-sidebar.css?v=20261031-nav-unified1';
    css.dataset.appSidebarCss='true';
    document.head.appendChild(css);
  }

  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.id='appSidebarToggle';
  toggle.className='appSidebarToggle';
  toggle.setAttribute('aria-controls','appSidebar');
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Abrir menu principal');
  toggle.textContent='☰';

  const backdrop=document.createElement('button');
  backdrop.type='button';
  backdrop.className='appSidebarBackdrop';
  backdrop.setAttribute('aria-label','Fechar menu principal');
  backdrop.setAttribute('aria-hidden','true');
  backdrop.disabled=true;

  headerInner.appendChild(toggle);
  document.body.append(sidebar,backdrop);

  const mobileQuery=window.matchMedia('(max-width: 760px)');
  const isMobile=()=>mobileQuery.matches;
  let isOpen=false;

  const closeSearch=()=>{
    const panel=document.querySelector('.siteSearchPanel');
    const searchTrigger=document.querySelector('.siteSearchTrigger');
    if(panel)panel.hidden=true;
    if(searchTrigger)searchTrigger.setAttribute('aria-expanded','false');
  };

  const setOpen=(open,options={})=>{
    isOpen=Boolean(open);
    if(isOpen)closeSearch();
    document.body.classList.toggle('appSidebarOpen',isOpen);
    document.body.classList.toggle('appSidebarCollapsed',!isOpen&&!isMobile());
    toggle.setAttribute('aria-expanded',String(isOpen));
    toggle.setAttribute('aria-label',isOpen?'Fechar menu principal':'Abrir menu principal');
    toggle.textContent=isOpen?'×':'☰';
    sidebar.setAttribute('aria-hidden',String(isMobile()&&!isOpen));
    sidebar.inert=isMobile()&&!isOpen;
    backdrop.setAttribute('aria-hidden',String(!isOpen));
    backdrop.disabled=!isOpen;
    if(isOpen&&options.focusFirst&&isMobile()){
      const first=sidebar.querySelector('a[href]');
      if(first)first.focus();
    }else if(!isOpen&&options.restoreFocus){
      toggle.focus();
    }
  };

  const getFocusable=()=>[...sidebar.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element=>!element.hidden);
  toggle.addEventListener('click',()=>setOpen(!isOpen,{focusFirst:true}));
  backdrop.addEventListener('click',()=>setOpen(false,{restoreFocus:true}));
  nav.addEventListener('click',event=>{
    if(event.target.closest('a')&&isMobile())setOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(!isOpen)return;
    if(event.key==='Escape'){
      event.preventDefault();
      setOpen(false,{restoreFocus:true});
      return;
    }
    if(event.key==='Tab'&&isMobile()){
      const focusable=getFocusable();
      if(!focusable.length){event.preventDefault();sidebar.focus();return;}
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  mobileQuery.addEventListener?.('change',()=>setOpen(false));
  window.addEventListener('pageshow',()=>setOpen(false));
  setOpen(false);
  const currentPath=location.pathname.replace(/\/+$/,'')||'/';
  nav.querySelectorAll('a[href]').forEach(link=>{
    const path=new URL(link.href,location.href).pathname.replace(/\/+$/,'')||'/';
    if(path===currentPath||(currentPath==='/'&&path==='/index.html')){
      link.classList.add('active');
      link.setAttribute('aria-current','page');
    }
  });
  window.__FRIFAS_SIDEBAR_READY__=true;
})();

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
      link.href='/perfil.html';
      const who=user.displayName||user.email||'sua conta';
      link.title='Perfil de '+who;
      link.setAttribute('aria-label','Abrir meu perfil');
    }else{
      link.textContent='Entrar';
      link.href='/login.html';
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


async function shareArticle(){
  const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};
  try{
    if(navigator.share){await navigator.share(data);return;}
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(location.href);alert('Link da matéria copiado!');return;}
    const temp=document.createElement('textarea');temp.value=location.href;temp.setAttribute('readonly','');temp.style.position='fixed';temp.style.opacity='0';document.body.appendChild(temp);temp.select();const copied=document.execCommand('copy');temp.remove();if(copied){alert('Link da matéria copiado!');return;}window.prompt('Copie o link da matéria:',location.href);
  }catch(e){
    if(e&&e.name==='AbortError')return;
    try{window.prompt('Copie o link da matéria:',location.href)}catch(_){}
  }
}
document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

// Campeonatos: status e contagem regressiva calculados automaticamente pelo horário real.
(()=>{const cards=[...document.querySelectorAll('.champCard[data-start]')];if(!cards.length)return;
const fmt=n=>String(n).padStart(2,'0');
function tick(){const now=Date.now();cards.forEach(card=>{const s=new Date(card.dataset.start).getTime(),e=new Date(card.dataset.end).getTime(),pill=card.querySelector('[data-auto-status]');if(!pill||!Number.isFinite(s)||!Number.isFinite(e))return;pill.classList.remove('live','done');if(now<s){pill.textContent='AGENDADO'}else if(now<=e){pill.textContent='PERÍODO PREVISTO';pill.classList.add('live')}else{pill.textContent='ENCERRADO';pill.classList.add('done')}});
const upcoming=cards.find(c=>Number.isFinite(new Date(c.dataset.end).getTime())&&new Date(c.dataset.end).getTime()>now);const main=document.querySelector('#champMainStatus');if(main){if(!upcoming)main.textContent='TEMPORADA CONCLUÍDA';else{const s=new Date(upcoming.dataset.start).getTime(),e=new Date(upcoming.dataset.end).getTime();main.textContent=now>=s&&now<=e?'DENTRO DO PERÍODO PREVISTO':'PRÓXIMO JOGO PROGRAMADO'}}
const box=document.querySelector('.champCountdown');if(box){const s=new Date(box.dataset.start).getTime(),e=new Date(box.dataset.end).getTime(),out=box.querySelector('[data-countdown]'),state=box.querySelector('[data-state]');if(!out||!state||!Number.isFinite(s)||!Number.isFinite(e))return;if(now<s){let d=s-now;const days=Math.floor(d/86400000);d%=86400000;const h=Math.floor(d/3600000);d%=3600000;const m=Math.floor(d/60000);out.textContent=(days?days+'d ':'')+fmt(h)+'h '+fmt(m)+'m';state.textContent='até o início'}else if(now<=e){out.textContent='PERÍODO PREVISTO';state.textContent='consulte os horários na fonte oficial'}else{out.textContent='ENCERRADO';state.textContent='aguardando próximo evento confirmado'}}}
tick();setInterval(tick,30000)})();


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
})();


// Os filtros do catálogo são inicializados na própria página de notícias, junto com os recursos de salvar matérias.



/* FRIFAS BRASIL: preserva referências editoriais e normaliza links externos.
   Fontes são parte importante da transparência jornalística: não remover links do conteúdo. */
(function preserveEditorialSources(){
  document.querySelectorAll('a.sourceLink[href]').forEach(link=>{
    if(!/^https?:/i.test(link.href)) return;
    link.target='_blank';
    const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel',[...rel].join(' '));
    if(!link.getAttribute('aria-label')&&!link.textContent.trim()){
      link.setAttribute('aria-label','Abrir fonte externa');
    }
  });
})();


/* Etapa 3 — busca global, matérias relacionadas e compartilhamento consistente. */
(function frifasDiscoveryTools(){
  const header=document.querySelector('.headerInner');
  if(header&&!document.querySelector('.siteSearchTrigger')){
    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='siteSearchTrigger';
    trigger.textContent='⌕ Buscar';
    trigger.setAttribute('aria-label','Buscar no FRIFAS BRASIL');
    trigger.setAttribute('aria-expanded','false');
    const panel=document.createElement('section');
    panel.className='siteSearchPanel';
    panel.hidden=true;
    panel.id='siteSearchPanel';
    trigger.setAttribute('aria-controls','siteSearchPanel');
    panel.setAttribute('aria-label','Busca no site');
    panel.innerHTML='<form class="siteSearchForm" role="search"><label for="siteSearchInput">O que você procura?</label><div class="siteSearchControls"><input id="siteSearchInput" name="q" type="search" placeholder="Notícias, eventos, guias..." autocomplete="off" maxlength="120"><button type="submit">Buscar</button></div></form><p class="siteSearchHint">Pesquise notícias, atualizações, campeonatos e guias.</p><div class="siteSearchResults" aria-live="polite"></div>';
    trigger.addEventListener('click',()=>{
      const opening=panel.hidden;
      panel.hidden=!opening;
      trigger.setAttribute('aria-expanded',String(opening));
      if(opening)panel.querySelector('input').focus();
    });
    panel.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();
      const query=panel.querySelector('input').value.trim();
      if(query)runSearch(query);
    });
    const closeOnEscape=event=>{
      if(event.key==='Escape'&&!panel.hidden){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}
    };
    document.addEventListener('keydown',closeOnEscape);
    header.appendChild(trigger);
    document.body.appendChild(panel);

    let searchCache=null;
    async function collectSearchItems(){
      if(searchCache)return searchCache;
      const items=new Map();
      const add=(href,title,description='',base=location.href)=>{
        if(!href||!title)return;
        try{
          const url=new URL(href,base);
          if(url.origin!==location.origin||!/^https?:$/.test(url.protocol))return;
          const path=url.pathname.split('/').pop()||'index.html';
          if(!path.endsWith('.html')||['login.html','perfil.html','privacidade.html','termos.html'].includes(path))return;
          const cleanTitle=title.replace(/\s+/g,' ').trim();
          if(cleanTitle.length<3)return;
          const key=url.pathname;
          if(!items.has(key))items.set(key,{url:url.href,title:cleanTitle,description:description.replace(/\s+/g,' ').trim()});
        }catch(_){}
      };
      document.querySelectorAll('.newsCard[href]').forEach(card=>{
        const heading=card.querySelector('h2,h3,h4');
        if(heading)add(card.getAttribute('href'),heading.textContent,card.querySelector('p')?.textContent||'');
      });
      const sitemapTask=(async()=>{
        try{
          const response=await fetch(new URL('/sitemap.xml',location.origin).href,{cache:'force-cache'});
          if(!response.ok)return;
          const xml=new DOMParser().parseFromString(await response.text(),'application/xml');
          [...xml.querySelectorAll('loc')].forEach(loc=>{
            const href=loc.textContent.trim();
            const path=new URL(href,location.href).pathname.split('/').pop()||'index.html';
            if(items.has(new URL(href,location.href).pathname))return;
            if(['index.html','noticias.html','guias.html','campeonatos.html','comunidade.html','contato.html','sobre.html','politica-editorial.html'].includes(path)){
              const known={'index.html':'Início — FRIFAS BRASIL','noticias.html':'Notícias — FRIFAS BRASIL','guias.html':'Guias de Free Fire — FRIFAS BRASIL','campeonatos.html':'Campeonatos de Free Fire — FRIFAS BRASIL','comunidade.html':'Comunidade — FRIFAS BRASIL','contato.html':'Contato e ajuda — FRIFAS BRASIL','sobre.html':'Sobre o FRIFAS BRASIL','politica-editorial.html':'Política editorial — FRIFAS BRASIL'};
              add(href,known[path]||path.replace(/[-_]/g,' ').replace(/\\.html$/i,''));
            }else{
              const readable=path.replace(/[-_]/g,' ').replace(/\\.html$/i,'').replace(/\\b\\w/g,c=>c.toUpperCase());
              add(href,readable+' — FRIFAS BRASIL');
            }
          });
        }catch(_){}
      })();
      const pageTasks=['index.html','noticias.html','guias.html','campeonatos.html'].map(async path=>{
        try{
          const response=await fetch(new URL('/'+path,location.origin).href,{cache:'force-cache'});
          if(!response.ok)return;
          const doc=new DOMParser().parseFromString(await response.text(),'text/html');
          doc.querySelectorAll('.newsCard[href],main a[href]').forEach(link=>{
            const title=link.querySelector('h2,h3,h4')?.textContent||link.getAttribute('aria-label')||link.textContent;
            if(title&&title.trim().length>4)add(link.getAttribute('href'),title,link.querySelector('p')?.textContent||'',new URL('/'+path,location.origin).href);
          });
        }catch(_){}
      });
      await Promise.all([sitemapTask,...pageTasks]);
      searchCache=[...items.values()];
      return searchCache;
    }
    let searchSequence=0;
    async function runSearch(query){
      const sequence=++searchSequence;
      const results=panel.querySelector('.siteSearchResults');
      results.innerHTML='<p class="siteSearchStatus">Procurando matérias…</p>';
      const normalized=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const words=normalized.split(/\s+/).filter(Boolean);
      const items=await collectSearchItems();
      if(sequence!==searchSequence)return;
      const matches=items.map(item=>{
        const haystack=(item.title+' '+item.description+' '+item.url).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
        const score=words.reduce((sum,word)=>sum+(item.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(word)?3:0)+(haystack.includes(word)?1:0),0);
        return {...item,score};
      }).filter(item=>item.score>=words.length).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'pt-BR')).slice(0,8);
      results.replaceChildren();
      if(!matches.length){const empty=document.createElement('p');empty.className='siteSearchStatus';empty.textContent='Nenhum resultado encontrado. Tente outras palavras.';results.appendChild(empty);return;}
      matches.forEach(item=>{
        const link=document.createElement('a');link.className='siteSearchResult';link.href=item.url;
        const title=document.createElement('strong');title.textContent=item.title;
        link.appendChild(title);
        if(item.description){const desc=document.createElement('span');desc.textContent=item.description.slice(0,150);link.appendChild(desc);}
        results.appendChild(link);
      });
    }
    panel.querySelector('input').addEventListener('input',event=>{
      const value=event.target.value.trim();
      if(value.length>=2)runSearch(value);
      else panel.querySelector('.siteSearchResults').replaceChildren();
    });
  }

  const article=document.querySelector('article.article');
  if(article){
    const body=article.querySelector('.articleBody');
    if(body&&!body.querySelector('.share')){
      const share=document.createElement('div');share.className='share reveal';
      const label=document.createElement('b');label.textContent='Compartilhe esta matéria';
      const button=document.createElement('button');button.type='button';button.textContent='Compartilhar matéria';
      button.addEventListener('click',()=>{if(typeof shareArticle==='function')shareArticle();});
      share.append(label,button);body.appendChild(share);
    }
    if(!article.querySelector('.relatedNews')){
      const section=document.createElement('section');section.className='relatedNews';section.setAttribute('aria-labelledby','frifasRelatedTitle');
      const heading=document.createElement('h2');heading.id='frifasRelatedTitle';heading.textContent='Leia também';
      const grid=document.createElement('div');grid.className='relatedGrid';section.append(heading,grid);
      article.appendChild(section);
      const currentPath=location.pathname.split('/').pop();
      const articleTitle=article.querySelector('h1')?.textContent||document.title;
      const keywords=articleTitle.toLowerCase().split(/[^a-z0-9áéíóúãõç]+/i).filter(word=>word.length>3);
      fetch(new URL('index.html',location.href).href,{cache:'force-cache'}).then(response=>response.ok?response.text():'').then(html=>{
        if(!html)return;
        const doc=new DOMParser().parseFromString(html,'text/html');
        const cards=[...doc.querySelectorAll('.newsCard[href]')].map(card=>({
          href:card.getAttribute('href'),
          title:card.querySelector('h2,h3,h4')?.textContent?.trim()||'',
          description:card.querySelector('p')?.textContent?.trim()||''
        })).filter(item=>item.href&&item.title&&!item.href.endsWith(currentPath));
        cards.sort((a,b)=>{
          const score=item=>keywords.reduce((sum,word)=>sum+((item.title+' '+item.description).toLowerCase().includes(word)?1:0),0);
          return score(b)-score(a);
        });
        const selected=cards.slice(0,3);
        if(!selected.length){selected.push({href:'noticias.html',title:'Ver todas as notícias'});}
        selected.forEach(item=>{const link=document.createElement('a');link.href=item.href;const span=document.createElement('span');span.textContent=item.title;link.appendChild(span);grid.appendChild(link);});
      }).catch(()=>{});
    }
    const canonical=document.querySelector('link[rel="canonical"]')?.href||location.href;
    if(!document.querySelector('script[data-frifas-breadcrumb]')){
      const crumb=document.createElement('script');crumb.type='application/ld+json';crumb.dataset.frifasBreadcrumb='true';
      crumb.textContent=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
        {'@type':'ListItem','position':1,'name':'Início','item':'https://frifasbrasil.com.br/'},
        {'@type':'ListItem','position':2,'name':'Notícias','item':'https://frifasbrasil.com.br/noticias.html'},
        {'@type':'ListItem','position':3,'name':article.querySelector('h1')?.textContent||document.title,'item':canonical}
      ]});
      document.head.appendChild(crumb);
    }
  }
})();


/* Etapa 4 — exportar datas dos campeonatos para calendários pessoais (.ics). */
(function championshipCalendarActions(){
  const cards=document.querySelectorAll('.champPage .champCard[data-start][data-end]');
  if(!cards.length)return;
  const formatDate=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\\.\\d{3}Z$/,'Z');
  const escapeICS=value=>String(value||'').replace(/\\\\/g,'\\\\\\\\').replace(/\r?\n/g,'\\\\n').replace(/,/g,'\\\\,').replace(/;/g,'\\\\;');
  cards.forEach(card=>{
    if(card.querySelector('.calendarExportButton'))return;
    const start=new Date(card.dataset.start),end=new Date(card.dataset.end);
    if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime()))return;
    const title=card.querySelector('h3')?.textContent?.trim()||'Campeonato de Free Fire';
    const description=card.querySelector('p')?.textContent?.trim()||'Consulte a cobertura no FRIFAS BRASIL.';
    const button=document.createElement('button');
    button.type='button';button.className='calendarExportButton';button.textContent='Adicionar ao calendário';
    button.addEventListener('click',()=>{
      const uid='frifas-'+encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g,'-'))+'@frifasbrasil.com.br';
      const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FRIFAS BRASIL//Calendario de campeonatos//PT-BR','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+formatDate(new Date()),'DTSTART:'+formatDate(start),'DTEND:'+formatDate(end),'SUMMARY:'+escapeICS(title),'DESCRIPTION:'+escapeICS(description+' Fonte editorial: FRIFAS BRASIL. Confirme horários na organização oficial.'),'URL:'+location.href,'END:VEVENT','END:VCALENDAR'];
      const blob=new Blob([lines.join('\\r\\n')+'\\r\\n'],{type:'text/calendar;charset=utf-8'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.ics';
      document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    card.appendChild(button);
  });
})();


// Acessibilidade básica e proteção de links externos sem alterar o conteúdo editorial.
(function improveAccessibilityAndLinkSafety(){
  if (document.body && !document.querySelector('.skip-link')) {
    const main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'conteudo-principal';
      const skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = '#' + main.id;
      skip.textContent = 'Pular para o conteúdo';
      document.body.insertBefore(skip, document.body.firstChild);
    }
  }
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  });
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    // Preserva imagens iniciais importantes; adia apenas imagens posteriores abaixo da dobra.
    if (index > 1 && !img.hasAttribute('loading') && !img.closest('header, .siteHeader, .brand')) img.loading = 'lazy';
  });
})();

// Integração opcional com Plausible. Nenhum rastreador novo é carregado por padrão.
// Para ativar, definir window.FRIFAS_ANALYTICS = { domain: 'frifasbrasil.com.br' }
// antes deste bloco e revisar consentimento/política de privacidade aplicáveis.
(function optionalPrivacyFriendlyAnalytics(){
  const config = window.FRIFAS_ANALYTICS;
  if (!config || typeof config.domain !== 'string' || !/^[a-z0-9.-]+$/i.test(config.domain)) return;
  if (document.querySelector('script[data-frifas-analytics]')) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://plausible.io/js/script.js';
  script.dataset.domain = config.domain;
  script.dataset.frifasAnalytics = 'true';
  document.head.appendChild(script);
})();


// FRIFAS BRASIL — padrão editorial próprio e apresentação consistente.
(function standardizeArticlePresentation(){
  const main = document.querySelector('main, article, .articleContent, .materiaConteudo');
  if (!main) return;

  // Evita chamadas duplicadas para compartilhar a mesma matéria.
  const shares = [...main.querySelectorAll('.share')];
  shares.slice(1).forEach(block => block.remove());
  const firstShare = shares[0];
  if (firstShare) {
    const label = firstShare.querySelector('b, strong');
    if (label) label.textContent = 'Compartilhe esta matéria';
    const button = firstShare.querySelector('button');
    if (button) button.textContent = 'Compartilhar matéria';
  }

})();


/* Remove links clicáveis para domínios externos; preserva o texto editorial e integrações técnicas. */
(function removeThirdPartyAnchors(){
  const ownHosts = new Set(['frifasbrasil.com.br','www.frifasbrasil.com.br','paulogame35.github.io']);
  function clean(root){
    const anchors = [];
    if(root instanceof Element && root.matches('a[href]')) anchors.push(root);
    if(root.querySelectorAll) anchors.push(...root.querySelectorAll('a[href]'));
    anchors.forEach(anchor=>{
      const raw = anchor.getAttribute('href');
      if(!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw.trim())) return;
      let url;
      try { url = new URL(raw, document.baseURI); } catch (_) { return; }
      if((url.protocol === 'http:' || url.protocol === 'https:') && !ownHosts.has(url.hostname.toLowerCase())){
        anchor.removeAttribute('href');
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
        anchor.setAttribute('data-third-party-link-removed','true');
        anchor.setAttribute('aria-disabled','true');
        anchor.style.cursor='default';
        anchor.style.textDecoration='none';
        anchor.addEventListener('click',event=>event.preventDefault());
      }
    });
  }
  clean(document);
  const observer = new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE)clean(node)})));
  if(document.documentElement) observer.observe(document.documentElement,{childList:true,subtree:true});
})();


