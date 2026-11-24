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

  window.ART = { compass, cloud, seal, knot, divider, xiuRing };
})();
