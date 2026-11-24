// 视觉与交互工具：图表、弹窗、提示、滚动进场、分享海报
(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // 雷达图，values 为 0–100
  function radar(labels, values) {
    const cx = 190, cy = 170, r = 120, n = labels.length;
    const pt = (i, k) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
    };
    const ring = (k) => labels.map((_, i) => pt(i, k).join(',')).join(' ');
    const grid = [0.25, 0.5, 0.75, 1].map((k) => `<polygon class="grid" points="${ring(k)}"/>`).join('');
    const axes = labels.map((_, i) => `<line class="grid" x1="${cx}" y1="${cy}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}"/>`).join('');
    const area = values.map((v, i) => pt(i, Math.max(v, 4) / 100).join(',')).join(' ');
    const dots = values.map((v, i) => { const [x, y] = pt(i, Math.max(v, 4) / 100); return `<circle class="dot" cx="${x}" cy="${y}" r="3.5"/>`; }).join('');
    const text = labels.map((l, i) => {
      const [x, y] = pt(i, 1.2);
      return `<text x="${x}" y="${y + 4}" text-anchor="middle">${esc(l)} ${Math.round(values[i])}</text>`;
    }).join('');
    return `<svg class="chart" viewBox="0 0 380 340" role="img" aria-label="五维雷达图">${grid}${axes}<polygon class="area" points="${area}" style="transform-origin:${cx}px ${cy}px"/>${dots}${text}</svg>`;
  }

  // 依恋四象限图，x 为回避、y 为焦虑
  function quadrant(anx, avo) {
    const s = 300, pad = 40;
    const x = pad + (avo / 100) * s, y = pad + s - (anx / 100) * s;
    const q = (tx, ty, t) => `<text x="${tx}" y="${ty}" text-anchor="middle" style="fill:var(--text-3)">${t}</text>`;
    return `<svg class="chart" viewBox="0 0 380 380" role="img" aria-label="依恋象限图">
      <rect class="grid" x="${pad}" y="${pad}" width="${s}" height="${s}" rx="14"/>
      <line class="grid" x1="${pad + s / 2}" y1="${pad}" x2="${pad + s / 2}" y2="${pad + s}"/>
      <line class="grid" x1="${pad}" y1="${pad + s / 2}" x2="${pad + s}" y2="${pad + s / 2}"/>
      ${q(pad + s / 4, pad + s / 4, '焦虑型')}${q(pad + (s * 3) / 4, pad + s / 4, '矛盾型')}
      ${q(pad + s / 4, pad + (s * 3) / 4 + 8, '安全型')}${q(pad + (s * 3) / 4, pad + (s * 3) / 4 + 8, '回避型')}
      <text x="${pad + s / 2}" y="${pad + s + 26}" text-anchor="middle">依恋回避 →</text>
      <text x="${pad - 14}" y="${pad + s / 2}" text-anchor="middle" transform="rotate(-90 ${pad - 14} ${pad + s / 2})">依恋焦虑 →</text>
      <circle cx="${x}" cy="${y}" r="16" style="fill:rgba(227,192,141,.15)"/>
      <circle class="you" cx="${x}" cy="${y}" r="7"/>
    </svg>`;
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

  function modal(html, label) {
    const prev = document.activeElement;
    const el = document.createElement('div');
    el.className = 'modal';
    el.innerHTML = `<div class="modal__box" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <button type="button" class="modal__close" aria-label="关闭">×</button>${html}</div>`;
    const close = () => {
      el.classList.add('is-closing');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { el.remove(); if (prev) prev.focus(); }, 240);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('.modal__close')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(el);
    const first = el.querySelector('input, .btn');
    (first || el.querySelector('.modal__close')).focus();
    return { el, close };
  }

  let observer;
  function reveal(root) {
    if (observer) observer.disconnect();
    const items = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((n) => n.classList.add('is-in')); return; }
    observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.querySelectorAll('[data-w]').forEach((b) => { b.style.width = b.dataset.w + '%'; });
        observer.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    items.forEach((n) => observer.observe(n));
    // 首屏内的元素直接显示，不依赖观察器回调
    requestAnimationFrame(() => {
      items.forEach((n) => {
        if (n.getBoundingClientRect().top < innerHeight * 0.95) {
          n.classList.add('is-in');
          n.querySelectorAll('[data-w]').forEach((b) => { b.style.width = b.dataset.w + '%'; });
          observer.unobserve(n);
        }
      });
    });
  }

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  window.FX = { esc, radar, quadrant, toast, modal, reveal, sha256 };
})();
// 分享海报：用 canvas 画一张 1080×1440 的图片
(function () {
  const SERIF = '"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif';
  const SANS = '"PingFang SC", "Microsoft YaHei", sans-serif';

  function wrap(ctx, text, x, y, maxW, lineH, maxLines) {
    let line = '';
    let lines = 0;
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxW) {
        lines += 1;
        if (lines === maxLines) { ctx.fillText(line.slice(0, -1) + '…', x, y); return y + lineH; }
        ctx.fillText(line, x, y);
        line = ch;
        y += lineH;
      } else {
        line += ch;
      }
    }
    if (line) ctx.fillText(line, x, y);
    return y + lineH;
  }

  function poster(d) {
    const W = 1080, H = 1440;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1b1622'); bg.addColorStop(1, '#0b0a0f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(220, 160, 0, 220, 160, 700);
    glow.addColorStop(0, 'rgba(160,120,60,.45)'); glow.addColorStop(1, 'rgba(160,120,60,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(227,192,141,.55)'; ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.strokeStyle = 'rgba(227,192,141,.2)';
    ctx.strokeRect(62, 62, W - 124, H - 124);

    const gold = ctx.createLinearGradient(0, 0, W, 0);
    gold.addColorStop(0, '#f6dfb7'); gold.addColorStop(.5, '#e3c08d'); gold.addColorStop(1, '#b8925a');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e3c08d';
    ctx.font = `28px ${SANS}`;
    ctx.fillText('P S Y C H O L O G Y   T E S T', W / 2, 150);
    ctx.fillStyle = '#a7a196';
    ctx.font = `34px ${SANS}`;
    ctx.fillText(d.testName, W / 2, 210);

    let y = 380;
    if (d.code) {
      ctx.fillStyle = gold;
      ctx.font = `bold 190px ${SERIF}`;
      ctx.fillText(d.code, W / 2, y + 60);
      y += 170;
    }
    ctx.fillStyle = '#f3efe8';
    ctx.font = `bold ${d.code ? 72 : 96}px ${SERIF}`;
    ctx.fillText(d.title, W / 2, y + 30);
    y += 110;
    ctx.fillStyle = '#a7a196';
    ctx.font = `34px ${SANS}`;
    y = wrap(ctx, d.summary, W / 2, y, 820, 56, 3) + 40;

    ctx.textAlign = 'left';
    (d.lines || []).slice(0, 5).forEach((l) => {
      ctx.fillStyle = '#f3efe8'; ctx.font = `32px ${SANS}`;
      ctx.fillText(l.label, 150, y);
      ctx.textAlign = 'right'; ctx.fillStyle = '#e3c08d'; ctx.font = `36px ${SERIF}`;
      ctx.fillText(l.text != null ? l.text : Math.round(l.value), W - 150, y);
      ctx.textAlign = 'left';
      if (l.value != null) {
        ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(150, y + 22, W - 300, 6);
        ctx.fillStyle = gold; ctx.fillRect(150, y + 22, ((W - 300) * l.value) / 100, 6);
      }
      y += 96;
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6f6a62'; ctx.font = `28px ${SANS}`;
    ctx.fillText('想知道你的结果？访问', W / 2, H - 190);
    ctx.fillStyle = '#e3c08d'; ctx.font = `32px ${SANS}`;
    ctx.fillText(d.url, W / 2, H - 140);
    return c.toDataURL('image/png');
  }

  window.FX.poster = poster;
})();
