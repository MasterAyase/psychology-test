(function () {
  const app = document.getElementById('app');
  const { GAN, ZHI, SHENGXIAO, SHICHEN, bazi, lunar } = window.CAL;
  const { WX, GAN_WX, ZHI_WX } = window.FATE;
  const LAST_KEY = 'fc_last_v1';
  const sky = document.querySelector('.sky');
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
    return `<fieldset class="person">
      <legend>${title}</legend>
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
  const NUM = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];

  function todayStrip() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    try {
      const b = bazi(y, m, d, now.getHours());
      const lu = lunar(y, m, d);
      const x = window.XIU.find(lu);
      return `<div class="today"><span>今日</span><strong>${b.year.text}年 · 农历${lu.text}</strong><span>${b.month.text}月 ${b.day.text}日</span><span>值宿 <em>${x.name}</em></span></div>`;
    } catch (e) {
      return '';
    }
  }

  function renderHome() {
    const features = [
      ['#/bazi', '八字正缘', '排出四柱八字，看正缘的性情、方位，以及未来十年里最容易相遇的年份。'],
      ['#/hehun', '双人合婚', '以宿曜、生肖、日柱、五行与配偶星五个维度，测两人缘分的深浅。'],
      ['#/xiu', '星宿查询', '依宿曜法由农历生日推得本命宿，再看你与 TA 属于哪一种星宿关系。']
    ].map(([href, h, p], i) => `
      <a class="feature" href="${href}">
        <span class="feature__no">${NUM[i]}</span>
        <h2>${h}</h2>
        <p>${p}</p>
        <span class="feature__go">进入</span>
      </a>`).join('');
    const xiang = [['东方青龙', '角亢氐房心尾箕'], ['北方玄武', '斗牛女虚危室壁'], ['西方白虎', '奎娄胃昴毕觜参'], ['南方朱雀', '井鬼柳星张翼轸']]
      .map(([n, s], i) => `<a href="#/xiu">${ART.xiangMap(i)}<strong>${n}</strong><span>${s}</span></a>`).join('');
    return `
      <section class="hero page-in">
        <div class="hero__text">
          <span class="hero__vert" aria-hidden="true">以生辰八字观正缘</span>
          <span class="eyebrow">生辰 · 八字 · 星宿</span>
          <h1><span>缘分</span><span><em>星盘</em></span></h1>
          <p class="hero__lead">依传统历法排出四柱八字与本命星宿，从五行、夫妻宫、桃花与流年之中，看见那个与你有缘的人。</p>
          <div class="actions"><a class="btn btn--red" href="#/bazi">开始测算 <span class="arrow">→</span></a><a class="btn btn--ghost" href="#/hehun">双人合婚</a></div>
          ${todayStrip()}
        </div>
        <div class="hero__art">${ART.compass()}</div>
      </section>
      <section class="features">${features}</section>
      <section class="sec">
        <div class="sec__head"><span class="sec__no">二十八宿</span><h2>四象分野</h2><p>周天二十八宿，分属四方，每方七宿。</p></div>
        <div class="xiang">${xiang}</div>
      </section>
      <a class="psych-entry" href="psych/">
        <span class="psych-entry__mark">ψ</span>
        <div><strong>想换个角度认识自己</strong><span>心理测评：大五人格、16 型人格、恋爱依恋风格与塔罗指引。</span></div>
        <em>前往 →</em>
      </a>`;
  }

  /* ---------- 八字正缘 ---------- */
  function renderBaziForm() {
    const last = readLast();
    return `<section class="form-wrap page-in">
      <div class="form-aside">
        <span class="eyebrow">八字正缘</span>
        <h1>排一张命盘</h1>
        <p>填写公历生日与出生时辰。时辰越准确，结果越完整；不清楚时辰也可以测算，只是少了时柱。</p>
        ${ART.compass()}
      </div>
      <form class="form-main" data-form="bazi" novalidate>
        ${personFields('', '你的生辰', last.a)}
        <p class="form-error" aria-live="polite"></p>
        <button class="btn btn--red" type="submit">查看我的正缘 <span class="arrow">→</span></button>
        <p class="notice">按北京时间排盘，子时按 0 点计算。测算内容源自传统命理说法，仅供娱乐参考。</p>
      </form>
    </section>`;
  }

  function pillarsHTML(p) {
    const list = [p.bazi.year, p.bazi.month, p.bazi.day, p.bazi.hour];
    const dg = p.bazi.day.gan;
    const cells = list.map((x, i) => {
      if (!x) return `<div class="pillar is-empty"><small>${PILLAR_NAMES[i]}</small><span class="ss">不详</span><b>?</b><b>?</b></div>`;
      const ss = i === 2 ? (p.gender === 'm' ? '元男' : '元女') : window.FATE.shishen(dg, x.gan);
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
    return `<div class="dots">${[p.date.text, '农历' + p.lunar.text, '属' + p.zodiac, p.hourText, p.xiu.name].map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;
  }

  const sec = (i, title, sub, body, keys) => `<section class="sec">
    <div class="sec__head"><span class="sec__no">${NUM[i]}</span><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>
    <div class="sec__body">${body}${keys ? window.GLOSSARY.render(keys) : ''}</div></section>`;
  function renderBaziReport(q) {
    const p = profile(q);
    if (!p) return renderNotFound('生日信息不完整或超出 1901–2099 年的范围，请重新填写。', '#/bazi');
    const r = window.FATE.destiny(p.bazi, p.gender, new Date().getFullYear());
    const who = p.name || '你';
    const best = new Set(r.best.map((y) => y.year));
    const years = r.years.map((y) => {
      const s = y.score >= 3 ? 3 : y.score >= 2 ? 2 : 1;
      return `<div class="year ${best.has(y.year) ? 'is-best' : ''}" title="${esc(y.why.join('、') || '平')}"><strong>${y.year}</strong><span>${y.ganzhi}</span><i data-s="${s}"></i></div>`;
    }).join('');
    const bestList = r.best.length
      ? `<ul class="best-list">${r.best.map((y) => `<li><b>${y.year}</b>${y.ganzhi}${y.zodiac}年 · ${esc(y.why.join('、'))}</li>`).join('')}</ul>`
      : '<p style="margin-top:18px">未来十年姻缘运势平稳，缘分更多取决于你主动走出去。</p>';
    const sw = WX.indexOf(r.spouse.wx);
    const shishenUsed = [p.bazi.year, p.bazi.month, p.bazi.hour].filter(Boolean).map((x) => window.FATE.shishen(p.bazi.day.gan, x.gan));
    const why = r.years.reduce((all, y) => all.concat(y.why), []).join('');
    const yearTerms = ['流年']
      .concat(/红鸾/.test(why) ? ['红鸾'] : [], /天喜/.test(why) ? ['天喜'] : [], /桃花/.test(why) ? ['桃花'] : [])
      .concat(/透出/.test(why) ? ['财星官星透出'] : [], /合夫妻宫/.test(why) ? ['流年合夫妻宫'] : [], /冲夫妻宫/.test(why) ? ['冲夫妻宫'] : []);
    return `<section class="report page-in">
      <div class="report-head">
        <div><span class="eyebrow">八字正缘报告</span><h1>${esc(who)}的正缘</h1>${headMeta(p)}</div>
        ${ART.seal('缘')}
      </div>
      ${sec(0, '四柱八字', '年月日时，天干在上，地支在下', `${pillarsHTML(p)}
        <p class="pillar-note">日主 <b class="wx-${GAN_WX[p.bazi.day.gan]}">${r.dayMaster}</b>，简易判断为<b>${r.strong ? '身强' : '身弱'}</b>。${p.bazi.hour ? '' : '时辰不详，以下分析只依据年、月、日三柱。'}</p>`, ['四柱八字', '天干', '地支', '日主', '元男元女', '十神'].concat(shishenUsed, ['身强身弱']))}
      ${sec(1, '五行', '八字中五行的个数', `<div class="cols">${wxBars(r.count)}<div><p>命中<b>${r.strongest}</b>最旺，<b>${r.weakest}</b>偏少。</p><p style="margin-top:12px">夫妻宫坐<b>${r.palace.zhi}</b>，十神为<b>${r.palace.shishen}</b>。${esc(r.palace.text)}</p></div></div>`, ['五行', '相生相克', '夫妻宫', r.palace.shishen])}
      ${sec(2, '正缘画像', p.gender === 'm' ? '男命以财星为妻' : '女命以官星为夫', `<div class="portrait">
          <div class="portrait__badge wx-${sw}">${r.spouse.wx}</div>
          <dl class="kv">
            <dt>配偶星</dt><dd>${r.spouse.star}属<b class="wx-${sw}">${r.spouse.wx}</b></dd>
            <dt>性情</dt><dd>${r.spouse.trait}</dd>
            <dt>气质</dt><dd>${r.spouse.look}</dd>
            <dt>行业</dt><dd>${r.spouse.field}</dd>
            <dt>方位</dt><dd>${r.spouse.dir}</dd>
            <dt>幸运色</dt><dd>${r.spouse.color}</dd>
          </dl></div>`, ['配偶星', r.spouse.star, '方位'])}
      ${sec(3, '属相与桃花', '', `<div class="cols">
          <div><span class="label">与夫妻宫相合</span><div class="tags">${r.zodiac.good.map((z) => `<span class="tag tag--good">${z}</span>`).join('')}</div>
            <span class="label" style="margin-top:22px">相处宜多包容</span><div class="tags">${r.zodiac.avoid.map((z) => `<span class="tag tag--bad">${z}</span>`).join('')}</div></div>
          <dl class="kv"><dt>红鸾</dt><dd>${r.stars.hongluan}年 · 主婚恋喜事</dd><dt>天喜</dt><dd>${r.stars.tianxi}年 · 主感情升温</dd><dt>桃花</dt><dd>${r.stars.taohua} · 主异性缘</dd></dl>
        </div>`, ['六合', '三合', '六冲', '六害', '红鸾', '天喜', '桃花'])}
      ${sec(4, '十年姻缘', '流年与命盘的呼应', `<div class="years">${years}</div>
        <div class="legend"><span><i style="background:var(--red)"></i>姻缘旺</span><span><i style="background:var(--gold)"></i>有助力</span><span><i style="background:var(--line-2)"></i>平</span></div>${bestList}`, yearTerms)}
      ${sec(5, '本命星宿', p.xiu.group, `<p><b>${p.xiu.name} · ${p.xiu.full}</b></p><p>${esc(p.xiu.text)}</p><p><a href="#/xiu?d=${esc(q.d)}">在星图中查看 →</a></p>`, ['宿曜', '本命宿', '四象', '星官名'])}
      <div class="actions">
        <a class="btn btn--red" href="#/hehun?${toQuery({ a_d: q.d, a_t: q.t, a_g: q.g, a_n: q.n })}">和 TA 测合婚 <span class="arrow">→</span></a>
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
    return `<section class="form-wrap page-in">
      <div class="form-aside">
        <span class="eyebrow">双人合婚</span>
        <h1>两个人的缘分</h1>
        <p>分别填写两人的公历生日。时辰选填，填了会让日柱和五行的判断更准确。</p>
        <div style="width:120px;margin-top:48px;color:var(--red)">${ART.knot()}</div>
      </div>
      <form class="form-main" data-form="hehun" novalidate>
        ${personFields('a_', '你', a)}
        ${personFields('b_', 'TA', b)}
        <p class="form-error" aria-live="polite"></p>
        <button class="btn btn--red" type="submit">开始合婚 <span class="arrow">→</span></button>
        <p class="notice">合婚结果仅供娱乐参考。两个人能否走到一起，最终取决于相处。</p>
      </form>
    </section>`;
  }
  function whoHTML(p, label) {
    const list = [p.bazi.year, p.bazi.month, p.bazi.day, p.bazi.hour].filter(Boolean);
    return `<div class="who"><h2>${esc(p.name || label)}</h2>
      <div class="mini">${list.map((x) => `${ganHTML(x.gan)}${zhiHTML(x.zhi)}`).join(' ').replace(/<b/g, '<span').replace(/<\/b>/g, '</span>')}</div>
      <p>属${p.zodiac} · ${p.xiu.name} · 农历${p.lunar.text}</p></div>`;
  }

  function renderHehunReport(q) {
    const a = profile(pick(q, 'a_'));
    const b = profile(pick(q, 'b_'));
    if (!a || !b) return renderNotFound('两个人的生日都需要填写完整，范围为 1901–2099 年。', '#/hehun');
    const r = window.FATE.match(a, b);
    const back = window.XIU.relate(b.xiu.index, a.xiu.index);
    const nameA = a.name || '你';
    const nameB = b.name || 'TA';
    const R = 96;
    const C = 2 * Math.PI * R;
    const ticks = Array.from({ length: 60 }, (_, i) => {
      const t = (i / 60) * Math.PI * 2;
      const r1 = i % 5 ? 106 : 102;
      return `<line class="tick" x1="${(110 + Math.cos(t) * r1).toFixed(1)}" y1="${(110 + Math.sin(t) * r1).toFixed(1)}" x2="${(110 + Math.cos(t) * 110).toFixed(1)}" y2="${(110 + Math.sin(t) * 110).toFixed(1)}"/>`;
    }).join('');
    const ITEM_TERMS = { 生肖六合: '六合', 生肖三合: '三合', 生肖相冲: '六冲', 生肖相害: '六害', 日干五合: '天干五合', 日支六合: '六合', 日支相冲: '六冲', 五行互补: '五行互补', 配偶星相应: '配偶星相应' };
    const itemTerms = r.items.map((it) => ITEM_TERMS[it.label]).filter(Boolean).concat(r.items.some((it) => it.label === '配偶星相应') ? ['配偶星'] : []);
    const items = r.items.map((it) => {
      const cls = it.delta > 0 ? 'up' : it.delta < 0 ? 'down' : 'zero';
      return `<li><span class="delta ${cls}">${it.delta > 0 ? '+' : ''}${it.delta}</span><div><strong>${esc(it.label)}</strong><p>${esc(it.text)}</p></div></li>`;
    }).join('');
    return `<section class="report page-in">
      <div class="match-head">
        ${whoHTML(a, '你')}
        <div class="score">
          <svg viewBox="0 0 220 220" aria-hidden="true">${ticks}
            <circle class="bg" cx="110" cy="110" r="${R}"/>
            <circle class="fg" cx="110" cy="110" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-offset="${(C * (1 - r.score / 100)).toFixed(1)}"/>
          </svg>
          <div class="score__num"><b>${r.score}</b><span>缘分指数</span></div>
        </div>
        ${whoHTML(b, 'TA')}
      </div>
      <div class="grade">${r.grade}</div>
      ${sec(0, '宿曜关系', r.relation.title, `<p>${esc(r.relation.text)}</p>
        <p>${esc(nameA)}（${a.xiu.name}）是 ${esc(nameB)} 的「${back.role}」，${esc(nameB)}（${b.xiu.name}）是 ${esc(nameA)} 的「${r.relation.role}」。${esc(r.relation.distanceText)}</p>`, ['宿曜', '本命宿', '宿曜关系', r.relation.key].concat(r.relation.distance ? ['远近距离'] : []))}
      ${sec(1, '合婚细项', '每一项的加减分', `<ul class="items">${items}</ul>`, itemTerms.concat(['缘分指数']))}
      <div class="actions">
        <button type="button" class="btn btn--red" data-copy>复制合婚链接</button>
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
        rel = `<section class="relation"><div><span class="eyebrow">你与 TA</span><h3 style="margin-top:14px">${r.title}</h3></div>
          <div><p>TA 的本命宿是<b>${other.xiu.name}</b>（农历${other.lunar.text}）。你是 TA 的「${back.role}」，TA 是你的「${r.role}」。</p>
          <p>${esc(r.text)}${esc(r.distanceText)}</p>${window.GLOSSARY.render(['宿曜关系', r.key].concat(r.distance ? ['远近距离'] : []))}</div></section>`;
      }
      result = `<section class="xiu-result">
          ${ART.constellation(x.index)}
          <div><span class="eyebrow">农历${me.lunar.text} · ${x.group}</span>
            <div class="xiu-name" style="margin-top:22px">${x.name}</div><div class="xiu-full">${x.full}</div>
            <div class="tags">${x.tags.split(' · ').map((t) => `<span class="tag">${t}</span>`).join('')}</div>
            <p>${esc(x.text)}</p>${window.GLOSSARY.render(['宿曜', '本命宿', '四象', '星官名'])}</div>
        </section>${rel}`;
    }
    const groups = ['东方青龙', '北方玄武', '西方白虎', '南方朱雀'].map((g) => {
      const cells = window.XIU.list.map((x, i) => [x, i]).filter(([x]) => x[2] === g).map(([x, i]) =>
        `<button type="button" class="xiu-cell ${me && me.xiu.index === i ? 'is-on' : ''}" data-xiu="${i}" aria-expanded="false"><b>${x[0]}</b><span>${x[1]}</span></button>`).join('');
      return `<div class="xiu-group"><h3>${g}</h3><div class="xiu-cells">${cells}</div><div class="xiu-detail" hidden></div></div>`;
    }).join('');
    return `<section class="report page-in">
      <div class="xiu-hero">
        <div><span class="eyebrow">二十七宿 · 宿曜</span><h1>本命星宿</h1>
          <p>宿曜法以农历生日推算本命宿。二十八宿中牛宿并入女宿，共二十七宿。填上 TA 的生日，还能看两人的星宿关系。</p></div>
        <form class="glass" data-form="xiu" novalidate>
          ${dateField('d', '你的公历生日', q.get('d') || (last.a && last.a.d) || '')}
          ${dateField('o', 'TA 的公历生日（选填）', q.get('o') || '')}
          <p class="form-error" aria-live="polite"></p>
          <button class="btn btn--red" type="submit">观星 <span class="arrow">→</span></button>
        </form>
      </div>
      ${result}
      <section class="sec" style="border-top:0;padding-bottom:0"><div class="sec__head"><span class="sec__no">一览</span><h2>二十七宿</h2><p>点击任一宿查看解读</p></div><div></div></section>
      <div class="xiu-table">${groups}</div>
      ${window.GLOSSARY.render(me ? ['二十八宿'] : ['二十八宿', '宿曜', '四象', '星官名'])}
      <p class="notice">星宿性格解读为本站原创，星官连线为装饰示意，仅供娱乐参考。</p>
    </section>`;
  }

  function renderAbout() {
    return `<section class="prose page-in">
      <span class="eyebrow">关于</span>
      <h1>缘分星盘</h1>
      <p>一个个人制作的趣味测算网站，所有功能免费，无需注册。</p>
      <h2>怎么算的</h2>
      <p>农历日期由浏览器内置的中国历法换算；年柱以立春为界，月柱以节气为界，节气时刻用天文公式计算，误差约十几分钟。日柱按儒略日推算，时柱按五鼠遁起法。本命星宿按宿曜法由农历月、日推得。</p>
      <h2>隐私</h2>
      <p>网站没有后台服务器，你输入的生日只在浏览器里计算，最近一次填写的内容保存在本机，方便下次使用。</p>
      <h2>免责声明</h2>
      <p>八字、星宿属于传统文化，相关解读由程序按常见说法生成，仅供娱乐参考，不构成任何决策建议。</p>
      <h2>更多</h2>
      <p>想从心理学角度认识自己，可以试试<a href="psych/">心理测评</a>。</p>
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
    const night = path === '/xiu';
    document.documentElement.classList.toggle('theme-night', night);
    document.querySelector('meta[name="theme-color"]').content = night ? '#0a0d16' : '#f2ece0';
    if (night) {
      const active = q.get('d') ? (profile({ d: q.get('d'), t: '-1', g: 'f' }) || {}).xiu : null;
      sky.innerHTML = ART.starMap(active ? active.index : null);
    }
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === (nav || 'home')));
    document.title = title ? title + ' · 缘分星盘' : '缘分星盘 · 八字正缘测算';
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
    animate();
  }

  window.addEventListener('hashchange', route);
  route();
})();
