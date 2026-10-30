/* FRIFAS BRASIL — menu lateral isolado do script global. */
(() => {
  'use strict';
  const start = () => {
    if (document.querySelector('.appSidebar')) return;
    const header = document.querySelector('.siteHeader');
    const headerInner = header?.querySelector('.headerInner');
    const nav = document.querySelector('.desktopNav') || document.querySelector('.mobileNav') || document.querySelector('#nav');
    if (!header || !headerInner || !nav || !document.body) return;
    if (!document.querySelector('link[data-app-sidebar-css]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/app-sidebar.css?v=20261029-3';
      css.dataset.appSidebarCss = 'true';
      document.head.appendChild(css);
    }
    const sidebar = document.createElement('aside');
    sidebar.className = 'appSidebar';
    sidebar.id = 'appSidebar';
    sidebar.setAttribute('aria-label', 'Menu principal do FRIFAS BRASIL');
    const top = document.createElement('div');
    top.className = 'appSidebarHeader';
    const mark = document.createElement('span');
    mark.className = 'appSidebarMark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = 'F';
    const brand = document.createElement('span');
    brand.className = 'appSidebarBrand';
    brand.append(document.createTextNode('FRIFAS BRASIL'));
    const sub = document.createElement('small');
    sub.textContent = 'PORTAL DA COMUNIDADE';
    brand.appendChild(sub);
    top.append(mark, brand);
    sidebar.appendChild(top);
    nav.classList.remove('mobileNav');
    nav.classList.add('desktopNav');
    nav.id = 'appSidebarNav';
    nav.setAttribute('aria-label', 'Navegação principal');
    sidebar.appendChild(nav);
    const footer = document.createElement('div');
    footer.className = 'appSidebarFooter';
    const footerTitle = document.createElement('strong');
    footerTitle.textContent = 'FRIFAS BRASIL';
    footer.append(footerTitle, document.createTextNode('Notícias, guias e comunidade'));
    sidebar.appendChild(footer);
    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'appSidebarBackdrop';
    backdrop.setAttribute('aria-label', 'Fechar menu');
    backdrop.setAttribute('aria-hidden', 'true');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'appSidebarToggle';
    toggle.setAttribute('aria-controls', 'appSidebar');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu lateral');
    toggle.textContent = '☰';
    headerInner.appendChild(toggle);
    document.body.append(sidebar, backdrop);
    const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
    const setOpen = (open) => {
      const mobile = isMobile();
      document.body.classList.toggle('appSidebarOpen', open);
      if (mobile) document.body.classList.remove('appSidebarCollapsed');
      else document.body.classList.toggle('appSidebarCollapsed', !open);
      // A sidebar fora da tela não deve continuar recebendo foco por teclado no celular.
      // Em desktop, o menu recolhido continua acessível pelos ícones da barra lateral.
      sidebar.inert = mobile && !open;
      sidebar.setAttribute('aria-hidden', String(mobile && !open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu lateral' : 'Abrir menu lateral');
      toggle.textContent = open ? '×' : '☰';
      backdrop.setAttribute('aria-hidden', String(!open));
    };
    setOpen(false);
    toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('appSidebarOpen')));
    backdrop.addEventListener('click', () => setOpen(false));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a') && isMobile()) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', () => setOpen(false));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
