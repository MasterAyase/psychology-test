# Wingsight · 翼眸 ⚡

<div align="center">

**探索你的内心世界 · 一站式心理测试集合平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://heyemily-ovo.github.io/wingsight/)

</div>

---

## 📖 项目简介

**Wingsight（翼眸）** 是一个集成了多种心理学测试的集合网站，涵盖 MBTI 人格测试、历史人物人格测试、恋爱类型测试、心理成熟度测试、动物人格测试、暗黑人格测试、塔罗占卜等。只需一次点击，即可跳转到你感兴趣的测试，开启自我探索之旅。

## 🧩 已集成测试

| 测试名称 | 图标 | 题量 | 用时 | 简介 | 图鉴 | 历史 |
|---------|------|------|------|------|------|------|
| [MBTI 性格测试](tests/mbti/) | 🧠 | 93 题 | ~12 分钟 | 基于荣格心理学理论，探索你的 16 种人格类型 | 📖 16 型插画档案 + 认知功能地图 | ✅ |
| [历史人物人格测试](tests/history/) | 🏯 | 50 题 | ~8 分钟 | 基于大五人格科学，找到跨越千年的灵魂共鸣者 | 📖 16 位人物肖像档案 | ✅ |
| [恋爱类型测试](tests/love/) | 💘 | 30 题 | ~6 分钟 | 结合 ECR 量表，发现你的 8 种恋爱人格 | 📖 关系轨道图 + 互动参考 | ✅ |
| [心理成熟度测试](tests/maturity/) | 🧘 | 50 题 | ~10 分钟 | 基于 Kegan 成人发展理论，八维评估你的心理成熟水平 | 📖 成长等高线 + 八维详解 | ✅ |
| [动物人格测试](tests/animal/) | 🐾 | 30 题 | ~5 分钟 | 12 种动物人格原型，发掘你的内在动物 | 📖 自然观察图鉴 + 互动参考 | ✅ |
| [暗黑人格测试](tests/dark-triad/) | 🌑 | 27 题 | ~5 分钟 | 基于 SD3 学术量表，测量马基雅维利主义、自恋、精神病态三大暗黑维度 | 📖 8 种棱镜画像 + 常模参考 | ✅ |
| [塔罗占卜](tests/tarot/) | 🔮 | 78 张牌 | ~3 分钟 | 经典韦特塔罗牌在线占卜，5 种牌阵 + v2.0 数据驱动深度解读（每张牌配专属详解/象征/建议），聆听潜意识的低语 | 📖 78 张牌完整图鉴 | ✅ |

## 🚀 快速开始

### 在线访问

