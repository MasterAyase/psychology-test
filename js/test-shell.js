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
  const RESULT_SELECTORS = '#results, #results-section, .results-section';
  const HISTORY_SELECTORS = '#historyPage, #history-section, .history-page, .history-section';
  const GALLERY_SELECTORS = '#encyclopediaPage, #encyclopedia-section, .encyclopedia-page, .encyclopedia-section';
  const NAVIGATOR_SELECTORS = '.q-tabs-wrap, .question-tabs-wrap, .dot-grid, .question-nav-grid';
  let navigatorPreferenceOpen = false;

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
      <a class="wt-nav-back" href="../../index.html">${ICONS.back}<span>测试集合</span></a>
      <a class="wt-nav-brand" href="../../index.html" aria-label="W-Test 首页">
        <img src="../../favicon.png" alt="" width="28" height="28"><span>W-Test</span>
      </a>
      <span class="wt-nav-context" aria-current="page">${config.name}</span>
      <button type="button" class="wt-nav-theme" data-theme-toggle>${ICONS.sun}${ICONS.moon}</button>`;
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

  function openRequestedView() {
    if (new URLSearchParams(window.location.search).get('view') !== 'history') return;
    window.setTimeout(() => {
      if (typeof window.showHistory === 'function') window.showHistory();
      else if (typeof window.showTab === 'function') window.showTab('history');
      else document.querySelector('#btn-domain-history, #btn-view-history')?.click();
    }, 0);
  }

  function watch(config, id) {
    let scheduled = false;
    const scan = () => {
      scheduled = false;
      enhanceLanding(id, config, document);
      markPageRegions();
      enhanceNavigators(document);
      enhancePseudoButtons(document);
      cleanStructuralEmoji(document);
      updateMbtiOverview();
      updateTarotFlow();
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
    enhanceMbtiProgress();
    updateMbtiOverview();
    enhanceTarotFlow();
    enhancePseudoButtons(document);
    cleanStructuralEmoji(document);
    resetOnStartActions();
    watch(config, id);
    openRequestedView();
    window.addEventListener('wtest:themechange', () => window.setTimeout(syncChartTheme, 60));
    window.addEventListener('resize', syncChartTheme, { passive: true });
    window.setTimeout(syncChartTheme, 180);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
