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

const { chartColors } = useChartTheme()
const props = defineProps<{ chartData: ChartData }>()

const chartOption = computed(() => {
  const colors = chartColors.value
  if (props.chartData.type === 'radar') {
    return {
      tooltip: {},
      legend: {
        bottom: 0,
        textStyle: { color: colors.textSecondary },
      },
      radar: {
        indicator: props.chartData.labels.map(l => ({ name: l, max: 100 })),
        shape: 'circle',
        axisName: { color: colors.textSecondary },
        splitArea: { areaStyle: { color: colors.splitAreaColors } },
        splitLine: { lineStyle: { color: colors.gridLineColor } },
        axisLine: { lineStyle: { color: colors.gridLineColor } },
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
      textStyle: { color: colors.textSecondary },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: props.chartData.labels,
      axisLabel: { color: colors.textSecondary },
      axisLine: { lineStyle: { color: colors.gridLineColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.gridLineColor } },
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
