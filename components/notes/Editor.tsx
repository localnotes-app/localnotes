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
    if (e.metaKey && e.altKey) {
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
    <div className="flex-1 flex flex-col min-w-0 border-r border-[#1e1e1e] overflow-hidden">
      <div className="px-3.5 py-2 border-b border-[#1e1e1e] bg-[#0a0a0a] flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-mono text-[#444] uppercase tracking-[0.8px]">editor</span>
        <span className="text-[10px] font-mono text-[#333]">{content.length} chars</span>
      </div>
      <textarea
        ref={ref} value={content} onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown} spellCheck={false}
        placeholder="Start writing in Markdown…"
        className="flex-1 p-5 bg-transparent resize-none outline-none font-mono text-[12px] leading-[1.9] text-[#666] caret-[#f0f0f0] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2a2a]"
      />
    </div>
  )
}
