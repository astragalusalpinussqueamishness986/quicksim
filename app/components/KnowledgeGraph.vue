<template>
  <div class="relative">
    <div v-if="loading" class="flex items-center justify-center h-[420px]">
      <span class="animate-spin text-2xl">⏳</span>
    </div>
    <div v-else-if="isEmpty" class="flex flex-col items-center justify-center h-[320px] text-center">
      <p class="text-4xl mb-3">🕸️</p>
      <p class="text-slate-400 text-sm">还没有足够的数据生成知识图谱</p>
      <p class="text-slate-500 text-xs mt-1">再做几次决策分析，图谱就会丰富起来</p>
    </div>
    <VChart
      v-else-if="chartOption"
      :option="chartOption"
      :autoresize="true"
      class="w-full h-[420px]"
      @mouseover="onNodeHover"
      @mouseout="hoveredNode = null"
    />

    <!-- Tooltip overlay -->
    <Transition name="fade">
      <div
        v-if="hoveredNode"
        class="absolute top-3 right-3 max-w-[220px] rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur p-3 text-xs pointer-events-none z-10"
      >
        <p class="font-semibold text-white mb-1">{{ hoveredNode.name }}</p>
        <p v-if="hoveredNode.nodeType === 'trait'" class="text-slate-400">
          置信度：{{ ((hoveredNode.value || 0) * 100).toFixed(0) }}%
        </p>
        <p v-if="hoveredNode.nodeType === 'decision'" class="text-slate-400">
          {{ hoveredNode.choiceA }} vs {{ hoveredNode.choiceB }}
        </p>
        <p v-if="hoveredNode.nodeType === 'category'" class="text-slate-400">
          类别中心节点
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([GraphChart, TooltipComponent, CanvasRenderer])

const loading = ref(true)
const isEmpty = ref(false)
const hoveredNode = ref<any>(null)
const chartOption = ref<any>(null)

onMounted(async () => {
  try {
    const data = await $fetch<any>('/api/profile-graph')
    if (!data.nodes || data.nodes.length === 0) {
      isEmpty.value = true
      loading.value = false
      return
    }

    chartOption.value = {
      backgroundColor: 'transparent',
      tooltip: { show: false },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: data.nodes,
          links: data.edges,
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
            color: '#e2e8f0',
            fontSize: 10,
          },
          lineStyle: {
            curveness: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
            label: { fontSize: 13, fontWeight: 'bold' },
            lineStyle: { width: 3 },
          },
        },
      ],
    }
    loading.value = false
  } catch {
    isEmpty.value = true
    loading.value = false
  }
})

function onNodeHover(params: any) {
  if (params.dataType === 'node') {
    hoveredNode.value = params.data
  }
}
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
