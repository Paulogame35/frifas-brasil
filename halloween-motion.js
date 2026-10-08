/* Halloween 2026: decoração leve, sem dependências ou bloqueio de navegação. */
(function(){
  if(document.documentElement.dataset.halloween!=='2026')return;
  const root=document.querySelector('.homeLatest');
  if(!root||root.querySelector('.halloweenStage'))return;
  const stage=document.createElement('div');
  stage.className='halloweenStage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML='<div class="halloweenMoon"></div><div class="halloweenFog one"></div><div class="halloweenFog two"></div><span class="halloweenBat b1">🦇</span><span class="halloweenBat b2">🦇</span><i class="halloweenParticle p1"></i><i class="halloweenParticle p2"></i><i class="halloweenParticle p3"></i>';
  root.prepend(stage);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let ticking=false;
  const update=()=>{
    ticking=false;
    const rect=root.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight)return;
    const offset=Math.max(-35,Math.min(35,-rect.top*.055));
    stage.style.setProperty('--halloween-shift',offset+'px');
  };
  const schedule=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
  window.addEventListener('scroll',schedule,{passive:true});
  schedule();
})();