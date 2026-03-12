// lib/export.ts
import { renderMarkdownToHTML } from './renderMarkdown'

export function exportToJSON(title: string, content: string): void {
  const blob = new Blob(
    [JSON.stringify({ title, content, exportedAt: Date.now() }, null, 2)],
    { type: 'application/json' }
  )
  dl(blob, `${safe(title)}.json`)
}

export async function exportToPDF(title: string, content: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'), import('html2canvas'),
  ])
  const html = await renderMarkdownToHTML(content)
  const container = document.createElement('div')
  container.style.cssText =
    'position:absolute;left:-9999px;top:0;width:800px;padding:40px;' +
    'background:white;color:#111;font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;'
  container.innerHTML = html
  document.body.appendChild(container)
  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save(`${safe(title)}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

function dl(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function safe(name: string): string {
  return name.replace(/[^a-z0-9\-_\s]/gi, '').trim().replace(/\s+/g, '-') || 'note'
}
