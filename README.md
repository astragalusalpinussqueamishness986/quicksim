# QuickSim ⚡ AI 人生场景速推

> 选一个场景，回答 2 个问题，AI 用真实数据为你推演一个"故事版"的未来走向。

![QuickSim](https://img.shields.io/badge/QuickSim-AI%20Life%20Simulator-6366f1?style=for-the-badge)

## ✨ 特色

- 🎯 **场景卡片模式** — 每张卡片独立运行，2 个输入，30 秒出结果
- 📖 **故事化输出** — 不是数字表格，AI 用第二人称讲"你的未来故事"
- 📊 **可视化对比** — 雷达图直观展示多维度对比
- ⚡ **零摩擦** — 无需注册，打开即用
- 🔒 **隐私安全** — 不存储任何个人数据

## 🎲 内置场景

| 场景 | 描述 |
|------|------|
| 🏙️ 城市 PK | 两个城市全方位对比 |
| 🔄 转行推演 | 职业转型可行性分析 |
| 🏠 买房 vs 租房 | 长期财务对比 |
| 💼 跳槽决策器 | 该不该跳？ |
| 🎓 考研 vs 工作 | 两条路 3 年后谁更好？ |
| ✈️ Gap Year 计算器 | 你的存款够不够？ |

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-username/quicksim.git
cd quicksim

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 LLM API Key

# 4. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可使用。

## 🛠️ 技术栈

- **框架**: Nuxt 4 (Vue 3 + TypeScript)
- **样式**: TailwindCSS
- **图表**: ECharts + vue-echarts
- **AI**: DeepSeek / OpenAI 兼容 API
- **部署**: Vercel / Netlify / 自托管

## 📁 项目结构

```
quicksim/
├── app/
│   ├── components/     # Vue 组件
│   ├── pages/          # 页面路由
│   ├── scenarios/      # 场景卡片配置
│   └── types/          # TypeScript 类型
├── server/
│   ├── api/            # API 端点
│   └── scenarios/      # 场景 Prompt 逻辑
├── nuxt.config.ts
└── .env.example
```

## 🔧 添加新场景

只需 2 步：

1. 在 `app/scenarios/index.ts` 添加场景配置
2. 在 `server/scenarios/prompts.ts` 添加对应的 Prompt

## 📄 License

MIT
