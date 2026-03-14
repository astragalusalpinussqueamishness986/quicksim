<template>
  <div v-if="data" class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
    <div class="flex items-center gap-2 text-sm text-slate-400">
      <span>📊</span>
      <span class="font-medium">概率化建模</span>
      <span class="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full">Skill</span>
    </div>

    <!-- Path scores -->
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="(path, i) in data.paths"
        :key="path.choice"
        class="rounded-xl border p-4 space-y-3 transition-all"
        :class="i === data.winnerIndex
          ? 'border-emerald-500/30 bg-emerald-500/[0.05]'
          : 'border-white/5 bg-white/[0.02]'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ path.icon }}</span>
            <span class="text-sm font-semibold text-white">{{ path.choice }}</span>
          </div>
          <span
            v-if="i === data.winnerIndex"
            class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full"
          >👑 推荐</span>
        </div>

        <!-- Score gauge -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-500">预期得分</span>
            <span class="font-mono font-bold" :class="scoreColor(path.totalEV)">{{ path.totalEV }}/100</span>
          </div>
          <div class="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="scoreBarColor(path.totalEV)"
              :style="{ width: path.totalEV + '%' }"
            />
          </div>
        </div>

        <!-- Risk level -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">风险等级</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :class="riskClass(path.riskLevel)"
          >{{ riskLabel(path.riskLevel) }}</span>
        </div>

        <!-- Best/worst case -->
        <div class="space-y-1.5 text-xs">
          <div class="flex gap-2">
            <span class="text-emerald-400 shrink-0">最佳</span>
            <span class="text-slate-300">{{ path.bestCase }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-red-400 shrink-0">最差</span>
            <span class="text-slate-300">{{ path.worstCase }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendation -->
    <p class="text-sm text-center text-slate-300 bg-white/[0.03] rounded-xl p-3 border border-white/5">
      💡 {{ data.recommendation }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any | null
}>()

function scoreColor(score: number) {
  if (score >= 65) return 'text-emerald-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBarColor(score: number) {
  if (score >= 65) return 'bg-gradient-to-r from-emerald-600 to-emerald-400'
  if (score >= 40) return 'bg-gradient-to-r from-amber-600 to-amber-400'
  return 'bg-gradient-to-r from-red-600 to-red-400'
}

function riskClass(level: string) {
  switch (level) {
    case 'low': return 'bg-emerald-500/15 text-emerald-400'
    case 'medium': return 'bg-amber-500/15 text-amber-400'
    case 'high': return 'bg-red-500/15 text-red-400'
    default: return 'bg-white/5 text-slate-400'
  }
}

function riskLabel(level: string) {
  switch (level) {
    case 'low': return '🟢 低风险'
    case 'medium': return '🟡 中风险'
    case 'high': return '🔴 高风险'
    default: return '未知'
  }
}
</script>
