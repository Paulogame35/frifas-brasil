/* Calendar labels describe the reported period, never live game availability. */
(function(root){
 function eventPeriod(start,end,now=Date.now()){
  const a=Date.parse(start+'T00:00:00-03:00'),b=Date.parse(end+'T23:59:59.999-03:00');
  if(!Number.isFinite(a)||!Number.isFinite(b)||a>b)return null;
  const format=v=>v.split('-').reverse().join('/');
  if(now<a)return {state:'upcoming',text:'Período informado: '+format(start)+' a '+format(end)+'. Ainda não iniciado.'};
  if(now>b)return {state:'ended',text:'O período informado terminou em '+format(end)+'. Esta matéria registra a edição anterior do evento.'};
  return {state:'scheduled',text:'Dentro do período informado: '+format(start)+' a '+format(end)+'. Confira a disponibilidade atual no jogo.'};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={eventPeriod};
 if(typeof document!=='undefined'){
  const refresh=()=>document.querySelectorAll('[data-event-start][data-event-end]').forEach(el=>{const status=eventPeriod(el.dataset.eventStart,el.dataset.eventEnd);if(status){el.textContent=status.text;el.dataset.state=status.state;el.hidden=false}});
  refresh();document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setInterval(refresh,60000);
 }
})(typeof globalThis!=='undefined'?globalThis:this);
