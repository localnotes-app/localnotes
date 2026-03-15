// components/notes/Editor.tsx
'use client'
import { useRef } from 'react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export function Editor({ content, onChange }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? e.metaKey : e.ctrlKey
    if (mod && e.altKey) {
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); wrap('**', '**') }
      if (e.key === 'i' || e.key === 'I') { e.preventDefault(); wrap('*', '*') }
    }
  }

  function wrap(before: string, after: string) {
    const ta = ref.current; if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const current = ta.value
    const newContent = current.slice(0, s) + before + current.slice(s, e) + after + current.slice(e)
    onChange(newContent)
    requestAnimationFrame(() => {
      ta.selectionStart = s + before.length
      ta.selectionEnd = e + before.length
    })
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle overflow-hidden">
      <div className="px-3.5 py-2 border-b border-border-subtle bg-surface-inset flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.8px]">editor</span>
        <span className="text-[10px] font-mono text-text-muted">{content.length} chars</span>
      </div>
      <textarea
        ref={ref} value={content} onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown} spellCheck={false}
        placeholder="Start writing in Markdown…"
        className="flex-1 p-4 sm:p-5 bg-transparent resize-none outline-none font-mono text-[12px] sm:text-[13px] leading-[1.9] text-text-secondary placeholder:text-text-muted caret-foreground scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
      />
    </div>
  )
}
