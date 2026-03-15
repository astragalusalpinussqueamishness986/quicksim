/**
 * API: Get aggregated decision style scores
 * Returns averaged style dimensions across all decisions
 */
import { getAggregatedStyle, getDecisionCount } from '../db/profile'

const DIMENSION_META: Record<string, { label: string; icon: string; lowLabel: string; highLabel: string }> = {
  risk: { label: '冒险指数', icon: '🎲', lowLabel: '求稳保守', highLabel: '敢于冒险' },
  rational: { label: '理性程度', icon: '🧮', lowLabel: '直觉感性', highLabel: '数据驱动' },
  foresight: { label: '远见指数', icon: '🔭', lowLabel: '关注当下', highLabel: '着眼长远' },
  independence: { label: '独立性', icon: '🦅', lowLabel: '参考他人', highLabel: '自主决策' },
  growth: { label: '成长导向', icon: '🌱', lowLabel: '追求舒适', highLabel: '追求成长' },
  pragmatic: { label: '务实程度', icon: '⚖️', lowLabel: '注重理想', highLabel: '注重实际' },
}

const DIMENSION_ORDER = ['risk', 'rational', 'foresight', 'independence', 'growth', 'pragmatic']

export default defineEventHandler(() => {
  const rows = getAggregatedStyle()
  const decisionCount = getDecisionCount()

  if (rows.length === 0) {
    return { dimensions: [], decisionCount, label: '', hasData: false }
  }

  const scoreMap = new Map(rows.map(r => [r.dimension, r]))

  const dimensions = DIMENSION_ORDER.map(dim => {
    const data = scoreMap.get(dim)
    const meta = DIMENSION_META[dim]
    return {
      dimension: dim,
      label: meta?.label || dim,
      icon: meta?.icon || '📊',
      score: data?.avg_score || 50,
      sampleCount: data?.sample_count || 0,
      lowLabel: meta?.lowLabel || '',
      highLabel: meta?.highLabel || '',
    }
  })

  // Generate a personality label based on top traits
  const sorted = [...dimensions].sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50))
  const top = sorted[0]
  let label = ''
  if (top.score >= 70) label = `${top.highLabel}型决策者`
  else if (top.score <= 30) label = `${top.lowLabel}型决策者`
  else label = '均衡型决策者'

  return { dimensions, decisionCount, label, hasData: true }
})
