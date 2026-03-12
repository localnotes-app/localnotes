// lib/export.ts
// Export utilities for notes

export async function exportToPDF(title: string, content: string): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 20)
  doc.setFontSize(11)
  const lines = doc.splitTextToSize(content, 180)
  doc.text(lines, 14, 35)
  doc.save(`${title}.pdf`)
}

export function exportToJSON(title: string, content: string): void {
  const data = JSON.stringify({ title, content, exportedAt: new Date().toISOString() }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.json`
  a.click()
  URL.revokeObjectURL(url)
}
