/**
 * API: Get user profile data
 * Returns traits, decision history, and profile summary
 */
import { getAllTraits, getRecentDecisions, getDecisionCount, getProfileSummary } from '../db/profile'

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

  return {
    traits: grouped,
    decisions,
    decisionCount,
    summary,
  }
})
