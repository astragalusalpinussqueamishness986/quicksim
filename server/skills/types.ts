/**
 * Skill System — modular capabilities that enhance decision analysis
 * Each skill can fetch data, compute metrics, or transform context
 */

export interface SkillResult {
  id: string
  name: string
  icon: string
  data: any
  contextInjection: string // text to inject into LLM context
}

export interface SkillContext {
  question: string
  choices: string[] // auto-detected choices
  userContext?: string
}

export type SkillExecutor = (ctx: SkillContext) => Promise<SkillResult | null>

export interface SkillDefinition {
  id: string
  name: string
  icon: string
  description: string
  execute: SkillExecutor
}
