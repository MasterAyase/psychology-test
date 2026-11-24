(function () {
  'use strict';

  const TESTS = {
    mbti: {
      name: 'MBTI 性格测试', kicker: 'COGNITIVE ATLAS · 认知坐标',
      meta: ['93 道题', '约 12 分钟', '荣格类型理论'], landing: '#intro-section'
    },
    history: {
      name: '历史人物人格测试', kicker: 'ARCHIVE OF CHARACTER · 人格档案',
      meta: ['50 道题', '约 8 分钟', '大五人格模型'], landing: '#landing'
    },
    love: {
      name: '恋爱类型测试', kicker: 'RELATIONSHIP ORBITS · 关系轨迹',
      meta: ['30 道题', '约 6 分钟', 'ECR 依恋量表'], landing: '.landing-container'
    },
    maturity: {
      name: '心理成熟度测试', kicker: 'GROWTH CONTOURS · 成长等高线',
      meta: ['50 道题', '约 10 分钟', '成人发展理论'], landing: '.landing-content'
    },
    animal: {
      name: '动物人格测试', kicker: 'FIELD NOTES · 性格观察手册',
      meta: ['30 道题', '约 5 分钟', '12 种动物原型'], landing: '.card.hero'
    },
    'dark-triad': {
      name: '暗黑人格测试', kicker: 'SHADOW PRISM · 人格棱镜',
      meta: ['27 道题', '约 5 分钟', 'SD3 学术量表'], landing: '.landing-container'
    },
    tarot: {
      name: '塔罗占卜', kicker: 'CELESTIAL OBSERVATORY · 潜意识观测',
      meta: ['78 张牌', '约 3 分钟', '多种经典牌阵'], landing: '#screen-domain'
    }
  };

  const ICONS = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/><path d="M9 12h10"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
    sun: '<svg class="wt-theme-icon wt-theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>',
    moon: '<svg class="wt-theme-icon wt-theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/></svg>'
  };

  const QUIZ_SELECTORS = '#test, #test-section, .test-section';
  const RESULT_SELECTORS = '#result, #results, #results-section, #screen-result, .results-section';
  const HISTORY_SELECTORS = '#history, #historyPage, #history-section, #screen-history, .history-page, .history-section';
  const GALLERY_SELECTORS = '#encyclopedia, #encyclopediaPage, #encyclopedia-section, .encyclopedia-page, .encyclopedia-section';
  const NAVIGATOR_SELECTORS = '.q-tabs-wrap, .question-tabs-wrap, .dot-grid, .question-nav-grid';
  let navigatorPreferenceOpen = false;
  let activeView = 'home';
  let restoringHistory = false;
  let lastViewTrigger = null;

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && !element.hidden;
  }

  function svgEmptyState() {
    return '<svg viewBox="0 0 80 56" aria-hidden="true"><path d="M14 14h52v34H14z"/><path d="m14 15 26 20 26-20"/><path d="M25 8h30"/><path d="M30 3h20"/></svg>';
  }

  function ensureToastRegion() {
    let region = document.querySelector('.wt-toast-region');
    if (region) return region;
    region = document.createElement('div');
    region.className = 'wt-toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'false');
    document.body.appendChild(region);
    return region;
  }

  function showToast(message, options = {}) {
    const region = ensureToastRegion();
    const toast = document.createElement('div');
    toast.className = 'wt-toast';
    toast.setAttribute('role', 'status');
    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(text);

    if (options.actionLabel && typeof options.onAction === 'function') {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'wt-toast__action';
      action.textContent = options.actionLabel;
      action.addEventListener('click', () => {
        options.onAction();
        toast.remove();
      }, { once: true });
      toast.appendChild(action);
    }

    region.appendChild(toast);
    const duration = Math.max(2000, Number(options.duration) || 5000);
    window.setTimeout(() => toast.remove(), duration);
    return toast;
  }

  function parseHistory(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { raw: null, records: [] };
      const parsed = JSON.parse(raw);
      return { raw, records: Array.isArray(parsed) ? parsed : [] };
    } catch (error) {
      return { raw: null, records: [] };
    }
  }

  function historyGroup(timestamp) {
    const value = Number(timestamp) || Date.parse(timestamp) || 0;
    const age = Date.now() - value;
    if (value && age < 86400000) return 'today';
    if (value && age < 604800000) return 'recent';
    return 'earlier';
  }

  function renderHistoryList(options) {
    const container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
    if (!container || !options.key || typeof options.toViewModel !== 'function') return null;
    const parsed = parseHistory(options.key);
    const models = [];
    parsed.records.forEach((record, sourceIndex) => {
      try {
        const model = options.toViewModel(record, sourceIndex);
        if (!model || !model.title) return;
        models.push({ ...model, record, sourceIndex });
      } catch (error) {
        // 损坏的单条旧记录只跳过展示，不修改原始数据。
      }
    });

    const legacyEmpty = options.empty
      ? (typeof options.empty === 'string' ? document.querySelector(options.empty) : options.empty)
      : null;
    if (legacyEmpty) legacyEmpty.style.display = 'none';
    container.innerHTML = '';
    container.classList.add('wt-history-list-shell');

    const stage = container.closest('.wt-test-stage--history, #history, #historyPage, #history-section, #screen-history, .history-page');
    stage?.querySelectorAll('button[onclick*="clearHistory"], button[onclick*="clearAllHistory"], button[onclick*="clearMbtiHistory"]').forEach((button) => {
      button.hidden = true;
    });

    if (!models.length) {
      const empty = document.createElement('div');
      empty.className = 'wt-empty-state';
      empty.innerHTML = `<div class="wt-empty-state__visual">${svgEmptyState()}</div><h2>还没有测试记录</h2><p>完成一次测试后，结果会保存在当前浏览器中。</p>`;
      if (typeof options.onStart === 'function') {
        const start = document.createElement('button');
        start.type = 'button';
        start.className = 'wt-button wt-button--primary';
        start.textContent = '开始第一次测试';
        start.addEventListener('click', options.onStart);
        empty.appendChild(start);
      }
      container.appendChild(empty);
      options.onCountChange?.(0);
      return { count: 0, skipped: parsed.records.length };
    }

    let manageMode = false;
    const selected = new Set();
    const controls = document.createElement('div');
    controls.className = 'wt-history-controls';
    const count = document.createElement('p');
    count.textContent = `共 ${models.length} 条 · 结果只保存在当前浏览器`;
    const actions = document.createElement('div');
    const manage = document.createElement('button');
    manage.type = 'button';
    manage.className = 'wt-button wt-button--secondary';
    manage.textContent = '选择记录';
    const removeSelected = document.createElement('button');
    removeSelected.type = 'button';
    removeSelected.className = 'wt-button wt-button--danger';
    removeSelected.textContent = '删除所选';
    removeSelected.hidden = true;
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'wt-button wt-button--danger';
    clear.textContent = '清空全部';
    clear.hidden = true;
    actions.append(manage, removeSelected, clear);
    controls.append(count, actions);
    container.appendChild(controls);

    const groups = { today: [], recent: [], earlier: [] };
    models.forEach((model) => groups[historyGroup(model.timestamp)].push(model));
    const groupLabels = { today: '今天', recent: '最近 7 天', earlier: '更早' };

    const restoreRaw = (raw) => {
      try {
        if (raw === null) localStorage.removeItem(options.key);
        else localStorage.setItem(options.key, raw);
      } catch (error) {
        showToast({ message: '当前浏览器无法写入历史记录。' });
        return;
      }
      options.onStorageChange?.();
      renderHistoryList(options);
    };

    const removeIndices = async (indices, message) => {
      if (!indices.length) return;
      const confirmed = await confirmAction(message, {
        title: indices.length > 1 ? `删除所选 ${indices.length} 条记录？` : '删除这条记录？',
        confirmLabel: '删除'
      });
      if (!confirmed) return;
      let before;
      try {
        before = localStorage.getItem(options.key);
        const next = [...parsed.records];
        [...indices].sort((a, b) => b - a).forEach((index) => next.splice(index, 1));
        localStorage.setItem(options.key, JSON.stringify(next));
      } catch (error) {
        showToast({ message: '当前浏览器无法写入历史记录。' });
        return;
      }
      options.onStorageChange?.();
      renderHistoryList(options);
      showToast(`已删除 ${indices.length} 条记录`, { actionLabel: '撤销', onAction: () => restoreRaw(before) });
    };

    Object.entries(groups).forEach(([group, items]) => {
      if (!items.length) return;
      const section = document.createElement('section');
      section.className = 'wt-history-group';
      const heading = document.createElement('h2');
      heading.textContent = groupLabels[group];
      section.appendChild(heading);

      items.forEach((model) => {
        const article = document.createElement('article');
        article.className = 'wt-history-card';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'wt-history-card__check';
        checkbox.setAttribute('aria-label', `选择${model.title}`);
        checkbox.hidden = true;
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) selected.add(model.sourceIndex);
          else selected.delete(model.sourceIndex);
          removeSelected.disabled = selected.size === 0;
          removeSelected.textContent = selected.size ? `删除所选（${selected.size}）` : '删除所选';
        });

        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'wt-history-card__main';
        const visual = document.createElement('span');
        visual.className = 'wt-history-card__visual';
        if (Array.isArray(model.images) && model.images.length) {
          visual.classList.add('wt-history-card__visual--images');
          model.images.slice(0, 3).forEach((source, index) => {
            const image = document.createElement('img');
            image.src = source;
            image.alt = index === 0 ? `${model.title}缩略图` : '';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.addEventListener('error', () => image.remove(), { once: true });
            visual.appendChild(image);
          });
        } else {
          visual.textContent = model.visual || '◇';
        }
        const copy = document.createElement('span');
        copy.className = 'wt-history-card__copy';
        const title = document.createElement('strong');
        title.textContent = model.title;
        const meta = document.createElement('span');
        meta.textContent = model.meta || '';
        const detail = document.createElement('small');
        detail.textContent = model.detail || '';
        copy.append(title, meta, detail);
        const metric = document.createElement('span');
        metric.className = 'wt-history-card__metric';
        metric.textContent = model.metric || '';
        open.append(visual, copy, metric);
        open.addEventListener('click', () => {
          sessionStorage.setItem(`wt-history-scroll:${options.key}`, String(window.scrollY));
          options.onOpen?.(model.record, model.sourceIndex);
        });

        const menu = document.createElement('details');
        menu.className = 'wt-history-card__menu';
        const summary = document.createElement('summary');
        summary.setAttribute('aria-label', '记录操作');
        summary.textContent = '•••';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '删除这条记录';
        remove.addEventListener('click', () => removeIndices([model.sourceIndex], '删除后可在 5 秒内撤销。'));
        menu.append(summary, remove);
        article.append(checkbox, open, menu);
        section.appendChild(article);
      });
      container.appendChild(section);
    });

    const syncManageMode = () => {
      container.classList.toggle('is-managing', manageMode);
      container.querySelectorAll('.wt-history-card__check').forEach((checkbox) => { checkbox.hidden = !manageMode; });
      container.querySelectorAll('.wt-history-card__menu').forEach((menu) => { menu.hidden = manageMode; });
      removeSelected.hidden = !manageMode;
      clear.hidden = !manageMode;
      manage.textContent = manageMode ? '完成选择' : '选择记录';
      if (!manageMode) {
        selected.clear();
        container.querySelectorAll('.wt-history-card__check').forEach((checkbox) => { checkbox.checked = false; });
      }
      removeSelected.disabled = selected.size === 0;
    };
    manage.addEventListener('click', () => { manageMode = !manageMode; syncManageMode(); });
    removeSelected.addEventListener('click', () => removeIndices([...selected], `删除所选 ${selected.size} 条记录后可在 5 秒内撤销。`));
    clear.addEventListener('click', async () => {
      const confirmed = await confirmAction(`将清空当前浏览器中的 ${parsed.records.length} 条记录。`, { title: '清空全部历史记录？', confirmLabel: '清空全部' });
      if (!confirmed) return;
      let before;
      try {
        before = localStorage.getItem(options.key);
        localStorage.removeItem(options.key);
      } catch (error) {
        showToast({ message: '当前浏览器无法写入历史记录。' });
        return;
      }
      options.onStorageChange?.();
      renderHistoryList(options);
      showToast('已清空全部记录', { actionLabel: '撤销', onAction: () => restoreRaw(before) });
    });
    syncManageMode();
    options.onCountChange?.(models.length);
    const savedScroll = Number(sessionStorage.getItem(`wt-history-scroll:${options.key}`));
    if (Number.isFinite(savedScroll) && savedScroll > 0) {
      window.requestAnimationFrame(() => window.scrollTo({ top: savedScroll, behavior: 'auto' }));
    }
    return { count: models.length, skipped: parsed.records.length - models.length };
  }

  function ensureConfirmDialog() {
    let dialog = document.querySelector('#wt-confirm-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'wt-confirm-dialog';
    dialog.className = 'wt-dialog';
    dialog.innerHTML = `
      <div class="wt-dialog__header"><h2 class="wt-dialog__title">请确认操作</h2></div>
      <div class="wt-dialog__body"><p data-wt-confirm-message></p></div>
      <div class="wt-dialog__footer">
        <button type="button" class="wt-button wt-button--secondary" value="cancel">取消</button>
        <button type="button" class="wt-button wt-button--danger" value="confirm">确认</button>
      </div>`;
    document.body.appendChild(dialog);
    return dialog;
  }

  function confirmAction(message, options = {}) {
    const dialog = ensureConfirmDialog();
    dialog.querySelector('[data-wt-confirm-message]').textContent = message;
    dialog.querySelector('.wt-dialog__title').textContent = options.title || '请确认操作';
    const confirmButton = dialog.querySelector('[value="confirm"]');
    const cancelButton = dialog.querySelector('[value="cancel"]');
    confirmButton.textContent = options.confirmLabel || '确认';
    cancelButton.textContent = options.cancelLabel || '取消';

    return new Promise((resolve) => {
      const finish = (value) => {
        dialog.close();
        confirmButton.removeEventListener('click', onConfirm);
        cancelButton.removeEventListener('click', onCancel);
        dialog.removeEventListener('cancel', onCancel);
        resolve(value);
      };
      const onConfirm = () => finish(true);
      const onCancel = (event) => {
        event?.preventDefault?.();
        finish(false);
      };
      confirmButton.addEventListener('click', onConfirm);
      cancelButton.addEventListener('click', onCancel);
      dialog.addEventListener('cancel', onCancel);
      dialog.showModal();
      cancelButton.focus();
    });
  }

  function openDrawer(options = {}) {
    const dialog = document.createElement('dialog');
    dialog.className = 'wt-detail-drawer';
    const titleId = `wt-drawer-title-${Math.random().toString(36).slice(2, 8)}`;
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.innerHTML = `
      <div class="wt-detail-drawer__header">
        <h2 class="wt-dialog__title" id="${titleId}"></h2>
        <button type="button" class="wt-icon-button" aria-label="关闭详情">×</button>
      </div>
      <div class="wt-detail-drawer__body"></div>`;
    dialog.querySelector('h2').textContent = options.title || '详情';
    const body = dialog.querySelector('.wt-detail-drawer__body');
    if (options.content instanceof Node) body.appendChild(options.content);
    else body.innerHTML = options.content || '';
    const trigger = options.trigger instanceof HTMLElement ? options.trigger : document.activeElement;
    const close = () => dialog.close();
    dialog.querySelector('button').addEventListener('click', close);
    dialog.addEventListener('close', () => {
      dialog.remove();
      trigger?.focus?.();
    }, { once: true });
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.querySelector('button').focus();
    return dialog;
  }

  function pathTestId() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const index = parts.lastIndexOf('tests');
    return index >= 0 ? parts[index + 1] : '';
  }

  function enhanceNavigation(config) {
    const nav = document.querySelector('.wt-nav');
    if (!nav || nav.dataset.wtEnhanced === 'true') return;
    nav.dataset.wtEnhanced = 'true';
    nav.innerHTML = `
      <a class="wt-nav-back" href="../../index.html">${ICONS.back}<span class="wt-nav-back__desktop">返回测试集合</span><span class="wt-nav-back__mobile">测试集合</span></a>
      <a class="wt-nav-brand" href="../../index.html" aria-label="Psychology Test 心理测试首页">
        <img src="../../favicon.png" alt="" width="28" height="28"><span>Psychology Test · 心理测试</span>
      </a>
      <button type="button" class="wt-nav-context" aria-label="返回${config.name}主页">${config.name}</button>
      <button type="button" class="wt-nav-theme" data-theme-toggle>${ICONS.sun}${ICONS.moon}</button>`;
    nav.querySelector('.wt-nav-context').addEventListener('click', () => navigateToView('home', { push: true }));
    window.WTestTheme?.bindControls();
  }

  function enhanceSkipLink() {
    if (document.querySelector('.wt-test-skip')) return;
    const target = document.querySelector('#app, .app-container, .container, #landing-section, #landing');
    if (!target) return;
    if (!target.id) target.id = 'wt-test-main';
    const link = document.createElement('a');
    link.className = 'wt-test-skip';
    link.href = `#${target.id}`;
    link.textContent = '跳到主要内容';
    document.body.insertBefore(link, document.body.firstChild);
  }

  function createHeroVisual(id, config) {
    const figure = document.createElement('figure');
    figure.className = 'wt-test-visual';
    figure.setAttribute('aria-hidden', 'true');
    figure.innerHTML = `
      <img src="../../assets/tests/${id}/hero.webp" alt="" width="1536" height="1024" decoding="async">
      <figcaption><span>${config.kicker.split(' · ')[0]}</span><span>W—${id.toUpperCase()}</span></figcaption>`;
    return figure;
  }

  function organizeLandingActions(id, copy) {
    if (id === 'love') {
      const secondaryButtons = [
        copy.querySelector('.history-entry-btn'),
        copy.querySelector('.encyclopedia-entry-btn')
      ].filter(Boolean);
      if (secondaryButtons.length && !secondaryButtons[0].closest('.wt-test-secondary-actions')) {
        const group = document.createElement('div');
        group.className = 'wt-test-secondary-actions';
        secondaryButtons[0].before(group);
        secondaryButtons.forEach((button) => group.appendChild(button));
      }
    }

    [...copy.children].forEach((child) => {
      if (!(child instanceof HTMLElement) || child.classList.contains('wt-test-secondary-actions')) return;
      const children = [...child.children];
      if (children.length >= 2 && children.every((node) => node.matches('button'))) {
        child.classList.add('wt-test-secondary-actions');
        child.removeAttribute('style');
      }
    });
  }

  function enhanceLanding(id, config, root) {
    const scope = root instanceof Element ? root : document;
    const targets = [];
    if (scope.matches?.(config.landing)) targets.push(scope);
    scope.querySelectorAll?.(config.landing).forEach((node) => targets.push(node));

    targets.forEach((target) => {
      if (target.dataset.wtLanding === 'true') return;
      target.dataset.wtLanding = 'true';
      target.classList.add('wt-test-landing');

      const copy = document.createElement('div');
      copy.className = 'wt-test-landing__copy';
      while (target.firstChild) copy.appendChild(target.firstChild);

      const kicker = document.createElement('p');
      kicker.className = 'wt-test-kicker';
      kicker.textContent = config.kicker;
      copy.insertBefore(kicker, copy.firstChild);

      const meta = document.createElement('ul');
      meta.className = 'wt-test-meta';
      meta.setAttribute('aria-label', '测试信息');
      meta.innerHTML = config.meta.map((item) => `<li>${item}</li>`).join('');
      const featureBlock = copy.querySelector('.features, .feature-cards, .stats');
      const firstAction = copy.querySelector('button, .btn, .start-btn');
      copy.insertBefore(meta, featureBlock || firstAction || null);
      organizeLandingActions(id, copy);

      target.append(copy, createHeroVisual(id, config));
    });
  }

  function markPageRegions() {
    document.querySelectorAll(QUIZ_SELECTORS).forEach((node) => node.classList.add('wt-test-stage', 'wt-test-stage--quiz'));
    document.querySelectorAll(RESULT_SELECTORS).forEach((node) => node.classList.add('wt-test-stage', 'wt-test-stage--result'));
    document.querySelectorAll(HISTORY_SELECTORS).forEach((node) => node.classList.add('wt-test-stage', 'wt-test-stage--history'));
    document.querySelectorAll(GALLERY_SELECTORS).forEach((node) => node.classList.add('wt-test-stage', 'wt-test-stage--gallery'));
  }

  function navigatorStats(panel) {
    const items = panel.querySelectorAll('.q-tab, .question-nav-item, .question-nav-dot, .nav-dot, .dot, [data-question]');
    const done = panel.querySelectorAll('.done, .answered, .completed, .is-answered').length;
    const total = items.length;
    return { done, total };
  }

  function updateNavigator(navigator) {
    const panel = navigator.querySelector('.wt-question-navigator__panel');
    const summary = navigator.querySelector('.wt-question-navigator__summary');
    if (!panel || !summary) return;
    const { done, total } = navigatorStats(panel);
    const nextText = total ? `已答 ${done} / ${total}` : '查看完成进度';
    if (summary.textContent !== nextText) summary.textContent = nextText;
  }

  function makeNavigatorCollapsible(element) {
    if (element.closest('.wt-question-navigator')) return;
    const navigator = document.createElement('div');
    navigator.className = 'wt-question-navigator';
    const panel = document.createElement('div');
    const panelId = `wt-question-panel-${Math.random().toString(36).slice(2, 9)}`;
    panel.className = 'wt-question-navigator__panel';
    panel.id = panelId;
    panel.hidden = true;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'wt-question-navigator__toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', panelId);
    toggle.innerHTML = `<span class="wt-question-navigator__label">查看题目导航</span><span class="wt-question-navigator__summary">查看完成进度</span>${ICONS.chevron}`;
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      navigatorPreferenceOpen = !expanded;
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.querySelector('.wt-question-navigator__label').textContent = expanded ? '查看题目导航' : '收起题目导航';
      panel.hidden = expanded;
      navigator.classList.toggle('is-open', !expanded);
    });

    element.before(navigator);
    panel.appendChild(element);
    navigator.append(toggle, panel);
    if (navigatorPreferenceOpen) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.wt-question-navigator__label').textContent = '收起题目导航';
      panel.hidden = false;
      navigator.classList.add('is-open');
    }
    updateNavigator(navigator);
  }

  function enhanceNavigators(root) {
    const scope = root instanceof Element ? root : document;
    const candidates = [];
    if (scope.matches?.(NAVIGATOR_SELECTORS)) candidates.push(scope);
    scope.querySelectorAll?.(NAVIGATOR_SELECTORS).forEach((node) => candidates.push(node));
    candidates.forEach(makeNavigatorCollapsible);
    document.querySelectorAll('.wt-question-navigator').forEach(updateNavigator);
  }

  function collapseNavigators() {
    navigatorPreferenceOpen = false;
    document.querySelectorAll('.wt-question-navigator').forEach((navigator) => {
      const toggle = navigator.querySelector('.wt-question-navigator__toggle');
      const panel = navigator.querySelector('.wt-question-navigator__panel');
      if (!toggle || !panel) return;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.wt-question-navigator__label').textContent = '查看题目导航';
      panel.hidden = true;
      navigator.classList.remove('is-open');
    });
  }

  function enhanceMbtiProgress() {
    const content = document.querySelector('#test-content');
    if (!content || content.querySelector('.wt-mbti-overview')) return;
    const overview = document.createElement('div');
    overview.className = 'wt-mbti-overview';
    overview.innerHTML = `<span>答题进度</span><strong aria-live="polite">开始后显示已完成题数</strong>`;
    content.querySelector('.progress-bar')?.after(overview);
  }

  function updateMbtiOverview() {
    const output = document.querySelector('.wt-mbti-overview strong');
    const progress = document.querySelector('#progress');
    if (!output || !progress) return;
    const value = progress.textContent.trim();
    const nextText = value && value !== '0%' ? `已完成 ${value}` : '开始后显示已完成进度';
    if (output.textContent !== nextText) output.textContent = nextText;
  }

  function enhanceTarotFlow() {
    if (document.querySelector('.wt-tarot-flow')) return;
    const brand = document.querySelector('body[data-wt-test-id="tarot"] .brand');
    if (!brand) return;
    const stages = [
      ['domain', '选择领域'], ['question', '写下问题'], ['spread', '选择牌阵'],
      ['shuffle', '洗牌'], ['draw', '抽牌'], ['result', '阅读解读']
    ];
    const flow = document.createElement('div');
    flow.className = 'wt-tarot-flow wt-question-navigator';
    const panelId = 'wt-tarot-flow-panel';
    flow.innerHTML = `
      <button class="wt-question-navigator__toggle" type="button" aria-expanded="false" aria-controls="${panelId}">
        <span class="wt-question-navigator__label">查看流程进度</span>
        <span class="wt-question-navigator__summary">共 6 个阶段</span>${ICONS.chevron}
      </button>
      <div class="wt-question-navigator__panel" id="${panelId}" hidden>
        <ol>${stages.map(([id, label], index) => `<li data-screen="${id}"><span>${index + 1}</span>${label}</li>`).join('')}</ol>
      </div>`;
    flow.querySelector('button').addEventListener('click', (event) => {
      const button = event.currentTarget;
      const panel = flow.querySelector('.wt-question-navigator__panel');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      navigatorPreferenceOpen = !expanded;
      button.setAttribute('aria-expanded', String(!expanded));
      button.querySelector('.wt-question-navigator__label').textContent = expanded ? '查看流程进度' : '收起流程进度';
      panel.hidden = expanded;
      flow.classList.toggle('is-open', !expanded);
    });
    brand.after(flow);
    updateTarotFlow();
  }

  function updateTarotFlow() {
    const active = document.querySelector('body[data-wt-test-id="tarot"] .screen.active');
    if (!active) return;
    const currentId = active.id.replace('screen-', '');
    const items = [...document.querySelectorAll('.wt-tarot-flow li')];
    const currentIndex = items.findIndex((item) => item.dataset.screen === currentId);
    items.forEach((item, index) => {
      item.classList.toggle('is-current', index === currentIndex);
      item.classList.toggle('is-complete', index < currentIndex);
      item.setAttribute('aria-current', index === currentIndex ? 'step' : 'false');
    });
  }

  function cleanStructuralEmoji(root) {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll?.('button, h1, h2, h3, .tabs-label, .encyclopedia-section-title, .chart-title').forEach((node) => {
      [...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).forEach((text) => {
        const cleaned = node.matches('button')
          ? text.nodeValue.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/\s{2,}/g, ' ')
          : text.nodeValue.replace(/^[\s\p{Extended_Pictographic}\uFE0F]+/u, '');
        if (cleaned !== text.nodeValue) text.nodeValue = cleaned;
      });
    });
  }

  function enhancePseudoButtons(root) {
    const selector = '[onclick], .option, .option-btn, .option-likert, .option-situational, .q-tab, .question-nav-item, .question-nav-dot, .nav-dot, .domain-item, .spread-card';
    const scope = root instanceof Element ? root : document;
    const nodes = [];
    if (scope.matches?.(selector)) nodes.push(scope);
    scope.querySelectorAll?.(selector).forEach((node) => nodes.push(node));
    nodes.forEach((element) => {
      if (element.matches('button, a, input, select, textarea, summary')) return;
      element.setAttribute('role', 'button');
      if (!element.hasAttribute('tabindex')) element.tabIndex = 0;
      element.setAttribute('aria-pressed', String(element.classList.contains('selected') || element.classList.contains('active')));
      if (element.dataset.wtKeyboardButton === 'true') return;
      element.dataset.wtKeyboardButton = 'true';
      element.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        element.click();
      });
    });
    scope.querySelectorAll?.('button:not([type])').forEach((button) => { button.type = 'button'; });
  }

  function resetOnStartActions() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, a');
      if (!button) return;
      const action = `${button.getAttribute('onclick') || ''} ${button.id || ''}`;
      if (/(start|restart|retake)/i.test(action)) window.setTimeout(collapseNavigators, 0);
    });
  }

  function syncChartTheme() {
    if (!window.echarts) return;
    const styles = getComputedStyle(document.body);
    const color = styles.getPropertyValue('--wt-color-text-secondary').trim() || '#64687b';
    const border = styles.getPropertyValue('--wt-color-border').trim() || '#dde1ec';
    document.querySelectorAll('[id*="Chart"], [id*="chart"]').forEach((node) => {
      const chart = window.echarts.getInstanceByDom?.(node);
      if (!chart) return;
      try {
        chart.setOption({
          textStyle: { color },
          legend: { textStyle: { color } },
          xAxis: { axisLabel: { color }, axisLine: { lineStyle: { color: border } }, splitLine: { lineStyle: { color: border } } },
          yAxis: { axisLabel: { color }, axisLine: { lineStyle: { color: border } }, splitLine: { lineStyle: { color: border } } },
          radar: { axisName: { color }, splitLine: { lineStyle: { color: border } }, axisLine: { lineStyle: { color: border } } }
        }, false);
        chart.resize();
      } catch (error) {
        // 不同图表配置不完整时保留原有渲染。
      }
    });
  }

  function viewLabel(id, view) {
    if (view === 'home') return '测试介绍';
    if (view === 'history') return '历史记录';
    if (id === 'tarot') return '牌典';
    return '图鉴';
  }

  function availableViews(id) {
    const views = ['home'];
    const hasAtlas = id === 'mbti' || typeof window.showEncyclopedia === 'function';
    if (hasAtlas) views.push('atlas');
    views.push('history');
    return views;
  }

  function createViewNavigation(id) {
    const nav = document.createElement('nav');
    nav.className = 'wt-test-view-nav';
    nav.setAttribute('aria-label', '测试内部导航');
    nav.innerHTML = availableViews(id).map((view) => `
      <button type="button" class="wt-test-view-nav__item" data-wt-view="${view}">${viewLabel(id, view)}</button>`).join('');
    nav.addEventListener('click', (event) => {
      const button = event.target.closest('[data-wt-view]');
      if (!button) return;
      lastViewTrigger = button;
      navigateToView(button.dataset.wtView, { push: true });
    });
    return nav;
  }

  function enhanceViewNavigation(id, config) {
    const placements = [];
    document.querySelectorAll('.wt-test-landing__copy').forEach((copy) => placements.push(copy));
    document.querySelectorAll(`${RESULT_SELECTORS}, ${HISTORY_SELECTORS}, ${GALLERY_SELECTORS}`).forEach((stage) => {
      const container = stage.querySelector(':scope > .results-container, :scope > .history-container, :scope > .encyclopedia-container') || stage;
      placements.push(container);
    });

    placements.forEach((placement) => {
      if (placement.querySelector(':scope > .wt-test-view-nav')) return;
      const nav = createViewNavigation(id);
      if (placement.classList.contains('wt-test-landing__copy')) {
        const meta = placement.querySelector('.wt-test-meta');
        meta?.after(nav);
      } else {
        placement.prepend(nav);
      }
    });
    syncViewNavigation(config);
  }

  function currentViewFromDom(config) {
    const visibleHistory = [...document.querySelectorAll(HISTORY_SELECTORS)].find(isVisible);
    if (visibleHistory) return 'history';
    const visibleGallery = [...document.querySelectorAll(GALLERY_SELECTORS)].find(isVisible);
    if (visibleGallery) return 'atlas';
    const visibleResult = [...document.querySelectorAll(RESULT_SELECTORS)].find(isVisible);
    if (visibleResult) return 'result';
    const visibleLanding = [...document.querySelectorAll(config.landing)].find(isVisible);
    if (visibleLanding) return 'home';
    const visibleQuiz = [...document.querySelectorAll(QUIZ_SELECTORS)].find(isVisible);
    if (visibleQuiz) return 'quiz';
    return activeView;
  }

  function syncViewNavigation(config) {
    const nextView = currentViewFromDom(config);
    if (nextView !== activeView) {
      activeView = nextView;
      const stage = nextView === 'history'
        ? [...document.querySelectorAll(HISTORY_SELECTORS)].find(isVisible)
        : nextView === 'atlas'
          ? [...document.querySelectorAll(GALLERY_SELECTORS)].find(isVisible)
          : nextView === 'result'
            ? [...document.querySelectorAll(RESULT_SELECTORS)].find(isVisible)
            : null;
      if (stage) {
        stage.classList.remove('is-wt-view-entering');
        window.requestAnimationFrame(() => stage.classList.add('is-wt-view-entering'));
      }
    }
    document.querySelectorAll('.wt-test-view-nav__item').forEach((button) => {
      const selected = button.dataset.wtView === activeView;
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function setViewUrl(view, push) {
    if (!['home', 'atlas', 'history', 'result'].includes(view)) return;
    const url = new URL(window.location.href);
    if (view === 'home') url.searchParams.delete('view');
    else url.searchParams.set('view', view);
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current) return;
    window.history[push ? 'pushState' : 'replaceState']({ wtView: view }, '', next);
  }

  function showHome(id) {
    if (id === 'mbti' && typeof window.showTab === 'function') {
      window.showTab('test');
      const intro = document.querySelector('#intro-section');
      const content = document.querySelector('#test-content');
      const result = document.querySelector('#result');
      if (intro) intro.style.display = 'block';
      if (content) content.style.display = 'none';
      if (result) result.style.display = 'none';
      return;
    }
    if (typeof window.backToLanding === 'function') window.backToLanding();
    else if (typeof window.backToHome === 'function') window.backToHome();
    else if (typeof window.backFromEncyclopedia === 'function') window.backFromEncyclopedia();
    else if (id === 'tarot') document.querySelector('#btn-back-home')?.click();
  }

  function showAtlas(id) {
    if (id === 'mbti' && typeof window.showTab === 'function') window.showTab('encyclopedia');
    else if (typeof window.showEncyclopedia === 'function') window.showEncyclopedia();
  }

  function showHistoryView(id) {
    if (typeof window.showHistory === 'function') window.showHistory();
    else if (id === 'mbti' && typeof window.showTab === 'function') window.showTab('history');
    else document.querySelector('#btn-domain-history, #btn-view-history')?.click();
  }

  function navigateToView(view, options = {}) {
    const id = pathTestId();
    restoringHistory = options.push === false;
    if (view === 'home') showHome(id);
    else if (view === 'atlas') showAtlas(id);
    else if (view === 'history') showHistoryView(id);
    if (options.push) setViewUrl(view, true);
    window.setTimeout(() => {
      restoringHistory = false;
      const config = TESTS[id];
      if (config) syncViewNavigation(config);
    }, 0);
  }

  function trackLegacyViewActions(config) {
    document.addEventListener('click', (event) => {
      if (event.target.closest('.wt-test-view-nav')) return;
      const control = event.target.closest('button, a');
      if (!control) return;
      const signature = `${control.getAttribute('onclick') || ''} ${control.id || ''} ${control.textContent || ''}`;
      let intended = '';
      if (/showHistory|历史记录|查看历史/.test(signature)) intended = 'history';
      else if (/showEncyclopedia|showTab\(['"]encyclopedia|图鉴|牌典/.test(signature)) intended = 'atlas';
      else if (/backToLanding|backFromEncyclopedia|测试主页|返回首页/.test(signature)) intended = 'home';
      if (!intended) return;
      lastViewTrigger = control;
      window.setTimeout(() => {
        syncViewNavigation(config);
        if (!restoringHistory && activeView === intended) setViewUrl(intended, true);
      }, 0);
    }, true);
  }

  function openRequestedView() {
    const view = new URLSearchParams(window.location.search).get('view');
    if (!['home', 'atlas', 'history'].includes(view)) return;
    window.setTimeout(() => {
      navigateToView(view, { push: false });
    }, 0);
  }

  function watch(config, id) {
    let scheduled = false;
    const scan = () => {
      scheduled = false;
      enhanceLanding(id, config, document);
      markPageRegions();
      enhanceNavigators(document);
      enhanceViewNavigation(id, config);
      enhancePseudoButtons(document);
      cleanStructuralEmoji(document);
      updateMbtiOverview();
      updateTarotFlow();
      syncViewNavigation(config);
      window.setTimeout(syncChartTheme, 80);
    };
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(scan);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }

  function init() {
    const id = pathTestId();
    const config = TESTS[id];
    if (!config) return;
    document.body.classList.add('wt-shell-v3');
    document.body.dataset.wtTestId = id;
    enhanceSkipLink();
    enhanceNavigation(config);
    enhanceLanding(id, config, document);
    markPageRegions();
    enhanceNavigators(document);
    enhanceViewNavigation(id, config);
    enhanceMbtiProgress();
    updateMbtiOverview();
    enhanceTarotFlow();
    enhancePseudoButtons(document);
    cleanStructuralEmoji(document);
    resetOnStartActions();
    trackLegacyViewActions(config);
    watch(config, id);
    openRequestedView();
    window.addEventListener('popstate', () => {
      const view = new URLSearchParams(window.location.search).get('view') || 'home';
      navigateToView(view, { push: false });
    });
    window.addEventListener('wtest:themechange', () => window.setTimeout(syncChartTheme, 60));
    window.addEventListener('resize', syncChartTheme, { passive: true });
    window.setTimeout(syncChartTheme, 180);
  }

  window.WTestShell = Object.assign(window.WTestShell || {}, {
    confirmAction,
    emptyStateVisual: svgEmptyState,
    navigateToView,
    openDrawer,
    renderHistoryList,
    showToast,
    syncView: () => {
      const config = TESTS[pathTestId()];
      if (config) syncViewNavigation(config);
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
