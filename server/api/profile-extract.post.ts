/**
 * API: Extract user traits from a decision question + brief
 * Called after each decision to build user profile
 */
import { upsertTraits, addDecision, linkDecisionTraits } from '../db/profile'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { question, choiceA, choiceB, brief, userContext, insight } = body

  if (!question) {
    throw createError({ statusCode: 400, message: '缺少 question 参数' })
  }

  // Save decision to history
  const decisionId = addDecision({
    question,
    choiceA,
    choiceB,
    brief,
    resultSummary: insight,
  })

  // Use LLM to extract user traits from the question + context
  const config = useRuntimeConfig()
  if (!config.llmApiKey) return { extracted: 0 }

  const contextStr = userContext ? `用户自述背景：${userContext}\n` : ''

  try {
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
            content: `你是一个用户画像提取助手。从用户的决策问题和背景信息中，提取可以描述该用户特征的标签。

严格返回JSON数组：
[
  { "category": "分类", "key": "属性名", "value": "属性值", "confidence": 0.8 }
]

分类规则：
- basic: 年龄、性别、城市、学历等基本信息
- career: 职业、行业、公司、薪资水平、工作年限
- values: 价值观倾向（如"稳定优先"、"追求成长"、"注重家庭"）
- preferences: 偏好（如"喜欢大城市"、"偏好技术路线"）
- life: 生活状况（如"有房贷"、"已婚"、"有小孩"）

规则：
- 只提取有明确依据的特征，不要猜测
- confidence 0.3-0.9，越确定越高
- 每次提取 2-8 个特征
- key 用中文简短标签
- 仅返回JSON数组`,
          },
          {
            role: 'user',
            content: `${contextStr}用户问题：${question}\n选项A：${choiceA || '未知'}\n选项B：${choiceB || '未知'}\nAI简报：${brief || '无'}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
    })

    const content = response?.choices?.[0]?.message?.content
    if (!content) return { extracted: 0 }

    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    const traits = JSON.parse(jsonStr)
    if (Array.isArray(traits) && traits.length > 0) {
      const mappedTraits = traits.map((t: any) => ({
        category: t.category || 'basic',
        key: t.key || '',
        value: t.value || '',
        confidence: t.confidence || 0.5,
        source: question,
      }))
      upsertTraits(mappedTraits)
      linkDecisionTraits(decisionId, mappedTraits)
      return { extracted: traits.length, traits }
    }

    return { extracted: 0 }
  } catch {
    return { extracted: 0 }
  }
})
