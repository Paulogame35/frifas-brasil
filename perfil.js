const body=document.body;
const root=document.documentElement;
const effectsToggle=document.querySelector('#effectsToggle');
const canvas=document.querySelector('#fxCanvas');
const ctx=canvas?canvas.getContext('2d'):null;
const dot=document.querySelector('.cursorDot');
const ring=document.querySelector('.cursorRing');
const ticker=document.querySelector('.profileTicker div');
const motionBand=document.querySelector('.motionBand div');

let W=0,H=0,dpr=1,particles=[],sparks=[],trail=[];
let pointer={x:innerWidth/2,y:innerHeight/2,tx:innerWidth/2,ty:innerHeight/2,active:false};
let ringPos={x:pointer.x,y:pointer.y};
let scrollVelocity=0,lastScroll=scrollY,lastTime=performance.now();

function resizeCanvas(){
  if(!canvas||!ctx)return;
  dpr=Math.min(devicePixelRatio||1,2);
  W=innerWidth;H=innerHeight;
  canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=W<720?32:Math.max(46,Math.min(72,Math.floor((W*H)/17000)));
  particles=Array.from({length:count},()=>({
    x:Math.random()*W,y:Math.random()*H,
    vx:(Math.random()-.5)*.55,vy:(Math.random()-.5)*.55,
    r:Math.random()*1.7+.8,a:Math.random()*.55+.22
  }));
}
resizeCanvas();
addEventListener('resize',resizeCanvas,{passive:true});

function setPointer(x,y){
  pointer.tx=x;pointer.ty=y;pointer.active=true;
  root.style.setProperty('--mx',x+'px');
  root.style.setProperty('--my',y+'px');
  trail.unshift({x,y,life:1});
  if(trail.length>18)trail.pop();
}
addEventListener('pointermove',e=>setPointer(e.clientX,e.clientY),{passive:true});
addEventListener('pointerdown',e=>{
  setPointer(e.clientX,e.clientY);
  if(!body.classList.contains('fxOff')){burst(e.clientX,e.clientY);shock(e.clientX,e.clientY)}
},{passive:true});
addEventListener('touchmove',e=>{
  const t=e.touches&&e.touches[0];if(t)setPointer(t.clientX,t.clientY);
},{passive:true});

function burst(x,y){
  for(let i=0;i<34;i++){
    const a=Math.random()*Math.PI*2,s=Math.random()*4.8+1.6;
    sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,r:Math.random()*2.8+1});
  }
}
function shock(x,y){
  const el=document.createElement('span');
  el.className='shockwave';el.style.left=x+'px';el.style.top=y+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),760);
}

