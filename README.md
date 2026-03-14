# QuickSim ⚡ AI 人生场景速推

> 输入一个人生决策问题，AI 用真实数据 + 搜索趋势 + 知识图谱为你推演决策路径。

![QuickSim](https://img.shields.io/badge/QuickSim-AI%20Decision%20Analyzer-6366f1?style=for-the-badge)

## ✨ 核心功能

### 🌳 决策路径树
- **5 层深度** 决策分支，AI 自动推演每条路径的结果
- 每个节点包含情感倾向（积极/消极/中性）
- 自定义 HTML/CSS 渲染，支持展开/折叠

### 📊 两步 AI 分析流水线
1. **研究简报** (Step 1) — AI 快速分析问题，提取关键选项和搜索关键词
2. **背景数据** (Step 1b) — 自动抓取 Wikipedia + 百度百科相关资料
3. **搜索趋势** (Step 2) — 百度 + Bing 搜索建议数据对比
4. **决策树生成** (Step 3) — LLM 综合所有上下文生成完整决策路径
5. **概率建模** (Step 4) — 客户端计算期望值、风险等级、最佳/最差情景

### 🧠 用户画像系统（数字孪生）
- **AI 自动学习** — 每次决策后自动提取用户特征（年龄、城市、行业、价值观等）
- **知识图谱可视化** — ECharts 力导向图展示特征关系网络
- **画像标签编辑** — 点击标签修改值，手动添加/删除标签
- **决策历史管理** — 记录所有决策，支持删除重复/错误记录
- **画像注入** — 用户画像自动注入 LLM 上下文，让 AI 越来越了解你
- **SQLite 持久化** — 本地数据库存储，隐私安全

### 🔧 Skill 系统
可切换的模块化能力：
- **📋 研究简报** — AI + Wikipedia/百科数据合成
- **📈 概率模型** — 期望值分数、风险等级、推荐方向

### 📸 其他功能
- 6 个预置场景 + 自定义场景输入
- 搜索趋势对比图表
- 一键导出决策结果为图片
- 暗色主题 UI

## 🚀 快速开始

```bash
# 克隆 & 安装
git clone https://github.com/your-username/quicksim.git
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
| 样式 | TailwindCSS |
| 图表 | ECharts (知识图谱 + 趋势对比) |
| 数据库 | better-sqlite3 (用户画像) |
| AI | 豆包/DeepSeek/OpenAI 兼容 API |
| 数据源 | Wikipedia, 百度百科, 百度搜索建议, Bing 搜索建议 |

## 📁 项目结构

```
quicksim/
├── app/
│   ├── components/          # Vue 组件
│   │   ├── CustomTreeNode   # 决策树节点（递归渲染）
│   │   ├── DecisionTree     # 决策树容器
│   │   ├── KnowledgeGraph   # ECharts 知识图谱
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
│   ├── composables/         # useExportImage 等
│   └── scenarios/           # 场景卡片配置
├── server/
│   ├── api/
│   │   ├── research-brief   # Step 1: AI 研究简报
│   │   ├── decision-tree    # Step 3: 决策树生成
│   │   ├── trends           # Step 2: 搜索趋势
│   │   ├── skills           # Skill 系统端点
│   │   ├── profile          # 用户画像查询
│   │   ├── profile-extract  # AI 特征提取
│   │   ├── profile-trait    # 标签 CRUD
│   │   └── profile-graph    # 知识图谱数据
│   ├── db/
│   │   └── profile.ts       # SQLite 数据库层
│   ├── skills/              # Skill 模块
│   │   ├── research.ts      # Wikipedia + 百科
│   │   └── probability.ts   # 概率计算
│   └── utils/               # 共享工具
├── data/                    # SQLite 数据库文件（gitignore）
└── .env                     # API Key 配置
```

## 🔧 配置 LLM

支持任何 OpenAI 兼容 API。在 `.env` 中配置：

```env
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1    # 或豆包/DeepSeek 等
LLM_MODEL=gpt-4o-mini                     # 模型名称
```

## 💡 灵感来源

QuickSim 融合了多个优秀 AI 项目的理念：
- **Claude Code** 的 Skill 系统 → 模块化可切换能力
- **DayWeave** 的微日记 → 从每次交互中学习用户特征
- **AgentCard** 的数字身份 → 用户画像 + 知识图谱
- **OpenClaw/MiroFish** 的开源精神 → 本地优先、隐私安全

## 📄 License

MIT
