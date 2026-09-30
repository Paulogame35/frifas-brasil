const body=document.body;
const root=document.documentElement;
const effectsToggle=document.querySelector('#effectsToggle');
const canvas=document.querySelector('#fxCanvas');
const ctx=canvas?canvas.getContext('2d'):null;
let W=0,H=0,dpr=1,particles=[],pointer={x:innerWidth/2,y:innerHeight/2,active:false};

function resizeCanvas(){
  if(!canvas||!ctx)return;
  dpr=Math.min(devicePixelRatio||1,2);
  W=innerWidth;H=innerHeight;
  canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=Math.max(34,Math.min(78,Math.floor((W*H)/18000)));
  particles=Array.from({length:count},()=>({
    x:Math.random()*W,y:Math.random()*H,
    vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,
    r:Math.random()*1.8+.7,a:Math.random()*.55+.18
  }));
}
resizeCanvas();
addEventListener('resize',resizeCanvas,{passive:true});

function setPointer(x,y){
  pointer.x=x;pointer.y=y;pointer.active=true;
  root.style.setProperty('--mx',x+'px');
  root.style.setProperty('--my',y+'px');
}
addEventListener('pointermove',e=>setPointer(e.clientX,e.clientY),{passive:true});
addEventListener('pointerdown',e=>setPointer(e.clientX,e.clientY),{passive:true});
addEventListener('touchmove',e=>{
  const t=e.touches&&e.touches[0];if(t)setPointer(t.clientX,t.clientY);
},{passive:true});

function drawFX(){
  requestAnimationFrame(drawFX);
  if(!ctx||body.classList.contains('fxOff'))return;
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<particles.length;i++){
    const p=particles[i];
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>W)p.vx*=-1;
    if(p.y<0||p.y>H)p.vy*=-1;

    if(pointer.active){
      const dx=p.x-pointer.x,dy=p.y-pointer.y;
      const dist=Math.hypot(dx,dy);
      if(dist<145&&dist>0){
        const force=(145-dist)/145;
        p.x+=(dx/dist)*force*1.35;
        p.y+=(dy/dist)*force*1.35;
      }
    }

    ctx.beginPath();
    ctx.fillStyle=`rgba(255,176,0,${p.a})`;
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();

    for(let j=i+1;j<particles.length;j++){
      const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
      if(d<105){
        ctx.beginPath();
        ctx.strokeStyle=`rgba(255,150,0,${(1-d/105)*.11})`;
        ctx.lineWidth=.7;ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
  }
  if(pointer.active){
    const g=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,90);
    g.addColorStop(0,'rgba(255,176,0,.17)');g.addColorStop(1,'rgba(255,176,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(pointer.x,pointer.y,90,0,Math.PI*2);ctx.fill();
  }
}
drawFX();

function updateProgress(){
  const max=document.documentElement.scrollHeight-innerHeight;
  const pct=max>0?(scrollY/max)*100:0;
  root.style.setProperty('--progress',pct+'%');
  root.style.setProperty('--scrollY',scrollY+'px');
}
updateProgress();
addEventListener('scroll',updateProgress,{passive:true});

if(effectsToggle){
  effectsToggle.addEventListener('click',()=>{
    const off=body.classList.toggle('fxOff');
    effectsToggle.setAttribute('aria-pressed',String(!off));
    effectsToggle.textContent=off?'✦ Efeitos OFF':'✦ Efeitos ON';
    if(ctx&&off)ctx.clearRect(0,0,W,H);
  });
}

const revealItems=document.querySelectorAll('.revealProfile');
if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}
    });
  },{threshold:.1,rootMargin:'0px 0px -5% 0px'});
  revealItems.forEach(el=>observer.observe(el));
}else revealItems.forEach(el=>el.classList.add('in'));
if(revealItems[0])revealItems[0].classList.add('in');

document.querySelectorAll('.tilt').forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(body.classList.contains('fxOff'))return;
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateX(${(-py*9).toFixed(2)}deg) rotateY(${(px*12).toFixed(2)}deg) translateY(-4px) scale(1.012)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
  card.addEventListener('touchstart',()=>{if(!body.classList.contains('fxOff'))card.animate([{transform:'scale(1)'},{transform:'scale(1.035)'},{transform:'scale(1)'}],{duration:380})},{passive:true});
});


/* Extra embers and touch bursts */
const sparks=[];
function burst(x,y){
  for(let i=0;i<24;i++){
    const a=Math.random()*Math.PI*2,s=Math.random()*3.8+1.4;
    sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,r:Math.random()*2.6+1});
  }
}
addEventListener('pointerdown',e=>{if(!body.classList.contains('fxOff'))burst(e.clientX,e.clientY)},{passive:true});

function drawSparks(){
  requestAnimationFrame(drawSparks);
  if(!ctx||body.classList.contains('fxOff'))return;
  for(let i=sparks.length-1;i>=0;i--){
    const s=sparks[i];s.x+=s.vx;s.y+=s.vy;s.vx*=.985;s.vy*=.985;s.life-=.025;
    ctx.beginPath();ctx.fillStyle=`rgba(255,174,0,${Math.max(0,s.life)})`;
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    if(s.life<=0)sparks.splice(i,1);
  }
}
drawSparks();

let lastScroll=scrollY;
addEventListener('scroll',()=>{
  const delta=scrollY-lastScroll;lastScroll=scrollY;
  if(body.classList.contains('fxOff'))return;
  document.querySelectorAll('.fxOrb').forEach((el,i)=>{
    el.style.marginTop=((scrollY*(i+1)*.035)%120)+'px';
  });
},{passive:true});
