// 生成兑换码：node tools/make-codes.js [数量]
// 兑换码追加到 codes.txt（上传到售卖平台当卡密，不要提交到仓库），哈希写入 js/paywall.js。
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const count = Math.max(1, Math.min(5000, parseInt(process.argv[2], 10) || 100));
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const root = path.join(__dirname, '..');
const payFile = path.join(root, 'js', 'paywall.js');
const codesFile = path.join(root, 'codes.txt');
const MARKER = '// __CODE_HASHES__';

function makeCode() {
  const bytes = crypto.randomBytes(10);
  let s = '';
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return s.slice(0, 5) + '-' + s.slice(5);
}

const src = fs.readFileSync(payFile, 'utf8');
if (!src.includes(MARKER)) {
  console.error('js/paywall.js 里找不到标记 ' + MARKER);
  process.exit(1);
}

const codes = new Set();
while (codes.size < count) codes.add(makeCode());

const hashes = [...codes].map((c) => {
  const h = crypto.createHash('sha256').update(c.replace('-', '')).digest('hex');
  return `    '${h}',`;
});

fs.writeFileSync(payFile, src.replace(MARKER, hashes.join('\n') + '\n    ' + MARKER));
fs.appendFileSync(codesFile, [...codes].join('\n') + '\n');
console.log(`已生成 ${count} 个兑换码，追加到 codes.txt；哈希已写入 js/paywall.js。`);
