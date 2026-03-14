/** 场景卡片配置 */
export interface ScenarioField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'city-select'
  placeholder?: string
  options?: { label: string; value: string }[]
  suffix?: string
  /** 用于结果后可调节 */
  adjustable?: boolean
  min?: number
  max?: number
  step?: number
}

export interface ScenarioConfig {
  id: string
  name: string
  icon: string
  description: string
  color: string
  fields: ScenarioField[]
  dimensions: string[]
}

/** API 请求/响应 */
export interface SimulateRequest {
  scenario: string
  params: Record<string, string | number>
}

/** 结构化阶段 */
export interface TimelinePhase {
  title: string
  icon: string
  content: string
}

/** 关键指标 */
export interface KeyMetric {
  label: string
  valueA: string
  valueB: string
  winner: 'A' | 'B' | 'tie'
}

export interface SimulateResponse {
  summary: string
  metrics: KeyMetric[]
  phases: TimelinePhase[]
  verdict: string
  chartData: ChartData
}

export interface ChartData {
  type: 'radar' | 'bar' | 'line'
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

/** 决策路径树节点 */
export interface TreeNode {
  id: string
  text: string
  icon: string
  sentiment: 'positive' | 'negative' | 'neutral'
  children?: TreeNode[]
}

/** 路径交叉点 */
export interface TreeLink {
  fromId: string
  toId: string
  reason: string
}

/** 决策路径树响应 */
export interface DecisionTreeResponse {
  question: string
  branches: {
    choice: string
    icon: string
    color: string
    nodes: TreeNode[]
  }[]
  links: TreeLink[]
  insight: string
}
