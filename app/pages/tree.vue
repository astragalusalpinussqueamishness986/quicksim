<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-content-secondary hover:text-content mb-6 transition-colors">
      ← 返回首页
    </NuxtLink>

    <!-- Header: show when no result yet -->
    <div v-if="!started" class="flex items-center gap-3 mb-8">
      <span class="text-4xl">🌳</span>
      <div>
        <h1 class="text-2xl font-bold">决策路径树</h1>
        <p class="text-content-secondary">输入一个选择，AI 推导多层连锁结果</p>
      </div>
    </div>

    <!-- After started: show user's question as title -->
    <div v-if="started" class="mb-6">
      <h1 class="text-xl font-bold text-content">🌳 {{ question }}</h1>
    </div>

    <!-- Input Form -->
    <form v-if="!started" class="space-y-4 max-w-lg" @submit.prevent="generate">
      <div>
        <label class="block text-sm font-medium text-content-secondary mb-1">你面临的选择</label>
        <input
          v-model="question"
          type="text"
          placeholder="例如：25岁要不要生孩子、该不该裸辞去旅行..."
          required
          class="input-field"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-content-secondary mb-1">背景描述 <span class="text-content-muted">(可选，更精准)</span></label>
        <textarea
          v-model="userContext"
          rows="2"
          placeholder="例如：计算机专业，男，月薪1.5万，坐标杭州..."
          class="input-field resize-none"
        />
      </div>

      <!-- Skill toggles -->
      <div class="space-y-2">
        <p class="text-xs text-content-muted">启用的 Skills</p>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="skill in availableSkills"
            :key="skill.id"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-sm"
            :class="enabledSkills.has(skill.id)
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-line bg-surface-card text-content-secondary hover:bg-surface-hover'"
          >
            <input
              v-model="enabledSkillsList"
              type="checkbox"
              :value="skill.id"
              class="sr-only"
            />
            <span>{{ skill.icon }}</span>
            <span>{{ skill.name }}</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        class="w-full py-3 rounded-xl font-semibold text-content bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all"
      >
        🌳 生成决策路径树
      </button>
    </form>

    <!-- Results area: progressive rendering -->
    <div v-if="started" class="space-y-6">
      <!-- Step 1: Research Brief (AI first call, fast) -->
      <ResearchBrief
        v-if="enabledSkills.has('research-brief')"
        :data="briefData"
        :wiki-data="wikiData"
        :loading="briefLoading"
        :loading-text="briefLoadingText"
      />

      <!-- Step 2: Trend comparison (uses brief-extracted choices, fast) -->
      <TrendComparison
        v-if="trendData || trendLoading"
        :data="trendData"
        :loading="trendLoading"
      />

      <!-- Step 3: Decision tree (AI second call, slow) -->
      <div v-if="treeData" ref="treeRef">
        <DecisionTree :data="treeData" />
      </div>

      <!-- Tree loading indicator -->
      <div v-if="treeLoading" class="rounded-2xl border border-line bg-surface-card p-5">
        <div class="flex items-center gap-2 text-sm text-content-secondary">
          <span class="inline-block animate-spin">🌳</span>
          <span>正在推导决策路径树...</span>
          <span class="text-xs text-content-faint">（约 15-30 秒）</span>
        </div>
      </div>

      <!-- Step 4: Probability Model (client-side, instant after tree) -->
      <ProbabilityModel v-if="probabilityData" :data="probabilityData" />

      <!-- Actions -->
      <div v-if="treeData" class="flex flex-wrap gap-3 pt-4">
        <button
          class="px-6 py-2 rounded-xl border border-line hover:bg-surface-hover transition-colors"
          @click="reset"
        >
          🔄 重新生成
        </button>
        <button
          :disabled="exporting"
          class="px-6 py-2 rounded-xl border border-line hover:bg-surface-hover transition-colors disabled:opacity-50"
          @click="handleExport"
        >
          {{ exporting ? '📸 导出中...' : '📸 导出为图片' }}
        </button>
        <NuxtLink
          to="/"
          class="px-6 py-2 rounded-xl border border-line hover:bg-surface-hover transition-colors"
        >
          🏠 返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DecisionTreeResponse } from '~/types'

const { exporting, exportAsImage } = useExportImage()

const question = ref('')
const userContext = ref('')
const started = ref(false)

