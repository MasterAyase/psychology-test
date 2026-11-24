(function () {
  const app = document.getElementById('app');
  const tests = window.PT_TESTS;
  const byId = Object.fromEntries(tests.map((t) => [t.id, t]));
  const STORE_KEY = 'pt_history_v1';
  const MAX_RECORDS = 50;
  const SCALE = ['非常不同意', '不同意', '说不清', '同意', '非常同意'];
  const DOT = [22, 18, 14, 18, 22];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // 每个维度的得分换算为 0–100
  function dimPercent(items, answers) {
    const sum = {};
    const cnt = {};
    items.forEach((it, i) => {
      const v = it.k === 1 ? answers[i] : 6 - answers[i];
      sum[it.d] = (sum[it.d] || 0) + v;
      cnt[it.d] = (cnt[it.d] || 0) + 1;
    });
    const out = {};
    Object.keys(sum).forEach((d) => {
      out[d] = ((sum[d] - cnt[d]) / (4 * cnt[d])) * 100;
    });
    return out;
  }

  window.PT = { dimPercent };

  /* ---------- 本地记录 ---------- */
  function loadRecords() {
    try {
      const list = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(list) ? list.filter((r) => r && byId[r.test]) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecords(list) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, MAX_RECORDS)));
    } catch (e) {
      // 隐私模式等情况下无法写入，结果仍可在本次会话中查看
    }
  }

  function addRecord(rec) {
    rec.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    rec.ts = Date.now();
    const list = loadRecords();
    list.unshift(rec);
    saveRecords(list);
    session[rec.id] = rec;
    return rec.id;
  }

  // 写入失败时仍能查看刚生成的结果
  const session = {};

  function findRecord(id) {
    return session[id] || loadRecords().find((r) => r.id === id);
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function summarize(rec) {
    const t = byId[rec.test];
    if (t.kind === 'tarot') {
      return t.spreads[rec.spread].name + '：' + rec.cards.map((c) => t.cards[c.i][1] + (c.rev ? '（逆）' : '')).join('、');
    }
    const r = t.score(rec.answers);
    return (r.code ? r.code + ' · ' : '') + r.title;
  }

  /* ---------- 页面 ---------- */
  function renderHome() {
    const rows = tests.map((t, i) => `
      <li class="test-row">
        <span class="test-row__num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h2>${esc(t.name)}</h2>
          <p>${esc(t.short)}</p>
          <div class="test-row__meta">
            <span>${t.kind === 'tarot' ? '抽牌' : t.items.length + ' 题'}</span>
            <span>约 ${t.minutes} 分钟</span>
            <span class="tag">${esc(t.basis)}</span>
          </div>
        </div>
        <a class="btn" href="#/test/${t.id}">开始</a>
      </li>`).join('');
    return `
      <section class="hero">
        <h1>花几分钟，<em>换个角度</em>认识自己</h1>
        <p>这里的测评免费、无需注册，答案和结果只保存在你自己的浏览器里。</p>
      </section>
      <ul class="test-list">${rows}</ul>`;
  }

  function renderIntro(t) {
    const paras = t.intro.map((p) => `<p>${esc(p)}</p>`).join('');
    if (t.kind === 'tarot') {
      const spreads = Object.entries(t.spreads).map(([id, s]) => `
        <a class="spread-btn" href="#/tarot/${id}" style="text-decoration:none">
          <strong>${esc(s.name)}</strong>
          <span class="muted">${esc(s.desc)}</span>
        </a>`).join('');
      return `<section class="intro"><h1>${esc(t.name)}</h1>${paras}<div class="spreads">${spreads}</div>
        <p class="notice">塔罗结果仅供娱乐和自我反思，请不要依据它做重大决定。</p></section>`;
    }
    return `
      <section class="intro">
        <h1>${esc(t.name)}</h1>
        ${paras}
        <div class="intro__facts">
          <div><strong>${t.items.length}</strong>道题</div>
          <div><strong>${t.minutes}</strong>分钟左右</div>
          <div><strong>5</strong>级选项</div>
        </div>
        <p class="muted">依据：${esc(t.basis)}</p>
        <div class="actions">
          <a class="btn" href="#/run/${t.id}">开始答题</a>
          <a class="btn btn--ghost" href="#/">返回</a>
        </div>
        <p class="notice">本测评用于自我了解，不能作为心理诊断依据。如果你正在经历持续的情绪困扰，请联系专业人士。</p>
      </section>`;
  }
  /* ---------- 答题 ---------- */
  let quiz = null;

  function startQuiz(t) {
    quiz = { test: t, idx: 0, answers: new Array(t.items.length).fill(null) };
    drawQuiz();
  }

  function drawQuiz() {
    const { test: t, idx, answers } = quiz;
    const total = t.items.length;
    const done = answers.filter((a) => a !== null).length;
    const isLast = idx === total - 1;
    const choices = SCALE.map((label, i) => `
      <button type="button" data-v="${i + 1}" style="--dot:${DOT[i]}px"
        class="${answers[idx] === i + 1 ? 'is-picked' : ''}" aria-pressed="${answers[idx] === i + 1}">${label}</button>`).join('');
    app.innerHTML = `
      <section class="quiz">
        <div class="quiz__top">
          <span>${esc(t.name)}</span>
          <span>${idx + 1} / ${total}</span>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
          <div class="progress__bar" style="width:${(done / total) * 100}%"></div>
        </div>
        <h1 class="quiz__q" id="q">${esc(t.items[idx].t)}</h1>
        <div class="scale" role="group" aria-labelledby="q">${choices}</div>
        <div class="quiz__nav">
          <button type="button" class="btn btn--ghost btn--small" data-act="prev" ${idx === 0 ? 'disabled' : ''}>上一题</button>
          ${isLast
            ? `<button type="button" class="btn" data-act="finish" ${done < total ? 'disabled' : ''}>查看结果</button>`
            : `<button type="button" class="btn btn--ghost btn--small" data-act="next" ${answers[idx] === null ? 'disabled' : ''}>下一题</button>`}
        </div>
        <p class="muted" style="font-size:13px;margin-top:20px">提示：可以用键盘 1–5 选择，← → 切换题目。</p>
      </section>`;
  }

  function answer(v) {
    quiz.answers[quiz.idx] = v;
    if (quiz.idx < quiz.test.items.length - 1) {
      quiz.idx += 1;
    } else {
      // 最后一题答完后，跳回第一道漏答的题
      const missing = quiz.answers.indexOf(null);
      if (missing !== -1) quiz.idx = missing;
    }
    drawQuiz();
  }

  function finishQuiz() {
    if (quiz.answers.includes(null)) return;
    const id = addRecord({ test: quiz.test.id, answers: quiz.answers });
    quiz = null;
    location.replace('#/result/' + id);
  }

  app.addEventListener('click', (e) => {
    if (!quiz) return;
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.v) answer(Number(btn.dataset.v));
    else if (btn.dataset.act === 'prev' && quiz.idx > 0) { quiz.idx -= 1; drawQuiz(); }
    else if (btn.dataset.act === 'next') { quiz.idx += 1; drawQuiz(); }
    else if (btn.dataset.act === 'finish') finishQuiz();
  });

  document.addEventListener('keydown', (e) => {
    if (!quiz || e.altKey || e.ctrlKey || e.metaKey) return;
    const last = quiz.test.items.length - 1;
    if (e.key >= '1' && e.key <= '5') answer(Number(e.key));
    else if (e.key === 'ArrowLeft' && quiz.idx > 0) { quiz.idx -= 1; drawQuiz(); }
    else if (e.key === 'ArrowRight' && quiz.idx < last && quiz.answers[quiz.idx] !== null) { quiz.idx += 1; drawQuiz(); }
  });
  /* ---------- 结果 ---------- */
  function renderBar(b) {
    const v = Math.round(b.value);
    if (b.split) {
      return `<div class="bar bar--split">
        <div class="bar__label"><strong>${esc(b.label)} ${v}%</strong><strong>${100 - v}% ${esc(b.right)}</strong></div>
        <div class="bar__track"><div class="bar__fill" style="width:${v}%"></div></div>
      </div>`;
    }
    return `<div class="bar">
      <div class="bar__label"><strong>${esc(b.label)}</strong><span>${v}</span></div>
      <div class="bar__track"><div class="bar__fill" style="width:${v}%"></div></div>
      ${b.note ? `<p class="bar__note">${esc(b.note)}</p>` : ''}
    </div>`;
  }

  function resultActions(t) {
    return `<div class="actions">
      <a class="btn" href="#/test/${t.id}">再测一次</a>
      <a class="btn btn--ghost" href="#/history">我的记录</a>
      <a class="btn btn--ghost" href="#/">看看其他测试</a>
    </div>`;
  }

  function renderResult(rec) {
    const t = byId[rec.test];
    if (t.kind === 'tarot') return renderReading(t, rec);
    const r = t.score(rec.answers);
    const sections = r.sections.map((s) => `<div class="panel section"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('');
    return `
      <section class="result">
        <div class="result__head">
          <p class="muted">${esc(t.name)} · ${formatDate(rec.ts)}</p>
          ${r.code ? `<div class="result__code">${esc(r.code)}</div>` : ''}
          <h1>${esc(r.title)}</h1>
          <p>${esc(r.summary)}</p>
        </div>
        <div class="result__grid">
          <div class="panel"><div class="bars">${r.bars.map(renderBar).join('')}</div></div>
          ${sections}
        </div>
        ${resultActions(t)}
      </section>`;
  }

  function renderCard(t, c, pos) {
    const [num, name, symbol] = t.cards[c.i];
    return `<div class="card">
      <div class="card__pos">${esc(pos)}</div>
      <div class="card__face ${c.rev ? 'card__face--rev' : ''}">
        <span class="card__num">${num}</span>
        <span class="card__symbol" aria-hidden="true">${symbol}</span>
        <span class="card__name">${esc(name)}</span>
      </div>
      <div class="card__dir">${c.rev ? '逆位' : '正位'}</div>
    </div>`;
  }

  function renderReading(t, rec) {
    const spread = t.spreads[rec.spread];
    const cards = rec.cards.map((c, i) => renderCard(t, c, spread.positions[i])).join('');
    const texts = rec.cards.map((c, i) => {
      const card = t.cards[c.i];
      return `<div class="panel section">
        <h3>${esc(spread.positions[i])}：${esc(card[1])}（${c.rev ? '逆位' : '正位'}）</h3>
        <p>${esc(c.rev ? card[4] : card[3])}</p>
      </div>`;
    }).join('');
    return `
      <section class="result">
        <div class="result__head">
          <p class="muted">${esc(t.name)} · ${formatDate(rec.ts)}</p>
          <h1>${esc(spread.name)}</h1>
          <p>${esc(spread.desc)}</p>
        </div>
        <div class="cards">${cards}</div>
        <div class="reading">${texts}</div>
        <p class="notice">塔罗结果仅供娱乐和自我反思。</p>
        ${resultActions(t)}
      </section>`;
  }
  /* ---------- 记录与关于 ---------- */
  function renderHistory() {
    const list = loadRecords();
    if (!list.length) {
      return `<section class="intro"><h1>我的记录</h1>
        <div class="empty"><p>还没有记录。完成一个测试后，结果会保存在这里。</p><a class="btn" href="#/">去做测试</a></div></section>`;
    }
    const items = list.map((r) => `
      <li class="history-item">
        <a href="#/result/${esc(r.id)}">
          <strong>${esc(byId[r.test].name)}</strong>
          <div>${esc(summarize(r))}</div>
          <div class="muted">${formatDate(r.ts)}</div>
        </a>
        <button type="button" class="btn btn--ghost btn--small" data-del="${esc(r.id)}">删除</button>
      </li>`).join('');
    return `<section class="intro" style="max-width:none">
      <h1>我的记录</h1>
      <p class="muted">共 ${list.length} 条，只保存在当前浏览器中，最多保留 ${MAX_RECORDS} 条。</p>
      <ul class="history-list">${items}</ul>
      <div class="actions"><button type="button" class="btn btn--ghost btn--small" data-clear>清空全部记录</button></div>
    </section>`;
  }

  app.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      saveRecords(loadRecords().filter((r) => r.id !== del.dataset.del));
      delete session[del.dataset.del];
      route();
    } else if (e.target.closest('[data-clear]') && confirm('确定清空全部记录吗？此操作无法撤销。')) {
      saveRecords([]);
      Object.keys(session).forEach((k) => delete session[k]);
      route();
    }
  });

  function renderAbout() {
    return `<section class="intro">
      <h1>关于</h1>
      <p>Psychology Test 是一个个人制作的在线心理测评网站，所有测试免费，无需注册。</p>
      <h2 style="font-size:20px;margin-top:28px">隐私</h2>
      <p>网站没有后台服务器，你的答案和结果只存储在当前浏览器的本地存储中。清除浏览器数据或点击"清空全部记录"即可删除。</p>
      <h2 style="font-size:20px;margin-top:28px">题目来源</h2>
      <p>大五人格测试的题目改编自 IPIP（International Personality Item Pool）大五因素标记，IPIP 题库属于公共领域。其余测试的题目、类型描述和塔罗解读均为本站原创。</p>
      <h2 style="font-size:20px;margin-top:28px">免责声明</h2>
      <p>所有结果仅用于自我了解和娱乐，不构成心理诊断或专业建议。如果你感到持续的情绪困扰，请寻求专业心理咨询师或医生的帮助。</p>
    </section>`;
  }

  function renderNotFound(msg) {
    return `<section class="intro"><h1>找不到页面</h1><p class="muted">${esc(msg)}</p>
      <div class="actions"><a class="btn" href="#/">回到首页</a></div></section>`;
  }

  /* ---------- 路由 ---------- */
  function setNav(name) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      a.classList.toggle('is-active', a.dataset.nav === name);
    });
  }

  function route() {
    const [, page = '', arg = ''] = location.hash.replace(/^#/, '').split('/');
    const t = byId[arg];
    let title = '';
    quiz = null;
    window.scrollTo(0, 0);

    if (page === 'run' && t && t.kind === 'likert') {
      setNav('home');
      document.title = t.name + ' · Psychology Test';
      startQuiz(t);
      app.focus({ preventScroll: true });
      return;
    }

    if (page === 'tarot' && byId.tarot.spreads[arg]) {
      const id = addRecord({ test: 'tarot', spread: arg, cards: byId.tarot.draw(arg) });
      location.replace('#/result/' + id);
      return;
    }

    let html;
    let nav = 'home';
    if (!page) {
      html = renderHome();
    } else if (page === 'test' && t) {
      html = renderIntro(t);
      title = t.name;
    } else if (page === 'result') {
      const rec = findRecord(arg);
      html = rec ? renderResult(rec) : renderNotFound('这条记录不存在，可能已被删除。');
      if (rec) title = byId[rec.test].name + '结果';
    } else if (page === 'history') {
      html = renderHistory();
      nav = 'history';
      title = '我的记录';
    } else if (page === 'about') {
      html = renderAbout();
      nav = 'about';
      title = '关于';
    } else {
      html = renderNotFound('你访问的地址不存在。');
    }
    setNav(nav);
    document.title = title ? title + ' · Psychology Test' : 'Psychology Test · 心理测试';
    app.innerHTML = html;
    app.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', route);
  route();
})();
