// 星座配对。算法依据西方占星的太阳星座"相位"：按两个星座在黄道上相隔几个星座，
// 结合元素（火土风水）与模式（基本、固定、变动）的关系打分。解读文字为本站原创，均以正向表述。
(function () {
  // [名称, 符号, 英文, 起始月, 起始日, 元素序号, 模式序号, 关键词, 性格]
  const SIGNS = [
    ['白羊座', '♈', 'Aries', 3, 21, 0, 0, '热情 · 勇敢 · 直率', '行动派，想到就做，像一团小火苗，总能点燃身边人的热情。'],
    ['金牛座', '♉', 'Taurus', 4, 20, 1, 1, '踏实 · 温柔 · 有品味', '稳重可靠，懂得享受生活，对认定的人和事非常长情。'],
    ['双子座', '♊', 'Gemini', 5, 21, 2, 2, '机灵 · 风趣 · 好奇', '脑子转得快，话题永远聊不完，和你在一起从不无聊。'],
    ['巨蟹座', '♋', 'Cancer', 6, 22, 3, 0, '温暖 · 体贴 · 顾家', '把在乎的人放在心尖上，是最会照顾人、最有安全感的存在。'],
    ['狮子座', '♌', 'Leo', 7, 23, 0, 1, '大方 · 自信 · 闪耀', '天生的主角光环，慷慨热心，对爱的人毫无保留。'],
    ['处女座', '♍', 'Virgo', 8, 23, 1, 2, '细致 · 可靠 · 有条理', '心思缜密，把每件小事都做得妥帖，用行动表达温柔。'],
    ['天秤座', '♎', 'Libra', 9, 23, 2, 0, '优雅 · 和气 · 有审美', '温和有礼，懂得平衡与分寸，身边的人都觉得如沐春风。'],
    ['天蝎座', '♏', 'Scorpio', 10, 24, 3, 1, '深情 · 专注 · 神秘', '感情浓烈而专一，一旦认定就全心守护，洞察力惊人。'],
    ['射手座', '♐', 'Sagittarius', 11, 23, 0, 2, '乐观 · 自由 · 爱冒险', '永远对世界充满好奇，乐观开朗，是快乐的传播者。'],
    ['摩羯座', '♑', 'Capricorn', 12, 22, 1, 0, '踏实 · 坚定 · 有担当', '目标清晰、脚踏实地，外冷内热，是最值得托付的人。'],
    ['水瓶座', '♒', 'Aquarius', 1, 20, 2, 1, '独特 · 理性 · 有远见', '想法新颖、不随大流，像朋友一样尊重伴侣的自由。'],
    ['双鱼座', '♓', 'Pisces', 2, 19, 3, 2, '浪漫 · 善良 · 想象力', '温柔敏感、富有同理心，把生活过成一首诗。']
  ];
  const ELEMENT = ['火象', '土象', '风象', '水象'];
  const MODE = ['基本', '固定', '变动'];

  // 相位：按相隔星座数（0–6）
  const ASPECT = [
    { name: '合相', title: '同频共振', score: 88, text: '同一个星座，性格、喜好和节奏都很接近，一个眼神就懂对方。你们是彼此的知音，也是最懂对方的人。' },
    { name: '半六合相', title: '近邻相伴', score: 82, text: '星座相邻，像住在隔壁的好朋友。你们一个擅长的正是另一个想学的，相处起来舒服又有新鲜感。' },
    { name: '六合相', title: '互补相助', score: 91, text: '元素天然互补，一个点子多，一个行动快，配合起来事半功倍。你们会是彼此最好的搭档和支持者。' },
    { name: '四分相', title: '火花相激', score: 80, text: '个性都很鲜明，在一起总有火花。你们能激发彼此的潜力，让对方变得更勇敢、更有活力。' },
    { name: '三分相', title: '天生默契', score: 96, text: '同属一个元素，价值观和生活节奏高度契合，是占星里最和谐的组合。相处自然顺畅，很容易长久。' },
    { name: '梅花相', title: '新奇互补', score: 78, text: '你们的世界观很不一样，正因如此，对方总能带你看到全新的风景。保持好奇，会越处越有意思。' },
    { name: '对分相', title: '对望相吸', score: 86, text: '黄道上正对彼此，像镜子的两面，最容易被对方身上自己没有的特质吸引。互相学习，会成为彼此的另一半拼图。' }
  ];

  // 元素组合的相处氛围（按元素序号排序后的组合）
  const ELEMENT_PAIR = {
    '0-0': '两团火在一起，热烈又有激情，一起做什么都充满干劲。',
    '0-1': '火的热情遇上土的稳重，一个负责点燃，一个负责落地，梦想更容易成真。',
    '0-2': '风助火势，你们是最有感染力的组合，一起出发就是一场冒险。',
    '0-3': '火的热烈遇上水的温柔，一刚一柔，能把对方照顾得很好。',
    '1-1': '两个踏实的人，一起把日子过得安稳又有质感。',
    '1-2': '土的务实加上风的灵感，想法和执行力兼备，是很好的合伙人。',
    '1-3': '土与水相互滋养，一个给安全感，一个给温柔，越久越甜。',
    '2-2': '两阵风在一起，有说不完的话题，精神上非常合拍。',
    '2-3': '风的理性和水的感性互相补充，能读懂对方没说出口的话。',
    '3-3': '两个感性的人，情感共鸣很深，是彼此最好的倾听者。'
  };

  // 按公历月日求星座序号
  function signOf(m, d) {
    for (let i = 0; i < 12; i++) {
      const next = SIGNS[(i + 1) % 12];
      const [, , , sm, sd] = SIGNS[i];
      const md = m * 100 + d;
      const start = sm * 100 + sd;
      const end = next[3] * 100 + next[4];
      if (start < end ? md >= start && md < end : md >= start || md < end) return i;
    }
    return 0;
  }

  function info(i) {
    const s = SIGNS[i];
    const pad = (n) => String(n).padStart(2, '0');
    const next = SIGNS[(i + 1) % 12];
    const endDate = new Date(Date.UTC(2001, next[3] - 1, next[4] - 1));
    return {
      index: i, name: s[0], glyph: s[1], en: s[2],
      range: `${pad(s[3])}.${pad(s[4])} – ${pad(endDate.getUTCMonth() + 1)}.${pad(endDate.getUTCDate())}`,
      element: ELEMENT[s[5]], el: s[5], mode: MODE[s[6]], tags: s[7], text: s[8]
    };
  }

  function match(a, b) {
    const raw = Math.abs(a - b);
    const dist = Math.min(raw, 12 - raw);
    const asp = ASPECT[dist];
    const A = info(a);
    const B = info(b);
    const sameMode = A.mode === B.mode;
    const key = [A.el, B.el].sort().join('-');
    // 在相位分基础上，模式相同时加 2 分，保持在 78–98
    const score = Math.min(98, asp.score + (sameMode && dist !== 0 ? 2 : 0));
    const hi = (v) => Math.max(70, Math.min(99, v));
    // 火与风、土与水为互补元素
    const elementHarmony = A.el === B.el ? 98 : Math.abs(A.el - B.el) === 2 ? 92 : 84;
    return {
      score,
      dist,
      aspect: asp,
      element: ELEMENT_PAIR[key],
      sameMode,
      dims: [
        ['爱情', hi(score + (dist === 6 ? 4 : 0))],
        ['友情', hi(score + (dist === 1 || dist === 2 ? 4 : 0))],
        ['沟通', hi(Math.round((score + elementHarmony) / 2))],
        ['默契', hi(score + (dist === 4 || dist === 0 ? 3 : -2))]
      ]
    };
  }

  window.STAR = { SIGNS, ELEMENT, MODE, ASPECT, signOf, info, match };
})();
