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

  // Create a hidden container with proper styling for rendering
  const container = document.createElement('div')
  container.style.cssText =
    'position:absolute;left:-9999px;top:0;width:680px;padding:48px 56px;' +
    'background:white;color:#1a1a1a;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;' +
    'font-size:13px;line-height:1.75;'

  // Add a styled title
  const titleEl = document.createElement('h1')
  titleEl.style.cssText =
    'font-size:22px;font-weight:600;color:#111;margin:0 0 8px 0;line-height:1.3;letter-spacing:-0.3px;'
  titleEl.textContent = title || 'Untitled'
  container.appendChild(titleEl)

  // Add a date
  const dateEl = document.createElement('p')
  dateEl.style.cssText = 'font-size:11px;color:#888;margin:0 0 24px 0;font-family:ui-monospace,monospace;'
  dateEl.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  container.appendChild(dateEl)

  // Add a divider
  const hr = document.createElement('hr')
  hr.style.cssText = 'border:none;border-top:1px solid #e5e5e5;margin:0 0 24px 0;'
  container.appendChild(hr)

  // Add rendered content
  const contentDiv = document.createElement('div')
  contentDiv.innerHTML = html

  // Style content elements for PDF
  const style = document.createElement('style')
  style.textContent = `
    h1 { font-size:20px; font-weight:600; color:#111; margin:28px 0 12px; line-height:1.3; }
    h2 { font-size:16px; font-weight:600; color:#222; margin:24px 0 10px; line-height:1.3; }
    h3 { font-size:14px; font-weight:600; color:#333; margin:20px 0 8px; }
    p { margin:0 0 14px; color:#333; }
    ul, ol { margin:0 0 14px; padding-left:24px; color:#333; }
    li { margin-bottom:4px; }
    code { background:#f5f5f5; border:1px solid #e5e5e5; padding:1px 5px; border-radius:3px; font-size:12px; font-family:ui-monospace,monospace; }
    pre { background:#f8f8f8; border:1px solid #e5e5e5; border-radius:6px; padding:16px; margin:0 0 16px; overflow:hidden; }
    pre code { background:none; border:none; padding:0; font-size:11.5px; color:#333; }
    blockquote { border-left:3px solid #ddd; padding-left:16px; margin:0 0 14px; color:#555; font-style:italic; }
    table { border-collapse:collapse; width:100%; margin:0 0 16px; }
    th, td { border:1px solid #e5e5e5; padding:8px 12px; text-align:left; font-size:12px; }
    th { background:#f8f8f8; font-weight:600; color:#222; }
    hr { border:none; border-top:1px solid #e5e5e5; margin:20px 0; }
    a { color:#2563eb; text-decoration:underline; }
    strong { font-weight:600; color:#111; }
    .katex { font-size:1.1em; }
    img { max-width:100%; }
  `
  container.appendChild(style)
  container.appendChild(contentDiv)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    // Handle multi-page PDFs
    if (imgHeight <= pageHeight) {
      // Single page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      // Multi-page: split canvas into page-sized chunks
      const totalPages = Math.ceil(imgHeight / pageHeight)
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage()

        // Calculate source crop from canvas
        const srcY = (i * pageHeight * canvas.width) / pageWidth
        const srcHeight = (pageHeight * canvas.width) / pageWidth

        // Create a page-sized canvas
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = Math.min(srcHeight, canvas.height - srcY)
        const ctx = pageCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          ctx.drawImage(
            canvas,
            0, srcY, canvas.width, pageCanvas.height,
            0, 0, pageCanvas.width, pageCanvas.height
          )
        }

        const pageImgHeight = (pageCanvas.height * pageWidth) / pageCanvas.width
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, pageImgHeight)
      }
    }

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
