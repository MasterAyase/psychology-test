(function () {
  const app = document.getElementById('app');
  const { GAN, ZHI, SHENGXIAO, SHICHEN, bazi, lunar } = window.CAL;
  const { WX, GAN_WX, ZHI_WX } = window.FATE;
  const LAST_KEY = 'fc_last_v1';
  const MIN = '1901-03-01';
  const MAX = '2099-12-31';
  const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const pad = (n) => String(n).padStart(2, '0');

  function readLast() {
    try { return JSON.parse(localStorage.getItem(LAST_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveLast(v) {
    try { localStorage.setItem(LAST_KEY, JSON.stringify(Object.assign(readLast(), v))); } catch (e) { /* 无法写入时忽略 */ }
  }

  function toast(msg) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  // 把表单或地址参数转换为完整的命盘信息；输入无效时返回 null
  function profile(p) {
    if (!p || !/^\d{4}-\d{2}-\d{2}$/.test(p.d || '') || p.d < MIN || p.d > MAX) return null;
    const [y, m, d] = p.d.split('-').map(Number);
    const check = new Date(Date.UTC(y, m - 1, d));
    if (check.getUTCMonth() !== m - 1) return null;
    const t = Number(p.t);
    const hour = t >= 0 && t <= 11 ? t * 2 : null;
    const b = bazi(y, m, d, hour);
    const lu = lunar(y, m, d);
    return {
      name: (p.n || '').slice(0, 12),
      gender: p.g === 'm' ? 'm' : 'f',
      date: { y, m, d, text: `${y}年${m}月${d}日` },
      hourText: hour === null ? '时辰不详' : SHICHEN[t],
      bazi: b,
      lunar: lu,
      zodiac: SHENGXIAO[b.year.zhi],
      xiu: window.XIU.find(lu)
    };
  }

  const ganHTML = (g) => `<b class="wx-${GAN_WX[g]}">${GAN[g]}</b>`;
  const zhiHTML = (z) => `<b class="wx-${ZHI_WX[z]}">${ZHI[z]}</b>`;

  // 年、月、日三个下拉框，替代原生日期控件（原生控件的年份很难用滚轮选择）
  const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  function dayOptions(y, m, sel) {
    const n = y && m ? daysIn(y, m) : 31;
    return '<option value="">日</option>' + Array.from({ length: n }, (_, i) => `<option value="${i + 1}" ${sel === i + 1 ? 'selected' : ''}>${i + 1} 日</option>`).join('');
  }

  function dateField(name, label, value) {
    const [y, m, d] = /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').map(Number) : [0, 0, 0];
    const top = Math.min(new Date().getFullYear(), Number(MAX.slice(0, 4)));
    const bottom = Number(MIN.slice(0, 4));
    const years = '<option value="">年</option>' + Array.from({ length: top - bottom + 1 }, (_, i) => top - i).map((yy) => `<option value="${yy}" ${yy === y ? 'selected' : ''}>${yy} 年</option>`).join('');
    const months = '<option value="">月</option>' + Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i + 1 === m ? 'selected' : ''}>${i + 1} 月</option>`).join('');
    return `<div class="field"><span id="${name}-label">${label}</span>
      <div class="date3" data-date="${name}" role="group" aria-labelledby="${name}-label">
        <select data-part="y" aria-label="年">${years}</select>
        <select data-part="m" aria-label="月">${months}</select>
        <select data-part="d" aria-label="日">${dayOptions(y, m, d)}</select>
      </div>
      <input type="hidden" name="${name}" value="${y ? esc(value) : ''}"></div>`;
  }

  // 选择变化时同步隐藏字段，并按年月更新天数
  app.addEventListener('change', (e) => {
    const box = e.target.closest('.date3');
    if (!box) return;
    const [ys, ms, ds] = ['y', 'm', 'd'].map((k) => box.querySelector(`[data-part="${k}"]`));
    const y = Number(ys.value);
    const m = Number(ms.value);
    let d = Number(ds.value);
    if (e.target !== ds) {
      if (y && m && d > daysIn(y, m)) d = daysIn(y, m);
      ds.innerHTML = dayOptions(y, m, d);
    }
    const hidden = box.parentNode.querySelector(`input[name="${box.dataset.date}"]`);
    hidden.value = y && m && d ? `${y}-${pad(m)}-${pad(d)}` : '';
  });

  function personFields(prefix, title, v) {
    v = v || {};
    const opts = ['<option value="-1">不清楚</option>'].concat(SHICHEN.map((s, i) => `<option value="${i}" ${String(v.t) === String(i) ? 'selected' : ''}>${s}</option>`)).join('');
    return `<fieldset class="panel panel--frame person" style="border:1px solid var(--line)">
      <legend class="person__title" style="padding:0">${title}</legend>
      <label class="field"><span>称呼（选填）</span><input name="${prefix}n" maxlength="12" value="${esc(v.n || '')}" placeholder="例如：小满"></label>
      <div class="row">
        ${dateField(prefix + 'd', '公历生日', v.d)}
        <label class="field"><span>出生时辰</span><select name="${prefix}t">${opts}</select></label>
      </div>
      <div class="field"><span>性别</span><div class="seg" role="radiogroup">
        <label><input type="radio" name="${prefix}g" value="f" ${v.g !== 'm' ? 'checked' : ''}><span>女</span></label>
        <label><input type="radio" name="${prefix}g" value="m" ${v.g === 'm' ? 'checked' : ''}><span>男</span></label>
      </div></div>
    </fieldset>`;
  }

  function readPerson(form, prefix) {
    const f = new FormData(form);
    return { n: (f.get(prefix + 'n') || '').trim(), d: f.get(prefix + 'd') || '', t: f.get(prefix + 't') || '-1', g: f.get(prefix + 'g') || 'f' };
  }

  const toQuery = (obj) => Object.entries(obj).filter(([, v]) => v !== '' && v != null).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  /* ---------- 首页 ---------- */
  function todayStrip() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    try {
      const b = bazi(y, m, d, now.getHours());
      const lu = lunar(y, m, d);
      const x = window.XIU.find(lu);
      return `<div class="today">今日 <strong>${b.year.text}年 ${lu.text}</strong><span>${b.month.text}月 ${b.day.text}日</span><span>值宿 <strong>${x.name}</strong></span></div>`;
    } catch (e) {
      return '';
    }
  }

  function renderHome() {
    const features = [
      ['#/bazi', '缘', '八字正缘', '输入生辰，排出四柱八字，看你的正缘是什么样的人、在哪个方向、哪几年最容易遇见。'],
      ['#/hehun', '合', '双人合婚', '输入两个人的生日，从宿曜、生肖、日柱和五行四个角度，看你们的缘分有多深。'],
      ['#/xiu', '宿', '星宿查询', '按农历生日查你的本命星宿，了解性格底色，再看看你和 TA 是哪一种星宿关系。']
    ].map(([href, s, h, p], i) => `
      <a class="feature" href="${href}">
        <span class="feature__no">0${i + 1}</span>
        ${ART.seal(s)}
        <h2>${h}</h2>
        <p>${p}</p>
        <span class="feature__go">立即测算 →</span>
      </a>`).join('');
    const xiang = [['东方青龙', '角 亢 氐 房 心 尾 箕', 'var(--wx-0)'], ['北方玄武', '斗 牛 女 虚 危 室 壁', 'var(--wx-4)'], ['西方白虎', '奎 娄 胃 昴 毕 觜 参', 'var(--wx-3)'], ['南方朱雀', '井 鬼 柳 星 张 翼 轸', 'var(--wx-1)']]
      .map(([n, s, c]) => `<div><i style="background:${c}"></i><strong>${n}</strong><span>${s}</span></div>`).join('');
    return `
      <section class="hero page-in">
        <div class="hero__text">
          <span class="eyebrow">生辰 · 八字 · 星宿</span>
          <h1>缘分<em>星盘</em></h1>
          <p class="hero__sub">以生辰八字，观你的正缘</p>
          <p class="muted">依据传统历法排出四柱八字与本命星宿，从五行、夫妻宫、桃花星和流年中，看见那个与你有缘的人。</p>
          <div class="actions"><a class="btn" href="#/bazi">开始测算</a><a class="btn btn--ghost" href="#/hehun">双人合婚</a></div>
          ${todayStrip()}
        </div>
        <div class="hero__art">${ART.compass()}${ART.cloud('c1')}${ART.cloud('c2')}</div>
      </section>
      <section class="features">${features}</section>
      <div class="section-head">
        <span class="eyebrow">二十八宿</span>
        <h2>四象分野，七宿一方</h2>
        ${ART.divider()}
      </div>
      <section class="xiang">${xiang}</section>
      <a class="psych-entry" href="psych/">
        <span class="psych-entry__mark">ψ</span>
        <div><strong>想换个角度认识自己？</strong><span>试试心理测评：大五人格、16 型人格、恋爱依恋风格、塔罗指引。</span></div>
        <em>去看看 →</em>
      </a>`;
  }
  /* ---------- 八字正缘 ---------- */
  function renderBaziForm() {
    const last = readLast();
    return `<section class="form-page page-in">
      <span class="eyebrow">八字正缘</span>
      <h1>排一张你的命盘</h1>
      <p>请填写公历生日。时辰越准确，结果越完整；不清楚时辰也可以测算，只是少了时柱。</p>
      <form data-form="bazi" novalidate>
        ${personFields('', '你的生辰', last.a)}
        <p class="form-error" aria-live="polite"></p>
        <button class="btn" type="submit">查看我的正缘</button>
      </form>
      <p class="notice">按北京时间排盘，子时按 0 点计算。测算内容源自传统命理说法，仅供娱乐参考。</p>
    </section>`;
  }

  function pillarsHTML(p) {
    const list = [p.bazi.year, p.bazi.month, p.bazi.day, p.bazi.hour];
    const dg = p.bazi.day.gan;
    const cells = list.map((x, i) => {
      if (!x) return `<div class="pillar"><small>${PILLAR_NAMES[i]}</small><span class="ss">&nbsp;</span><b style="color:var(--ink-3)">?</b><b style="color:var(--ink-3)">?</b></div>`;
      const ss = i === 2 ? '日主' : window.FATE.shishen(dg, x.gan);
      return `<div class="pillar ${i === 2 ? 'is-day' : ''}"><small>${PILLAR_NAMES[i]}</small><span class="ss">${ss}</span>${ganHTML(x.gan)}${zhiHTML(x.zhi)}</div>`;
    }).join('');
    return `<div class="pillars">${cells}</div>`;
  }

  function wxBars(count) {
    const max = Math.max.apply(null, count) || 1;
    return `<div class="wx-bars">${WX.map((w, i) => `
      <div class="wx-bar"><b class="wx-${i}">${w}</b><div class="track"><div class="fill" data-w="${(count[i] / max) * 100}" style="background:var(--wx-${i})"></div></div><em>${count[i]}</em></div>`).join('')}</div>`;
  }

  function headMeta(p) {
    return [p.date.text, '农历' + p.lunar.text, '属' + p.zodiac, p.hourText, p.xiu.name].map((t) => `<span class="chip">${esc(t)}</span>`).join('');
  }

  function renderBaziReport(q) {
    const p = profile(q);
    if (!p) return renderNotFound('生日信息不完整或超出 1901–2099 年的范围，请重新填写。', '#/bazi');
    const r = window.FATE.destiny(p.bazi, p.gender, new Date().getFullYear());
    const who = p.name || '你';
    const best = new Set(r.best.map((y) => y.year));
    const years = r.years.map((y) => `<div class="year ${best.has(y.year) ? 'is-best' : ''}"><strong>${y.year}</strong><span>${y.ganzhi} · ${y.zodiac}年</span><div class="stars">${'★'.repeat(Math.max(0, Math.min(5, y.score)))}</div></div>`).join('');
    const bestList = r.best.length
      ? `<ul class="best-list">${r.best.map((y) => `<li><b>${y.year} 年</b>${esc(y.why.join('、'))}</li>`).join('')}</ul>`
      : '<p class="muted" style="margin-top:14px">未来十年姻缘运势比较平稳，缘分更多取决于你主动走出去。</p>';
    const spouseWxIndex = WX.indexOf(r.spouse.wx);
    return `<section class="report page-in">
      <div class="report__head">
        <span class="eyebrow">八字正缘报告</span>
        <h1>${esc(who)}的正缘</h1>
        <div class="meta">${headMeta(p)}</div>
        ${ART.divider()}
      </div>
      <div class="grid">
        <div class="panel panel--frame wide"><h3>四柱八字</h3>${pillarsHTML(p)}
          <p style="margin-top:16px">日主 <b class="wx-${GAN_WX[p.bazi.day.gan]}">${r.dayMaster}</b>，简易判断为<b>${r.strong ? '身强' : '身弱'}</b>。${p.bazi.hour ? '' : '因时辰不详，以下分析只依据年、月、日三柱。'}</p></div>
        <div class="panel"><h3>五行分布</h3>${wxBars(r.count)}<p style="margin-top:14px">命中<b>${r.strongest}</b>最旺，<b>${r.weakest}</b>偏少。</p></div>
        <div class="panel"><h3>夫妻宫 · ${r.palace.zhi}</h3><p>${esc(r.palace.text)}</p>
          <p style="margin-top:12px">日支为${r.palace.zhi}，十神为<b>${r.palace.shishen}</b>。</p></div>
        <div class="panel panel--frame wide"><h3>正缘画像</h3>
          <div class="portrait">
            <div class="portrait__badge wx-${spouseWxIndex}">${r.spouse.wx}</div>
            <dl class="kv">
              <dt>配偶星</dt><dd>${p.gender === 'm' ? '男命以财星为妻' : '女命以官星为夫'}，你的${r.spouse.star}属<b class="wx-${spouseWxIndex}">${r.spouse.wx}</b></dd>
              <dt>性格</dt><dd>${r.spouse.trait}</dd>
              <dt>气质</dt><dd>${r.spouse.look}</dd>
              <dt>可能从事</dt><dd>${r.spouse.field}</dd>
              <dt>相遇方位</dt><dd>${r.spouse.dir}</dd>
              <dt>幸运色</dt><dd>${r.spouse.color}</dd>
            </dl>
          </div></div>
        <div class="panel"><h3>属相宜忌</h3>
          <p style="margin-bottom:10px">与你夫妻宫相合的属相：</p><div class="tags">${r.zodiac.good.map((z) => `<span class="tag tag--good">${z}</span>`).join('')}</div>
          <p style="margin:16px 0 10px">相处需多些包容：</p><div class="tags">${r.zodiac.avoid.map((z) => `<span class="tag tag--bad">${z}</span>`).join('')}</div></div>
        <div class="panel"><h3>桃花星</h3><dl class="kv">
          <dt>红鸾</dt><dd>${r.stars.hongluan}年 · 主婚恋喜事</dd>
          <dt>天喜</dt><dd>${r.stars.tianxi}年 · 主感情升温</dd>
          <dt>桃花</dt><dd>${r.stars.taohua} · 主异性缘</dd></dl></div>
        <div class="panel panel--frame wide"><h3>未来十年姻缘</h3><div class="years">${years}</div>${bestList}</div>
        <div class="panel wide"><h3>本命星宿 · ${p.xiu.name}</h3><p><b>${p.xiu.full}</b>（${p.xiu.group}）：${esc(p.xiu.text)}</p></div>
      </div>
      <div class="actions" style="justify-content:center">
        <a class="btn" href="#/hehun?${toQuery({ a_d: q.d, a_t: q.t, a_g: q.g, a_n: q.n })}">和 TA 测合婚</a>
        <button type="button" class="btn btn--ghost" data-copy>复制报告链接</button>
        <a class="btn btn--ghost" href="#/bazi">重新排盘</a>
      </div>
      <p class="notice">测算依据传统命理的常见说法，由程序自动生成，仅供娱乐参考，请勿据此做重大决定。</p>
    </section>`;
  }
  /* ---------- 双人合婚 ---------- */
  const pick = (q, prefix) => ({ d: q.get(prefix + 'd') || '', t: q.get(prefix + 't') || '-1', g: q.get(prefix + 'g') || '', n: q.get(prefix + 'n') || '' });

  function renderHehunForm(q) {
    const last = readLast();
    const a = q.get('a_d') ? pick(q, 'a_') : last.a;
    const b = last.b || { g: a && a.g === 'f' ? 'm' : 'f' };
    return `<section class="form-page page-in">
      <span class="eyebrow">双人合婚</span>
      <h1>看看你们的缘分</h1>
      <p>分别填写两个人的公历生日。时辰选填，填了会让日柱和五行的判断更准确。</p>
      <form data-form="hehun" novalidate>
        ${personFields('a_', '你', a)}
        ${personFields('b_', 'TA', b)}
        <p class="form-error" aria-live="polite"></p>
        <button class="btn" type="submit">开始合婚</button>
      </form>
      <p class="notice">合婚结果仅供娱乐参考。两个人能否走到一起，最终取决于相处。</p>
    </section>`;
  }

  function personCard(p, label) {
    const list = [p.bazi.year, p.bazi.month, p.bazi.day, p.bazi.hour].filter(Boolean);
    return `<div class="panel"><h3>${esc(p.name || label)}</h3>
      <div class="mini-pillars">${list.map((x) => `<span>${ganHTML(x.gan)}${zhiHTML(x.zhi)}</span>`).join('')}</div>
      <p style="font-size:13px">属${p.zodiac} · ${p.xiu.name} · 农历${p.lunar.text}</p></div>`;
  }

  function renderHehunReport(q) {
    const a = profile(pick(q, 'a_'));
    const b = profile(pick(q, 'b_'));
    if (!a || !b) return renderNotFound('两个人的生日都需要填写完整，范围为 1901–2099 年。', '#/hehun');
    const r = window.FATE.match(a, b);
    const back = window.XIU.relate(b.xiu.index, a.xiu.index);
    const nameA = a.name || '你';
    const nameB = b.name || 'TA';
    const C = 2 * Math.PI * 92;
    const items = r.items.map((it) => {
      const cls = it.delta > 0 ? 'up' : it.delta < 0 ? 'down' : 'zero';
      return `<li><span class="delta ${cls}">${it.delta > 0 ? '+' : ''}${it.delta}</span><div><strong>${esc(it.label)}</strong><p>${esc(it.text)}</p></div></li>`;
    }).join('');
    return `<section class="report page-in">
      <div class="report__head">
        <span class="eyebrow">合婚报告</span>
        <h1>${esc(nameA)} 与 ${esc(nameB)}</h1>
        <div class="score">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs><linearGradient id="scoreGrad" x1="0" x2="1"><stop offset="0" stop-color="#d4b06f"/><stop offset="1" stop-color="#b5372a"/></linearGradient></defs>
            <circle class="bg" cx="100" cy="100" r="92"/>
            <circle class="fg" cx="100" cy="100" r="92" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-offset="${(C * (1 - r.score / 100)).toFixed(1)}"/>
          </svg>
          <div class="score__num"><b>${r.score}</b><span>缘分指数</span></div>
        </div>
        <div class="grade">${r.grade}</div>
        ${ART.divider()}
      </div>
      <div class="couple">${personCard(a, '你')}<div class="knot">${ART.knot()}</div>${personCard(b, 'TA')}</div>
      <div class="grid" style="margin-top:18px">
        <div class="panel panel--frame wide"><h3>宿曜关系 · ${r.relation.title}</h3>
          <p>${esc(r.relation.text)}</p>
          <p style="margin-top:12px">${esc(nameA)}（${a.xiu.name}）是 ${esc(nameB)} 的「${back.role}」，${esc(nameB)}（${b.xiu.name}）是 ${esc(nameA)} 的「${r.relation.role}」。${esc(r.relation.distanceText)}</p></div>
        <div class="panel wide"><h3>合婚细项</h3><ul class="items">${items}</ul></div>
      </div>
      <div class="actions" style="justify-content:center">
        <button type="button" class="btn" data-copy>复制合婚链接</button>
        <a class="btn btn--ghost" href="#/bazi/r?${toQuery(pick(q, 'a_'))}">看 ${esc(nameA)} 的正缘</a>
        <a class="btn btn--ghost" href="#/hehun">重新合婚</a>
      </div>
      <p class="notice">合婚分数由程序按传统说法自动计算，仅供娱乐参考。</p>
    </section>`;
  }
  /* ---------- 星宿查询 ---------- */
  function renderXiu(q) {
    const last = readLast();
    const me = q.get('d') ? profile({ d: q.get('d'), t: '-1', g: 'f' }) : null;
    const other = q.get('o') ? profile({ d: q.get('o'), t: '-1', g: 'f' }) : null;
    let result = '';
    if (q.get('d') && !me) result = '<p class="form-error">生日无效，请重新选择。</p>';
    if (me) {
      const x = me.xiu;
      let rel = '';
      if (other) {
        const r = window.XIU.relate(x.index, other.xiu.index);
        const back = window.XIU.relate(other.xiu.index, x.index);
        rel = `<div class="panel panel--frame" style="margin-top:18px"><h3>你与 TA · ${r.title}</h3>
          <p>TA 的本命宿是<b>${other.xiu.name}</b>（农历${other.lunar.text}）。你是 TA 的「${back.role}」，TA 是你的「${r.role}」。</p>
          <p style="margin-top:10px">${esc(r.text)}${esc(r.distanceText)}</p></div>`;
      }
      result = `<div class="panel panel--frame" style="margin-top:28px"><div class="xiu-result">
          ${ART.xiuRing(x.name.charAt(0))}
          <div><span class="eyebrow">农历${me.lunar.text} · ${x.group}</span>
            <div class="xiu-name">${x.name}</div><div class="xiu-full">${x.full}</div>
            <div class="tags" style="margin-bottom:14px">${x.tags.split(' · ').map((t) => `<span class="tag">${t}</span>`).join('')}</div>
            <p>${esc(x.text)}</p></div>
        </div></div>${rel}`;
    }
    const groups = ['东方青龙', '北方玄武', '西方白虎', '南方朱雀'].map((g) => {
      const cells = window.XIU.list.map((x, i) => [x, i]).filter(([x]) => x[2] === g).map(([x, i]) =>
        `<button type="button" class="xiu-cell ${me && me.xiu.index === i ? 'is-on' : ''}" data-xiu="${i}" aria-expanded="false"><b>${x[0]}</b><span>${x[1]}</span></button>`).join('');
      return `<div class="xiu-group"><h3>${g}</h3><div class="xiu-cells">${cells}</div><div class="xiu-detail" hidden></div></div>`;
    }).join('');
    return `<section class="report page-in">
      <div class="report__head"><span class="eyebrow">二十七宿 · 宿曜</span><h1>查你的本命星宿</h1>
        <p class="muted" style="max-width:34em;margin:0 auto">宿曜法以农历生日推算本命宿，二十八宿中牛宿并入女宿，共二十七宿。填上 TA 的生日，还能看两人的星宿关系。</p>${ART.divider()}</div>
      <form class="panel" data-form="xiu" novalidate style="max-width:640px;margin:0 auto">
        <div class="row">
          ${dateField('d', '你的公历生日', q.get('d') || (last.a && last.a.d) || '')}
          ${dateField('o', 'TA 的公历生日（选填）', q.get('o') || '')}
        </div>
        <p class="form-error" aria-live="polite"></p>
        <button class="btn" type="submit" style="width:100%">查询星宿</button>
      </form>
      ${result}
      <div class="section-head"><span class="eyebrow">点击查看</span><h2>二十七宿一览</h2>${ART.divider()}</div>
      <div class="panel xiu-table">${groups}</div>
      <p class="notice">星宿性格解读为本站原创，仅供娱乐参考。</p>
    </section>`;
  }

  function renderAbout() {
    return `<section class="prose page-in">
      <span class="eyebrow">关于</span>
      <h1>关于缘分星盘</h1>
      <p>缘分星盘是一个个人制作的趣味测算网站，所有功能免费，无需注册。</p>
      <h2>怎么算的</h2>
      <p>农历日期由浏览器内置的中国历法换算；年柱以立春为界，月柱以节气为界，节气时刻用天文公式计算，误差约十几分钟。日柱按儒略日推算，时柱按"五鼠遁"起法。本命星宿按宿曜法由农历月、日推得。</p>
      <h2>隐私</h2>
      <p>网站没有后台服务器，你输入的生日只在你的浏览器里计算，最近一次填写的内容保存在本机，方便下次使用。</p>
      <h2>免责声明</h2>
      <p>八字、星宿属于传统文化，相关解读由程序按常见说法生成，仅供娱乐参考，不构成任何决策建议。</p>
      <h2>更多</h2>
      <p>想从心理学角度认识自己，可以试试 <a href="psych/">心理测评</a>。</p>
    </section>`;
  }

  function renderNotFound(msg, back) {
    return `<section class="prose page-in"><h1>出了点问题</h1><p>${esc(msg)}</p>
      <div class="actions"><a class="btn" href="${back || '#/'}">返回</a></div></section>`;
  }
  /* ---------- 交互 ---------- */
  function validDate(v) {
    return /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= MIN && v <= MAX;
  }

  app.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const err = form.querySelector('.form-error');
    const type = form.dataset.form;
    if (type === 'bazi') {
      const a = readPerson(form, '');
      if (!validDate(a.d)) { err.textContent = '请选择 1901–2099 年之间的生日。'; return; }
      saveLast({ a });
      location.hash = '#/bazi/r?' + toQuery(a);
    } else if (type === 'hehun') {
      const a = readPerson(form, 'a_');
      const b = readPerson(form, 'b_');
      if (!validDate(a.d) || !validDate(b.d)) { err.textContent = '两个人的生日都需要填写，范围为 1901–2099 年。'; return; }
      saveLast({ a, b });
      const q = {};
      Object.entries(a).forEach(([k, v]) => { q['a_' + k] = v; });
      Object.entries(b).forEach(([k, v]) => { q['b_' + k] = v; });
      location.hash = '#/hehun/r?' + toQuery(q);
    } else if (type === 'xiu') {
      const f = new FormData(form);
      const d = f.get('d') || '';
      const o = f.get('o') || '';
      if (!validDate(d) || (o && !validDate(o))) { err.textContent = '请选择 1901–2099 年之间的日期。'; return; }
      location.hash = '#/xiu?' + toQuery({ d, o });
    }
  });

  app.addEventListener('click', (e) => {
    const cell = e.target.closest('[data-xiu]');
    if (cell) {
      const x = window.XIU.list[Number(cell.dataset.xiu)];
      const group = cell.closest('.xiu-group');
      const detail = group.querySelector('.xiu-detail');
      const open = cell.getAttribute('aria-expanded') === 'true';
      group.querySelectorAll('[data-xiu]').forEach((c) => c.setAttribute('aria-expanded', 'false'));
      if (open) { detail.hidden = true; return; }
      cell.setAttribute('aria-expanded', 'true');
      detail.innerHTML = `<b>${x[0]}宿 · ${x[1]}</b>（${x[4]}）：${esc(x[3])}`;
      detail.hidden = false;
      return;
    }
    if (e.target.closest('[data-copy]')) {
      const url = location.href;
      const done = () => toast('链接已复制，发给朋友就能看到同样的结果');
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => toast('复制失败，请手动复制地址栏'));
      else toast('请手动复制地址栏的链接');
    }
  });

  function animate() {
    setTimeout(() => {
      app.querySelectorAll('[data-w]').forEach((el) => { el.style.width = el.dataset.w + '%'; });
      app.querySelectorAll('[data-offset]').forEach((el) => { el.style.strokeDashoffset = el.dataset.offset; });
    }, 80);
  }

  /* ---------- 路由 ---------- */
  function route() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = raw.split('?');
    const q = new URLSearchParams(qs || '');
    const page = path.split('/')[1] || '';
    let html;
    let nav = page;
    let title = '';
    try {
      if (!page) html = renderHome();
      else if (path === '/bazi') { html = renderBaziForm(); title = '八字正缘'; }
      else if (path === '/bazi/r') { html = renderBaziReport(Object.fromEntries(q)); title = '正缘报告'; nav = 'bazi'; }
      else if (path === '/hehun') { html = renderHehunForm(q); title = '双人合婚'; }
      else if (path === '/hehun/r') { html = renderHehunReport(q); title = '合婚报告'; nav = 'hehun'; }
      else if (path === '/xiu') { html = renderXiu(q); title = '星宿查询'; }
      else if (path === '/about') { html = renderAbout(); title = '关于'; }
      else html = renderNotFound('你访问的页面不存在。');
    } catch (err) {
      html = renderNotFound('当前浏览器暂不支持农历换算，请更新浏览器或换用 Chrome、Safari 最新版。');
    }
    app.innerHTML = html;
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === (nav || 'home')));
    document.title = title ? title + ' · 缘分星盘' : '缘分星盘 · 八字正缘测算';
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
    animate();
  }

  window.addEventListener('hashchange', route);
  route();
})();
