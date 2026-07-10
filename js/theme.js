(function () {
  'use strict';

  const STORAGE_KEY = 'wt-test-theme';
  const root = document.documentElement;

  function readStoredTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function currentTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function updateControls(theme) {
    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach((button) => {
      const nextLabel = theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';
      button.setAttribute('aria-label', nextLabel);
      button.setAttribute('title', nextLabel);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  function applyTheme(theme, persist) {
    const normalized = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = normalized;
    updateControls(normalized);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch (error) {
        // 本地存储不可用时仍保留本次主题。
      }
    }
    window.dispatchEvent(new CustomEvent('wtest:themechange', { detail: { theme: normalized } }));
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
  }

  function bindControls() {
    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';
      button.addEventListener('click', toggleTheme);
    });
    updateControls(currentTheme());
  }

  const storedTheme = readStoredTheme();
  applyTheme(storedTheme || getSystemTheme(), false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindControls);
  } else {
    bindControls();
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (event) => {
      if (!readStoredTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
    });
  }

  window.WTestTheme = { applyTheme, bindControls, currentTheme, toggleTheme };
})();
