// components/notes/Toolbar.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { Kbd } from '@/components/ui/kbd'
import { useNotes } from '@/context/NotesContext'

interface ToolbarProps {
  noteTitle: string
  onTitleChange: (t: string) => void
  showPreview: boolean; onTogglePreview: () => void
  showSyntax: boolean; onToggleSyntax: () => void
  onExportPDF: () => void
  onExportJSON: () => void
  onDelete: () => void
}

function TbBtn({ children, active, onClick, danger }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-[4px] border transition-all whitespace-nowrap font-medium ${
        active
          ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#e0e0e0]'
          : danger
          ? 'bg-transparent border-transparent text-[#333] hover:border-[#333] hover:text-[#888]'
          : 'bg-transparent border-transparent text-[#333] hover:border-[#1e1e1e] hover:text-[#777]'
      }`}>
      {children}
    </button>
  )
}

const Div = () => <div className="w-px h-4 bg-[#1a1a1a] flex-shrink-0 mx-0.5" />

// Tag editor: shows current tags, allows adding/removing
function TagEditor({ noteId }: { noteId: string }) {
  const { notes, updateNote } = useNotes()
  const note = notes.find(n => n.id === noteId)
  const tags = note?.tags ?? []
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = input.trim().replace(/^#*/, '#').replace(/\s+/g, '-')
      if (tag.length > 1 && !tags.includes(tag)) {
        updateNote(noteId, { tags: [...tags, tag] })
      }
      setInput('')
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function removeTag(t: string) {
    updateNote(noteId, { tags: tags.filter(x => x !== t) })
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tags.map(t => (
        <span key={t}
          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#444] border border-[#1e1e1e] rounded-[3px] px-1.5 py-px group/tag hover:border-[#2a2a2a]">
          {t}
          <button onClick={() => removeTag(t)} className="text-[#2a2a2a] hover:text-[#888] leading-none">&times;</button>
        </span>
      ))}
      {open ? (
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={addTag}
          onBlur={() => { setOpen(false); setInput('') }}
          placeholder="#tag"
          className="text-[10px] font-mono bg-transparent border-b border-[#2a2a2a] outline-none text-[#777] placeholder:text-[#2a2a2a] w-16"
        />
      ) : (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#383838] hover:text-[#777] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-[3px] px-1.5 py-px transition-colors">
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 1v5M1 3.5h5"/></svg>
          tag
        </button>
      )}
    </div>
  )
}

export function Toolbar({
  noteTitle, onTitleChange, showPreview, onTogglePreview,
  showSyntax, onToggleSyntax, onExportPDF, onExportJSON, onDelete,
}: ToolbarProps) {
  const { activeNote } = useNotes()

  return (
    <div className="border-b border-[#141414] bg-[#080808]">
      {/* Title row */}
      <div className="px-5 pt-3.5 pb-1.5 flex items-center gap-2">
        <input value={noteTitle} onChange={e => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-semibold text-[#f0f0f0] placeholder:text-[#222] font-sans tracking-tight" />
      </div>
      {/* Tags + actions row */}
      <div className="px-4 pb-2.5 flex items-center gap-1 overflow-x-auto">
        {activeNote && <TagEditor noteId={activeNote.id} />}
        <div className="flex-1" />
        <TbBtn active={!showPreview && !showSyntax} onClick={() => { if (showPreview) onTogglePreview(); if (showSyntax) onToggleSyntax(); }}>Edit</TbBtn>
        <TbBtn active={showPreview} onClick={onTogglePreview}>
          Preview <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>P</Kbd></div>
        </TbBtn>
        <TbBtn active={showSyntax} onClick={onToggleSyntax}>
          Syntax <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>?</Kbd></div>
        </TbBtn>
        <Div />
        <TbBtn onClick={onExportPDF}>PDF ↓</TbBtn>
        <TbBtn onClick={onExportJSON}>JSON ↓</TbBtn>
        <Div />
        <TbBtn onClick={onDelete} danger>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 3h10M4 3V2h4v1M5 5.5v4M7 5.5v4M2 3l.7 7.3A1 1 0 003.7 11h4.6a1 1 0 001-.7L10 3"/>
          </svg>
        </TbBtn>
      </div>
    </div>
  )
}
