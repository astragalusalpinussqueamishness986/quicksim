/**
 * Skill: Research Brief
 * Fetches real-world data from Wikipedia/Baidu Baike + search engines
 * to build a factual foundation for decision analysis
 */
import type { SkillContext, SkillResult } from './types'

interface WikiSummary {
  title: string
  extract: string
  description?: string
}

interface ResearchData {
  articles: { keyword: string; summary: string; source: string }[]
  relatedQuestions: string[]
  keyFacts: string[]
}

// Common abbreviation → full name mappings for better search
const KEYWORD_ENRICHMENT: Record<string, string[]> = {
  '字节': ['字节跳动'],
  '阿里': ['阿里巴巴'],
  '美团': ['美团点评'],
  '京东': ['京东集团'],
  '百度': ['百度公司'],
  '华为': ['华为技术'],
  '小米': ['小米集团'],
  '网易': ['网易公司'],
  '滴滴': ['滴滴出行'],
  '拼多多': ['拼多多'],
  '快手': ['快手科技'],
}

async function fetchWikiSummary(keyword: string): Promise<WikiSummary | null> {
  try {
    const url = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`
    const res = await $fetch<any>(url, { timeout: 5000 })
    if (res?.extract) {
      return {
        title: res.title || keyword,
        extract: res.extract.slice(0, 300),
        description: res.description,
      }
    }
    return null
  } catch {
    return null
  }
}

// Try keyword + enriched variants, return first relevant result
async function fetchBestWikiResult(keyword: string, questionContext: string): Promise<WikiSummary | null> {
  const candidates = [keyword, ...(KEYWORD_ENRICHMENT[keyword] || [])]
  for (const candidate of candidates) {
    const result = await fetchWikiSummary(candidate)
    if (result) {
      // Basic relevance check: is the result about a company/person/place (not a generic term)?
      const desc = (result.description || '').toLowerCase()
      const extract = result.extract.toLowerCase()
      const isGenericTerm = desc.includes('unit') || desc.includes('计量') || desc.includes('单位')
      if (!isGenericTerm || candidates.length === 1) {
        return { ...result, title: candidate }
      }
    }
  }
  // Fallback: return first result even if generic
  return await fetchWikiSummary(candidates[0])
}

async function fetchBaikeSummary(keyword: string): Promise<string | null> {
  try {
    const url = `https://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=${encodeURIComponent(keyword)}&bk_length=300`
    const res = await $fetch<any>(url, { timeout: 5000 })
    if (res?.abstract) {
      return res.abstract.slice(0, 300)
    }
    return null
  } catch {
    return null
  }
}

async function fetchBaiduRelatedQuestions(keyword: string): Promise<string[]> {
  try {
    const url = `https://www.baidu.com/sugrec?prod=pc&from=pc_web&wd=${encodeURIComponent(keyword)}`
    const res = await $fetch<any>(url, { timeout: 5000 })
    if (res?.g && Array.isArray(res.g)) {
      return res.g.map((item: any) => item.q || item.k).filter(Boolean).slice(0, 6)
    }
    return []
  } catch {
    return []
  }
}

export async function executeResearchBrief(ctx: SkillContext): Promise<SkillResult | null> {
  const { question, choices } = ctx
  if (choices.length < 2) return null

  // Fetch data for both choices in parallel
  const [wikiA, wikiB, baikeA, baikeB, relatedA, relatedB] = await Promise.all([
    fetchBestWikiResult(choices[0], question),
    fetchBestWikiResult(choices[1], question),
    fetchBaikeSummary(KEYWORD_ENRICHMENT[choices[0]]?.[0] || choices[0]),
    fetchBaikeSummary(KEYWORD_ENRICHMENT[choices[1]]?.[0] || choices[1]),
    fetchBaiduRelatedQuestions(choices[0]),
    fetchBaiduRelatedQuestions(choices[1]),
  ])

  const articles: ResearchData['articles'] = []

  if (wikiA) articles.push({ keyword: wikiA.title || choices[0], summary: wikiA.extract, source: 'Wikipedia' })
  else if (baikeA) articles.push({ keyword: choices[0], summary: baikeA, source: '百度百科' })

  if (wikiB) articles.push({ keyword: wikiB.title || choices[1], summary: wikiB.extract, source: 'Wikipedia' })
  else if (baikeB) articles.push({ keyword: choices[1], summary: baikeB, source: '百度百科' })

  const relatedQuestions = [...new Set([...relatedA, ...relatedB])].slice(0, 8)

  const data: ResearchData = {
    articles,
    relatedQuestions,
    keyFacts: articles.map(a => `${a.keyword}: ${a.summary.slice(0, 100)}`),
  }

  // Build context injection for LLM
  const contextParts: string[] = ['[调研数据]']
  for (const article of articles) {
    contextParts.push(`${article.keyword} (${article.source}): ${article.summary}`)
  }
  if (relatedQuestions.length > 0) {
    contextParts.push(`相关搜索: ${relatedQuestions.join(', ')}`)
  }

  return {
    id: 'research-brief',
    name: 'AI 调研简报',
    icon: '📋',
    data,
    contextInjection: contextParts.join('\n'),
  }
}
