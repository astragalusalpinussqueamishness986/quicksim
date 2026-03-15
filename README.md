# QuickSim ⚡ AI Life Decision Analyzer

> Input a life decision question, AI uses real data + search trends + knowledge graphs to project your decision paths.

[中文文档](./README_CN.md)

![QuickSim](https://img.shields.io/badge/QuickSim-AI%20Decision%20Analyzer-6366f1?style=for-the-badge)

## ✨ Core Features

### 🌳 Decision Path Tree
- **5-level depth** decision branches, AI auto-projects outcomes for each path
- Each node includes sentiment analysis (positive/negative/neutral)
- Custom HTML/CSS rendering with expand/collapse support

### 📊 Two-Step AI Analysis Pipeline
1. **Research Brief** — AI quickly analyzes the question, extracts key options and search keywords
2. **Background Data** — Auto-fetches Wikipedia + Baidu Baike related info
3. **Search Trends** — Baidu + Bing search suggestion data comparison
4. **Decision Tree Generation** — LLM synthesizes all context into a complete decision path
5. **Probability Modeling** — Client-side expected value, risk level, best/worst case calculation

### 🧠 User Profile System (Digital Twin)
- **AI Auto-Learning** — Extracts user traits after each decision (age, city, industry, values, etc.)
- **Profile Completeness Radar** — 5-dimension coverage score with ECharts radar chart
- **Decision Style Analysis** — 6-dimension style radar (risk/rational/foresight/independence/growth/pragmatic)
- **Knowledge Graph** — ECharts force-directed graph showing trait relationships
- **Profile Tag Editing** — Click to edit, manually add/delete tags
- **Decision History** — Track all decisions with delete support
- **Profile Injection** — User profile auto-injected into LLM context for personalized analysis
- **SQLite Persistence** — Local database storage, privacy-safe

### 🎨 Theme System
- Light/Dark mode toggle with `@nuxtjs/color-mode`
- All components and charts adapt to theme automatically

### 🔧 Skill System
Modular, toggleable capabilities:
- **📋 Research Brief** — AI + Wikipedia/Baike data synthesis
- **📈 Probability Model** — Expected value scores, risk levels, recommendations

### 📸 Other Features
- 6 preset scenarios + custom scenario input
- Search trend comparison charts
- One-click export decision results as image

## 🚀 Quick Start

```bash
# Clone & install
git clone https://github.com/Harris-H/quicksim.git
cd quicksim && npm install

# Configure environment
cp .env.example .env
# Edit .env, fill in your LLM API Key

# Start
npm run dev
```

Open http://localhost:3000 to use.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 (Vue 3 + TypeScript) |
| Styling | TailwindCSS + CSS Variables |
| Charts | ECharts (knowledge graph, radar, trends) |
| Database | better-sqlite3 (user profile) |
| AI | DeepSeek/OpenAI compatible API |
| Data Sources | Wikipedia, Baidu Baike, Baidu/Bing Search Suggestions |
| Theme | @nuxtjs/color-mode (light/dark) |

## 📁 Project Structure

```
quicksim/
├── app/
│   ├── components/          # Vue components
│   │   ├── CustomTreeNode   # Decision tree node (recursive)
│   │   ├── DecisionTree     # Decision tree container
│   │   ├── KnowledgeGraph   # ECharts knowledge graph
│   │   ├── ProfileRadar     # Profile completeness radar
│   │   ├── DecisionStyle    # Decision style radar
│   │   ├── ResearchBrief    # Research brief display
│   │   ├── ProbabilityModel # Probability model card
│   │   ├── TrendComparison  # Search trend comparison
│   │   └── CompareChart     # Radar comparison chart
│   ├── pages/
│   │   ├── index.vue        # Home (scenario selection)
│   │   ├── tree.vue         # Core decision page
│   │   ├── profile.vue      # User profile page
│   │   ├── custom.vue       # Custom scenario
│   │   └── sim/[id].vue     # Preset scenarios
│   ├── composables/         # useExportImage, useChartTheme
│   └── scenarios/           # Scenario card configs
├── server/
│   ├── api/
│   │   ├── research-brief   # Step 1: AI research brief
│   │   ├── decision-tree    # Step 3: Decision tree gen
│   │   ├── trends           # Step 2: Search trends
│   │   ├── skills           # Skill system endpoint
│   │   ├── profile          # User profile query
│   │   ├── profile-extract  # AI trait extraction
│   │   ├── profile-style    # Decision style API
│   │   ├── profile-trait    # Tag CRUD
│   │   └── profile-graph    # Knowledge graph data
│   ├── db/
│   │   └── profile.ts       # SQLite database layer
│   ├── skills/              # Skill modules
│   └── utils/               # Shared utilities
├── data/                    # SQLite database file
└── .env                     # API Key config
```

## 🔧 LLM Configuration

Supports any OpenAI-compatible API. Configure in `.env`:

```env
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.deepseek.com      # or OpenAI, etc.
LLM_MODEL=deepseek-chat                     # model name
```

## 📄 License

MIT
