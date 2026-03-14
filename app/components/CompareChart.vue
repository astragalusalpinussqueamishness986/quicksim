<template>
  <div class="w-full h-80">
    <v-chart :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { RadarChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, RadarComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import type { ChartData } from '~/types'

use([RadarChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, RadarComponent, GridComponent, CanvasRenderer])

const props = defineProps<{ chartData: ChartData }>()

const chartOption = computed(() => {
  if (props.chartData.type === 'radar') {
    return {
      tooltip: {},
      legend: {
        bottom: 0,
        textStyle: { color: '#94a3b8' },
      },
      radar: {
        indicator: props.chartData.labels.map(l => ({ name: l, max: 100 })),
        shape: 'circle',
        axisName: { color: '#cbd5e1' },
        splitArea: { areaStyle: { color: ['rgba(99,102,241,0.05)', 'rgba(99,102,241,0.1)'] } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [{
        type: 'radar',
        data: props.chartData.datasets.map(ds => ({
          value: ds.data,
          name: ds.label,
          areaStyle: { opacity: 0.15 },
        })),
      }],
    }
  }

  // Bar chart fallback
  return {
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      textStyle: { color: '#94a3b8' },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: props.chartData.labels,
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    series: props.chartData.datasets.map(ds => ({
      name: ds.label,
      type: 'bar',
      data: ds.data,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    })),
  }
})
</script>
