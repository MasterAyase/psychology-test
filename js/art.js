// 国风装饰图案：罗盘、二十八宿环、祥云、印章、同心结、回纹
(function () {
  const svg = (vb, body, cls) => `<svg class="${cls || 'art'}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const polar = (cx, cy, r, deg) => [cx + Math.cos((deg - 90) * Math.PI / 180) * r, cy + Math.sin((deg - 90) * Math.PI / 180) * r];
  const ringText = (cx, cy, r, list, size, offset) => list.map((t, i) => {
    const deg = (360 / list.length) * i + (offset || 0);
    const [x, y] = polar(cx, cy, r, deg);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" transform="rotate(${deg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${t}</text>`;
  }).join('');
  const spokes = (cx, cy, r1, r2, n, offset) => Array.from({ length: n }, (_, i) => {
    const deg = (360 / n) * i + (offset || 0);
    const [x1, y1] = polar(cx, cy, r1, deg);
    const [x2, y2] = polar(cx, cy, r2, deg);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }).join('');

  const BAGUA = ['☰', '☴', '☵', '☶', '☷', '☳', '☲', '☱'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const XIU28 = ['角', '亢', '氐', '房', '心', '尾', '箕', '斗', '牛', '女', '虚', '危', '室', '壁', '奎', '娄', '胃', '昴', '毕', '觜', '参', '井', '鬼', '柳', '星', '张', '翼', '轸'];

  // 罗盘：八卦、地支、天干、二十八宿四层，外两层缓慢旋转
  function compass() {
    return svg('0 0 400 400', `
      <g class="spin" style="transform-origin:200px 200px">
        <circle cx="200" cy="200" r="194" stroke-width=".8"/>
        <circle cx="200" cy="200" r="172" stroke-width=".8"/>
        ${spokes(200, 200, 172, 194, 28, 0)}
        ${ringText(200, 200, 183, XIU28, 11, 360 / 56)}
      </g>
      <g class="spin spin--rev" style="transform-origin:200px 200px">
        <circle cx="200" cy="200" r="150" stroke-width=".8"/>
        ${spokes(200, 200, 150, 172, 12, 15)}
        ${ringText(200, 200, 161, ZHI, 13)}
      </g>
      <circle cx="200" cy="200" r="128" stroke-width=".8"/>
      ${spokes(200, 200, 128, 150, 10, 18)}
      ${ringText(200, 200, 139, GAN, 11)}
      <circle cx="200" cy="200" r="104" stroke-width="1.2"/>
      ${ringText(200, 200, 116, BAGUA, 16)}
      <circle cx="200" cy="200" r="70" stroke-width=".8" stroke-dasharray="2 4"/>
      <g class="spin" style="transform-origin:200px 200px;animation-duration:40s">
        <path d="M200 146a54 54 0 0 1 0 108a27 27 0 0 1 0-54a27 27 0 0 0 0-54z" fill="currentColor" stroke="none" opacity=".88"/>
        <circle cx="200" cy="200" r="54" stroke-width="1.2"/>
        <circle cx="200" cy="173" r="7" fill="currentColor" stroke="none"/>
        <circle cx="200" cy="227" r="7" class="paper-fill" stroke="none"/>
      </g>
    `, 'art art--compass');
  }

  // 祥云
  const cloud = (cls) => svg('0 0 120 48', `
    <path d="M8 40h96" stroke-width="1.6"/>
    <path d="M18 40c-8 0-10-12-2-14c0-10 14-12 18-4c4-10 20-10 22 2c8-6 18 0 16 8c8-2 12 8 6 8" stroke-width="1.6"/>
    <path d="M30 30c2-4 8-4 10 0M58 26c3-5 10-4 11 1" stroke-width="1.2"/>
    <path d="M86 40c4 0 6-4 3-7M94 40c6 0 8-8 2-10" stroke-width="1.2"/>`, 'art art--cloud ' + (cls || ''));

  // 印章
  const seal = (text) => `<span class="seal" aria-hidden="true"><span>${text}</span></span>`;

  // 同心结
  const knot = () => svg('0 0 120 160', `
    <path d="M60 4v20" stroke-width="1.6"/>
    <path d="M60 24 L84 48 L60 72 L36 48 Z" stroke-width="1.6"/>
    <path d="M60 36 L72 48 L60 60 L48 48 Z" stroke-width="1.2"/>
    <path d="M36 48c-14-14-30 6-14 14M84 48c14-14 30 6 14 14" stroke-width="1.4"/>
    <path d="M60 72v14" stroke-width="1.6"/>
    <path d="M60 86c-8 20-14 40-20 66M60 86c0 24 0 44 0 66M60 86c8 20 14 40 20 66" stroke-width="1" opacity=".8"/>`, 'art art--knot');

  // 回纹分隔
  const divider = () => svg('0 0 280 20', `
    <path d="M0 10h100M180 10h100" stroke-width=".9"/>
    <path d="M104 14v-8h8v4h-4M176 14v-8h-8v4h4" stroke-width="1"/>
    <path d="M120 10 L140 2 L160 10 L140 18 Z" stroke-width="1"/>
    <circle cx="140" cy="10" r="3" fill="currentColor" stroke="none"/>`, 'art art--divider');

  // 二十八宿四象环（用于星宿页）
  function xiuRing(active) {
    const dots = XIU28.map((t, i) => {
      const deg = (360 / 28) * i;
      const [x, y] = polar(150, 150, 120, deg);
      const on = active === t;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 7 : 3}" fill="currentColor" stroke="none" class="${on ? 'pulse' : ''}" opacity="${on ? 1 : .55}"/>`;
    }).join('');
    const groups = ['东方青龙', '北方玄武', '西方白虎', '南方朱雀'].map((g, i) => {
      const [x, y] = polar(150, 150, 70, ((i * 7 + 3) * 360) / 28);
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="12" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">${g}</text>`;
    }).join('');
    return svg('0 0 300 300', `
      <circle cx="150" cy="150" r="138" stroke-width=".8" stroke-dasharray="1 4"/>
      <circle cx="150" cy="150" r="120" stroke-width=".8"/>
      ${spokes(150, 150, 0, 120, 4, -360 / 56)}
      ${dots}
      ${ringText(150, 150, 104, XIU28, 10)}
      ${groups}`, 'art art--ring');
  }

  // 可复现的伪随机数，保证每次绘制的星图一致
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 各宿传统星数（用于装饰性的连线示意，不是真实星位）
  const STARS = [2, 4, 4, 4, 3, 9, 4, 6, 6, 4, 2, 3, 2, 2, 16, 3, 3, 7, 8, 3, 10, 8, 4, 8, 7, 6, 22, 4];

  // 生成一宿的星点与连线，坐标归一到 size×size
  function shape(i28, size) {
    const r = rng(i28 * 977 + 13);
    const n = Math.min(STARS[i28], 9);
    const pts = [[0, 0]];
    let ang = r() * Math.PI * 2;
    for (let k = 1; k < n; k++) {
      ang += (r() - 0.5) * 2.4;
      const len = 0.8 + r() * 0.7;
      const [px, py] = pts[k - 1];
      pts.push([px + Math.cos(ang) * len, py + Math.sin(ang) * len]);
    }
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
    const ox = (Math.max(...xs) + Math.min(...xs)) / 2;
    const oy = (Math.max(...ys) + Math.min(...ys)) / 2;
    return pts.map(([x, y], k) => ({ x: ((x - ox) / span) * size, y: ((y - oy) / span) * size, r: k === 0 ? 2.6 : 1.2 + r() * 1.2 }));
  }

  function constellationBody(i28, size, cx, cy, cls) {
    const pts = shape(i28, size);
    const line = pts.map((p, k) => (k ? 'L' : 'M') + (cx + p.x).toFixed(1) + ' ' + (cy + p.y).toFixed(1)).join('');
    const dots = pts.map((p) => `<circle cx="${(cx + p.x).toFixed(1)}" cy="${(cy + p.y).toFixed(1)}" r="${p.r.toFixed(1)}" fill="currentColor" stroke="none"/>`).join('');
    return `<g class="${cls || ''}"><path d="${line}" stroke-width=".7" opacity=".55"/>${dots}</g>`;
  }

  // 单个星宿的星官图；i27 为二十七宿序号
  function constellation(i27) {
    const i28 = i27 < 8 ? i27 : i27 + 1;
    return svg('-60 -60 120 120', `<circle r="56" stroke-width=".6" stroke-dasharray="1 3" opacity=".6"/>${constellationBody(i28, 70, 0, 0, 'const-glow')}`, 'art art--const');
  }

  // 全幅星图：二十八宿分野、黄道、北斗与背景星
  function starMap(active27) {
    const active = active27 == null ? -1 : active27 < 8 ? active27 : active27 + 1;
    const r = rng(2026);
    let bg = '';
    for (let k = 0; k < 280; k++) {
      const x = r() * 1000;
      const y = r() * 1000;
      bg += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.4 + r() * 1.1).toFixed(1)}" fill="currentColor" stroke="none" opacity="${(0.15 + r() * 0.6).toFixed(2)}" class="${k % 9 === 0 ? 'twinkle' : ''}" style="animation-delay:${(-r() * 4).toFixed(1)}s"/>`;
    }
    const ticks = Array.from({ length: 180 }, (_, k) => {
      const deg = k * 2;
      const [x1, y1] = polar(500, 500, 440, deg);
      const [x2, y2] = polar(500, 500, k % 5 === 0 ? 452 : 446, deg);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }).join('');
    const consts = XIU28.map((_, i) => {
      const [cx, cy] = polar(500, 500, 385, (360 / 28) * i + 360 / 56);
      return constellationBody(i, 56, cx, cy, i === active ? 'is-active' : '');
    }).join('');
    const names = XIU28.map((t, i) => {
      const deg = (360 / 28) * i + 360 / 56;
      const [x, y] = polar(500, 500, 470, deg);
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" class="${i === active ? 'is-active' : ''}" transform="rotate(${deg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${t}</text>`;
    }).join('');
    const xiang = ['东方青龙', '北方玄武', '西方白虎', '南方朱雀'].map((g, i) => {
      const [x, y] = polar(500, 500, 262, ((i * 7 + 3.5) * 360) / 28);
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="17" letter-spacing="6" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" opacity=".7">${g}</text>`;
    }).join('');
    const dipper = [[452, 430], [478, 446], [498, 470], [522, 482], [530, 512], [566, 520], [570, 486]];
    const dip = `<path d="M${dipper.map((p) => p.join(' ')).join('L')}L522 482" stroke-width=".8" opacity=".6"/>` + dipper.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="currentColor" stroke="none"/>`).join('');
    return svg('0 0 1000 1000', `
      <g class="sky-stars">${bg}</g>
      <g class="spin" style="transform-origin:500px 500px;animation-duration:600s">
        <circle cx="500" cy="500" r="490" stroke-width=".6" stroke-dasharray="1 6"/>
        <circle cx="500" cy="500" r="440" stroke-width=".8"/>
        <circle cx="500" cy="500" r="330" stroke-width=".6"/>
        ${ticks}
        ${spokes(500, 500, 330, 440, 28, 0)}
        ${spokes(500, 500, 0, 330, 4, -360 / 56)}
        ${consts}${names}${xiang}
        <circle cx="520" cy="486" r="300" stroke-width=".6" stroke-dasharray="6 8" opacity=".6"/>
      </g>
      <circle cx="500" cy="500" r="200" stroke-width=".6" opacity=".7"/>
      ${dip}
      <circle cx="500" cy="500" r="3.5" fill="currentColor" stroke="none"/>`, 'art art--sky');
  }

  // 四象缩略星图：一象七宿
  function xiangMap(g) {
    const body = Array.from({ length: 7 }, (_, k) => {
      const i = g * 7 + k;
      const [cx, cy] = polar(60, 60, 38, (360 / 7) * k);
      return constellationBody(i, 22, cx, cy);
    }).join('');
    return svg('0 0 120 120', `<circle cx="60" cy="60" r="56" stroke-width=".6"/><circle cx="60" cy="60" r="18" stroke-width=".6" stroke-dasharray="1 3"/>${body}`, 'art art--xiang');
  }

  window.ART = { compass, cloud, seal, knot, divider, xiuRing, constellation, starMap, xiangMap };
})();
