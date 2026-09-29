const b=document.querySelector('#menuBtn'),n=document.querySelector('#nav');if(b&&n)b.addEventListener('click',()=>n.classList.toggle('open'));
async function shareArticle(){const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}catch(e){alert(location.href)}}}

const searchPages=[
{t:'Notícias',d:'Últimas publicações do FRIFAS BRASIL',u:'noticias.html'},
{t:'Atualizações',d:'Mudanças e versões do Free Fire',u:'atualizacoes.html'},
{t:'Campeonatos',d:'Central competitiva e campeonatos',u:'campeonatos.html'},
{t:'Eventos',d:'Eventos e recompensas',u:'eventos.html'},
{t:'Craftland',d:'Mapas, criações e guias',u:'craftland.html'},
{t:'Guias',d:'Tutoriais e configurações',u:'guias.html'},
{t:'Comunidade',d:'Área da comunidade FRIFAS',u:'comunidade.html'},
{t:'Bem-vindo ao FRIFAS BRASIL',d:'Conheça o projeto FRIFAS BRASIL',u:'materia-bem-vindo.html'}
];
const so=document.querySelector('#searchOpen'),ov=document.querySelector('#searchOverlay'),sc=document.querySelector('#searchClose'),si=document.querySelector('#siteSearch'),sr=document.querySelector('#searchResults');
function renderSearch(q=''){if(!sr)return;const x=q.trim().toLowerCase();if(!x){sr.innerHTML='';return}const hits=searchPages.filter(p=>(p.t+' '+p.d).toLowerCase().includes(x));sr.innerHTML=hits.length?hits.map(p=>'<a class="searchResult" href="'+p.u+'"><b>'+p.t+'</b><span>'+p.d+'</span></a>').join(''):'<div class="searchEmpty">Nenhum resultado encontrado.</div>'}
if(so&&ov){so.addEventListener('click',()=>{ov.classList.add('open');setTimeout(()=>si&&si.focus(),50)});sc.addEventListener('click',()=>ov.classList.remove('open'));ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('open')});si.addEventListener('input',e=>renderSearch(e.target.value));document.addEventListener('keydown',e=>{if(e.key==='Escape')ov.classList.remove('open')})}

if(b&&n){n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>n.classList.remove('open')));document.addEventListener('click',e=>{if(n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b)n.classList.remove('open')})}
