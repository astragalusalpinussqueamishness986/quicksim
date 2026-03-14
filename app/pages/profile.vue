<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-slate-400 hover:text-white mb-6 transition-colors">
      ← 返回首页
    </NuxtLink>

    <div class="flex items-center gap-3 mb-8">
      <span class="text-4xl">🧠</span>
      <div>
        <h1 class="text-2xl font-bold">我的决策画像</h1>
        <p class="text-slate-400">AI 从你的每次决策中学习你的特征</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-8" v-if="profile">
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <p class="text-3xl font-bold text-white">{{ profile.decisionCount }}</p>
        <p class="text-xs text-slate-500 mt-1">决策次数</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <p class="text-3xl font-bold text-white">{{ traitCount }}</p>
        <p class="text-xs text-slate-500 mt-1">画像标签</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <p class="text-3xl font-bold text-white">{{ categoryCount }}</p>
        <p class="text-xs text-slate-500 mt-1">维度覆盖</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="profile && traitCount === 0" class="text-center py-16">
      <p class="text-6xl mb-4">🌱</p>
      <p class="text-lg text-slate-300">画像还是空白的</p>
      <p class="text-sm text-slate-500 mt-2">去<NuxtLink to="/tree" class="text-emerald-400 hover:underline">决策树</NuxtLink>提问几个问题，AI 会自动学习你的特征</p>
    </div>

    <!-- Trait cards by category -->
    <div v-if="profile" class="space-y-6">
      <div
        v-for="(traits, category) in profile.traits"
        :key="category"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="text-lg">{{ categoryIcon(category as string) }}</span>
          <h2 class="text-base font-semibold text-white">{{ categoryLabel(category as string) }}</h2>
          <span class="text-xs text-slate-500">({{ (traits as any[]).length }})</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="trait in (traits as any[])"
            :key="trait.key"
            class="group relative px-3 py-2 rounded-xl border transition-all"
            :class="confidenceClass(trait.confidence)"
          >
            <span class="text-xs text-slate-400">{{ trait.key }}</span>
            <span class="text-sm font-medium text-white ml-1">{{ trait.value }}</span>
            <!-- Confidence bar -->
            <div class="absolute bottom-0 left-0 h-0.5 rounded-full bg-emerald-500/50" :style="{ width: (trait.confidence * 100) + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Decision History -->
    <div v-if="profile?.decisions?.length" class="mt-8">
      <h2 class="text-base font-semibold text-white mb-4">📜 决策历史</h2>
      <div class="space-y-2">
        <div
          v-for="d in (profile.decisions as any[])"
          :key="d.id"
          class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
        >
          <span class="text-xs text-slate-500 shrink-0">{{ formatDate(d.created_at) }}</span>
          <span class="text-sm text-slate-300 flex-1 truncate">{{ d.question }}</span>
          <span v-if="d.choice_a && d.choice_b" class="text-xs text-slate-500">
            {{ d.choice_a }} vs {{ d.choice_b }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="!profile" class="text-center py-16">
      <span class="animate-spin inline-block">⏳</span>
      <p class="text-sm text-slate-500 mt-2">加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const profile = ref<any>(null)

const traitCount = computed(() => {
  if (!profile.value?.traits) return 0
  return Object.values(profile.value.traits).reduce((sum: number, arr: any) => sum + arr.length, 0)
})

const categoryCount = computed(() => {
  if (!profile.value?.traits) return 0
  return Object.keys(profile.value.traits).length
})

onMounted(async () => {
  try {
    profile.value = await $fetch('/api/profile')
  } catch {
    profile.value = { traits: {}, decisions: [], decisionCount: 0, summary: '' }
  }
})

function categoryIcon(cat: string) {
  const icons: Record<string, string> = {
    basic: '👤',
    career: '💼',
    values: '💎',
    preferences: '🎯',
    life: '🏠',
  }
  return icons[cat] || '📌'
}

function categoryLabel(cat: string) {
  const labels: Record<string, string> = {
    basic: '基本信息',
    career: '职业发展',
    values: '价值观',
    preferences: '偏好特征',
    life: '生活状况',
  }
  return labels[cat] || cat
}

function confidenceClass(confidence: number) {
  if (confidence >= 0.7) return 'border-emerald-500/30 bg-emerald-500/[0.05]'
  if (confidence >= 0.4) return 'border-amber-500/20 bg-amber-500/[0.03]'
  return 'border-white/5 bg-white/[0.02]'
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>
