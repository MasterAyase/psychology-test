// 付费解锁配置。
// 1. 在面包多、爱发电等平台上架"完整报告兑换码"商品，把商品链接填到 buyUrl。
// 2. 运行 node tools/make-codes.js 200 生成兑换码：codes.txt 上传到平台作为卡密，
//    脚本会自动把对应的哈希写进下面的 codeHashes。codes.txt 不要提交到仓库。
// 注意：纯静态网站无法在服务器端核销兑换码，同一个码可以在不同设备上重复使用。
window.PT_PAY = {
  buyUrl: '',
  codeHashes: [
    // __CODE_HASHES__
  ]
};