直接访问 GitHub Pages：**[https://heyemily-ovo.github.io/wingsight/](https://heyemily-ovo.github.io/wingsight/)**

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/HeyEmily-ovo/wingsight.git

# 进入目录
cd wingsight

# 使用任意静态服务器启动，例如：
python -m http.server 8080
# 或
npx serve .
```

然后打开浏览器访问 `http://localhost:8080`

## ✨ 特色功能

- **🧭 心智图谱发现**：按探索目标、深度与测试倾向筛选，也可以通过推荐向导快速找到适合当前状态的测试
- **📋 历史记录**：每次测试结果自动保存在浏览器本地，随时回顾、对比成长轨迹
- **📖 差异化图鉴**：MBTI 使用原创类型场景插画和认知功能地图，历史人物采用肖像档案，恋爱类型使用关系轨道与场景插画，动物人格采用自然观察手册，塔罗提供 78 张完整牌典
- **🧾 统一详情与历史**：类型档案使用可访问详情抽屉，历史记录统一支持回看、删除、清空确认、空状态和 URL 深链
- **🌓 浅/深色主题**：一键切换，偏好自动记忆
- **⌨️ 无障碍交互**：清晰键盘焦点、44px 触控目标、减少动态效果支持与可读的深浅主题对比度
- **🗂️ 折叠题目导航**：题号矩阵默认收起，按需查看已答、当前与未答状态，避免答题页堆砌

## 🎨 设计风格

- **心智图谱母题**：以坐标、档案、轨迹和观测等视觉语言表达“从一个问题开始认识自己”
- **统一但不单调**：共享导航、答题、报告、历史与图鉴骨架，每个测试保留独立主题色和标志性主视觉
- **编辑式界面**：克制阴影、清晰排版、轻边框和语义化信息标签，避免模板化玻璃拟态
- **响应式布局**：进入页在桌面使用双栏，平板和手机自动切换为单栏，并针对 375px 小屏完成适配
- **主题插画**：7 个测试均配有 1536×1024 WebP 主视觉，所有关键信息仍由 HTML 文本承载
- **内容图像资产**：人物肖像、类型场景、动物插画和塔罗牌面均提供固定比例、替代文本、懒加载及响应式资源；来源和生成方式记录在对应 `SOURCES.md`

## ➕ 如何添加新测试

新增测试需要同时接入首页配置、共享测试外壳和测试资源。完整流程请先阅读 [`开发规范.md`](开发规范.md)。最少需要：

1. 创建 `tests/<id>/index.html`、`style.css`、`script.js`。
2. 在 `js/config.js` 的 `TEST_CONFIG` 中添加完整配置。
3. 在 `js/test-shell.js` 中补充测试元信息和 landing 选择器。
4. 添加 `assets/tests/<id>/hero.webp` 主题主视觉。
5. 完成结果、历史、图鉴、主题、响应式和可访问性验收。

首页配置示例：

```javascript
{
  id: 'my-test',           // 对应 tests/ 下的目录名
  name: '我的测试',         // 测试名称
  icon: '🎯',              // 展示图标（emoji）
  description: '测试描述',  // 简短介绍
  color: '#7C5CFC',        // 主题色
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  questions: 30,           // 题目数量
  duration: 5,             // 预计用时（分钟）
  tags: ['趣味', '心理'],  // 分类标签
  goals: ['认识性格'],     // 首页目标筛选
  depth: 'medium',         // quick / medium / deep
  tone: 'scientific',      // scientific / balanced / playful
  resultPromise: '完成后用户能获得什么',
  evidence: '量表或内容依据',
  recommendedFor: '适合的用户情境',
  featuredReason: '具体推荐理由',
  storageKey: 'my_test_history',
  atlas: { x: 50, y: 50 },
  featured: false,         // 是否精选
  resultTypes: 10,         // 结果类型数量
  path: 'tests/my-test/index.html'  // 测试页面路径
}
```

首页卡片会由配置自动生成；测试内部的导航、主题、主视觉和折叠题目导航由共享测试外壳增强。

## 🏗️ 项目结构

```
wingsight/
├── index.html                  # 主入口页面
├── favicon.png                 # 网站图标（翅膀大脑图案）
├── assets/
│   ├── decorations/            # 首页装饰图片
│   └── tests/                  # 测试主视觉、肖像、类型插画和资源来源记录
│       ├── ASSET_GUIDE.md      # 内容图像规格与接入规范
│       └── <id>/hero.webp      # 各测试 3:2 主题主视觉
├── css/
│   ├── tokens.css              # 全站设计令牌与深色主题
│   ├── components.css          # 共享基础组件
│   ├── test-shell.css          # 测试内部统一外壳
│   └── style.css               # 主页样式
├── js/
│   ├── config.js               # 首页测试配置与发现数据
│   ├── main.js                 # 首页交互逻辑
│   ├── theme.js                # 全站主题状态
│   ├── test-shell.js           # 测试页增强与折叠导航
│   └── history-index.js        # 首页最近探索聚合
├── tests/                      # 各测试子目录
│   ├── mbti/                   # MBTI 性格测试
│   ├── history/                # 历史人物人格测试
│   ├── love/                   # 恋爱类型测试
│   ├── maturity/               # 心理成熟度测试
│   ├── animal/                 # 动物人格测试
│   ├── dark-triad/             # 暗黑人格测试（SD3）
│   └── tarot/                  # 塔罗占卜（78张牌 + 5种牌阵）
├── README.md
├── 开发规范.md                   # 新增测试开发规范（必读）
└── .gitignore
```

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">
Made with ❤️ by <a href="https://github.com/HeyEmily-ovo">HeyEmily</a>
</div>
