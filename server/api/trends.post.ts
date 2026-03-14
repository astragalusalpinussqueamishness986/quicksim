/**
 * Trend data API — fetches real-world search/suggestion data
 * Uses Baidu + Bing suggestion APIs, plus Baidu search result count estimation
 */

interface TrendResult {
  keyword: string
  suggestions: string[]
  suggestCount: number
}

interface TrendResponse {
  choiceA: TrendResult
  choiceB: TrendResult
  comparison: {
    hotterChoice: 'A' | 'B' | 'tie'
    ratio: string
    summary: string
  }
}

async function fetchBaiduSuggestions(keyword: string): Promise<string[]> {
  try {
    const url = `https://www.baidu.com/sugrec?prod=pc&from=pc_web&wd=${encodeURIComponent(keyword)}`
    const res = await $fetch<any>(url, { timeout: 5000 })
    if (res?.g && Array.isArray(res.g)) {
      return res.g.map((item: any) => item.q || item.k).filter(Boolean)
    }
    return []
  } catch {
    return []
  }
}

async function fetchBingSuggestions(keyword: string): Promise<string[]> {
  try {
    const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(keyword)}&mkt=zh-CN&language=zh`
    const res = await $fetch<any>(url, { timeout: 5000 })
    return Array.isArray(res) && res[1] ? res[1] : []
  } catch {
    return []
  }
}

export default defineEventHandler(async (event): Promise<TrendResponse> => {
  const body = await readBody(event)
  const { question, choiceA: explicitA, choiceB: explicitB } = body

  if (!question) {
    throw createError({ statusCode: 400, message: '缺少 question 参数' })
  }

  // Use explicit AI-extracted choices if provided, otherwise fall back to heuristic
  let choiceA: string
  let choiceB: string
  if (explicitA && explicitB) {
    choiceA = explicitA
    choiceB = explicitB
  } else {
    const extracted = extractChoices(question)
    choiceA = extracted.choiceA
    choiceB = extracted.choiceB
  }

  // Fetch suggestions with fallback: if keyword returns 0, try shorter variants
  async function fetchWithFallback(keyword: string) {
    const [baidu, bing] = await Promise.all([
      fetchBaiduSuggestions(keyword),
      fetchBingSuggestions(keyword),
    ])
    const merged = [...new Set([...baidu, ...bing])]

    // If no results and keyword > 2 chars, try shorter version
    if (merged.length === 0 && keyword.length > 2) {
      const shorter = keyword.slice(0, 2)
      const [baiduS, bingS] = await Promise.all([
        fetchBaiduSuggestions(shorter),
        fetchBingSuggestions(shorter),
      ])
      const mergedS = [...new Set([...baiduS, ...bingS])]
      return { suggestions: mergedS, keyword: shorter }
    }

    return { suggestions: merged, keyword }
  }

  const [resultA, resultB] = await Promise.all([
    fetchWithFallback(choiceA),
    fetchWithFallback(choiceB),
  ])

  const suggestionsA = resultA.suggestions
  const suggestionsB = resultB.suggestions
  const displayKeywordA = resultA.keyword
  const displayKeywordB = resultB.keyword

  // Combined score: suggestion count
  const scoreA = suggestionsA.length
  const scoreB = suggestionsB.length
  const total = scoreA + scoreB || 1

  let hotterChoice: 'A' | 'B' | 'tie' = 'tie'
  if (scoreA > scoreB * 1.2) hotterChoice = 'A'
  else if (scoreB > scoreA * 1.2) hotterChoice = 'B'

  const ratioA = Math.round((scoreA / total) * 100)
  const ratioB = 100 - ratioA

  return {
    choiceA: {
      keyword: choiceA,
      suggestions: suggestionsA.slice(0, 8),
      suggestCount: suggestionsA.length,
    },
    choiceB: {
      keyword: choiceB,
      suggestions: suggestionsB.slice(0, 8),
      suggestCount: suggestionsB.length,
    },
    comparison: {
      hotterChoice,
      ratio: `${ratioA}% : ${ratioB}%`,
      summary: hotterChoice === 'tie'
        ? `"${choiceA}" 和 "${choiceB}" 的搜索热度相当`
        : `"${hotterChoice === 'A' ? choiceA : choiceB}" 的搜索热度更高 (${hotterChoice === 'A' ? ratioA : ratioB}%)`,
    },
  }
})
