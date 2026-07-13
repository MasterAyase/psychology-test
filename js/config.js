/**
 * Wingsight（翼眸）测试配置文件
 *
 * 添加新测试只需在此数组中新增一个对象即可，
 * 系统会自动在主页面渲染对应的卡片。
 *
 * 字段说明：
 *   id          - 唯一标识，对应 tests/ 下的目录名
 *   name        - 测试名称
 *   icon        - 展示图标（emoji）
 *   description - 简短描述（1-2句话）
 *   color       - 主题色（用于卡片悬停微交互）
 *   gradient    - 卡片渐变背景色
 *   questions   - 题目数量
 *   duration    - 预计用时（分钟）
 *   tags        - 标签分类
 *   goals       - 首页目标分类
 *   depth       - 探索深度（quick / medium / deep）
 *   tone        - 内容倾向（scientific / balanced / playful）
 *   resultPromise - 用户完成测试后能获得什么
 *   evidence    - 理论、量表或内容依据
 *   recommendedFor - 适合的用户情境
 *   featuredReason - 推荐理由
 *   storageKey  - 对应历史记录 localStorage Key
 *   atlas       - 首页心智图谱坐标
 *   featured    - 是否精选推荐（true 的卡片会有特殊徽章）
 *   resultTypes - 结果类型数量（用于首页统计）
 *   path        - 测试页面路径
 */
