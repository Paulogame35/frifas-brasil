/* Compatibilidade com páginas antigas: o menu é inicializado somente por script.js. */
(() => {
  'use strict';
  if(window.__FRIFAS_SIDEBAR_READY__ || document.querySelector('.appSidebar')) return;
  const globalScript=[...document.scripts].find(script=>/\/?script\.js(?:\?|$)/.test(script.getAttribute('src')||''));
  if(globalScript) return;
  const script=document.createElement('script');
  script.src='/script.js?v=20261031-nav-unified1';
  script.defer=true;
  document.head.appendChild(script);
})();
