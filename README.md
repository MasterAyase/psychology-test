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
js/app.js           路由、答题流程、结果展示、本地记录
js/tests/*.js       各测试的题目、计分和解读
```

## 添加新测试

在 `js/tests/` 下新建一个文件，向 `window.PT_TESTS` 推入一个测试对象（可参考 `attachment.js`），然后在 `index.html` 里、`js/app.js` 之前引入它。首页列表会自动出现新测试。

## 免责声明

所有结果仅用于自我了解和娱乐，不构成心理诊断或专业建议。

## 协议

[MIT License](LICENSE)
