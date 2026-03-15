/**
 * API: Get user profile data
 * Returns traits, decision history, profile summary, and completeness scores
 */
import { getAllTraits, getRecentDecisions, getDecisionCount, getProfileSummary } from '../db/profile'

const EXPECTED_TRAITS: Record<string, number> = {
  basic: 5,
  career: 5,
  values: 4,
  preferences: 4,
  life: 4,
}

const CATEGORY_ORDER = ['basic', 'career', 'values', 'preferences', 'life']

const CATEGORY_LABELS: Record<string, string> = {
  basic: '基本信息',
  career: '职业发展',
  values: '价值观',
  preferences: '偏好特征',
  life: '生活状况',
}

function calcCompleteness(grouped: Record<string, any[]>) {
  const dimensions: { category: string; label: string; score: number; traitCount: number; expected: number }[] = []

  for (const cat of CATEGORY_ORDER) {
    const traits = grouped[cat] || []
    const expected = EXPECTED_TRAITS[cat] || 4
    const countRatio = Math.min(traits.length / expected, 1)
    const avgConfidence = traits.length > 0
      ? traits.reduce((sum: number, t: any) => sum + (t.confidence || 0.5), 0) / traits.length
      : 0
    const score = Math.round((countRatio * 0.7 + avgConfidence * 0.3) * 100)

    dimensions.push({
      category: cat,
      label: CATEGORY_LABELS[cat] || cat,
      score,
      traitCount: traits.length,
      expected,
    })
  }

  const overall = dimensions.length > 0
    ? Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length)
    : 0

  return { dimensions, overall }
}

export default defineEventHandler(async (event) => {
  const traits = getAllTraits()
  const decisions = getRecentDecisions(20)
  const decisionCount = getDecisionCount()
  const summary = getProfileSummary()

  // Group traits by category
  const grouped: Record<string, any[]> = {}
  for (const t of traits as any[]) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  }

  const completeness = calcCompleteness(grouped)

  return {
    traits: grouped,
    decisions,
    decisionCount,
    summary,
    completeness,
  }
})
