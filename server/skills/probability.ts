/**
 * Skill: Probability Modeling
 * Post-processes the decision tree to add probability weights
 * and compute expected value scores for each path
 */
import type { SkillResult } from './types'
import type { DecisionTreeResponse, TreeNode } from '../../app/types'

interface PathScore {
  choice: string
  icon: string
  totalEV: number
  bestCase: string
  worstCase: string
  riskLevel: 'low' | 'medium' | 'high'
}

interface ProbabilityData {
  paths: PathScore[]
  recommendation: string
  winnerIndex: number
}

// Sentiment to score: positive=+1, neutral=0, negative=-1
function sentimentScore(s: string): number {
  switch (s) {
    case 'positive': return 1
    case 'negative': return -1
    default: return 0
  }
}

// Count nodes by sentiment in a subtree
function countSentiments(nodes: TreeNode[]): { pos: number; neg: number; neu: number } {
  let pos = 0, neg = 0, neu = 0
  for (const n of nodes) {
    if (n.sentiment === 'positive') pos++
    else if (n.sentiment === 'negative') neg++
    else neu++
    if (n.children && Array.isArray(n.children)) {
      const sub = countSentiments(n.children)
      pos += sub.pos; neg += sub.neg; neu += sub.neu
    }
  }
  return { pos, neg, neu }
}

// Find the deepest positive/negative node text
function findExtreme(nodes: TreeNode[], sentiment: 'positive' | 'negative', depth = 0): { text: string; depth: number } | null {
  let best: { text: string; depth: number } | null = null
  for (const n of nodes) {
    if (n.sentiment === sentiment) {
      if (!best || depth > best.depth) {
        best = { text: n.text, depth }
      }
    }
    if (n.children && Array.isArray(n.children)) {
      const child = findExtreme(n.children, sentiment, depth + 1)
      if (child && (!best || child.depth > best.depth)) {
        best = child
      }
    }
  }
  return best
}

export function executeProbabilityModeling(tree: DecisionTreeResponse): SkillResult | null {
  if (!tree.branches || tree.branches.length < 2) return null

  const paths: PathScore[] = tree.branches.map((branch) => {
    const validNodes = (branch.nodes || []).filter((n: any) => n && typeof n === 'object')
    const counts = countSentiments(validNodes)
    const total = counts.pos + counts.neg + counts.neu || 1

    // EV = (positive_ratio × 1 + neutral_ratio × 0 + negative_ratio × -1) normalized to 0-100
    const rawEV = (counts.pos - counts.neg) / total
    const normalizedEV = Math.round((rawEV + 1) * 50) // -1→0, 0→50, 1→100

    const bestCase = findExtreme(validNodes, 'positive')
    const worstCase = findExtreme(validNodes, 'negative')

    const negRatio = counts.neg / total
    const riskLevel: PathScore['riskLevel'] = negRatio > 0.4 ? 'high' : negRatio > 0.2 ? 'medium' : 'low'

    return {
      choice: branch.choice,
      icon: branch.icon,
      totalEV: normalizedEV,
      bestCase: bestCase?.text || '未知',
      worstCase: worstCase?.text || '未知',
      riskLevel,
    }
  })

  const winnerIndex = paths[0].totalEV >= paths[1].totalEV ? 0 : 1
  const diff = Math.abs(paths[0].totalEV - paths[1].totalEV)

  let recommendation: string
  if (diff < 5) {
    recommendation = `两个选择的预期得分非常接近 (${paths[0].totalEV} vs ${paths[1].totalEV})，建议结合个人偏好决定`
  } else if (diff < 15) {
    recommendation = `"${paths[winnerIndex].choice}" 略占优势 (得分 ${paths[winnerIndex].totalEV}/100)，但差距不大`
  } else {
    recommendation = `"${paths[winnerIndex].choice}" 明显更优 (得分 ${paths[winnerIndex].totalEV}/100 vs ${paths[1 - winnerIndex].totalEV}/100)`
  }

  const data: ProbabilityData = { paths, recommendation, winnerIndex }

  return {
    id: 'probability-model',
    name: '概率化建模',
    icon: '📊',
    data,
    contextInjection: '', // post-processing, no LLM context needed
  }
}
