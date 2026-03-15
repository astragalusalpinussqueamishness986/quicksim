<template>
  <div class="relative">
    <div v-if="loading" class="flex items-center justify-center h-[280px]">
      <span class="animate-spin text-2xl">⏳</span>
    </div>
    <div v-else-if="!data" class="flex flex-col items-center justify-center h-[240px] text-center">
      <p class="text-4xl mb-3">📊</p>
      <p class="text-content-secondary text-sm">暂无画像数据</p>
    </div>
    <div v-else class="flex flex-col items-center">
      <!-- Overall score -->
      <div class="relative mb-1">
        <div class="text-center">
          <p class="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {{ data.overall }}
          </p>
          <p class="text-[10px] text-content-muted mt-0.5">画像成熟度</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full max-w-[240px] mb-3 mx-auto">
        <div class="h-1 rounded-full bg-surface-card overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out"
            :class="overallBarColor"
            :style="{ width: data.overall + '%' }"
          />
        </div>
        <p class="text-[10px] text-content-faint text-center mt-1">{{ maturityLabel }}</p>
      </div>

      <!-- Radar chart -->
      <div ref="chartRef" class="w-full h-[240px]" />

      <!-- Dimension details -->
      <div class="w-full grid grid-cols-5 gap-1 mt-2">
        <div
          v-for="dim in data.dimensions"
          :key="dim.category"
          class="text-center"
        >
          <p class="mb-0.5">{{ categoryIcon(dim.category) }}</p>
          <p class="text-[10px] font-medium text-content">{{ dim.score }}%</p>
          <p class="text-[10px] text-content-muted leading-tight">{{ dim.label }}</p>
          <p class="text-[10px] text-content-faint">
            <template v-if="dim.traitCount >= dim.expected">✓ {{ dim.traitCount }}项</template>
            <template v-else>{{ dim.traitCount }}/{{ dim.expected }}</template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

const { chartColors } = useChartTheme()

interface Dimension {
  category: string
  label: string
  score: number
  traitCount: number
  expected: number
}

interface CompletenessData {
  dimensions: Dimension[]
  overall: number
}

const props = defineProps<{
  data: CompletenessData | null
  loading?: boolean
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const overallBarColor = computed(() => {
  if (!props.data) return 'bg-slate-600'
  const score = props.data.overall
  if (score >= 70) return 'bg-gradient-to-r from-emerald-500 to-cyan-500'
  if (score >= 40) return 'bg-gradient-to-r from-amber-500 to-yellow-500'
  return 'bg-gradient-to-r from-slate-500 to-slate-400'
})

const maturityLabel = computed(() => {
  if (!props.data) return ''
  const score = props.data.overall
  if (score >= 80) return '🌟 画像非常完整，AI 已深入了解你'
  if (score >= 60) return '📈 画像较完善，继续决策能更精准'
  if (score >= 40) return '🌿 画像初具雏形，多做几次决策吧'
  if (score >= 20) return '🌱 画像刚起步，快去试试决策树'
  return '🪹 画像还是空白的'
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

function renderChart() {
  if (!chartRef.value || !props.data?.dimensions?.length) return

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const dims = props.data.dimensions
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
            name: '画像完整度',
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(52, 211, 153, 0.35)' },
                { offset: 1, color: 'rgba(6, 182, 212, 0.08)' },
              ]),
            },
            lineStyle: {
              color: '#34d399',
              width: 2,
            },
            itemStyle: {
              color: '#34d399',
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
          `${categoryIcon(d.category)} ${d.label}: <strong>${params.value[i]}%</strong> (${d.traitCount}/${d.expected})`
        ).join('<br/>')
      },
    },
  })
}

watch(() => props.data, () => {
  nextTick(renderChart)
}, { deep: true })

watch(chartColors, () => {
  nextTick(renderChart)
})

onMounted(() => {
  if (props.data) {
    nextTick(renderChart)
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
</script>
