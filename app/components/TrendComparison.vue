<template>
  <div v-if="data" class="trend-comparison rounded-2xl border border-line bg-surface-card p-5 space-y-4">
    <div class="flex items-center gap-2 text-sm text-content-secondary">
      <span>📊</span>
      <span class="font-medium">搜索热度对比</span>
      <span class="text-xs text-content-faint">（基于搜索引擎真实数据）</span>
    </div>

    <!-- Ratio bar -->
    <div>
      <div class="flex justify-between text-xs mb-1.5">
        <span class="text-cyan-400 font-medium">{{ data.choiceA.keyword }}</span>
        <span class="text-amber-400 font-medium">{{ data.choiceB.keyword }}</span>
      </div>
      <div class="h-3 rounded-full overflow-hidden bg-surface-card flex">
        <div
          class="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700 ease-out"
          :style="{ width: barWidthA }"
        />
        <div
          class="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
          :style="{ width: barWidthB }"
        />
      </div>
      <div class="text-center text-xs text-content-muted mt-1">{{ data.comparison.ratio }}</div>
    </div>

    <!-- Related searches -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-content-muted mb-2">相关搜索</p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="s in data.choiceA.suggestions.slice(0, 5)"
            :key="s"
            class="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300/80 border border-cyan-500/15"
          >{{ s }}</span>
          <span v-if="!data.choiceA.suggestions.length" class="text-xs text-content-faint">暂无数据</span>
        </div>
      </div>
      <div>
        <p class="text-xs text-content-muted mb-2">相关搜索</p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="s in data.choiceB.suggestions.slice(0, 5)"
            :key="s"
            class="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300/80 border border-amber-500/15"
          >{{ s }}</span>
          <span v-if="!data.choiceB.suggestions.length" class="text-xs text-content-faint">暂无数据</span>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <p class="text-xs text-content-secondary text-center">
      {{ data.comparison.summary }}
    </p>
  </div>

  <!-- Loading state -->
  <div v-else-if="loading" class="rounded-2xl border border-line bg-surface-card p-5 text-center">
    <div class="flex items-center justify-center gap-2 text-sm text-content-muted">
      <span class="animate-spin">⏳</span>
      <span>正在获取搜索热度数据...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any | null
  loading: boolean
}>()

const barWidthA = computed(() => {
  if (!props.data) return '50%'
  const total = props.data.choiceA.suggestCount + props.data.choiceB.suggestCount
  if (total === 0) return '50%'
  return Math.round((props.data.choiceA.suggestCount / total) * 100) + '%'
})

const barWidthB = computed(() => {
  if (!props.data) return '50%'
  const total = props.data.choiceA.suggestCount + props.data.choiceB.suggestCount
  if (total === 0) return '50%'
  return Math.round((props.data.choiceB.suggestCount / total) * 100) + '%'
})
</script>