// State for each step
const briefData = ref<any>(null)
const briefLoading = ref(false)
const briefLoadingText = ref('')
const wikiData = ref<any>(null)
const trendData = ref<any>(null)
const trendLoading = ref(false)
const treeData = ref<DecisionTreeResponse | null>(null)
const treeLoading = ref(false)
const probabilityData = ref<any>(null)
const treeRef = ref<HTMLElement | null>(null)

// Skill system
const availableSkills = [
  { id: 'research-brief', name: 'AI 调研简报', icon: '📋' },
  { id: 'probability-model', name: '概率化建模', icon: '📊' },
]
const enabledSkillsList = ref(['research-brief', 'probability-model'])
const enabledSkills = computed(() => new Set(enabledSkillsList.value))

// Pre-fill from query string
const route = useRoute()
onMounted(() => {
  const q = route.query.q as string
  if (q) question.value = q
})

async function generate() {
  started.value = true
  briefData.value = null
  wikiData.value = null
  trendData.value = null
  treeData.value = null
  probabilityData.value = null

  let extractedChoiceA = ''
  let extractedChoiceB = ''
  let searchKeywordA = ''
  let searchKeywordB = ''
  let briefContext = ''

  // Load existing user profile for context injection
  let profileContext = ''
  try {
    const profile = await $fetch<any>('/api/profile')
    if (profile.summary) {
      profileContext = profile.summary
    }
  } catch {
    // No profile yet, that's fine
  }

  // ── Step 1: AI Research Brief (fast LLM call) ──
  if (enabledSkills.value.has('research-brief')) {
    briefLoading.value = true
    briefLoadingText.value = '正在分析问题...'
    try {
      const res = await $fetch<any>('/api/research-brief', {
        method: 'POST',
        body: { question: question.value, userContext: userContext.value },
      })
      briefData.value = res
      extractedChoiceA = res.choiceA
      extractedChoiceB = res.choiceB
      searchKeywordA = res.searchKeywordA || res.choiceA
      searchKeywordB = res.searchKeywordB || res.choiceB
      briefContext = `AI简报：${res.brief}\n关键因素：${(res.keyFactors || []).join('、')}`

      // Step 1b: Fetch Wikipedia/Baike data using AI-extracted choices (non-LLM, fast)
      briefLoadingText.value = '正在查询百科数据...'
      try {
        const skillRes = await $fetch<any>('/api/skills', {
          method: 'POST',
          body: { question: question.value, choices: [extractedChoiceA, extractedChoiceB] },
        })
        const research = skillRes?.skills?.find((s: any) => s.id === 'research-brief')
        if (research?.data?.articles?.length) {
          wikiData.value = research.data
          briefContext += `\n${skillRes.combinedContext}`
        }
      } catch {
        // Non-critical
      }
    } catch {
      // Brief failed, continue without it
    }
    briefLoading.value = false
  }

  // ── Step 2: Trend data (uses AI-extracted search keywords for better matching) ──
  trendLoading.value = true
  const trendBody: any = { question: question.value }
  if (searchKeywordA && searchKeywordB) {
    trendBody.choiceA = searchKeywordA
    trendBody.choiceB = searchKeywordB
  } else if (extractedChoiceA && extractedChoiceB) {
    trendBody.choiceA = extractedChoiceA
    trendBody.choiceB = extractedChoiceB
  }
  const trendPromise = $fetch('/api/trends', {
    method: 'POST',
    body: trendBody,
  }).then((res) => {
    trendData.value = res
    trendLoading.value = false
    return res
  }).catch(() => {
    trendLoading.value = false
    return null
  })

  // ── Step 3: Decision tree (LLM, slow — inject brief + trend as context) ──
  treeLoading.value = true

  // Wait for trend data (up to 2s) to inject into context
  const trend = await Promise.race([trendPromise, new Promise(r => setTimeout(r, 2000))])

  const contextParts: string[] = []
  if (profileContext) contextParts.push(profileContext)
  if (userContext.value) contextParts.push(userContext.value)
  if (briefContext) contextParts.push(briefContext)

  if (trend) {
    contextParts.push(`搜索热度数据：${JSON.stringify({
      choiceA: { keyword: (trend as any).choiceA?.keyword, suggestCount: (trend as any).choiceA?.suggestCount, suggestions: (trend as any).choiceA?.suggestions?.slice(0, 5) },
      choiceB: { keyword: (trend as any).choiceB?.keyword, suggestCount: (trend as any).choiceB?.suggestCount, suggestions: (trend as any).choiceB?.suggestions?.slice(0, 5) },
      comparison: (trend as any).comparison,
    })}`)
  }

  try {
    const res = await $fetch<DecisionTreeResponse>('/api/decision-tree', {
      method: 'POST',
      body: {
        question: question.value,
        context: contextParts.join('\n'),
      },
    })
    treeData.value = res

    // Step 4: Probability Modeling (client-side, instant)
    if (enabledSkills.value.has('probability-model') && res) {
      probabilityData.value = computeProbability(res)
    }

    // Step 5: Extract user profile traits (background, non-blocking)
    $fetch('/api/profile-extract', {
      method: 'POST',
      body: {
        question: question.value,
        choiceA: res.branches?.[0]?.choice,
        choiceB: res.branches?.[1]?.choice,
        brief: briefData.value?.brief,
        userContext: userContext.value,
        insight: res.insight,
      },
    }).catch(() => {}) // non-critical
  } catch (e: any) {
    alert('生成失败：' + (e?.data?.message || e?.message || '未知错误'))
  }

  treeLoading.value = false
  await trendPromise // ensure trend completes
}

