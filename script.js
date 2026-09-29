const b=document.querySelector('#menuBtn'),n=document.querySelector('#nav');if(b&&n)b.addEventListener('click',()=>{const open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open));});
async function shareArticle(){const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}catch(e){alert(location.href)}}}

if(b&&n){n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b)n.classList.remove('open')})}

const ih=document.querySelector('#interactiveHero');
if(ih&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const move=(x,y)=>{const r=ih.getBoundingClientRect(),px=Math.max(0,Math.min(1,(x-r.left)/r.width)),py=Math.max(0,Math.min(1,(y-r.top)/r.height));ih.style.setProperty('--mx',(px*100)+'%');ih.style.setProperty('--my',(py*100)+'%');ih.style.setProperty('--shift-x',((px-.5)*10)+'px');ih.style.setProperty('--shift-y',((py-.5)*6)+'px')};
 ih.addEventListener('pointermove',e=>move(e.clientX,e.clientY),{passive:true});
 ih.addEventListener('touchmove',e=>{const t=e.touches[0];if(t)move(t.clientX,t.clientY)},{passive:true});
}
