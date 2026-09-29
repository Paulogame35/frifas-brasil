const b=document.querySelector('#menuBtn'),n=document.querySelector('#nav');if(b&&n)b.addEventListener('click',()=>{const open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open));});
async function shareArticle(){const data={title:document.title,text:'Veja esta matéria no FRIFAS BRASIL',url:location.href};if(navigator.share){try{await navigator.share(data)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Link copiado!')}catch(e){alert(location.href)}}}

if(b&&n){n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b)n.classList.remove('open')})}


const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealGroups=[
  ['.portalHero .heroCopy','reveal reveal-left'],
  ['.frifasRadar','reveal reveal-right'],
  ['.homeNav a','reveal'],
  ['.sectionTitle','reveal'],
  ['.leadStory > *','reveal'],
  ['.purpose > *','reveal'],
  ['.portalGrid article','reveal'],
  ['.newsItem','reveal'],
  ['.pageHero > *','reveal'],
  ['.emptyState','reveal'],
  ['.statusStrip','reveal'],
  ['.articleHead','reveal'],
  ['.articleCover','reveal'],
  ['.articleBody > *','reveal'],
  ['.competition','reveal'],
  ['.panel > *','reveal']
];

const revealNodes=[];
revealGroups.forEach(([selector,classes])=>{
  document.querySelectorAll(selector).forEach(el=>{
    classes.split(' ').forEach(c=>el.classList.add(c));
    revealNodes.push(el);
  });
});

if(motionReduced || !('IntersectionObserver' in window)){
  revealNodes.forEach(el=>el.classList.add('is-visible'));
}else{
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  revealNodes.forEach(el=>observer.observe(el));
}
