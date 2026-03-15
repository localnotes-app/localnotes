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
  onToggleSidebar?: () => void
}

function TbBtn({ children, active, onClick, danger }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md border transition-all whitespace-nowrap font-medium ${
        active
          ? 'bg-accent border-border text-foreground'
          : danger
          ? 'bg-transparent border-transparent text-text-tertiary hover:border-border hover:text-destructive'
          : 'bg-transparent border-transparent text-text-tertiary hover:border-border hover:text-text-secondary'
      }`}>
      {children}
    </button>
  )
}

const Div = () => <div className="w-px h-4 bg-border flex-shrink-0 mx-0.5 hidden sm:block" />

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
          className="inline-flex items-center gap-1 text-[10px] font-mono text-text-tertiary border border-border rounded-[3px] px-1.5 py-px group/tag hover:border-border-strong">
          {t}
          <button onClick={() => removeTag(t)} className="text-text-muted hover:text-text-secondary leading-none">&times;</button>
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
          className="text-[10px] font-mono bg-transparent border-b border-border outline-none text-text-secondary placeholder:text-text-muted w-16"
        />
      ) : (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-text-secondary border border-border hover:border-border-strong rounded-[3px] px-1.5 py-px transition-colors">
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 1v5M1 3.5h5"/></svg>
          tag
        </button>
      )}
    </div>
  )
}

export function Toolbar({
  noteTitle, onTitleChange, showPreview, onTogglePreview,
  showSyntax, onToggleSyntax, onExportPDF, onExportJSON, onDelete, onToggleSidebar,
}: ToolbarProps) {
  const { activeNote } = useNotes()

  return (
    <div className="border-b border-border-subtle bg-surface">
      {/* Title row */}
      <div className="px-3 sm:px-5 pt-3 pb-1.5 flex items-center gap-2">
        {/* Mobile hamburger */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden flex-shrink-0 p-1 -ml-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-accent/50 transition-colors"
            title="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="4.5" x2="15" y2="4.5"/><line x1="3" y1="9" x2="15" y2="9"/><line x1="3" y1="13.5" x2="15" y2="13.5"/>
            </svg>
          </button>
        )}
        <input value={noteTitle} onChange={e => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-semibold text-foreground placeholder:text-text-muted font-sans tracking-tight" />
      </div>
      {/* Tags + actions row */}
      <div className="px-3 sm:px-4 pb-2.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {activeNote && <TagEditor noteId={activeNote.id} />}
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-1">
          <TbBtn active={!showPreview && !showSyntax} onClick={() => { if (showPreview) onTogglePreview(); if (showSyntax) onToggleSyntax(); }}>Edit</TbBtn>
          <TbBtn active={showPreview} onClick={onTogglePreview}>
            Preview <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>P</Kbd></div>
          </TbBtn>
          <TbBtn active={showSyntax} onClick={onToggleSyntax}>
            Syntax <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>?</Kbd></div>
          </TbBtn>
          <Div />
        </div>
        <TbBtn onClick={onExportPDF}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v6M3.5 5.5L6 8l2.5-2.5M2 10h8"/>
          </svg>
          <span className="hidden sm:inline">PDF</span>
        </TbBtn>
        <TbBtn onClick={onExportJSON}>
          <span className="hidden sm:inline">JSON ↓</span>
          <span className="sm:hidden text-[10px]">{ }</span>
        </TbBtn>
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