function draw(){
  requestAnimationFrame(draw);
  if(!ctx)return;
  if(body.classList.contains('fxOff')){ctx.clearRect(0,0,W,H);return;}

  pointer.x+=(pointer.tx-pointer.x)*.16;
  pointer.y+=(pointer.ty-pointer.y)*.16;
  ctx.clearRect(0,0,W,H);

  for(let i=0;i<particles.length;i++){
    const p=particles[i];
    p.x+=p.vx*(1+Math.min(Math.abs(scrollVelocity)*.015,2));
    p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;

    if(pointer.active){
      const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);
      if(d<190&&d>1){
        const f=(190-d)/190;
        p.x+=(dx/d)*f*2.3;p.y+=(dy/d)*f*2.3;
      }
    }

    ctx.beginPath();
    ctx.fillStyle=`rgba(255,176,0,${p.a})`;
    ctx.shadowBlur=12;ctx.shadowColor='rgba(255,135,0,.4)';
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;

    for(let j=i+1;j<particles.length;j++){
      const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
      if(d<120){
        ctx.beginPath();
        ctx.strokeStyle=`rgba(255,145,0,${(1-d/120)*.16})`;
        ctx.lineWidth=.75;ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
  }

  for(let i=trail.length-1;i>=0;i--){
    const t=trail[i];t.life-=.055;
    if(t.life<=0){trail.splice(i,1);continue}
    ctx.beginPath();
    ctx.fillStyle=`rgba(255,176,0,${t.life*.08})`;
    ctx.arc(t.x,t.y,48*(1-t.life)+8,0,Math.PI*2);ctx.fill();
  }

  for(let i=sparks.length-1;i>=0;i--){
    const s=sparks[i];
    s.x+=s.vx;s.y+=s.vy;s.vx*=.982;s.vy*=.982;s.life-=.025;
    ctx.beginPath();ctx.fillStyle=`rgba(255,174,0,${Math.max(0,s.life)})`;
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    if(s.life<=0)sparks.splice(i,1);
  }

  if(pointer.active){
    const g=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,120);
    g.addColorStop(0,'rgba(255,176,0,.22)');
    g.addColorStop(.35,'rgba(255,120,0,.09)');
    g.addColorStop(1,'rgba(255,176,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(pointer.x,pointer.y,120,0,Math.PI*2);ctx.fill();
  }

  if(dot&&ring&&matchMedia('(pointer:fine)').matches){
    dot.style.transform=`translate3d(${pointer.tx-3.5}px,${pointer.ty-3.5}px,0)`;
    ringPos.x+=(pointer.tx-ringPos.x)*.14;ringPos.y+=(pointer.ty-ringPos.y)*.14;
    ring.style.transform=`translate3d(${ringPos.x-17}px,${ringPos.y-17}px,0)`;
  }
}
draw();

function updateScroll(){
  const now=performance.now();
  const dy=scrollY-lastScroll;
  const dt=Math.max(16,now-lastTime);
  scrollVelocity=dy/(dt/16.67);
  lastScroll=scrollY;lastTime=now;

  const max=document.documentElement.scrollHeight-innerHeight;
  const pct=max>0?(scrollY/max)*100:0;
  root.style.setProperty('--progress',pct+'%');

  document.querySelectorAll('[data-depth]').forEach(el=>{
    const depth=parseFloat(el.dataset.depth||'.2');
    const y=-(scrollY*depth);
    el.style.translate='0 '+y+'px';
  });

  const hero=document.querySelector('.profileHero');
  if(hero){
    const heroShift=Math.min(scrollY*.22,120);
    hero.style.setProperty('--heroShift',heroShift+'px');
  }

  if(ticker) ticker.style.animationDuration=(Math.max(8,22-Math.min(Math.abs(scrollVelocity)*.65,12)))+'s';
  if(motionBand) motionBand.style.animationDuration=(Math.max(7,15-Math.min(Math.abs(scrollVelocity)*.45,7)))+'s';
}
updateScroll();
addEventListener('scroll',updateScroll,{passive:true});

if(effectsToggle){
  effectsToggle.addEventListener('click',()=>{
    const off=body.classList.toggle('fxOff');
    effectsToggle.setAttribute('aria-pressed',String(!off));
    effectsToggle.textContent=off?'✦ Efeitos OFF':'✦ Efeitos MAX';
    if(ctx&&off)ctx.clearRect(0,0,W,H);
  });
  effectsToggle.textContent='✦ Efeitos MAX';
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
    card.style.transform=`perspective(900px) rotateX(${(-py*11).toFixed(2)}deg) rotateY(${(px*15).toFixed(2)}deg) translateY(-5px) scale(1.018)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
  card.addEventListener('touchstart',()=>{
    if(!body.classList.contains('fxOff'))card.animate(
      [{transform:'scale(1)'},{transform:'scale(1.045) rotate(-.4deg)'},{transform:'scale(1)'}],
      {duration:420,easing:'cubic-bezier(.2,.8,.2,1)'}
    )
  },{passive:true});
});

document.querySelectorAll('.magnetic').forEach(el=>{
  el.addEventListener('pointermove',e=>{
    if(body.classList.contains('fxOff'))return;
    const r=el.getBoundingClientRect();
    const x=(e.clientX-(r.left+r.width/2))*.18;
    const y=(e.clientY-(r.top+r.height/2))*.18;
    el.style.transform=`translate3d(${x}px,${y}px,0) scale(1.035)`;
  });
  el.addEventListener('pointerleave',()=>el.style.transform='');
});

const title=document.querySelector('.glitchTitle');
if(title){
  addEventListener('pointermove',e=>{
    if(body.classList.contains('fxOff'))return;
    const nx=(e.clientX/innerWidth-.5)*10;
    const ny=(e.clientY/innerHeight-.5)*7;
    title.style.transform=`translate3d(${nx}px,${ny}px,0)`;
  },{passive:true});
}

setTimeout(()=>document.body.classList.add('introDone'),1900);
