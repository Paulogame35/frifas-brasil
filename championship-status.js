/* Status de campeonatos baseado nos horários locais informados pela organização. */
(function (root) {
  'use strict';

  function championshipStatus(startValue, endValue, now = Date.now()) {
    const start = Date.parse(startValue);
    const end = Date.parse(endValue);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return null;
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'live';
  }

  function refreshChampionshipStatuses() {
    document.querySelectorAll('.champCard[data-start][data-end]').forEach((card) => {
      const state = championshipStatus(card.dataset.start, card.dataset.end);
      if (!state) return;
      card.dataset.state = state;
      const badge = card.querySelector('[data-auto-status]');
      if (!badge) return;
      badge.textContent = state === 'upcoming' ? 'PRÓXIMO' : state === 'live' ? 'EM ANDAMENTO' : 'ENCERRADO';
      badge.dataset.state = state;
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { championshipStatus };
  }

  if (typeof document !== 'undefined') {
    refreshChampionshipStatuses();
    window.setInterval(refreshChampionshipStatuses, 60000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshChampionshipStatuses();
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
