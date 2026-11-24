// 装饰图案：金色线描 SVG，全部使用 currentColor，颜色由 CSS 控制
(function () {
  const svg = (vb, body, cls) => `<svg class="${cls || 'art'}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  // 四角星
  const star = (x, y, r, cls) => `<path class="${cls || ''}" d="M${x} ${y - r}C${x + r * 0.12} ${y - r * 0.12} ${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y}C${x + r * 0.12} ${y + r * 0.12} ${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r}C${x - r * 0.12} ${y + r * 0.12} ${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y}C${x - r * 0.12} ${y - r * 0.12} ${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r}Z" fill="currentColor" stroke="none"/>`;

  function ticks(cx, cy, r1, r2, n, every) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const long = every && i % every === 0;
      const rr = long ? r1 - (r2 - r1) : r1;
      out += `<line x1="${(cx + Math.cos(a) * rr).toFixed(1)}" y1="${(cy + Math.sin(a) * rr).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}"/>`;
    }
    return out;
  }

  // 首页主视觉：星盘、月相、星座连线
  const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  function hero() {
    const zod = ZODIAC.map((z, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 12;
      return `<text x="${(200 + Math.cos(a) * 158).toFixed(1)}" y="${(200 + Math.sin(a) * 158 + 6).toFixed(1)}" text-anchor="middle" font-size="15" fill="currentColor" stroke="none">${z}&#xFE0E;</text>`;
    }).join('');
    return svg('0 0 400 400', `
      <g class="spin" style="transform-origin:200px 200px">
        <circle cx="200" cy="200" r="190" stroke-width=".8" stroke-dasharray="1 6"/>
        <circle cx="200" cy="200" r="176" stroke-width=".8"/>
        <circle cx="200" cy="200" r="140" stroke-width=".8"/>
        ${ticks(200, 200, 170, 176, 72, 6)}
        ${zod}
        ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; return `<line x1="${200 + Math.cos(a) * 140}" y1="${200 + Math.sin(a) * 140}" x2="${200 + Math.cos(a) * 176}" y2="${200 + Math.sin(a) * 176}" stroke-width=".8"/>`; }).join('')}
        <circle cx="200" cy="10" r="4" fill="currentColor" stroke="none"/>
      </g>
      <g class="spin spin--rev" style="transform-origin:200px 200px">
        <circle cx="200" cy="200" r="112" stroke-width=".8" stroke-dasharray="3 5"/>
        <path d="M200 88 L297 256 L103 256 Z" stroke-width=".8" opacity=".7"/>
        <path d="M200 312 L103 144 L297 144 Z" stroke-width=".8" opacity=".7"/>
        <circle cx="312" cy="200" r="3.5" fill="currentColor" stroke="none"/>
      </g>
      <circle cx="200" cy="200" r="70" stroke-width="1"/>
      <path d="M222 152a52 52 0 1 0 0 96a64 64 0 0 1 0-96z" fill="currentColor" stroke="none" opacity=".18"/>
      <path d="M222 152a52 52 0 1 0 0 96a64 64 0 0 1 0-96z" stroke-width="1.2"/>
      ${star(236, 182, 10, 'twinkle')}${star(250, 222, 6, 'twinkle d2')}
      <g stroke-width=".8" opacity=".8">
        <path d="M40 70 L78 52 L112 80 L150 60"/>
        <path d="M300 350 L332 322 L366 336"/>
      </g>
      ${star(40, 70, 5, 'twinkle')}${star(78, 52, 3.5, 'twinkle d2')}${star(112, 80, 4, 'twinkle d3')}${star(150, 60, 3, 'twinkle')}
      ${star(300, 350, 4, 'twinkle d3')}${star(332, 322, 5, 'twinkle')}${star(366, 336, 3, 'twinkle d2')}
      ${star(360, 60, 7, 'twinkle d2')}${star(30, 330, 6, 'twinkle d3')}
    `, 'art art--hero');
  }
  // 各测试的插画，视口 200×200
  function bigFive() {
    const petals = Array.from({ length: 5 }, (_, i) => `<ellipse cx="100" cy="62" rx="20" ry="40" transform="rotate(${i * 72} 100 100)" stroke-width="1.1"/>`).join('');
    const inner = Array.from({ length: 5 }, (_, i) => `<ellipse cx="100" cy="76" rx="9" ry="22" transform="rotate(${i * 72 + 36} 100 100)" stroke-width=".8" opacity=".7"/>`).join('');
    const nodes = Array.from({ length: 5 }, (_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return `<circle cx="${(100 + Math.cos(a) * 86).toFixed(1)}" cy="${(100 + Math.sin(a) * 86).toFixed(1)}" r="3" fill="currentColor" stroke="none"/>`; }).join('');
    return svg('0 0 200 200', `
      <circle cx="100" cy="100" r="86" stroke-width=".7" stroke-dasharray="1 4"/>
      <g class="sway">${petals}${inner}</g>
      <circle cx="100" cy="100" r="10" stroke-width="1.1"/><circle cx="100" cy="100" r="3" fill="currentColor" stroke="none"/>
      ${nodes}${star(170, 34, 6, 'twinkle')}${star(28, 160, 4, 'twinkle d2')}`);
  }

  function types16() {
    const dots = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dots.push(`<circle cx="${43 + c * 38}" cy="${43 + r * 38}" r="${(r + c) % 3 === 0 ? 2.6 : 1.4}" fill="currentColor" stroke="none" opacity="${(r + c) % 3 === 0 ? 1 : .5}"/>`);
    return svg('0 0 200 200', `
      <rect x="24" y="24" width="152" height="152" rx="6" stroke-width=".8"/>
      <rect x="34" y="34" width="132" height="132" rx="3" stroke-width=".6" stroke-dasharray="2 4"/>
      <line x1="100" y1="12" x2="100" y2="188" stroke-width=".6"/><line x1="12" y1="100" x2="188" y2="100" stroke-width=".6"/>
      ${dots.join('')}
      <g class="spin" style="transform-origin:100px 100px">
        <path d="M100 46 L110 90 L154 100 L110 110 L100 154 L90 110 L46 100 L90 90 Z" stroke-width="1.1"/>
        <path d="M100 70 L104 96 L130 100 L104 104 L100 130 L96 104 L70 100 L96 96 Z" fill="currentColor" stroke="none" opacity=".25"/>
      </g>
      <circle cx="100" cy="100" r="4" fill="currentColor" stroke="none"/>
      <text x="100" y="20" text-anchor="middle" font-size="11" fill="currentColor" stroke="none">E</text>
      <text x="100" y="198" text-anchor="middle" font-size="11" fill="currentColor" stroke="none">I</text>
      <text x="6" y="104" text-anchor="middle" font-size="11" fill="currentColor" stroke="none">S</text>
      <text x="194" y="104" text-anchor="middle" font-size="11" fill="currentColor" stroke="none">N</text>`);
  }

  function attachment() {
    return svg('0 0 200 200', `
      <circle cx="78" cy="100" r="50" stroke-width="1.1"/>
      <circle cx="122" cy="100" r="50" stroke-width="1.1"/>
      <circle cx="78" cy="100" r="60" stroke-width=".6" stroke-dasharray="1 4"/>
      <circle cx="122" cy="100" r="60" stroke-width=".6" stroke-dasharray="1 4"/>
      <path class="beat" style="transform-origin:100px 102px" d="M100 118c-14-10-22-17-22-26a10 10 0 0 1 22-4a10 10 0 0 1 22 4c0 9-8 16-22 26z" fill="currentColor" stroke="none" opacity=".85"/>
      <path d="M20 160 C50 130 70 175 100 150 S150 130 180 158" stroke-width=".9" stroke-dasharray="3 4"/>
      ${star(30, 40, 6, 'twinkle')}${star(172, 44, 5, 'twinkle d2')}${star(160, 176, 4, 'twinkle d3')}`);
  }

  function tarot() {
    const rays = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `<line x1="${(100 + Math.cos(a) * 30).toFixed(1)}" y1="${(78 + Math.sin(a) * 30).toFixed(1)}" x2="${(100 + Math.cos(a) * (i % 2 ? 38 : 44)).toFixed(1)}" y2="${(78 + Math.sin(a) * (i % 2 ? 38 : 44)).toFixed(1)}"/>`; }).join('');
    return svg('0 0 200 200', `
      <path d="M52 186 V60 a48 48 0 0 1 96 0 V186 Z" stroke-width="1.1"/>
      <path d="M62 178 V62 a38 38 0 0 1 76 0 V178 Z" stroke-width=".6" stroke-dasharray="2 4"/>
      <g class="spin" style="transform-origin:100px 78px" stroke-width=".9">${rays}</g>
      <path d="M108 58a22 22 0 1 0 0 40a27 27 0 0 1 0-40z" stroke-width="1.2"/>
      <path d="M70 140 Q100 118 130 140 Q100 162 70 140 Z" stroke-width="1"/>
      <circle cx="100" cy="140" r="7" stroke-width="1"/><circle cx="100" cy="140" r="2.5" fill="currentColor" stroke="none"/>
      ${star(100, 166, 4)}${star(22, 52, 6, 'twinkle')}${star(178, 92, 5, 'twinkle d2')}${star(170, 30, 3, 'twinkle d3')}`);
  }

  // 分隔花纹
  const divider = () => svg('0 0 240 20', `
    <line x1="0" y1="10" x2="96" y2="10" stroke-width=".8"/><line x1="144" y1="10" x2="240" y2="10" stroke-width=".8"/>
    <circle cx="92" cy="10" r="1.6" fill="currentColor" stroke="none"/><circle cx="148" cy="10" r="1.6" fill="currentColor" stroke="none"/>
    <path d="M120 2 L126 10 L120 18 L114 10 Z" stroke-width=".9"/>${star(120, 10, 3.2)}
    <path d="M104 10 a6 6 0 0 1 6 -6 M136 10 a6 6 0 0 0 -6 -6 M104 10 a6 6 0 0 0 6 6 M136 10 a6 6 0 0 1 -6 6" stroke-width=".8"/>`, 'art art--divider');

  // 解锁徽章
  const lock = () => svg('0 0 80 80', `
    <circle cx="40" cy="40" r="36" stroke-width=".8" stroke-dasharray="1 4"/>
    <circle cx="40" cy="40" r="28" stroke-width=".9"/>
    <rect x="28" y="38" width="24" height="18" rx="3" stroke-width="1.3"/>
    <path d="M32 38 v-5 a8 8 0 0 1 16 0 v5" stroke-width="1.3"/>
    <circle cx="40" cy="47" r="2" fill="currentColor" stroke="none"/>
    ${star(66, 16, 4, 'twinkle')}${star(12, 62, 3, 'twinkle d2')}`, 'art art--lock');

  // 牌背中央徽记：日月
  const cardEmblem = () => svg('0 0 60 60', `
    <circle cx="30" cy="30" r="22" stroke-width="1"/>
    <circle cx="30" cy="30" r="17" stroke-width=".6" stroke-dasharray="1 3"/>
    ${ticks(30, 30, 22, 26, 24)}
    <path d="M34 20a10 10 0 1 0 0 20a12.5 12.5 0 0 1 0-20z" fill="currentColor" stroke="none" opacity=".85"/>
    ${star(26, 30, 3)}`, 'art art--emblem');

  const ILLU = { 'big-five': bigFive, types16, attachment, tarot };
  window.ART = {
    hero,
    divider,
    lock,
    cardEmblem,
    star: (cls) => svg('-10 -10 20 20', star(0, 0, 10), 'art ' + (cls || '')),
    test: (id) => (ILLU[id] ? ILLU[id]() : '')
  };
})();
