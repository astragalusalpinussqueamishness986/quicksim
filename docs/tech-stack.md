# QuickSim 技术栈文档

## 架构概览

```
┌─────────────────────────────────────────┐
│           Nuxt 4 全栈应用                 │
│  ┌─────────────────────────────────────┐ │
│  │  前端 (app/)                         │ │
│  │  Vue 3 + TS + TailwindCSS + ECharts │ │
│  └──────────────┬──────────────────────┘ │
│                 │ $fetch                  │
│  ┌──────────────┴──────────────────────┐ │
│  │  后端 (server/)                      │ │
│  │  Nitro Server Routes                │ │
│  │  ├── Scenario Prompt Builder        │ │
│  │  └── LLM API Proxy                 │ │
│  └──────────────┬──────────────────────┘ │
└─────────────────┼───────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │   LLM API (DeepSeek/OpenAI) │
    └────────────────────────────┘
```

## 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 框架 | Nuxt 4 | 全栈一体、TypeScript 原生、SSR/SPA 灵活切换 |
| UI | TailwindCSS | 原子化快速开发、深色主题容易实现 |
| 图表 | ECharts + vue-echarts | 雷达图支持好、中文友好、响应式 |
| AI | OpenAI 兼容 API | 统一接口，支持 DeepSeek/OpenAI/Ollama |
| 部署 | Vercel | 零配置、免费额度充足 |

## 核心数据流

1. 用户选择场景卡片 → 输入 2-3 个参数
2. 前端 POST `/api/simulate` → Server Route 处理
3. Server 根据场景 ID 构建 Prompt → 调用 LLM API
4. LLM 返回 JSON（summary + story + chartData）
5. 前端渲染：摘要卡片 + 雷达图 + 打字机效果故事

## 文件清单

- `app/scenarios/index.ts` — 所有场景卡片配置（前端）
- `server/scenarios/prompts.ts` — 所有场景 Prompt 模板（后端）
- `server/api/simulate.post.ts` — 唯一的 API 端点
- `app/pages/index.vue` — 首页（场景选择）
- `app/pages/sim/[id].vue` — 场景推演页
- `app/components/CompareChart.vue` — ECharts 图表组件

## 扩展新场景

1. `app/scenarios/index.ts` 添加 ScenarioConfig
2. `server/scenarios/prompts.ts` 添加对应 Prompt 函数
3. 完成。无需修改其他文件。
