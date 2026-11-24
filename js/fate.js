// 八字正缘与合婚分析。规则取自传统命理的常见说法，解读文字为本站原创，仅供娱乐。
(function () {
  const { GAN, ZHI, SHENGXIAO, yearPillar } = window.CAL;
  const WX = ['木', '火', '土', '金', '水'];
  const GAN_WX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  const ZHI_WX = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  const ZHI_MAIN_GAN = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];
  const SHISHEN = [['比肩', '劫财'], ['食神', '伤官'], ['偏财', '正财'], ['七杀', '正官'], ['偏印', '正印']];

  const LIUHE = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const chong = (z) => (z + 6) % 12;
  const hai = (z) => (7 - z + 12) % 12;
  const sanhe = (a, b) => a !== b && a % 4 === b % 4;
  const hongluan = (z) => (3 - z + 12) % 12;
  const tianxi = (z) => (hongluan(z) + 6) % 12;
  const taohua = (z) => [9, 6, 3, 0][z % 4];
  const ganHe = (a, b) => (a + 5) % 10 === b;

  function shishen(dayGan, gan) {
    const rel = (GAN_WX[gan] - GAN_WX[dayGan] + 5) % 5;
    return SHISHEN[rel][dayGan % 2 === gan % 2 ? 0 : 1];
  }

  const ELEMENT = {
    木: { trait: '温和上进、有同情心，做事有耐心，喜欢学习和成长', look: '身形偏修长，气质清爽', field: '教育、文化、医疗、设计', dir: '东方', color: '青绿色' },
    火: { trait: '热情开朗、有感染力，表达直接，行动力强', look: '神采奕奕，笑起来很有感染力', field: '传媒、销售、餐饮、能源', dir: '南方', color: '红色、紫色' },
    土: { trait: '稳重踏实、包容可靠，重承诺，给人安全感', look: '面相敦厚，给人亲切感', field: '地产、管理、金融、农业', dir: '本地或中部', color: '黄色、咖色' },
    金: { trait: '果断讲原则、有执行力，做事干脆利落', look: '五官立体，形象干练', field: '法律、金融、科技、制造', dir: '西方', color: '白色、金色' },
    水: { trait: '聪明灵活、善解人意，沟通能力好，适应力强', look: '眼神灵动，气质温润', field: '贸易、物流、咨询、互联网', dir: '北方', color: '黑色、蓝色' }
  };

  // 日支（夫妻宫）十神对感情的影响
  const PALACE = {
    比肩: '夫妻宫坐比肩，你们更像并肩作战的伙伴，彼此独立、平等，也需要注意别各自为政。',
    劫财: '夫妻宫坐劫财，感情里个性都强，容易为小事争输赢，学会让一步关系会更顺。',
    食神: '夫妻宫坐食神，相处轻松有趣，懂得一起享受生活，是很有烟火气的组合。',
    伤官: '夫妻宫坐伤官，你对伴侣要求高、眼光挑剔，遇到真正欣赏的人才会全心投入。',
    偏财: '夫妻宫坐偏财，你在感情中大方体贴，异性缘好，用心经营会很幸福。',
    正财: '夫妻宫坐正财，你重视家庭和责任，感情踏实稳定，适合细水长流。',
    七杀: '夫妻宫坐七杀，容易被有魄力、有个性的人吸引，感情热烈但需要磨合。',
    正官: '夫妻宫坐正官，伴侣多端正可靠、有责任心，你们的关系有规矩也有温度。',
    偏印: '夫妻宫坐偏印，你在感情里需要精神上的共鸣，喜欢能聊深层话题的人。',
    正印: '夫妻宫坐正印，伴侣会像家人一样照顾你，感情温暖、有依靠感。'
  };

  function pillars(b) {
    return [b.year, b.month, b.day, b.hour].filter(Boolean);
  }

  function elements(b) {
    const count = [0, 0, 0, 0, 0];
    pillars(b).forEach((p) => { count[GAN_WX[p.gan]] += 1; count[ZHI_WX[p.zhi]] += 1; });
    return count;
  }

  // 单人正缘分析；gender 为 'm' 或 'f'
  function destiny(b, gender, nowYear) {
    const dm = b.day.gan;
    const dmWx = GAN_WX[dm];
    const count = elements(b);
    const support = count[dmWx] + count[(dmWx + 4) % 5];
    const strong = support >= pillars(b).length;
    const spouseWx = gender === 'm' ? (dmWx + 2) % 5 : (dmWx + 3) % 5;
    const spouseStar = gender === 'm' ? '正财' : '正官';
    const dz = b.day.zhi;
    const yz = b.year.zhi;
    const palaceShishen = shishen(dm, ZHI_MAIN_GAN[dz]);
    const el = ELEMENT[WX[spouseWx]];
    const goodZodiac = [LIUHE[dz]].concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((z) => sanhe(z, dz)));

    const years = [];
    for (let y = nowYear; y < nowYear + 10; y++) {
      const p = yearPillar(y);
      const why = [];
      let score = 0;
      if (p.zhi === hongluan(yz)) { score += 3; why.push('红鸾星动'); }
      if (p.zhi === tianxi(yz)) { score += 2; why.push('天喜临门'); }
      if (p.zhi === LIUHE[dz]) { score += 2; why.push('流年六合夫妻宫'); }
      if (sanhe(p.zhi, dz)) { score += 1; why.push('流年三合夫妻宫'); }
      if (p.zhi === taohua(dz)) { score += 1; why.push('桃花年'); }
      if (GAN_WX[p.gan] === spouseWx) { score += 2; why.push(gender === 'm' ? '财星透出' : '官星透出'); }
      if (p.zhi === chong(dz)) { score -= 1; why.push('冲夫妻宫，感情易有变动'); }
      years.push({ year: y, ganzhi: p.text, zodiac: SHENGXIAO[p.zhi], score, why });
    }
    const best = years.filter((y) => y.score >= 3).sort((a, b2) => b2.score - a.score).slice(0, 3);

    return {
      dayMaster: GAN[dm] + WX[dmWx],
      strong,
      count,
      shishen: pillars(b).map((p, i) => (i === 2 ? '日主' : shishen(dm, p.gan))),
      spouse: { wx: WX[spouseWx], star: spouseStar, trait: el.trait, look: el.look, field: el.field, dir: el.dir, color: el.color },
      palace: { zhi: ZHI[dz], shishen: palaceShishen, text: PALACE[palaceShishen] },
      zodiac: { good: goodZodiac.map((z) => SHENGXIAO[z]), avoid: [SHENGXIAO[chong(dz)], SHENGXIAO[hai(dz)]] },
      stars: { hongluan: ZHI[hongluan(yz)], tianxi: ZHI[tianxi(yz)], taohua: ZHI[taohua(dz)] + '（' + SHENGXIAO[taohua(dz)] + '）' },
      years,
      best,
      weakest: WX[count.indexOf(Math.min.apply(null, count))],
      strongest: WX[count.indexOf(Math.max.apply(null, count))]
    };
  }
  // 双人合婚；a、b 为 { bazi, lunar, gender, xiu }
  function match(a, b) {
    const items = [];
    let score = 60;
    const add = (delta, label, text) => { score += delta; items.push({ delta, label, text }); };

    const rel = window.XIU.relate(a.xiu.index, b.xiu.index);
    add(Math.round((rel.score - 50) * 0.4), '宿曜 · ' + rel.key, rel.text);

    const ya = a.bazi.year.zhi;
    const yb = b.bazi.year.zhi;
    const za = SHENGXIAO[ya] + '与' + SHENGXIAO[yb];
    if (LIUHE[ya] === yb) add(8, '生肖六合', za + '六合，性情互补，相处融洽。');
    else if (sanhe(ya, yb)) add(6, '生肖三合', za + '三合，目标一致，容易同心协力。');
    else if (chong(ya) === yb) add(-8, '生肖相冲', za + '相冲，脾气容易顶撞，需要多些耐心。');
    else if (hai(ya) === yb) add(-5, '生肖相害', za + '相害，容易因误会产生隔阂，坦诚沟通很重要。');
    else if (ya === yb) add(2, '生肖相同', '同属' + SHENGXIAO[ya] + '，生活习惯和想法比较接近。');
    else add(0, '生肖平和', za + '没有明显的合冲，关系走向取决于相处。');

    const da = a.bazi.day;
    const db = b.bazi.day;
    if (ganHe(da.gan, db.gan) || ganHe(db.gan, da.gan)) add(6, '日干五合', GAN[da.gan] + GAN[db.gan] + '相合，彼此有天然的吸引力。');
    if (LIUHE[da.zhi] === db.zhi) add(6, '日支六合', '夫妻宫' + ZHI[da.zhi] + ZHI[db.zhi] + '六合，婚后生活容易和睦。');
    else if (chong(da.zhi) === db.zhi) add(-6, '日支相冲', '夫妻宫' + ZHI[da.zhi] + ZHI[db.zhi] + '相冲，生活习惯差异大，需要互相迁就。');

    const ea = elements(a.bazi);
    const eb = elements(b.bazi);
    const weakA = ea.indexOf(Math.min.apply(null, ea));
    const weakB = eb.indexOf(Math.min.apply(null, eb));
    if (eb[weakA] >= 3) add(4, '五行互补', '你命中偏少的' + WX[weakA] + '，正是对方的长处。');
    if (ea[weakB] >= 3) add(4, '五行互补', '对方命中偏少的' + WX[weakB] + '，正好由你来补足。');

    const spouseOf = (p) => (p.gender === 'm' ? (GAN_WX[p.bazi.day.gan] + 2) % 5 : (GAN_WX[p.bazi.day.gan] + 3) % 5);
    if (GAN_WX[db.gan] === spouseOf(a)) add(5, '配偶星相应', '对方的日主五行正是你的配偶星，符合传统说法里的"正缘"特征。');
    if (GAN_WX[da.gan] === spouseOf(b)) add(5, '配偶星相应', '你的日主五行正是对方的配偶星，你很可能是对方心中的理想型。');

    score = Math.max(52, Math.min(98, score));
    const grade = score >= 90 ? '上上婚 · 天作之合' : score >= 80 ? '上等婚 · 情投意合' : score >= 70 ? '中上婚 · 用心经营' : score >= 60 ? '中等婚 · 磨合成长' : '需包容 · 慢慢靠近';
    return { score, grade, relation: rel, items };
  }

  window.FATE = { WX, GAN_WX, ZHI_WX, elements, shishen, destiny, match };
})();
