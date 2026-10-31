/* Interações opcionais do especial Halloween. Sem áudio automático e sem flashes. */
(function(){
  'use strict';
  const root=document.documentElement;
  if(!root.classList.contains('halloween-day'))return;
  const button=document.getElementById('halloweenScareButton');
  if(!button)return;
  const layer=document.createElement('div');
  layer.className='halloween-atmosphere';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<span class="halloween-close-hint">EXPERIÊNCIA VISUAL • SEM ÁUDIO</span><div class="halloween-mist"></div><div class="halloween-shadow"></div><p class="halloween-scare-message">VOCÊ NÃO ESTÁ SOZINHO…</p>';
  document.body.appendChild(layer);
  let active=false;
  let closeTimer=0;
  function closeExperience(){
    active=false;
    layer.classList.remove('is-active');
    root.classList.remove('halloween-awake');
    button.textContent='👁️ Ativar experiência';
    window.clearTimeout(closeTimer);
  }
  function startExperience(){
    if(active){closeExperience();return}
    active=true;
    root.classList.add('halloween-awake');
    layer.classList.add('is-active');
    button.textContent='✕ Encerrar experiência';
    closeTimer=window.setTimeout(closeExperience,2600);
  }
  button.addEventListener('click',startExperience);
  document.addEventListener('keydown',function(event){if(event.key==='Escape'&&active)closeExperience()});
  layer.addEventListener('click',closeExperience);
})();
