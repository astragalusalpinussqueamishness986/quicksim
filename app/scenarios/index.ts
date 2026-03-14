import type { ScenarioConfig } from '~/types'

export const scenarios: ScenarioConfig[] = [
  {
    id: 'city-pk',
    name: '城市 PK',
    icon: '🏙️',
    description: '两个城市的全方位生活对比',
    color: 'from-blue-500 to-cyan-500',
    fields: [
      { key: 'city_a', label: '城市 A', type: 'text', placeholder: '例如：上海' },
      { key: 'city_b', label: '城市 B', type: 'text', placeholder: '例如：成都' },
    ],
    dimensions: ['生活成本', '薪资水平', '空气质量', '通勤体验', '美食指数', '文化娱乐'],
  },
  {
    id: 'career-switch',
    name: '转行推演',
    icon: '🔄',
    description: '从当前职业转到目标方向的可行性分析',
    color: 'from-purple-500 to-pink-500',
    fields: [
      { key: 'current', label: '当前职业', type: 'text', placeholder: '例如：Java后端开发' },
      { key: 'target', label: '目标方向', type: 'text', placeholder: '例如：AI工程师' },
    ],
    dimensions: ['技能匹配度', '学习成本', '市场需求', '薪资涨幅', '竞争强度', '发展前景'],
  },
  {
    id: 'buy-vs-rent',
    name: '买房 vs 租房',
    icon: '🏠',
    description: '在你的城市，买房和租房哪个更划算？',
    color: 'from-amber-500 to-orange-500',
    fields: [
      { key: 'city', label: '城市', type: 'text', placeholder: '例如：杭州' },
      { key: 'budget', label: '月预算(元)', type: 'number', placeholder: '例如：8000' },
    ],
    dimensions: ['5年总成本', '10年总成本', '生活灵活性', '资产增值', '压力指数', '生活品质'],
  },
  {
    id: 'job-hop',
    name: '跳槽决策器',
    icon: '💼',
    description: '该不该跳？跳了会怎样？',
    color: 'from-emerald-500 to-teal-500',
    fields: [
      { key: 'current_salary', label: '当前月薪(元)', type: 'number', placeholder: '例如：15000' },
      { key: 'target_type', label: '目标公司类型', type: 'text', placeholder: '例如：大厂/创业公司/外企' },
    ],
    dimensions: ['薪资涨幅', '成长空间', '工作强度', '稳定性', '技术深度', '跳槽风险'],
  },
  {
    id: 'grad-vs-work',
    name: '考研 vs 工作',
    icon: '🎓',
    description: '两条路，3年后谁更好？',
    color: 'from-rose-500 to-red-500',
    fields: [
      { key: 'major', label: '专业方向', type: 'text', placeholder: '例如：计算机科学' },
      { key: 'city', label: '所在城市', type: 'text', placeholder: '例如：北京' },
    ],
    dimensions: ['3年收入总计', '知识深度', '人脉资源', '就业竞争力', '生活压力', '长期回报'],
  },
  {
    id: 'gap-year',
    name: 'Gap Year 计算器',
    icon: '✈️',
    description: '你的存款够不够来一次间隔年？',
    color: 'from-sky-500 to-indigo-500',
    fields: [
      { key: 'savings', label: '当前存款(元)', type: 'number', placeholder: '例如：50000' },
      { key: 'destination', label: '目标地区', type: 'text', placeholder: '例如：东南亚/欧洲/日本' },
    ],
    dimensions: ['预算充足度', '签证难度', '安全指数', '文化体验', '生活成本', '回归难度'],
  },
]

export function getScenarioById(id: string): ScenarioConfig | undefined {
  return scenarios.find(s => s.id === id)
}
