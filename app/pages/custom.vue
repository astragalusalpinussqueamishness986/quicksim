<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-slate-400 hover:text-white mb-6 transition-colors">
      ← 返回场景列表
    </NuxtLink>

    <div class="flex items-center gap-3 mb-8">
      <span class="text-4xl">🎨</span>
      <div>
        <h1 class="text-2xl font-bold">自定义场景</h1>
        <p class="text-slate-400">定义你自己的对比维度，AI 为你分析</p>
      </div>
    </div>

    <!-- Step 1: Define Scenario -->
    <form v-if="!result" class="space-y-6 max-w-lg" @submit.prevent="runSimulation">
      <!-- Scenario name -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">场景名称</label>
        <input
          v-model="scenarioName"
          type="text"
          placeholder="例如：留学 vs 国内考研"
          required
          class="input-field"
        />
      </div>

      <!-- Options -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">选项 A</label>
          <input v-model="optionA" type="text" placeholder="例如：留学" required class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">选项 B</label>
          <input v-model="optionB" type="text" placeholder="例如：国内考研" required class="input-field" />
        </div>
      </div>

      <!-- Context -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">背景描述 <span class="text-slate-500">(可选)</span></label>
        <textarea
          v-model="context"
          rows="3"
          placeholder="例如：本科计算机专业，大三，家庭年收入约 20 万..."
          class="input-field resize-none"
        />
      </div>

      <!-- Dimensions -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">对比维度 <span class="text-slate-500">(至少 3 个)</span></label>
        <div class="space-y-2">
          <div v-for="(dim, i) in dimensions" :key="i" class="flex gap-2">
            <input
              v-model="dimensions[i]"
              type="text"
              :placeholder="`维度 ${i + 1}，如：经济成本`"
              class="input-field flex-1"
            />
            <button
              v-if="dimensions.length > 3"
              type="button"
              class="px-3 rounded-xl border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
              @click="removeDimension(i)"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          v-if="dimensions.length < 8"
          type="button"
          class="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          @click="addDimension"
        >
          + 添加维度
        </button>
      </div>

      <button
        type="submit"
        :disabled="loading || !isFormValid"
        class="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
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
      <div class="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-[1px]">
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
        <div class="relative pl-8 border-l-2 border-purple-500/30 space-y-6">
          <div v-for="(phase, i) in result.phases" :key="i" class="relative">
            <div class="absolute -left-[25px] w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900" />
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
      <div v-if="result.verdict" class="rounded-2xl bg-purple-950/50 border border-purple-500/30 p-5">
        <div class="flex items-start gap-3">
          <span class="text-2xl">🎯</span>
          <div>
            <p class="text-sm text-purple-400 font-medium mb-1">AI 结论</p>
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
</template>

<script setup lang="ts">
import type { SimulateResponse } from '~/types'

const { exporting, exportAsImage } = useExportImage()

const scenarioName = ref('')
const optionA = ref('')
const optionB = ref('')
const context = ref('')
const dimensions = ref(['', '', '', ''])
const loading = ref(false)
const result = ref<SimulateResponse | null>(null)
const resultRef = ref<HTMLElement | null>(null)

const isFormValid = computed(() => {
  return (
    scenarioName.value.trim() &&
    optionA.value.trim() &&
    optionB.value.trim() &&
    dimensions.value.filter(d => d.trim()).length >= 3
  )
})

function addDimension() {
  if (dimensions.value.length < 8) {
    dimensions.value.push('')
  }
}

function removeDimension(index: number) {
  dimensions.value.splice(index, 1)
}

async function runSimulation() {
  loading.value = true
  const validDims = dimensions.value.filter(d => d.trim())
  try {
    const res = await $fetch<SimulateResponse>('/api/simulate', {
      method: 'POST',
      body: {
        scenario: 'custom',
        params: {
          name: scenarioName.value,
          option_a: optionA.value,
          option_b: optionB.value,
          context: context.value,
          dimensions: validDims.join(','),
        },
      },
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
  if (resultRef.value) {
    exportAsImage(resultRef.value, `quicksim-custom-${scenarioName.value}`)
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors;
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
