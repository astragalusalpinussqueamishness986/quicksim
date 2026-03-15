<template>
  <div class="relative">
    <div v-if="loading" class="flex items-center justify-center h-[280px]">
      <span class="animate-spin text-2xl">⏳</span>
    </div>
    <div v-else-if="!styleData?.hasData" class="flex flex-col items-center justify-center h-[240px] text-center">
      <p class="text-4xl mb-3">🎭</p>
      <p class="text-content-secondary text-sm">还没有足够的决策数据</p>
      <p class="text-content-muted text-xs mt-1">多做几次决策分析，AI 会自动识别你的决策风格</p>
    </div>
    <div v-else class="flex flex-col items-center">
      <!-- Label badge -->
      <div class="mb-2 text-center">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/20 text-violet-300">
          {{ styleData.label }}
        </span>
        <p class="text-[10px] text-content-faint mt-1">基于 {{ styleData.decisionCount }} 次决策分析</p>
      </div>

      <!-- Radar chart -->
      <div ref="chartRef" class="w-full h-[240px]" />

      <!-- Dimension bars -->
      <div class="w-full space-y-2 mt-2">
        <div v-for="dim in styleData.dimensions" :key="dim.dimension" class="group">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[10px] text-content-muted">{{ dim.lowLabel }}</span>
            <span class="text-[10px] font-medium text-content">{{ dim.icon }} {{ dim.label }} {{ dim.score }}</span>
            <span class="text-[10px] text-content-muted">{{ dim.highLabel }}</span>
          </div>
          <div class="h-1 rounded-full bg-surface-card overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="barColor(dim.score)"
              :style="{ width: dim.score + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

const { chartColors } = useChartTheme()

interface StyleDimension {
  dimension: string
  label: string
  icon: string
  score: number
  sampleCount: number
  lowLabel: string
  highLabel: string
}

interface StyleData {
  dimensions: StyleDimension[]
  decisionCount: number
  label: string
  hasData: boolean
}

const loading = ref(true)
const styleData = ref<StyleData | null>(null)
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

function barColor(score: number) {
  if (score >= 70) return 'bg-gradient-to-r from-violet-500 to-indigo-500'
  if (score >= 40) return 'bg-gradient-to-r from-slate-400 to-slate-300'
  return 'bg-gradient-to-r from-amber-500 to-yellow-500'
}

function renderChart() {
  if (!chartRef.value || !styleData.value?.dimensions?.length) return

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const dims = styleData.value.dimensions
  const indicators = dims.map(d => ({
    name: d.label,
    max: 100,
  }))

  chart.setOption({
    backgroundColor: 'transparent',
    radar: {
      indicator: indicators,
      shape: 'circle',
      radius: '65%',
      axisName: {
        color: chartColors.value.textSecondary,
        fontSize: 11,
      },
      splitArea: {
        areaStyle: {
          color: chartColors.value.splitAreaColors,
        },
      },
      splitLine: {
        lineStyle: { color: chartColors.value.splitLineColor },
      },
      axisLine: {
        lineStyle: { color: chartColors.value.axisLineColor },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: dims.map(d => d.score),
            name: '决策风格',
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(139, 92, 246, 0.35)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.08)' },
              ]),
            },
            lineStyle: {
              color: '#8b5cf6',
              width: 2,
            },
            itemStyle: {
              color: '#8b5cf6',
              borderColor: '#fff',
              borderWidth: 1,
            },
          },
        ],
        animationDuration: 1200,
      },
    ],
    tooltip: {
      trigger: 'item',
      backgroundColor: chartColors.value.tooltipBg,
      borderColor: chartColors.value.tooltipBorder,
      textStyle: { color: chartColors.value.tooltipText, fontSize: 12 },
      formatter: (params: any) => {
        if (!params.value) return ''
        return dims.map((d, i) =>
          `${d.icon} ${d.label}: <strong>${params.value[i]}</strong>`
        ).join('<br/>')
      },
    },
  })
}

onMounted(async () => {
  try {
    const data = await $fetch<StyleData>('/api/profile-style')
    styleData.value = data
  } catch {
    styleData.value = { dimensions: [], decisionCount: 0, label: '', hasData: false }
  }
  loading.value = false

  await nextTick()
  if (styleData.value?.hasData) {
    renderChart()
  }

  if (chartRef.value) {
    const ro = new ResizeObserver(() => chart?.resize())
    ro.observe(chartRef.value)
    onUnmounted(() => {
      ro.disconnect()
      chart?.dispose()
      chart = null
    })
  }
})

watch(chartColors, () => {
  if (styleData.value?.hasData) {
    nextTick(renderChart)
  }
})
</script>
