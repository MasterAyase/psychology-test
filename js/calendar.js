// 历法计算：公历转农历、节气、八字四柱
// 农历由浏览器内置的 Intl 中国历法提供；节气用 Meeus 低精度太阳黄经公式计算，误差约 15 分钟。
(function () {
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const SHICHEN = ['子时 23–01', '丑时 01–03', '寅时 03–05', '卯时 05–07', '辰时 07–09', '巳时 09–11', '午时 11–13', '未时 13–15', '申时 15–17', '酉时 17–19', '戌时 19–21', '亥时 21–23'];
  const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const LUNAR_DAY = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  const rad = Math.PI / 180;
  const mod = (a, n) => ((a % n) + n) % n;

  // 公历日期的儒略日数（当日正午）
  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  // 太阳视黄经（度），jd 为儒略日
  function sunLongitude(jd) {
    const T = (jd - 2451545.0) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * rad;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    const omega = (125.04 - 1934.136 * T) * rad;
    return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(omega), 360);
  }

  function lunar(y, m, d) {
    const t = new Date(Date.UTC(y, m - 1, d, 4));
    const num = new Intl.DateTimeFormat('en-u-ca-chinese', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric' }).format(t);
    const name = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { timeZone: 'Asia/Shanghai', month: 'long' }).format(t);
    const match = num.match(/(\d+)\D*?\/(\d+)/) || num.match(/(\d+)\D+(\d+)/);
    if (!match) throw new Error('lunar parse failed: ' + num);
    const month = Number(match[1]);
    const day = Number(match[2]);
    const leap = /bis/.test(num) || name.indexOf('闰') !== -1;
    return { month, day, leap, text: (leap ? '闰' : '') + LUNAR_MONTH[month - 1] + '月' + LUNAR_DAY[day - 1] };
  }

  const pillar = (i) => ({ gan: i % 10, zhi: i % 12, text: GAN[i % 10] + ZHI[i % 12] });
  // 由天干、地支序号求六十甲子序号
  const ganzhiIndex = (g, z) => mod(6 * g - 5 * z, 60);

  // hour 为 0–23 的整点；传 null 表示时辰不详
  function bazi(y, m, d, hour) {
    const hasHour = hour !== null && hour !== undefined;
    const h = hasHour ? hour : 12;
    const jdUT = jdn(y, m, d) - 0.5 + (h + 0.5 - 8) / 24;
    const L = sunLongitude(jdUT);
    const k = Math.floor(mod(L - 315, 360) / 30); // 0 为寅月
    let year = y;
    if (m <= 2 && k >= 10) year -= 1;
    const yg = mod(year - 4, 10);
    const yz = mod(year - 4, 12);
    const mg = mod((yg % 5) * 2 + 2 + k, 10);
    const mz = mod(2 + k, 12);
    // 23 点起算次日（子初换日）
    const dayJdn = jdn(y, m, d) + (hasHour && hour >= 23 ? 1 : 0);
    const di = mod(dayJdn + 49, 60);
    const res = {
      year: pillar(ganzhiIndex(yg, yz)),
      month: pillar(ganzhiIndex(mg, mz)),
      day: pillar(di),
      hour: null,
      sunLongitude: L
    };
    if (hasHour) {
      const hz = Math.floor((hour + 1) / 2) % 12;
      const hg = mod((res.day.gan % 5) * 2 + hz, 10);
      res.hour = pillar(ganzhiIndex(hg, hz));
    }
    return res;
  }

  // 某公历年的流年干支（以立春后为准）
  const yearPillar = (year) => pillar(ganzhiIndex(mod(year - 4, 10), mod(year - 4, 12)));

  window.CAL = { GAN, ZHI, SHENGXIAO, SHICHEN, jdn, sunLongitude, lunar, bazi, yearPillar, ganzhiIndex, mod };
})();
