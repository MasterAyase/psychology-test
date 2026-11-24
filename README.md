# Psychology Test · 心理测试

免费、无需注册的在线心理测评网站。答案和结果只保存在你自己的浏览器里。

在线访问：https://masterayase.github.io/psychology-test/

## 测试列表

- **大五人格测试**：50 题，题目改编自 IPIP 大五因素标记（公共领域）
- **16 型人格倾向**：32 题，基于荣格心理类型理论，题目为原创
- **恋爱依恋风格**：16 题，基于成人依恋"焦虑-回避"两维度模型，题目为原创
- **塔罗指引**：22 张大阿尔卡那，3 种牌阵，解读为原创

## 本地运行

纯静态网站，不需要安装依赖或构建。在项目目录下启动任意静态服务器：

```bash
python -m http.server 8080
```

然后打开 http://localhost:8080 。

## 目录结构

```
index.html          页面骨架
css/app.css         全部样式
js/app.js           路由、答题、报告、塔罗抽牌、解锁、本地记录
js/fx.js            图表、弹窗、滚动动画、分享海报
js/paywall.js       价格、购买链接、兑换码哈希
js/tests/*.js       各测试的题目、计分和解读（含付费部分）
tools/make-codes.js 兑换码生成脚本
```

## 收费设置

1. 在面包多、爱发电等平台上架"完整报告兑换码"商品，把商品链接填到 `js/paywall.js` 的 `buyUrl`。
2. 运行 `node tools/make-codes.js 200` 生成 200 个兑换码。兑换码追加到 `codes.txt`，上传到平台作为卡密；哈希自动写进 `js/paywall.js`。`codes.txt` 已被 `.gitignore` 忽略，不要提交。
3. 提交并推送 `js/paywall.js`。

限制：网站没有后台，无法在服务器端核销兑换码。同一个码可以在不同设备上重复使用，懂技术的人也能绕过解锁。

## 添加新测试

在 `js/tests/` 下新建一个文件，向 `window.PT_TESTS` 推入一个测试对象（可参考 `attachment.js`），然后在 `index.html` 里、`js/paywall.js` 之前引入它。首页列表会自动出现新测试。

## 免责声明

所有结果仅用于自我了解和娱乐，不构成心理诊断或专业建议。

## 协议

[MIT License](LICENSE)
