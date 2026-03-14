<template>
  <div v-if="scenario">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-slate-400 hover:text-white mb-6 transition-colors">
      ← 返回场景列表
    </NuxtLink>

    <div class="flex items-center gap-3 mb-8">
      <span class="text-4xl">{{ scenario.icon }}</span>
      <div>
        <h1 class="text-2xl font-bold">{{ scenario.name }}</h1>
        <p class="text-slate-400">{{ scenario.description }}</p>
      </div>
    </div>

    <!-- Input Form -->
    <form v-if="!result" class="space-y-4 max-w-md" @submit.prevent="runSimulation">
      <div v-for="field in scenario.fields" :key="field.key">
        <label class="block text-sm font-medium text-slate-300 mb-1">{{ field.label }}</label>
        <input
          v-model="formData[field.key]"
          :type="field.type === 'number' ? 'number' : 'text'"
          :placeholder="field.placeholder"
          required
          class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
      >
        {{ loading ? '⏳ AI 正在推演...' : '🚀 开始推演' }}
      </button>
      <p v-if="loading" class="text-sm text-slate-500 text-center">预计需要 10-20 秒，请稍候...</p>
    </form>

    <!-- ===== Structured Results ===== -->
    <div v-if="result" class="space-y-6 animate-fade-in">

      <!-- Export capture area (excludes action buttons) -->
      <div ref="resultRef" class="space-y-6 pb-2">

      <!-- 1. Summary Banner -->
      <div class="rounded-2xl bg-gradient-to-r p-[1px]" :class="scenario.color">
        <div class="rounded-2xl bg-slate-900 p-5 text-center">
          <p class="text-xl font-bold">{{ result.summary }}</p>
        </div>
      </div>

      <!-- 2. Key Metrics Grid -->
      <div v-if="result.metrics?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="(m, i) in result.metrics"
          :key="i"
          class="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
        >
          <p class="text-xs text-slate-500 mb-2">{{ m.label }}</p>
          <div class="flex items-center justify-center gap-3">
            <span
              class="text-sm font-semibold"
              :class="m.winner === 'A' ? 'text-cyan-400' : 'text-slate-300'"
            >{{ m.valueA }}</span>
            <span class="text-xs text-slate-600">vs</span>
            <span
              class="text-sm font-semibold"
              :class="m.winner === 'B' ? 'text-amber-400' : 'text-slate-300'"
            >{{ m.valueB }}</span>
          </div>
        </div>
      </div>

      <!-- 3. Radar Chart -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <CompareChart :chart-data="result.chartData" />
      </div>

      <!-- 4. Timeline Phases -->
      <div v-if="result.phases?.length" class="space-y-0">
        <h3 class="text-lg font-semibold mb-4">📖 推演时间线</h3>
        <div class="relative pl-8 border-l-2 border-indigo-500/30 space-y-6">
          <div
            v-for="(phase, i) in result.phases"
            :key="i"
            class="relative"
          >
            <!-- Timeline dot -->
            <div class="absolute -left-[25px] w-4 h-4 rounded-full bg-indigo-500 border-2 border-slate-900" />
            <div class="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{{ phase.icon }}</span>
                <h4 class="font-semibold text-white">{{ phase.title }}</h4>
              </div>
              <p class="text-sm text-slate-300 leading-relaxed">{{ phase.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Verdict -->
      <div v-if="result.verdict" class="rounded-2xl bg-indigo-950/50 border border-indigo-500/30 p-5">
        <div class="flex items-start gap-3">
          <span class="text-2xl">🎯</span>
          <div>
            <p class="text-sm text-indigo-400 font-medium mb-1">AI 结论</p>
            <p class="text-white font-semibold">{{ result.verdict }}</p>
          </div>
        </div>
      </div>

      <!-- Watermark for export -->
      <div class="text-center text-xs text-slate-600 pt-2">QuickSim — AI 人生场景速推</div>

      </div><!-- end resultRef -->

      <!-- Actions -->
      <div class="flex flex-wrap gap-3 pt-2">
        <button
          class="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          @click="reset"
        >
          🔄 重新推演
        </button>
        <button
          :disabled="exporting"
          class="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
          @click="handleExport"
        >
          {{ exporting ? '📸 导出中...' : '📸 导出为图片' }}
        </button>
        <NuxtLink
          to="/"
          class="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
        >
          🎲 换个场景
        </NuxtLink>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <p class="text-slate-400">场景不存在</p>
    <NuxtLink to="/" class="text-indigo-400 hover:underline mt-2 inline-block">返回首页</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { getScenarioById } from '~/scenarios'
import type { SimulateResponse } from '~/types'

const { exporting, exportAsImage } = useExportImage()

const route = useRoute()
const scenarioId = route.params.id as string
const scenario = getScenarioById(scenarioId)

const formData = ref<Record<string, string | number>>({})
const loading = ref(false)
const result = ref<SimulateResponse | null>(null)
const resultRef = ref<HTMLElement | null>(null)

async function runSimulation() {
  if (!scenario) return
  loading.value = true
  try {
    const res = await $fetch<SimulateResponse>('/api/simulate', {
      method: 'POST',
      body: { scenario: scenario.id, params: formData.value },
    })
    result.value = res
  } catch (e: any) {
    alert('推演失败：' + (e?.data?.message || e?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value = null
}

function handleExport() {
  if (resultRef.value && scenario) {
    exportAsImage(resultRef.value, `quicksim-${scenario.id}`)
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