const TEST_CONFIG = [
  {
    id: 'mbti',
    name: 'MBTI 性格测试',
    icon: '🧠',
    description: '基于荣格心理学理论，探索你的人格类型，发现属于你的 MBTI 四字母代码',
    color: '#7C5CFC',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    questions: 93,
    duration: 12,
    tags: ['性格', '心理学', 'MBTI'],
    goals: ['认识性格', '成长状态'],
    depth: 'deep',
    tone: 'scientific',
    resultPromise: '看见你的认知偏好、行为倾向和相处方式',
    evidence: '荣格类型理论',
    recommendedFor: '想系统认识自己的用户',
    featuredReason: '适合第一次深入探索',
    storageKey: 'mbti_test_history',
    atlas: { x: 28, y: 22 },
    featured: true,
    resultTypes: 16,
    path: 'tests/mbti/index.html'
  },
  {
    id: 'history',
    name: '历史人物人格测试',
    icon: '🏯',
    description: '基于大五人格科学的 50 题深度测试，找到跨越千年的灵魂共鸣者',
    color: '#D4A574',
    gradient: 'linear-gradient(135deg, #8B4513 0%, #D4A574 50%, #2C1810 100%)',
    questions: 50,
    duration: 8,
    tags: ['人格', '历史', '文化'],
    goals: ['认识性格', '文化与原型'],
    depth: 'deep',
    tone: 'balanced',
    resultPromise: '找到与你性格最接近的历史人物原型',
    evidence: '大五人格模型',
    recommendedFor: '喜欢从故事和人物理解自己的用户',
    featuredReason: '科学模型与文化叙事结合',
    storageKey: 'history_figure_test_history',
    atlas: { x: 49, y: 36 },
    featured: true,
    resultTypes: 16,
    path: 'tests/history/index.html'
  },
  {
    id: 'love',
    name: '恋爱类型测试',
    icon: '💘',
    description: '结合 ECR 量表与心理学研究，科学分析你的恋爱模式，发现 8 种恋爱人格',
    color: '#FF6B9D',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #FFC0CB 100%)',
    questions: 30,
    duration: 6,
    tags: ['恋爱', '情感', '人格'],
    goals: ['亲密关系', '认识性格'],
    depth: 'medium',
    tone: 'scientific',
    resultPromise: '识别你在亲密关系里的依恋与表达模式',
    evidence: 'ECR 依恋量表',
    recommendedFor: '想改善亲密关系互动的用户',
    featuredReason: '结果建议具体、容易应用',
    storageKey: 'love_type_test_history',
    atlas: { x: 40, y: 58 },
    featured: true,
    resultTypes: 8,
    path: 'tests/love/index.html'
  },
  {
    id: 'maturity',
    name: '心理成熟度测试',
    icon: '🧘',
    description: '基于 Kegan 成人发展理论，从八个核心维度全面评估你的心理成熟水平',
    color: '#2C5F7C',
    gradient: 'linear-gradient(135deg, #1a4a5e 0%, #2C5F7C 50%, #5B9AA0 100%)',
    questions: 50,
    duration: 10,
    tags: ['成长', '心理学', '自我认知'],
    goals: ['成长状态', '认识性格'],
    depth: 'deep',
    tone: 'scientific',
    resultPromise: '评估情绪、责任、关系与自我发展的成熟状态',
    evidence: 'Kegan 成人发展理论',
    recommendedFor: '正在经历转变或自我复盘的用户',
    featuredReason: '覆盖八个成长维度',
    storageKey: 'maturity_test_history',
    atlas: { x: 22, y: 72 },
    featured: true,
    resultTypes: 5,
    path: 'tests/maturity/index.html'
  },
  {
    id: 'animal',
    name: '动物人格测试',
    icon: '🐾',
    description: '30 道趣味题目，测测你的动物人格原型！猫系？狗系？卡皮巴拉？12 种动物等你解锁',
    color: '#FF8C42',
    gradient: 'linear-gradient(135deg, #FF8C42 0%, #FFB347 50%, #FF6B35 100%)',
    questions: 30,
    duration: 5,
    tags: ['趣味', '动物', '人格'],
    goals: ['轻松玩玩', '文化与原型'],
    depth: 'quick',
    tone: 'playful',
    resultPromise: '用动物原型读懂你的社交节奏和性格气质',
    evidence: '情境式趣味测验',
    recommendedFor: '想快速获得轻松结果的用户',
    featuredReason: '五分钟完成的轻量体验',
    storageKey: 'animal_test_history',
    atlas: { x: 79, y: 24 },
    featured: false,
    resultTypes: 12,
    path: 'tests/animal/index.html'
  },
  {
    id: 'dark-triad',
    name: '暗黑人格测试',
    icon: '🌑',
    description: '基于 SD3 学术量表，测量马基雅维利主义、自恋、精神病态三大暗黑人格维度',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #EC4899 100%)',
    questions: 27,
    duration: 5,
    tags: ['人格', '心理学', '暗黑人格'],
    goals: ['认识性格', '成长状态'],
    depth: 'medium',
    tone: 'scientific',
    resultPromise: '了解三种暗黑人格特质在你身上的相对强度',
    evidence: 'SD3 学术量表',
    recommendedFor: '愿意诚实观察人格阴影的用户',
    featuredReason: '用量表理解人格阴影',
    storageKey: 'dark_triad_test_history',
    atlas: { x: 58, y: 76 },
    featured: true,
    resultTypes: 8,
    path: 'tests/dark-triad/index.html'
  },
  {
    id: 'tarot',
    name: '塔罗占卜',
    icon: '🔮',
    description: '78 张经典韦特塔罗牌，支持多种牌阵，智能综合解读带你探索潜意识',
    color: '#5B8FBF',
    gradient: 'linear-gradient(135deg, #1e3a58 0%, #5B8FBF 50%, #89B4D8 100%)',
    questions: 1,
    duration: 3,
    tags: ['趣味', '占卜', '塔罗'],
    goals: ['轻松玩玩', '文化与原型'],
    depth: 'quick',
    tone: 'playful',
    resultPromise: '借助牌阵和象征线索整理当下的问题与感受',
    evidence: '78 张韦特塔罗数据解读',
    recommendedFor: '想从象征与直觉获得新视角的用户',
    featuredReason: '适合带着一个具体问题进入',
    storageKey: 'tarot-history',
    atlas: { x: 82, y: 66 },
    featured: true,
    resultTypes: 78,
    path: 'tests/tarot/index.html'
  }
];

// 如果通过 URL 参数动态加载，可覆盖默认配置
// 示例：?featured=true 仅显示精选测试
(function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const filterFeatured = params.get('featured');
  if (filterFeatured === 'true') {
    window.TESTS = TEST_CONFIG.filter(t => t.featured);
  } else {
    window.TESTS = TEST_CONFIG;
  }
})();
