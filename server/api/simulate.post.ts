import type { SimulateResponse } from '~/app/types'
import { buildPrompt } from '../scenarios/prompts'

export default defineEventHandler(async (event): Promise<SimulateResponse> => {
  const body = await readBody(event)
  const { scenario, params } = body

  if (!scenario || !params) {
    throw createError({ statusCode: 400, message: '缺少 scenario 或 params 参数' })
  }

  const config = useRuntimeConfig()
  if (!config.llmApiKey) {
    throw createError({ statusCode: 500, message: 'LLM API Key 未配置，请在 .env 中设置 LLM_API_KEY' })
  }

  const prompt = buildPrompt(scenario, params)

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
          content: `你是一个数据分析助手。用户会提供两个选项让你对比分析。请严格返回JSON格式：
{
  "summary": "一句话对比结论（≤30字）",
  "metrics": [
    { "label": "对比维度", "valueA": "选项A数据", "valueB": "选项B数据", "winner": "A或B或tie" }
  ],
  "phases": [
    { "title": "阶段标题", "icon": "emoji", "content": "该阶段的对比分析（≤80字，用第二人称）" }
  ],
  "verdict": "综合对比结论（≤50字）",
  "chartData": {
    "type": "radar",
    "labels": ["维度1","维度2"],
    "datasets": [
      { "label": "选项A", "data": [80,60] },
      { "label": "选项B", "data": [60,85] }
    ]
  }
}
metrics提供4-6个维度的具体数据对比，phases提供4个时间阶段分析，chartData每个维度0-100分。仅返回JSON，不要多余文字。`,
        },
        { role: 'user', content: prompt },
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
    return JSON.parse(jsonStr) as SimulateResponse
  } catch {
    throw createError({ statusCode: 500, message: 'LLM 返回格式解析失败: ' + jsonStr.slice(0, 200) })
  }
})
