const body=document.body;
const effectsToggle=document.querySelector('#effectsToggle');
const root=document.documentElement;

function setPointer(x,y){
  root.style.setProperty('--mx',x+'px');
  root.style.setProperty('--my',y+'px');
}
window.addEventListener('pointermove',e=>{
  if(body.classList.contains('fxOff')) return;
  setPointer(e.clientX,e.clientY);
},{passive:true});

function updateProgress(){
  const max=document.documentElement.scrollHeight-innerHeight;
  const pct=max>0?(scrollY/max)*100:0;
  root.style.setProperty('--progress',pct+'%');
}
updateProgress();
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress,{passive:true});

if(effectsToggle){
  effectsToggle.addEventListener('click',()=>{
    const off=body.classList.toggle('fxOff');
    effectsToggle.setAttribute('aria-pressed',String(!off));
    effectsToggle.textContent=off?'✦ Efeitos OFF':'✦ Efeitos ON';
  });
}

const revealItems=document.querySelectorAll('.revealProfile');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  revealItems.forEach(el=>observer.observe(el));
}else{
  revealItems.forEach(el=>el.classList.add('in'));
}
if(revealItems[0]) revealItems[0].classList.add('in');

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion){
  document.querySelectorAll('.tilt').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(body.classList.contains('fxOff')) return;
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;
      const rx=(-py*5).toFixed(2);
      const ry=(px*7).toFixed(2);
      card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
  });
}