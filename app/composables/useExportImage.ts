import html2canvas from 'html2canvas'

export function useExportImage() {
  const exporting = ref(false)

  async function exportAsImage(el: HTMLElement, filename = 'quicksim-result') {
    if (!el) return
    exporting.value = true
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Export failed:', e)
      alert('导出失败，请重试')
    } finally {
      exporting.value = false
    }
  }

  return { exporting, exportAsImage }
}
