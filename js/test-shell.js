(function () {
  'use strict';

  const sunIcon = '<svg class="wt-theme-icon wt-theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const moonIcon = '<svg class="wt-theme-icon wt-theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

  function enhanceNavigation() {
    const nav = document.querySelector('.wt-nav');
    if (!nav || nav.querySelector('[data-theme-toggle]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wt-nav-theme';
    button.dataset.themeToggle = '';
    button.innerHTML = sunIcon + moonIcon;
    nav.appendChild(button);
    window.WTestTheme?.bindControls();
  }

  function improveInteractiveSemantics() {
    document.querySelectorAll('button:not([type])').forEach((button) => {
      button.type = 'button';
    });
  }

  const pseudoButtonSelector = [
    '[onclick]',
    '.option',
    '.option-btn',
    '.option-likert',
    '.option-situational',
    '.q-tab',
    '.question-nav-item',
    '.question-nav-dot',
    '.nav-dot',
    '.domain-card',
    '.spread-card'
  ].join(',');

  function enhancePseudoButton(element) {
    if (!(element instanceof HTMLElement)) return;
    if (element.matches('button, a, input, select, textarea, summary')) return;
    if (element.dataset.wtKeyboardButton === 'true') {
      element.setAttribute('aria-pressed', String(element.classList.contains('selected') || element.classList.contains('active')));
      return;
    }

    element.dataset.wtKeyboardButton = 'true';
    element.setAttribute('role', 'button');
    if (!element.hasAttribute('tabindex')) element.tabIndex = 0;
    element.setAttribute('aria-pressed', String(element.classList.contains('selected') || element.classList.contains('active')));
    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      element.click();
    });
  }

  function scanPseudoButtons(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element && root.matches(pseudoButtonSelector)) enhancePseudoButton(root);
    root.querySelectorAll(pseudoButtonSelector).forEach(enhancePseudoButton);
    root.querySelectorAll('button:not([type])').forEach((button) => {
      button.type = 'button';
    });
  }

  function watchDynamicContent() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.target.matches?.(pseudoButtonSelector)) enhancePseudoButton(mutation.target);
          return;
        }
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) scanPseudoButtons(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function openRequestedView() {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view !== 'history') return;

    window.setTimeout(() => {
      if (typeof window.showHistory === 'function') {
        window.showHistory();
        return;
      }
      if (typeof window.showTab === 'function') {
        window.showTab('history');
        return;
      }
      const tarotHistoryButton = document.querySelector('#btn-domain-history, #btn-view-history');
      tarotHistoryButton?.click();
    }, 0);
  }

  function init() {
    document.body.classList.add('wt-shell-v2');
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const testsIndex = pathParts.lastIndexOf('tests');
    if (testsIndex >= 0 && pathParts[testsIndex + 1]) {
      document.body.dataset.wtTestId = pathParts[testsIndex + 1];
    }
    enhanceNavigation();
    improveInteractiveSemantics();
    scanPseudoButtons(document);
    watchDynamicContent();
    openRequestedView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
