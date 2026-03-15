# QuickSim ⚡ AI 人生场景速推

> 输入一个人生决策问题，AI 用真实数据 + 搜索趋势 + 知识图谱为你推演决策路径。

[English](./README.md)

![QuickSim](https://img.shields.io/badge/QuickSim-AI%20Decision%20Analyzer-6366f1?style=for-the-badge)

## ✨ 核心功能

### 🌳 决策路径树
- **5 层深度** 决策分支，AI 自动推演每条路径的结果
- 每个节点包含情感倾向（积极/消极/中性）
- 自定义 HTML/CSS 渲染，支持展开/折叠

### 📊 两步 AI 分析流水线
1. **研究简报** — AI 快速分析问题，提取关键选项和搜索关键词
2. **背景数据** — 自动抓取 Wikipedia + 百度百科相关资料
3. **搜索趋势** — 百度 + Bing 搜索建议数据对比
4. **决策树生成** — LLM 综合所有上下文生成完整决策路径
5. **概率建模** — 客户端计算期望值、风险等级、最佳/最差情景

### 🧠 用户画像系统（数字孪生）
- **AI 自动学习** — 每次决策后自动提取用户特征（年龄、城市、行业、价值观等）
- **画像完整度雷达** — 五维覆盖度评分 + ECharts 雷达图
- **决策风格分析** — 六维风格雷达（冒险/理性/远见/独立/成长/务实）
- **知识图谱可视化** — ECharts 力导向图展示特征关系网络
- **画像标签编辑** — 点击标签修改值，手动添加/删除标签
- **决策历史管理** — 记录所有决策，支持删除
- **画像注入** — 用户画像自动注入 LLM 上下文，让 AI 越来越了解你
- **SQLite 持久化** — 本地数据库存储，隐私安全

### 🎨 主题系统
- 明/暗主题一键切换（`@nuxtjs/color-mode`）
- 所有组件和图表自动适配主题

### 🔧 Skill 系统
可切换的模块化能力：
- **📋 研究简报** — AI + Wikipedia/百科数据合成
- **📈 概率模型** — 期望值分数、风险等级、推荐方向

### 📸 其他功能
- 6 个预置场景 + 自定义场景输入
- 搜索趋势对比图表
- 一键导出决策结果为图片

## 🚀 快速开始

```bash
# 克隆 & 安装
git clone https://github.com/Harris-H/quicksim.git
cd quicksim && npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 LLM API Key

# 启动
npm run dev
```

打开 http://localhost:3000 即可使用。

## 🛠️ 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Nuxt 4 (Vue 3 + TypeScript) |
| 样式 | TailwindCSS + CSS 变量 |
| 图表 | ECharts (知识图谱 + 雷达图 + 趋势对比) |
| 数据库 | better-sqlite3 (用户画像) |
| AI | DeepSeek/OpenAI 兼容 API |
| 数据源 | Wikipedia, 百度百科, 百度/Bing 搜索建议 |
| 主题 | @nuxtjs/color-mode (明/暗切换) |

## 📁 项目结构

```
quicksim/
├── app/
│   ├── components/          # Vue 组件
│   │   ├── CustomTreeNode   # 决策树节点（递归渲染）
│   │   ├── DecisionTree     # 决策树容器
│   │   ├── KnowledgeGraph   # ECharts 知识图谱
│   │   ├── ProfileRadar     # 画像完整度雷达
│   │   ├── DecisionStyle    # 决策风格雷达
│   │   ├── ResearchBrief    # 研究简报展示
│   │   ├── ProbabilityModel # 概率模型卡片
│   │   ├── TrendComparison  # 搜索趋势对比
│   │   └── CompareChart     # 雷达对比图
│   ├── pages/
│   │   ├── index.vue        # 首页（场景选择）
│   │   ├── tree.vue         # 核心决策页面
│   │   ├── profile.vue      # 用户画像页面
│   │   ├── custom.vue       # 自定义场景
│   │   └── sim/[id].vue     # 预置场景
│   ├── composables/         # useExportImage, useChartTheme
│   └── scenarios/           # 场景卡片配置
├── server/
│   ├── api/
│   │   ├── research-brief   # AI 研究简报
│   │   ├── decision-tree    # 决策树生成
│   │   ├── trends           # 搜索趋势
│   │   ├── skills           # Skill 系统端点
│   │   ├── profile          # 用户画像查询
│   │   ├── profile-extract  # AI 特征提取
│   │   ├── profile-style    # 决策风格 API
│   │   ├── profile-trait    # 标签 CRUD
│   │   └── profile-graph    # 知识图谱数据
│   ├── db/
│   │   └── profile.ts       # SQLite 数据库层
│   ├── skills/              # Skill 模块
│   └── utils/               # 共享工具
├── data/                    # SQLite 数据库文件
└── .env                     # API Key 配置
```

## 🔧 配置 LLM

支持任何 OpenAI 兼容 API。在 `.env` 中配置：

```env
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.deepseek.com      # 或 OpenAI 等
LLM_MODEL=deepseek-chat                     # 模型名称
```

## 📄 License

MIT
