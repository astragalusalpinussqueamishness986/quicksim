/**
 * Skill Runner — orchestrates skill execution pipeline
 */
import type { SkillContext, SkillResult, SkillDefinition } from '../skills/types'
import { executeResearchBrief } from '../skills/research'

// Registry of all available skills
const skills: SkillDefinition[] = [
  {
    id: 'research-brief',
    name: 'AI 调研简报',
    icon: '📋',
    description: '自动搜索百科、搜索引擎等数据源，获取选项相关的事实信息',
    execute: executeResearchBrief,
  },
  // Probability modeling is post-processing, runs after tree generation
]

/**
 * Run all pre-generation skills (before LLM call)
 * Returns skill results and combined context injection
 */
export async function runPreSkills(ctx: SkillContext): Promise<{
  results: SkillResult[]
  combinedContext: string
}> {
  const results: SkillResult[] = []

  // Run all skills in parallel
  const settled = await Promise.allSettled(
    skills.map(s => s.execute(ctx))
  )

  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value)
    }
  }

  const combinedContext = results
    .map(r => r.contextInjection)
    .filter(Boolean)
    .join('\n\n')

  return { results, combinedContext }
}
