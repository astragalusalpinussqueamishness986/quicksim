/**
 * API: Return profile data structured for knowledge graph visualization
 * Nodes: categories, traits, decisions
 * Edges: category-trait, decision-trait
 */
import { getGraphData } from '../db/profile'

const CATEGORY_COLORS: Record<string, string> = {
  basic: '#60a5fa',
  career: '#f59e0b',
  values: '#a78bfa',
  preferences: '#34d399',
  life: '#fb7185',
}

const CATEGORY_LABELS: Record<string, string> = {
  basic: '基本信息',
  career: '职业发展',
  values: '价值观',
  preferences: '偏好特征',
  life: '生活状况',
}

export default defineEventHandler(() => {
  const { traits, decisions, links } = getGraphData()

  if (traits.length === 0 && decisions.length === 0) {
    return { nodes: [], edges: [], categories: [] }
  }

  const nodes: any[] = []
  const edges: any[] = []

  // Unique categories present
  const catSet = new Set(traits.map((t: any) => t.category))

  // Category hub nodes
  for (const cat of catSet) {
    nodes.push({
      id: `cat:${cat}`,
      name: CATEGORY_LABELS[cat] || cat,
      category: cat,
      symbolSize: 50,
      itemStyle: { color: CATEGORY_COLORS[cat] || '#94a3b8' },
      label: { show: true, fontSize: 13, fontWeight: 'bold' },
      nodeType: 'category',
    })
  }

  // Trait nodes
  for (const t of traits) {
    const size = 20 + (t.confidence || 0.5) * 20
    nodes.push({
      id: `trait:${t.category}:${t.key}`,
      name: `${t.key}: ${t.value}`,
      category: t.category,
      symbolSize: size,
      itemStyle: {
        color: CATEGORY_COLORS[t.category] || '#94a3b8',
        opacity: 0.5 + (t.confidence || 0.5) * 0.5,
      },
      label: { show: true, fontSize: 10 },
      nodeType: 'trait',
      value: t.confidence,
    })

    // Edge: category → trait
    edges.push({
      source: `cat:${t.category}`,
      target: `trait:${t.category}:${t.key}`,
      lineStyle: { color: CATEGORY_COLORS[t.category] || '#94a3b8', opacity: 0.4, width: 2 },
    })
  }

  // Decision nodes
  for (const d of decisions) {
    const label = d.question.length > 12 ? d.question.slice(0, 12) + '…' : d.question
    nodes.push({
      id: `dec:${d.id}`,
      name: label,
      category: '_decision',
      symbol: 'diamond',
      symbolSize: 30,
      itemStyle: { color: '#94a3b8', borderColor: '#cbd5e1', borderWidth: 2 },
      label: { show: true, fontSize: 9, color: '#cbd5e1' },
      nodeType: 'decision',
      value: d.question,
      choiceA: d.choice_a,
      choiceB: d.choice_b,
    })
  }

  // Decision → Trait edges
  for (const link of links) {
    const traitId = `trait:${link.trait_category}:${link.trait_key}`
    const decId = `dec:${link.decision_id}`
    // Only add edge if both nodes exist
    if (nodes.some(n => n.id === traitId) && nodes.some(n => n.id === decId)) {
      edges.push({
        source: decId,
        target: traitId,
        lineStyle: { color: '#475569', opacity: 0.3, width: 1, type: 'dashed' },
      })
    }
  }

  // Categories for legend
  const categories = [...catSet].map(cat => ({
    name: cat,
    label: CATEGORY_LABELS[cat] || cat,
    color: CATEGORY_COLORS[cat] || '#94a3b8',
  }))
  categories.push({ name: '_decision', label: '决策', color: '#94a3b8' })

  return { nodes, edges, categories }
})
