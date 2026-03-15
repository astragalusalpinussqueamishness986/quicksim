/**
 * API: Extract user traits from a decision question + brief
 * Called after each decision to build user profile
 */
import { upsertTraits, addDecision, linkDecisionTraits, upsertStyleScores } from '../db/profile'

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
            content: `你是一个用户画像提取助手。从用户的决策问题和背景信息中，提取两部分数据。

严格返回JSON对象：
{
  "traits": [
    { "category": "分类", "key": "属性名", "value": "属性值", "confidence": 0.8 }
  ],
  "style": {
    "risk": 50,
    "rational": 50,
    "foresight": 50,
    "independence": 50,
    "growth": 50,
    "pragmatic": 50
  }
}

一、traits 提取规则：
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

二、style 决策风格评分（0-100）：
- risk: 冒险指数（高=敢于冒险，低=求稳保守）
- rational: 理性程度（高=数据驱动，低=直觉感性）
- foresight: 远见指数（高=考虑长远，低=关注当下）
- independence: 独立性（高=自主决策，低=依赖他人）
- growth: 成长导向（高=追求成长，低=追求舒适）
- pragmatic: 务实程度（高=注重实际，低=注重理想）

根据用户的决策问题和选项来判断风格倾向，仅返回JSON对象。`,
          },
          {
            role: 'user',
            content: `${contextStr}用户问题：${question}\n选项A：${choiceA || '未知'}\n选项B：${choiceB || '未知'}\nAI简报：${brief || '无'}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      },
    })

    const content = response?.choices?.[0]?.message?.content
    if (!content) return { extracted: 0 }

    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    const parsed = JSON.parse(jsonStr)

    // Handle both old array format and new object format
    const traits = Array.isArray(parsed) ? parsed : (parsed.traits || [])
    const style = Array.isArray(parsed) ? null : (parsed.style || null)

    let extractedCount = 0

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
      extractedCount = traits.length
    }

    // Save decision style scores
    if (style && typeof style === 'object') {
      const dimensions = ['risk', 'rational', 'foresight', 'independence', 'growth', 'pragmatic']
      const scores = dimensions
        .filter(d => typeof style[d] === 'number')
        .map(d => ({ dimension: d, score: Math.max(0, Math.min(100, style[d])) }))
      if (scores.length > 0) {
        upsertStyleScores(decisionId, scores)
      }
    }

    return { extracted: extractedCount, traits, style }
  } catch {
    return { extracted: 0 }
  }
})
