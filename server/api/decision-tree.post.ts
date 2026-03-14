import type { DecisionTreeResponse } from '~/app/types'

export default defineEventHandler(async (event): Promise<DecisionTreeResponse> => {
  const body = await readBody(event)
  const { question, context } = body

  if (!question) {
    throw createError({ statusCode: 400, message: '缺少 question 参数' })
  }

  const config = useRuntimeConfig()
  if (!config.llmApiKey) {
    throw createError({ statusCode: 500, message: 'LLM API Key 未配置' })
  }

  const contextStr = context ? `背景：${context}\n` : ''

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
          content: `你是一个人生决策分析助手。用户会提出一个关于人生、职业、生活的选择题（如选哪家公司、要不要做某事等），你自动识别其中的两个核心选项，然后用第一性原理逐层推导每个选项对用户人生的连锁影响。要求每条路径至少5层深度。

注意：用户问"X还是Y"通常是在问应该选择X还是Y（比如"腾讯还是字节"是问去哪家公司工作），请从职业发展、生活影响等角度分析。

严格返回JSON格式：
{
  "question": "问题精简版（≤15字）",
  "branches": [
    {
      "choice": "选项名（你自动识别）",
      "icon": "emoji",
      "color": "cyan",
      "nodes": [
        {
          "id": "a1",
          "text": "直接结果（≤15字）",
          "icon": "emoji",
          "sentiment": "positive/negative/neutral",
          "children": [
            {
              "id": "a1-1",
              "text": "二级推导（≤15字）",
              "icon": "emoji",
              "sentiment": "positive/negative/neutral",
              "children": [
                {
                  "id": "a1-1-1",
                  "text": "三级推导（≤15字）",
                  "icon": "emoji",
                  "sentiment": "positive/negative/neutral",
                  "children": [
                    {
                      "id": "a1-1-1-1",
                      "text": "四级推导（≤15字）",
                      "icon": "emoji",
                      "sentiment": "positive/negative/neutral",
                      "children": [
                        {
                          "id": "a1-1-1-1-1",
                          "text": "最终结局（≤15字）",
                          "icon": "emoji",
                          "sentiment": "positive/negative/neutral"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "links": [
    { "fromId": "a节点id", "toId": "b节点id", "reason": "交叉原因（≤10字）" }
  ],
  "insight": "综合洞察（≤60字）"
}

规则：
- 你自动从用户问题中识别两个核心选项
- branches恰好2个，第一个color为"cyan"，第二个为"amber"
- 每个branch的nodes有1-2个根节点
- 每个节点的children有1-2个子节点，深度至少5层
- 在第2-3层可以分叉（1个节点有2个children）让树更丰富
- id格式：a开头为路径A，b开头为路径B
- 叶子节点不需要children字段
- links标记两条路径中可能到达相同结果的节点对（1-3个）
- 仅返回JSON`,
        },
        {
          role: 'user',
          content: `${contextStr}${question}`,
        },
      ],
      temperature: 0.7,
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
    return JSON.parse(jsonStr) as DecisionTreeResponse
  } catch {
    throw createError({ statusCode: 500, message: 'LLM 返回格式解析失败: ' + jsonStr.slice(0, 200) })
  }
})
