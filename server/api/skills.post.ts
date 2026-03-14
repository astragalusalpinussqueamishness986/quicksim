/**
 * API endpoint that runs pre-generation skills
 * Accepts explicit choices (from LLM-detected branch names) for accurate research
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { question, choices } = body

  if (!question) {
    throw createError({ statusCode: 400, message: '缺少 question 参数' })
  }

  // Use explicit choices if provided, otherwise fall back to heuristic extraction
  let resolvedChoices: string[]
  if (choices && Array.isArray(choices) && choices.length >= 2) {
    resolvedChoices = choices
  } else {
    const { choiceA, choiceB } = extractChoices(question)
    resolvedChoices = [choiceA, choiceB]
  }

  const ctx = {
    question,
    choices: resolvedChoices,
  }

  const { results, combinedContext } = await runPreSkills(ctx)

  return {
    skills: results,
    combinedContext,
  }
})
