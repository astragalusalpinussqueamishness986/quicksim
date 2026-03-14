/**
 * API: AI Research Brief (Step 1)
 * Uses LLM to analyze the question, extract choices, and generate a brief
 * This is a lightweight first-pass that enables downstream skills
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { question, userContext } = body

  if (!question) {
    throw createError({ statusCode: 400, message: '缺少 question 参数' })
  }

  const config = useRuntimeConfig()
  if (!config.llmApiKey) {
    throw createError({ statusCode: 500, message: 'LLM API Key 未配置' })
  }

  const contextStr = userContext ? `用户背景：${userContext}\n` : ''

  const response = await $fetch<any>(`${config.llmBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.llmApiKey}`,
    },
    body: {
      model: config.llmModel,
      messages: [
        {
          role: 'system',
          content: `你是一个决策分析助手。用户会提出一个关于人生/职业/生活的选择题。你的任务是快速理解问题并提取关键信息。

严格返回JSON：
{
  "choiceA": "选项A名称（简洁，2-6字）",
  "choiceB": "选项B名称（简洁，2-6字）",
  "searchKeywordA": "选项A的搜索关键词（1-2个核心词，适合搜索引擎搜索）",
  "searchKeywordB": "选项B的搜索关键词（1-2个核心词，适合搜索引擎搜索）",
  "questionSummary": "问题一句话概括（≤20字）",
  "keyFactors": ["关键考量因素1", "关键考量因素2", "关键考量因素3"],
  "brief": "针对这个决策的背景分析（50-100字，包含关键数据或常识性事实）"
}

规则：
- "X还是Y"通常是在两者间做选择（如"腾讯还是字节"指选哪家公司工作）
- "要不要X"指是否做某事
- choiceA和choiceB必须是可搜索的实体/短语（公司名、城市名等），不要太抽象
- searchKeywordA/B是真正用于搜索引擎搜索的关键词，必须是常见的1-2个词（如"裸辞创业"应简化为"裸辞"，"字节跳动"可用"字节跳动"）
- keyFactors列出3个最重要的考量维度
- brief要包含具体的事实信息，不要空泛
- 仅返回JSON`,
        },
        {
          role: 'user',
          content: `${contextStr}${question}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    },
  })

  const content = response?.choices?.[0]?.message?.content
  if (!content) {
    throw createError({ statusCode: 500, message: 'LLM 返回为空' })
  }

  let jsonStr = content.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  try {
    const parsed = JSON.parse(jsonStr)
    return {
      choiceA: parsed.choiceA || '',
      choiceB: parsed.choiceB || '',
      searchKeywordA: parsed.searchKeywordA || parsed.choiceA || '',
      searchKeywordB: parsed.searchKeywordB || parsed.choiceB || '',
      questionSummary: parsed.questionSummary || '',
      keyFactors: parsed.keyFactors || [],
      brief: parsed.brief || '',
    }
  } catch {
    throw createError({ statusCode: 500, message: 'AI 简报解析失败: ' + jsonStr.slice(0, 200) })
  }
})