function computeProbability(tree: DecisionTreeResponse) {
  if (!tree.branches || tree.branches.length < 2) return null

  function countSentiments(nodes: any[]): { pos: number; neg: number; neu: number } {
    let pos = 0, neg = 0, neu = 0
    for (const n of nodes) {
      if (!n || typeof n !== 'object') continue
      if (n.sentiment === 'positive') pos++
      else if (n.sentiment === 'negative') neg++
      else neu++
      if (n.children && Array.isArray(n.children)) {
        const sub = countSentiments(n.children)
        pos += sub.pos; neg += sub.neg; neu += sub.neu
      }
    }
    return { pos, neg, neu }
  }

  function findExtreme(nodes: any[], sentiment: string, depth = 0): { text: string; depth: number } | null {
    let best: { text: string; depth: number } | null = null
    for (const n of nodes) {
      if (!n || typeof n !== 'object') continue
      if (n.sentiment === sentiment) {
        if (!best || depth > best.depth) best = { text: n.text, depth }
      }
      if (n.children && Array.isArray(n.children)) {
        const child = findExtreme(n.children, sentiment, depth + 1)
        if (child && (!best || child.depth > best.depth)) best = child
      }
    }
    return best
  }

  const paths = tree.branches.map((branch) => {
    const validNodes = (branch.nodes || []).filter((n: any) => n && typeof n === 'object')
    const counts = countSentiments(validNodes)
    const total = counts.pos + counts.neg + counts.neu || 1
    const rawEV = (counts.pos - counts.neg) / total
    const normalizedEV = Math.round((rawEV + 1) * 50)
    const bestCase = findExtreme(validNodes, 'positive')
    const worstCase = findExtreme(validNodes, 'negative')
    const negRatio = counts.neg / total
    const riskLevel = negRatio > 0.4 ? 'high' : negRatio > 0.2 ? 'medium' : 'low'

    return {
      choice: branch.choice,
      icon: branch.icon,
      totalEV: normalizedEV,
      bestCase: bestCase?.text || '未知',
      worstCase: worstCase?.text || '未知',
      riskLevel,
    }
  })

  const winnerIndex = paths[0].totalEV >= paths[1].totalEV ? 0 : 1
  const diff = Math.abs(paths[0].totalEV - paths[1].totalEV)
  let recommendation: string
  if (diff < 5) {
    recommendation = `两个选择的预期得分非常接近 (${paths[0].totalEV} vs ${paths[1].totalEV})，建议结合个人偏好决定`
  } else if (diff < 15) {
    recommendation = `"${paths[winnerIndex].choice}" 略占优势 (得分 ${paths[winnerIndex].totalEV}/100)，但差距不大`
  } else {
    recommendation = `"${paths[winnerIndex].choice}" 明显更优 (得分 ${paths[winnerIndex].totalEV}/100 vs ${paths[1 - winnerIndex].totalEV}/100)`
  }

  return { paths, recommendation, winnerIndex }
}

function reset() {
  started.value = false
  briefData.value = null
  wikiData.value = null
  trendData.value = null
  treeData.value = null
  probabilityData.value = null
}

function handleExport() {
  if (treeRef.value) {
    exportAsImage(treeRef.value, `quicksim-tree-${question.value.slice(0, 20)}`)
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl bg-surface-card border border-line px-4 py-3 text-content placeholder-content-muted focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors;
}
</style>
