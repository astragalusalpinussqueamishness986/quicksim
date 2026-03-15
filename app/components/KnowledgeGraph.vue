<template>
  <div class="relative">
    <div v-if="loading" class="flex items-center justify-center h-[420px]">
      <span class="animate-spin text-2xl">⏳</span>
    </div>
    <div v-else-if="isEmpty" class="flex flex-col items-center justify-center h-[320px] text-center">
      <p class="text-4xl mb-3">🕸️</p>
      <p class="text-content-secondary text-sm">还没有足够的数据生成知识图谱</p>
      <p class="text-content-muted text-xs mt-1">再做几次决策分析，图谱就会丰富起来</p>
    </div>
    <div v-show="!loading && !isEmpty" ref="chartRef" class="w-full h-[420px]" />

    <!-- Tooltip overlay -->
    <Transition name="fade">
      <div
        v-if="hoveredNode"
        class="absolute top-3 right-3 max-w-[220px] rounded-xl border border-line bg-surface-secondary backdrop-blur p-3 text-xs pointer-events-none z-10"
      >
        <p class="font-semibold text-content mb-1">{{ hoveredNode.name }}</p>
        <p v-if="hoveredNode.nodeType === 'trait'" class="text-content-secondary">
          置信度：{{ ((hoveredNode.value || 0) * 100).toFixed(0) }}%
        </p>
        <p v-if="hoveredNode.nodeType === 'decision'" class="text-content-secondary">
          {{ hoveredNode.choiceA }} vs {{ hoveredNode.choiceB }}
        </p>
        <p v-if="hoveredNode.nodeType === 'category'" class="text-content-secondary">
          类别中心节点
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

const { chartColors } = useChartTheme()
const chartRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const isEmpty = ref(false)
const hoveredNode = ref<any>(null)
let chart: echarts.ECharts | null = null

function applyChartColors() {
  if (!chart) return
  const colors = chartColors.value
  chart.setOption({
    series: [{
      label: {
        color: colors.textColor,
      },
    }],
  })
}

watch(chartColors, applyChartColors)

onMounted(async () => {
  try {
    const data = await $fetch<any>('/api/profile-graph')
    if (!data.nodes || data.nodes.length === 0) {
      isEmpty.value = true
      loading.value = false
      return
    }

    loading.value = false
    await nextTick()

    if (!chartRef.value) return

    chart = echarts.init(chartRef.value)

    chart.setOption({
      backgroundColor: 'transparent',
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: data.nodes.map((n: any) => ({
            id: n.id,
            name: n.name,
            symbolSize: n.symbolSize,
            symbol: n.symbol,
            itemStyle: n.itemStyle,
            label: n.label,
            nodeType: n.nodeType,
            value: n.value,
            choiceA: n.choiceA,
            choiceB: n.choiceB,
          })),
          links: data.edges.map((e: any) => ({
            source: e.source,
            target: e.target,
            lineStyle: e.lineStyle,
          })),
          roam: true,
          draggable: true,
          force: {
            repulsion: 200,
            gravity: 0.1,
            edgeLength: [60, 150],
            friction: 0.6,
          },
          label: {
            show: true,
            position: 'right',
            color: chartColors.value.textColor,
            fontSize: 10,
          },
          lineStyle: {
            curveness: 0.1,
          },
          emphasis: {
            label: { fontSize: 13, fontWeight: 'bold' },
            lineStyle: { width: 3 },
          },
        },
      ],
    })

    chart.on('mouseover', (params: any) => {
      if (params.dataType === 'node') {
        hoveredNode.value = params.data
      }
    })
    chart.on('mouseout', () => {
      hoveredNode.value = null
    })

    const ro = new ResizeObserver(() => chart?.resize())
    ro.observe(chartRef.value)

    onUnmounted(() => {
      ro.disconnect()
      chart?.dispose()
      chart = null
    })
  } catch (e) {
    console.error('Knowledge graph error:', e)
    isEmpty.value = true
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
