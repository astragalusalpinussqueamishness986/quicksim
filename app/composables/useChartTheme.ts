/**
 * Composable: provides ECharts-compatible theme colors
 * that react to light/dark mode switching.
 */
export function useChartTheme() {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  const chartColors = computed(() => {
    if (isDark.value) {
      return {
        textColor: '#e2e8f0',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        splitAreaColors: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.03)'],
        splitLineColor: 'rgba(255,255,255,0.06)',
        axisLineColor: 'rgba(255,255,255,0.08)',
        gridLineColor: 'rgba(255,255,255,0.1)',
        tooltipBg: 'rgba(15, 23, 42, 0.95)',
        tooltipBorder: 'rgba(255,255,255,0.1)',
        tooltipText: '#e2e8f0',
      }
    }
    return {
      textColor: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      splitAreaColors: ['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.03)'],
      splitLineColor: 'rgba(0,0,0,0.06)',
      axisLineColor: 'rgba(0,0,0,0.08)',
      gridLineColor: 'rgba(0,0,0,0.08)',
      tooltipBg: 'rgba(255, 255, 255, 0.95)',
      tooltipBorder: 'rgba(0,0,0,0.1)',
      tooltipText: '#1e293b',
    }
  })

  return { isDark, chartColors }
}
