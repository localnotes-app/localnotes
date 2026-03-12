// components/notes/NoteItem.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import type { Note } from '@/types'

function fmt(ts: number): string {
  const d = new Date(ts), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return `today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diff === 1) return 'yesterday'
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function NoteItem({ note }: { note: Note }) {
  const { activeNote, setActiveNote } = useNotes()
  const active = activeNote?.id === note.id
  return (
    <button onClick={() => setActiveNote(note)}
      className={`w-full text-left px-2.5 py-2.5 rounded-[4px] mb-0.5 border transition-colors ${
        active ? 'bg-[#111] border-[#2a2a2a]' : 'bg-transparent border-transparent hover:bg-[#0d0d0d]'
      }`}>
      <div className={`text-[12px] font-medium truncate mb-0.5 ${active ? 'text-[#f0f0f0]' : 'text-[#999]'}`}>
        {note.title.trim() || 'Untitled'}
      </div>
      <div className="text-[10px] font-mono text-[#444] mb-1">{fmt(note.updatedAt)}</div>
      {note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {note.tags.map(t => (
            <span key={t} className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border ${
              active ? 'text-[#999] border-[#2a2a2a]' : 'text-[#444] border-[#1e1e1e]'
            }`}>{t}</span>
          ))}
        </div>
      )}
    </button>
  )
}
