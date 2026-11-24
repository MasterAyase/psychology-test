(function () {
  const app = document.getElementById('app');
  const tests = window.PT_TESTS;
  const byId = Object.fromEntries(tests.map((t) => [t.id, t]));
  const PAY = window.PT_PAY;
  const { esc, toast, modal, reveal } = window.FX;
  const STORE_KEY = 'pt_history_v1';
  const UNLOCK_KEY = 'pt_unlocked_v1';
  const MAX_RECORDS = 50;
  const SCALE = ['非常不同意', '不同意', '说不清', '同意', '非常同意'];
  const GLYPH = { 'big-five': 'V', types16: 'XVI', attachment: '♡', tarot: '☽' };
  const SITE_URL = location.host + location.pathname.replace(/index\.html$/, '');

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

  /* ---------- 本地存储 ---------- */
  function readJSON(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 隐私模式等情况下无法写入，结果仍可在本次会话中查看
    }
  }

  // 写入失败时仍能查看刚生成的结果
  const session = {};

  function loadRecords() {
    const list = readJSON(STORE_KEY, []);
    return Array.isArray(list) ? list.filter((r) => r && byId[r.test]) : [];
  }

  function saveRecords(list) {
    writeJSON(STORE_KEY, list.slice(0, MAX_RECORDS));
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

  function findRecord(id) {
    return session[id] || loadRecords().find((r) => r.id === id);
  }

  function isUnlocked(id) {
    return readJSON(UNLOCK_KEY, []).includes(id);
  }

  function markUnlocked(id) {
    const list = readJSON(UNLOCK_KEY, []);
    if (!list.includes(id)) list.push(id);
    writeJSON(UNLOCK_KEY, list);
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function cardName(t, c) {
    return t.cards[c.i][1] + (c.rev ? '·逆' : '');
  }

  function summarize(rec) {
    const t = byId[rec.test];
    if (t.kind === 'tarot') return t.spreads[rec.spread].name + '：' + rec.cards.map((c) => cardName(t, c)).join('、');
    const r = t.score(rec.answers);
    return (r.code ? r.code + ' · ' : '') + r.title;
  }

  const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* ---------- 首页 ---------- */
  function renderHome() {
    const tiles = tests.map((t, i) => `
      <a class="test-tile reveal" href="#/test/${t.id}" style="transition-delay:${i * 80}ms">
        <span class="test-tile__glyph" aria-hidden="true">${GLYPH[t.id] || ''}</span>
        <span class="test-tile__num">NO.${String(i + 1).padStart(2, '0')}</span>
        <h2>${esc(t.name)}</h2>
        <p>${esc(t.short)}</p>
        <div class="test-tile__meta">
          <span class="chip">${t.kind === 'tarot' ? '22 张牌' : t.items.length + ' 题'}</span>
          <span class="chip">约 ${t.minutes} 分钟</span>
          <span class="test-tile__go">${ARROW}</span>
        </div>
      </a>`).join('');
    const total = tests.reduce((n, t) => n + (t.items ? t.items.length : 0), 0);
    return `
      <section class="hero page-in">
        <svg class="hero__orb" viewBox="0 0 300 300" aria-hidden="true">
          <g class="spin"><circle cx="150" cy="150" r="140" stroke-dasharray="2 8"/><circle cx="150" cy="10" r="4" style="fill:var(--gold);stroke:none"/></g>
          <g class="spin spin--rev"><circle cx="150" cy="150" r="96"/><circle cx="246" cy="150" r="3" style="fill:var(--gold);stroke:none"/></g>
          <circle cx="150" cy="150" r="52" stroke-dasharray="1 5"/>
        </svg>
        <span class="eyebrow">Know yourself, gently</span>
        <h1>花几分钟<br><span class="gold-text">读懂此刻的自己</span></h1>
        <p>基于心理学研究设计的测评，答完即刻生成你的个人报告。无需注册，所有数据只留在你的设备上。</p>
        <div class="hero__stats">
          <div><strong>${tests.length}</strong><span>套测评</span></div>
          <div><strong>${total}</strong><span>道精选题目</span></div>
          <div><strong>0</strong><span>数据上传</span></div>
        </div>
      </section>
      <section class="tests">${tiles}</section>
      <section class="promise">
        <div class="reveal"><strong>有依据</strong><span>题目来自公开的心理学量表与理论模型，不靠玄学凑数。</span></div>
        <div class="reveal"><strong>看得懂</strong><span>用日常语言解释分数，告诉你它在生活里意味着什么。</span></div>
        <div class="reveal"><strong>重隐私</strong><span>没有账号、没有后台，答案和报告只保存在你的浏览器里。</span></div>
      </section>`;
  }

  // 卡片跟随鼠标的光斑
  app.addEventListener('pointermove', (e) => {
    const tile = e.target.closest('.test-tile');
    if (!tile) return;
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', e.clientX - r.left + 'px');
    tile.style.setProperty('--my', e.clientY - r.top + 'px');
  });

  /* ---------- 介绍页 ---------- */
  function renderIntro(t) {
    const paras = t.intro.map((p) => `<p>${esc(p)}</p>`).join('');
    if (t.kind === 'tarot') {
      const spreads = Object.entries(t.spreads).map(([id, s]) => `
        <a class="spread-btn" href="#/tarot/${id}">
          <em>${s.positions.length} 张牌</em>
          <strong>${esc(s.name)}</strong>
          <span>${esc(s.desc)}</span>
        </a>`).join('');
      return `<section class="intro page-in">
        <span class="eyebrow">Tarot · Major Arcana</span>
        <h1>${esc(t.name)}</h1>
        <div>${paras}</div>
        <div class="spreads">${spreads}</div>
        <p class="notice">塔罗结果仅供娱乐和自我反思，请不要依据它做重大决定。</p>
      </section>`;
    }
    return `
      <section class="intro page-in">
        <span class="eyebrow">${esc(t.basis)}</span>
        <h1>${esc(t.name)}</h1>
        <div>${paras}</div>
        <div class="facts">
          <div><strong>${t.items.length}</strong>道题</div>
          <div><strong>${t.minutes}′</strong>预计用时</div>
          <div><strong>¥${esc(PAY.price)}</strong>完整报告</div>
        </div>
        <div class="actions">
          <a class="btn" href="#/run/${t.id}">开始测评 ${ARROW}</a>
          <a class="btn btn--ghost" href="#/">返回</a>
        </div>
        <p class="notice">基础结果免费查看。本测评用于自我了解，不能作为心理诊断依据；如果你正在经历持续的情绪困扰，请联系专业人士。</p>
      </section>`;
  }
  /* ---------- 答题 ---------- */
  let quiz = null;

  function startQuiz(t) {
    quiz = { test: t, idx: 0, answers: new Array(t.items.length).fill(null), busy: false };
    app.innerHTML = `
      <section class="quiz page-in">
        <div class="quiz__top">
          <div class="quiz__count" aria-live="polite"></div>
          <div class="quiz__name">${esc(t.name)}</div>
        </div>
        <div class="progress"><div class="progress__bar"></div></div>
        <div class="quiz__stage"></div>
        <div class="quiz__nav">
          <button type="button" class="btn btn--ghost btn--small" data-act="prev">上一题</button>
          <span class="quiz__hint">键盘 1–5 作答 · ← 返回</span>
        </div>
      </section>`;
    paintQuestion();
  }

  function paintQuestion() {
    const { test: t, idx, answers } = quiz;
    const total = t.items.length;
    const done = answers.filter((a) => a !== null).length;
    app.querySelector('.quiz__count').innerHTML = `${String(idx + 1).padStart(2, '0')}<small> / ${total}</small>`;
    app.querySelector('.progress__bar').style.width = (done / total) * 100 + '%';
    app.querySelector('[data-act="prev"]').disabled = idx === 0;
    const opts = SCALE.map((label, i) => {
      const dots = [0, 1, 2, 3, 4].map((d) => `<i class="${d <= i ? 'on' : ''}"></i>`).join('');
      const picked = answers[idx] === i + 1;
      return `<button type="button" class="opt ${picked ? 'is-picked' : ''}" data-v="${i + 1}" aria-pressed="${picked}">
        <span class="opt__key">${i + 1}</span><span>${label}</span><span class="opt__dots" aria-hidden="true">${dots}</span></button>`;
    }).join('');
    app.querySelector('.quiz__stage').innerHTML = `
      <h1 class="quiz__q" id="q">${esc(t.items[idx].t)}</h1>
      <div class="scale" role="group" aria-labelledby="q">${opts}</div>`;
  }

  // 题目切换：先淡出，再从另一侧滑入
  function goTo(next, back) {
    const stage = app.querySelector('.quiz__stage');
    quiz.busy = true;
    stage.classList.remove('is-entering', 'is-back');
    stage.classList.add('is-leaving');
    setTimeout(() => {
      quiz.idx = next;
      paintQuestion();
      stage.classList.remove('is-leaving');
      stage.classList.toggle('is-back', !!back);
      void stage.offsetWidth;
      stage.classList.add('is-entering');
      quiz.busy = false;
    }, 260);
  }

  function answer(v, btn, e) {
    if (quiz.busy) return;
    quiz.answers[quiz.idx] = v;
    app.querySelectorAll('.opt').forEach((o) => {
      o.classList.toggle('is-picked', o === btn);
      o.setAttribute('aria-pressed', o === btn);
    });
    if (btn && e && e.clientX) {
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.left = e.clientX - r.left + 'px';
      rip.style.top = e.clientY - r.top + 'px';
      btn.appendChild(rip);
    }
    const total = quiz.test.items.length;
    app.querySelector('.progress__bar').style.width = (quiz.answers.filter((a) => a !== null).length / total) * 100 + '%';
    const missing = quiz.answers.indexOf(null);
    quiz.busy = true;
    setTimeout(() => {
      quiz.busy = false;
      if (missing === -1) finishQuiz();
      else goTo(quiz.idx < total - 1 ? quiz.idx + 1 : missing);
    }, 300);
  }

  function finishQuiz() {
    const id = addRecord({ test: quiz.test.id, answers: quiz.answers });
    quiz = null;
    showLoading('正在生成你的专属报告', () => location.replace('#/result/' + id));
  }

  function showLoading(text, done) {
    app.innerHTML = `<section class="loading"><div>
      <svg class="loading__ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="44"/><circle class="fg" cx="50" cy="50" r="44"/></svg>
      <p>${esc(text)}</p><small>分析维度 · 匹配解读 · 排版报告</small></div></section>`;
    setTimeout(done, matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 1700);
  }

  app.addEventListener('click', (e) => {
    if (!quiz) return;
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.v) answer(Number(btn.dataset.v), btn, e);
    else if (btn.dataset.act === 'prev' && quiz.idx > 0 && !quiz.busy) goTo(quiz.idx - 1, true);
  });

  document.addEventListener('keydown', (e) => {
    if (!quiz || e.altKey || e.ctrlKey || e.metaKey || document.querySelector('.modal')) return;
    if (e.key >= '1' && e.key <= '5') {
      answer(Number(e.key), app.querySelector(`.opt[data-v="${e.key}"]`));
    } else if (e.key === 'ArrowLeft' && quiz.idx > 0 && !quiz.busy) {
      goTo(quiz.idx - 1, true);
    }
  });
  /* ---------- 报告 ---------- */
  function renderBar(b) {
    const v = Math.round(b.value);
    if (b.split) {
      return `<div class="bar bar--split">
        <div class="bar__label"><strong>${esc(b.label)} <em>${v}%</em></strong><strong><em>${100 - v}%</em> ${esc(b.right)}</strong></div>
        <div class="bar__track"><div class="bar__fill" data-w="${v}"></div></div>
      </div>`;
    }
    return `<div class="bar">
      <div class="bar__label"><strong>${esc(b.label)}</strong><em>${v}</em></div>
      <div class="bar__track"><div class="bar__fill" data-w="${v}"></div></div>
      ${b.note ? `<p class="bar__note">${esc(b.note)}</p>` : ''}
    </div>`;
  }

  function sectionHTML(s) {
    const body = s.list ? `<ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(s.p)}</p>`;
    return `<div class="panel"><h3>${esc(s.h)}</h3>${body}</div>`;
  }

  function lockedHTML(rec, sections) {
    const open = isUnlocked(rec.id);
    const veil = open ? '' : `
      <div class="locked__veil"><div>
        <span class="eyebrow">Full report</span>
        <h3>解锁你的完整报告</h3>
        <p>${sections.map((s) => esc(s.h)).join(' · ')}</p>
        <div class="price gold-text"><small>¥</small>${esc(PAY.price)}</div>
        <button type="button" class="btn" data-unlock="${esc(rec.id)}">立即解锁</button>
      </div></div>`;
    return `<div class="locked reveal ${open ? '' : 'is-locked'}">
      ${open ? '<span class="chip chip--gold locked__badge">已解锁</span>' : ''}
      <div class="locked__content" ${open ? '' : 'aria-hidden="true"'}>${sections.map(sectionHTML).join('')}</div>
      ${veil}
    </div>`;
  }

  function heroHTML(t, rec, code, title, summary) {
    const letters = code ? `      <div class="report__code">${[...code].map((ch, i) => `<span style="animation-delay:${0.15 + i * 0.12}s">${esc(ch)}</span>`).join('')}</div>` : '';
    return `<div class="report__hero page-in">
      <span class="eyebrow">${esc(t.name)} · ${formatDate(rec.ts)}</span>
      ${letters}
      <h1>${esc(title)}</h1>
      <p>${esc(summary)}</p>
      <div class="actions">
        <button type="button" class="btn" data-poster="${esc(rec.id)}">生成分享海报</button>
        <a class="btn btn--ghost" href="#/test/${t.id}">再测一次</a>
      </div>
    </div>`;
  }

  function renderReport(rec) {
    const t = byId[rec.test];
    if (t.kind === 'tarot') return renderReading(t, rec);
    const r = t.score(rec.answers);
    let chart = '';
    if (r.chart === 'radar') chart = FX.radar(r.bars.map((b) => b.label), r.bars.map((b) => b.value));
    if (r.chart === 'quadrant') chart = FX.quadrant(r.bars[0].value, r.bars[1].value);
    const bars = `<div class="bars">${r.bars.map(renderBar).join('')}</div>`;
    const top = chart
      ? `<div class="panel reveal"><h3>你的轮廓</h3>${chart}</div><div class="panel reveal"><h3>维度得分<small>0–100</small></h3>${bars}</div>`
      : `<div class="panel panel--wide reveal"><h3>四组倾向</h3>${bars}</div>`;
    return `<section class="report">
      ${heroHTML(t, rec, r.code, r.title, r.summary)}
      <div class="report__grid">
        ${top}
        ${r.sections.map((s) => sectionHTML(s).replace('class="panel"', 'class="panel reveal"')).join('')}
      </div>
      ${lockedHTML(rec, r.locked)}
      <p class="notice">本报告仅供自我了解，不构成心理诊断或专业建议。</p>
    </section>`;
  }

  function faceHTML(t, c) {
    const [num, name, glyph] = t.cards[c.i];
    return `<div class="card-face ${c.rev ? 'is-rev' : ''}">
      <span class="card-face__num">${num}</span>
      <span class="card-face__glyph" aria-hidden="true">${glyph}&#xFE0E;</span>
      <span class="card-face__name">${esc(name)}</span>
    </div>`;
  }

  function renderReading(t, rec) {
    const spread = t.spreads[rec.spread];
    const free = rec.cards.map((c, i) => {
      const card = t.cards[c.i];
      return `<div class="panel reveal">
        <div class="mini">${faceHTML(t, c)}</div>
        <div><h3>${esc(spread.positions[i])} <small>${esc(card[1])} · ${c.rev ? '逆位' : '正位'}</small></h3>
        <p>${esc(c.rev ? card[4] : card[3])}</p></div>
      </div>`;
    }).join('');
    const revCount = rec.cards.filter((c) => c.rev).length;
    const overall = revCount > rec.cards.length / 2
      ? '逆位牌偏多，说明你当下面对的阻力更多来自内心的犹豫和消耗。先照顾好自己的状态，再推进事情。'
      : '正位牌占多数，整体能量是顺畅的。你已经具备向前走的条件，关键在于行动。';
    const locked = [
      { h: '行动建议', list: rec.cards.map((c, i) => spread.positions[i] + '：' + t.advice[c.i]) },
      { h: '整体能量', p: overall }
    ];
    const names = rec.cards.map((c) => t.cards[c.i][1]).join(' · ');
    return `<section class="report">
      ${heroHTML(t, rec, '', spread.name, names)}
      <div class="reading">${free}</div>
      ${lockedHTML(rec, locked)}
      <p class="notice">塔罗结果仅供娱乐和自我反思。</p>
    </section>`;
  }
  /* ---------- 塔罗抽牌 ---------- */
  let tarot = null;

  function startTarot(spreadId) {
    const t = byId.tarot;
    const spread = t.spreads[spreadId];
    tarot = { spreadId, deck: t.shuffle(), picks: [] };
    const n = tarot.deck.length;
    const cards = tarot.deck.map((_, i) => {
      const a = -42 + (84 * i) / (n - 1);
      const sx = Math.round(Math.sin(i * 12.9898) * 160);
      return `<button type="button" class="tcard" data-pick="${i}" aria-label="第 ${i + 1} 张牌"
        style="--i:${i};--fan:translate(-50%,0) rotate(${a}deg);--sx:${sx}px;--sr:${sx / 8}deg;z-index:${i}">
        <span class="card-back"></span></button>`;
    }).join('');
    const slots = spread.positions.map((p) => `<div class="slot"><div class="slot__frame">待抽取</div><div class="slot__name">${esc(p)}</div></div>`).join('');
    app.innerHTML = `<section class="table page-in">
      <span class="eyebrow">${esc(spread.name)}</span>
      <h1>静下心，想着你的问题</h1>
      <p class="table__tip" aria-live="polite">正在洗牌……</p>
      <div class="slots">${slots}</div>
      <div class="deck is-shuffling">${cards}</div>
      <div class="actions" style="justify-content:center" hidden><button type="button" class="btn" data-reading>查看解读 ${ARROW}</button></div>
    </section>`;
    setTimeout(() => {
      if (!tarot) return;
      app.querySelector('.deck').classList.remove('is-shuffling');
      app.querySelector('.table__tip').textContent = `凭直觉，从牌堆中选出 ${spread.positions.length} 张牌`;
    }, 1300);
  }

  function pickCard(btn) {
    const t = byId.tarot;
    const spread = t.spreads[tarot.spreadId];
    const need = spread.positions.length;
    if (tarot.picks.length >= need || app.querySelector('.deck.is-shuffling')) return;
    const card = tarot.deck[Number(btn.dataset.pick)];
    tarot.picks.push(card);
    btn.classList.add('is-taken');
    const frame = app.querySelectorAll('.slot__frame')[tarot.picks.length - 1];
    frame.style.borderStyle = 'none';
    frame.innerHTML = `<div class="flip"><span class="card-back"></span>${faceHTML(t, card)}</div>`;
    const tip = app.querySelector('.table__tip');
    if (tarot.picks.length < need) {
      tip.textContent = `还需要选 ${need - tarot.picks.length} 张`;
      return;
    }
    tip.textContent = '牌已选定，正在为你翻开……';
    app.querySelector('.deck').style.opacity = '.25';
    app.querySelectorAll('.flip').forEach((f, i) => setTimeout(() => f.classList.add('is-open'), 600 + i * 550));
    setTimeout(() => {
      if (!tarot) return;
      tip.textContent = '这就是此刻给你的提示';
      app.querySelector('.table .actions').hidden = false;
    }, 600 + need * 550 + 500);
  }

  app.addEventListener('click', (e) => {
    if (!tarot) return;
    const pick = e.target.closest('[data-pick]');
    if (pick) pickCard(pick);
    if (e.target.closest('[data-reading]')) {
      const id = addRecord({ test: 'tarot', spread: tarot.spreadId, cards: tarot.picks });
      tarot = null;
      location.replace('#/result/' + id);
    }
  });
  /* ---------- 解锁与分享 ---------- */
  function openUnlock(recId) {
    const buy = PAY.buyUrl
      ? `<a class="btn" href="${esc(PAY.buyUrl)}" target="_blank" rel="noopener" style="width:100%">去购买兑换码 · ¥${esc(PAY.price)}</a>`
      : '<p class="field__msg" style="color:var(--text-3)">购买渠道即将开放。</p>';
    const m = modal(`
      <span class="eyebrow">Unlock</span>
      <h3>解锁完整报告</h3>
      <ol><li>点击下方按钮购买兑换码</li><li>付款后平台会自动发给你一串兑换码</li><li>回到这里粘贴兑换码，即可解锁本次报告</li></ol>
      ${buy}
      <form class="field" data-redeem>
        <input name="code" autocomplete="off" spellcheck="false" placeholder="输入兑换码" aria-label="兑换码" required>
        <button type="submit" class="btn btn--ghost">兑换</button>
      </form>
      <p class="field__msg" aria-live="polite"></p>`, '解锁完整报告');
    m.el.querySelector('[data-redeem]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = m.el.querySelector('.field__msg:last-child');
      const code = e.target.code.value.trim().toUpperCase().replace(/[\s-]/g, '');
      if (!code) return;
      msg.textContent = '正在验证……';
      let ok = false;
      try {
        ok = PAY.codeHashes.includes(await FX.sha256(code));
      } catch (err) {
        msg.textContent = '当前浏览器不支持验证，请换用最新版浏览器。';
        return;
      }
      if (!ok) {
        msg.textContent = '兑换码无效，请检查后重试。';
        return;
      }
      markUnlocked(recId);
      m.close();
      toast('解锁成功，完整报告已展开');
      route();
      setTimeout(() => {
        const box = app.querySelector('.locked');
        if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  }

  function openPoster(rec) {
    const t = byId[rec.test];
    let d;
    if (t.kind === 'tarot') {
      const spread = t.spreads[rec.spread];
      d = {
        title: spread.name,
        summary: '我抽到了：' + rec.cards.map((c) => cardName(t, c)).join('、'),
        lines: rec.cards.map((c, i) => ({ label: spread.positions[i], text: t.cards[c.i][1] + (c.rev ? '（逆位）' : '') }))
      };
    } else {
      const r = t.score(rec.answers);
      d = {
        code: r.code,
        title: r.title,
        summary: r.summary,
        lines: r.bars.map((b) => (b.split
          ? { label: b.label + ' / ' + b.right, value: b.value, text: Math.round(b.value) + '%' }
          : { label: b.label, value: b.value }))
      };
    }
    d.testName = t.name;
    d.url = SITE_URL;
    const src = FX.poster(d);
    modal(`
      <span class="eyebrow">Share</span>
      <h3>你的分享海报</h3>
      <img class="poster-img" src="${src}" alt="${esc(t.name)}结果海报">
      <p class="muted" style="font-size:13px;margin:12px 0 0">手机上长按图片即可保存或发送给朋友。</p>
      <div class="actions" style="margin-top:16px"><a class="btn" href="${src}" download="psychology-test-${esc(rec.test)}.png" style="width:100%">下载图片</a></div>`, '分享海报');
  }

  app.addEventListener('click', (e) => {
    const unlock = e.target.closest('[data-unlock]');
    if (unlock) return openUnlock(unlock.dataset.unlock);
    const poster = e.target.closest('[data-poster]');
    if (poster) {
      const rec = findRecord(poster.dataset.poster);
      if (rec) openPoster(rec);
    }
  });
  /* ---------- 记录与关于 ---------- */
  function renderHistory() {
    const list = loadRecords();
    if (!list.length) {
      return `<section class="history page-in"><span class="eyebrow">History</span><h1>我的记录</h1>
        <div class="empty"><p>还没有记录。完成一个测评后，报告会保存在这里。</p><a class="btn" href="#/">去做测评</a></div></section>`;
    }
    const items = list.map((r) => `
      <li class="history-item">
        <a href="#/result/${esc(r.id)}">
          <strong>${esc(byId[r.test].name)}</strong>
          ${isUnlocked(r.id) ? '<span class="chip chip--gold" style="margin-left:8px">完整版</span>' : ''}
          <div>${esc(summarize(r))}</div>
          <div class="muted">${formatDate(r.ts)}</div>
        </a>
        <button type="button" class="btn btn--ghost btn--small" data-del="${esc(r.id)}">删除</button>
      </li>`).join('');
    return `<section class="history page-in">
      <span class="eyebrow">History</span>
      <h1>我的记录</h1>
      <p class="muted">共 ${list.length} 条，只保存在当前浏览器中，最多保留 ${MAX_RECORDS} 条。清除浏览器数据后记录和解锁状态都会消失。</p>
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
    } else if (e.target.closest('[data-clear]') && confirm('确定清空全部记录吗？已解锁的报告也会一并删除，且无法恢复。')) {
      saveRecords([]);
      Object.keys(session).forEach((k) => delete session[k]);
      route();
    }
  });

  function renderAbout() {
    return `<section class="prose page-in">
      <span class="eyebrow">About</span>
      <h1>关于</h1>
      <p>Psychology Test 是一个个人制作的在线心理测评网站。基础结果免费查看，完整报告 ¥${esc(PAY.price)} 解锁。</p>
      <h2>隐私</h2>
      <p>网站没有后台服务器，你的答案和报告只存储在当前浏览器的本地存储中。清除浏览器数据或点击"清空全部记录"即可删除。</p>
      <h2>题目来源</h2>
      <p>大五人格测试的题目改编自 IPIP（International Personality Item Pool）大五因素标记，IPIP 题库属于公共领域。其余测评的题目、类型描述和塔罗解读均为本站原创。</p>
      <h2>购买说明</h2>
      <p>兑换码通过第三方平台售卖，一个兑换码解锁一份报告。解锁状态保存在当前浏览器中，更换设备或清除数据后需要重新解锁。</p>
      <h2>免责声明</h2>
      <p>所有结果仅用于自我了解和娱乐，不构成心理诊断或专业建议。如果你感到持续的情绪困扰，请寻求专业心理咨询师或医生的帮助。</p>
    </section>`;
  }

  function renderNotFound(msg) {
    return `<section class="prose page-in"><h1>找不到页面</h1><p>${esc(msg)}</p>
      <div class="actions"><a class="btn" href="#/">回到首页</a></div></section>`;
  }

  /* ---------- 路由 ---------- */
  function setNav(name) {
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === name));
  }

  function route() {
    const [, page = '', arg = ''] = location.hash.replace(/^#/, '').split('/');
    const t = byId[arg];
    quiz = null;
    tarot = null;
    window.scrollTo(0, 0);
    document.querySelectorAll('.modal').forEach((m) => m.remove());

    let html = '';
    let nav = 'home';
    let title = '';
    if (page === 'run' && t && t.kind === 'likert') {
      title = t.name;
      startQuiz(t);
    } else if (page === 'tarot' && byId.tarot.spreads[arg]) {
      title = byId.tarot.name;
      startTarot(arg);
    } else if (!page) {
      html = renderHome();
    } else if (page === 'test' && t) {
      html = renderIntro(t);
      title = t.name;
    } else if (page === 'result') {
      const rec = findRecord(arg);
      html = rec ? renderReport(rec) : renderNotFound('这条记录不存在，可能已被删除。');
      if (rec) title = byId[rec.test].name + '报告';
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
    if (html) app.innerHTML = html;
    setNav(nav);
    document.title = title ? title + ' · Psychology Test' : 'Psychology Test · 心理测试';
    reveal(app);
    app.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', route);
  route();
})();
