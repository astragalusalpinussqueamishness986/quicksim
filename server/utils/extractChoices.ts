/**
 * Shared utility: extract two choices from a Chinese decision question
 */
export function extractChoices(question: string): { choiceA: string; choiceB: string } {
  const separators = ['还是', '或者', ' vs ', ' VS ', '和', '与其']
  let choiceA = ''
  let choiceB = ''

  // Pattern 1: "要不要X" / "该不该X" → X vs 不X
  const yesNoMatch = question.match(/(要不要|该不该|是否应该|是否要|是否)(.*?)([？?。.！!]?)$/)
  if (yesNoMatch) {
    const topic = yesNoMatch[2].trim()
    choiceA = topic
    choiceB = `不${topic}`
  }

  // Pattern 2: "X还是Y" / "X或者Y" etc.
  if (!choiceA || !choiceB) {
    for (const sep of separators) {
      if (question.includes(sep)) {
        const parts = question.split(sep)
        if (parts.length >= 2) {
          choiceA = parts[0].replace(/^(该|要|应该|到底|究竟|我|你|是|选|去|.*岁)/g, '').trim()
          choiceB = parts[parts.length - 1].replace(/[？?。.！!]$/g, '').trim()
          break
        }
      }
    }
  }

  if (!choiceA || !choiceB) {
    choiceA = question
    choiceB = question
  }

  return { choiceA, choiceB }
}
