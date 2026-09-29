const b=document.querySelector('#menuBtn'),n=document.querySelector('#nav');if(b&&n)b.addEventListener('click',()=>{const open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open));});
async function shareArticle(){const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}catch(e){alert(location.href)}}}

if(b&&n){n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b)n.classList.remove('open')})}

const siteIntro=document.querySelector('#siteIntro');
if(siteIntro){
 const finishIntro=()=>siteIntro.classList.add('done');
 window.addEventListener('load',()=>setTimeout(finishIntro,800),{once:true});
 setTimeout(finishIntro,1400);
}
