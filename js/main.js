(function () {
  'use strict';

  const tests = Array.isArray(window.TESTS) ? window.TESTS : [];
  const goals = ['全部', '认识性格', '亲密关系', '成长状态', '文化与原型', '轻松玩玩'];
  const state = {
    goal: '全部',
    query: '',
    recommendationStep: 0,
    recommendation: { goal: '', time: '', tone: '' }
  };
  let isNavigating = false;

  const elements = {};

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  }

  function cacheElements() {
    elements.atlasNodes = document.getElementById('atlasNodes');
    elements.goalFilter = document.getElementById('goalFilter');
    elements.testGrid = document.getElementById('testGrid');
    elements.testSearch = document.getElementById('testSearch');
    elements.resultSummary = document.getElementById('resultSummary');
    elements.resetFilters = document.getElementById('resetFilters');
    elements.recentRecords = document.getElementById('recentRecords');
    elements.dialog = document.getElementById('recommendationDialog');
    elements.dialogContent = document.getElementById('recommendationContent');
    elements.dialogFooter = document.getElementById('recommendationFooter');
    elements.dialogProgress = document.getElementById('recommendationProgress');
  }

  function renderAtlas() {
    if (!elements.atlasNodes) return;
    elements.atlasNodes.innerHTML = tests.map((test) => {
      const position = test.atlas || { x: 50, y: 50 };
      return `
        <a class="atlas-node"
           href="${escapeHtml(test.path)}"
           style="--node-x:${Number(position.x)}%;--node-y:${Number(position.y)}%;--node-color:${escapeHtml(test.color)}"
           aria-label="${escapeHtml(test.name)}，${test.questions} 题，约 ${test.duration} 分钟">
          <span>${escapeHtml(test.name.replace('测试', ''))}</span>
          <span class="atlas-node__meta" aria-hidden="true">${test.questions} 题 · 约 ${test.duration} 分钟<br>${escapeHtml(test.resultPromise)}</span>
        </a>`;
    }).join('');
  }

  function renderGoalFilters() {
    if (!elements.goalFilter) return;
    const availableGoals = goals.filter((goal) => goal === '全部' || tests.some((test) => test.goals?.includes(goal)));
    elements.goalFilter.innerHTML = availableGoals.map((goal) => `
      <button class="wt-chip"
              type="button"
              data-goal="${escapeHtml(goal)}"
              aria-pressed="${String(state.goal === goal)}">
        ${escapeHtml(goal)}
      </button>`).join('');
  }

  function getVisibleTests() {
    const query = state.query.trim().toLocaleLowerCase('zh-CN');
    return tests.filter((test) => {
      const matchesGoal = state.goal === '全部' || test.goals?.includes(state.goal);
      const haystack = [
        test.name,
        test.description,
        test.resultPromise,
        test.evidence,
        ...(test.tags || []),
        ...(test.goals || [])
      ].join(' ').toLocaleLowerCase('zh-CN');
      return matchesGoal && (!query || haystack.includes(query));
    });
  }

  function renderTestCards() {
    if (!elements.testGrid) return;
    const visibleTests = getVisibleTests();

    elements.resultSummary.textContent = state.goal === '全部' && !state.query
      ? `共 ${visibleTests.length} 项探索`
      : `找到 ${visibleTests.length} 项符合当前条件的探索`;
    elements.resetFilters.hidden = state.goal === '全部' && !state.query;

    if (!visibleTests.length) {
      elements.testGrid.innerHTML = `
        <div class="wt-empty-state wt-surface-card" style="grid-column:1 / -1">
          <h3>没有找到对应测试</h3>
          <p>换一个目标或搜索词，再看看其他探索方向。</p>
          <button class="wt-button wt-button--secondary" type="button" data-reset-filters>查看全部测试</button>
        </div>`;
      elements.testGrid.querySelector('[data-reset-filters]')?.addEventListener('click', resetFilters);
      return;
    }

    elements.testGrid.innerHTML = visibleTests.map((test) => `
      <a class="test-card"
         href="${escapeHtml(test.path)}"
         style="--test-color:${escapeHtml(test.color)}"
         aria-label="开始${escapeHtml(test.name)}，${test.questions}题，约${test.duration}分钟">
        <div class="test-card__top">
          <span class="test-card__icon" aria-hidden="true">${test.icon}</span>
          <span class="test-card__reason">${escapeHtml(test.featuredReason || test.recommendedFor || '')}</span>
        </div>
        <h3>${escapeHtml(test.name)}</h3>
        <p class="test-card__promise">${escapeHtml(test.resultPromise || test.description)}</p>
        <p class="test-card__evidence">${escapeHtml(test.evidence || '趣味探索')}</p>
        <div class="test-card__meta">
          <span>${test.questions} 题</span>
          <span>约 ${test.duration} 分钟</span>
        </div>
        <div class="test-card__footer">
          <span>开始测试</span>
          <span aria-hidden="true">→</span>
        </div>
      </a>`).join('');
  }

  function renderRecentRecords() {
    if (!elements.recentRecords) return;
    const records = window.WTestHistory?.getRecent(tests, 3) || [];

    if (!records.length) {
      const firstChoice = tests.find((test) => test.id === 'animal') || tests[0];
      elements.recentRecords.innerHTML = `
        <div class="records-empty">
          <h3>这里会留下你的探索轨迹</h3>
          <p>完成任意测试后，最近结果会出现在这里。数据只保存在当前浏览器中。</p>
          ${firstChoice ? `<a class="wt-button wt-button--primary" href="${escapeHtml(firstChoice.path)}">开始第一次探索</a>` : ''}
        </div>`;
      return;
    }

    elements.recentRecords.innerHTML = records.map((record) => `
      <a class="record-card" href="${escapeHtml(record.detailPath)}" style="--record-color:${escapeHtml(record.color)}">
        <span class="record-card__icon" aria-hidden="true">${record.icon}</span>
        <span>
          <h3>${escapeHtml(record.testName)}</h3>
          <p>${escapeHtml(record.resultCode ? `${record.resultCode} · ${record.resultLabel}` : record.resultLabel)}</p>
        </span>
        <time datetime="${record.timestamp ? new Date(record.timestamp).toISOString() : ''}">${escapeHtml(window.WTestHistory.formatDate(record.timestamp))}</time>
      </a>`).join('');
  }

  function resetFilters() {
    state.goal = '全部';
    state.query = '';
    if (elements.testSearch) elements.testSearch.value = '';
    renderGoalFilters();
    renderTestCards();
  }

  function setupFilters() {
    elements.goalFilter?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-goal]');
      if (!button) return;
      state.goal = button.dataset.goal;
      renderGoalFilters();
      renderTestCards();
    });

    elements.testSearch?.addEventListener('input', (event) => {
      state.query = event.target.value;
      renderTestCards();
    });

    elements.resetFilters?.addEventListener('click', resetFilters);
  }

  const recommendationSteps = [
    {
      key: 'goal',
      question: '你此刻最想了解什么？',
      options: [
        ['认识性格', '理解自己的思考和行为方式'],
        ['亲密关系', '看见依恋、表达与相处模式'],
        ['成长状态', '复盘情绪、责任与发展阶段'],
        ['文化与原型', '从人物、动物或象征理解自己'],
        ['轻松玩玩', '快速获得一个有趣的新视角']
      ]
    },
    {
      key: 'time',
      question: '你想投入多长时间？',
      options: [
        ['quick', '5 分钟以内', '适合快速体验'],
        ['medium', '大约 5–8 分钟', '在速度和深度之间平衡'],
        ['deep', '10 分钟左右', '愿意完成更深入的测评']
      ]
    },
    {
      key: 'tone',
      question: '你偏好哪种探索方式？',
      options: [
        ['scientific', '更偏科学', '重视量表、理论和维度分析'],
        ['playful', '更偏趣味', '重视故事、原型和直觉体验'],
        ['either', '都可以', '只要适合当前问题即可']
      ]
    }
  ];

  function renderRecommendationStep() {
    const step = recommendationSteps[state.recommendationStep];
    const selectedValue = state.recommendation[step.key];
    elements.dialogProgress.textContent = `${state.recommendationStep + 1} / ${recommendationSteps.length}`;
    elements.dialogContent.innerHTML = `
      <h3 class="recommendation-question">${escapeHtml(step.question)}</h3>
      <div class="recommendation-options">
        ${step.options.map((option) => `
          <button class="recommendation-option"
                  type="button"
                  data-recommendation-value="${escapeHtml(option[0])}"
                  aria-pressed="${String(selectedValue === option[0])}">
            <strong>${escapeHtml(option[1] || option[0])}</strong>
            <span>${escapeHtml(option[2] || '')}</span>
          </button>`).join('')}
      </div>`;

    elements.dialogFooter.innerHTML = `
      <button class="wt-button wt-button--quiet" type="button" data-recommendation-back ${state.recommendationStep === 0 ? 'disabled' : ''}>上一步</button>
      <button class="wt-button wt-button--primary" type="button" data-recommendation-next ${selectedValue ? '' : 'disabled'}>${state.recommendationStep === recommendationSteps.length - 1 ? '查看推荐' : '下一步'}</button>`;

    elements.dialogContent.querySelectorAll('[data-recommendation-value]').forEach((button) => {
      button.addEventListener('click', () => {
        state.recommendation[step.key] = button.dataset.recommendationValue;
        renderRecommendationStep();
      });
    });
    elements.dialogFooter.querySelector('[data-recommendation-back]')?.addEventListener('click', () => {
      state.recommendationStep = Math.max(0, state.recommendationStep - 1);
      renderRecommendationStep();
    });
    elements.dialogFooter.querySelector('[data-recommendation-next]')?.addEventListener('click', () => {
      if (state.recommendationStep < recommendationSteps.length - 1) {
        state.recommendationStep += 1;
        renderRecommendationStep();
      } else {
        renderRecommendationResults();
      }
    });
  }

  function scoreTests() {
    return tests.map((test) => {
      let score = test.featured ? 0.25 : 0;
      const reasons = [];

      if (test.goals?.includes(state.recommendation.goal)) {
        score += 5;
        reasons.push(`适合“${state.recommendation.goal}”`);
      }

      if (test.depth === state.recommendation.time) {
        score += 2;
        reasons.push(`符合你的时间预期`);
      } else if (state.recommendation.time === 'medium' && ['quick', 'deep'].includes(test.depth)) {
        score += 0.5;
      }

      if (state.recommendation.tone === 'either' || test.tone === state.recommendation.tone) {
        score += state.recommendation.tone === 'either' ? 0.5 : 2;
        if (state.recommendation.tone !== 'either') reasons.push(test.tone === 'scientific' ? '偏重理论与量表' : '偏重趣味与象征');
      } else if (test.tone === 'balanced') {
        score += 1;
      }

      return { test, score, reasons };
    }).sort((a, b) => b.score - a.score || a.test.duration - b.test.duration);
  }

  function renderRecommendationResults() {
    const results = scoreTests().slice(0, 3);
    elements.dialogProgress.textContent = '推荐完成';
    elements.dialogContent.innerHTML = `
      <h3 class="recommendation-question">根据你的选择，先从这里开始</h3>
      <div class="recommendation-results">
        ${results.map((result, index) => `
          <a class="recommendation-result" href="${escapeHtml(result.test.path)}">
            <span class="recommendation-result__icon" aria-hidden="true">${result.test.icon}</span>
            <span>
              <h3>${escapeHtml(result.test.name)}</h3>
              <p>${escapeHtml(result.reasons.join(' · ') || result.test.featuredReason)}</p>
            </span>
            <span class="recommendation-result__rank">${index === 0 ? '最推荐' : `备选 ${index}`}</span>
          </a>`).join('')}
      </div>`;
    elements.dialogFooter.innerHTML = `
      <button class="wt-button wt-button--quiet" type="button" data-recommendation-restart>重新选择</button>
      <button class="wt-button wt-button--secondary" type="button" data-recommendation-close>稍后再说</button>`;
    elements.dialogFooter.querySelector('[data-recommendation-restart]')?.addEventListener('click', () => {
      state.recommendationStep = 0;
      state.recommendation = { goal: '', time: '', tone: '' };
      renderRecommendationStep();
    });
    elements.dialogFooter.querySelector('[data-recommendation-close]')?.addEventListener('click', closeRecommendation);
  }

  function openRecommendation() {
    state.recommendationStep = 0;
    state.recommendation = { goal: '', time: '', tone: '' };
    renderRecommendationStep();
    if (typeof elements.dialog.showModal === 'function') {
      elements.dialog.showModal();
    } else {
      elements.dialog.setAttribute('open', '');
    }
  }

  function closeRecommendation() {
    if (typeof elements.dialog.close === 'function') {
      elements.dialog.close();
    } else {
      elements.dialog.removeAttribute('open');
    }
  }

  function setupRecommendation() {
    document.getElementById('openRecommendation')?.addEventListener('click', openRecommendation);
    document.getElementById('closeRecommendation')?.addEventListener('click', closeRecommendation);
    elements.dialog?.addEventListener('click', (event) => {
      if (event.target === elements.dialog) closeRecommendation();
    });
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function waitForCriticalAssets() {
    const heroImage = document.querySelector('.atlas__art');
    const imageReady = !heroImage || heroImage.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
        heroImage.addEventListener('load', resolve, { once: true });
        heroImage.addEventListener('error', resolve, { once: true });
      });
    const fontsReady = document.fonts?.ready || Promise.resolve();

    return Promise.race([
      Promise.all([imageReady, fontsReady]),
      wait(1600)
    ]);
  }

  async function dismissSiteLoader() {
    const loader = document.getElementById('siteLoader');
    if (!loader) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const minimumDuration = window.matchMedia?.('(max-width: 640px)').matches ? 1350 : 1600;
    await Promise.all([waitForCriticalAssets(), wait(reduceMotion ? 0 : minimumDuration)]);
    loader.classList.add('is-hidden');
    document.body.removeAttribute('aria-busy');
    await wait(reduceMotion ? 0 : 570);
    loader.hidden = true;
  }

  async function navigateWithLoader(url) {
    const loader = document.getElementById('siteLoader');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!loader || reduceMotion) {
      window.location.assign(url);
      return;
    }

    loader.hidden = false;
    loader.classList.add('is-transitioning');
    document.body.setAttribute('aria-busy', 'true');
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    loader.classList.remove('is-hidden');
    await wait(480);
    window.location.assign(url);
  }

  function setupPageTransitions() {
    document.addEventListener('click', (event) => {
      if (isNavigating || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.dataset.loaderSkip === 'true') return;

      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#')) return;

      const destination = new URL(link.href, window.location.href);
      const isSamePage = destination.pathname === window.location.pathname && destination.search === window.location.search;
      if (destination.origin !== window.location.origin || isSamePage) return;

      event.preventDefault();
      isNavigating = true;
      navigateWithLoader(destination.href);
    });
  }

  function init() {
    cacheElements();
    window.WTestTheme?.bindControls();
    renderAtlas();
    renderGoalFilters();
    renderTestCards();
    renderRecentRecords();
    setupFilters();
    setupRecommendation();
    setupPageTransitions();
    dismissSiteLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
