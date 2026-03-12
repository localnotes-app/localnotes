// components/notes/NoteItem.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import type { Note } from '@/types'

function fmt(ts: number): string {
  const d = new Date(ts), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getPreview(plainContent: string): string {
  return plainContent
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+(\[[ x]\]\s+)?/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 80)
}

export function NoteItem({ note }: { note: Note }) {
  const { activeNote, setActiveNote, plainContent } = useNotes()
  const active = activeNote?.id === note.id
  const preview = getPreview(plainContent[note.id] ?? '')

  return (
    <button onClick={() => setActiveNote(note)}
      className={`w-full text-left px-3 py-2.5 rounded-[4px] mb-[1px] transition-colors group ${
        active ? 'bg-[#111] ' : 'hover:bg-[#0d0d0d]'
      }`}>
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <div className={`text-[12px] font-medium truncate ${active ? 'text-[#f0f0f0]' : 'text-[#888]'}`}>
          {note.title.trim() || <span className="italic text-[#333]">Untitled</span>}
        </div>
        <div className={`text-[10px] font-mono flex-shrink-0 ${active ? 'text-[#444]' : 'text-[#2a2a2a]'}`}>
          {fmt(note.updatedAt)}
        </div>
      </div>
      {preview && (
        <div className={`text-[11px] leading-relaxed truncate ${active ? 'text-[#444]' : 'text-[#2a2a2a]'}`}>
          {preview}
        </div>
      )}
      {note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1.5">
          {note.tags.map(t => (
            <span key={t} className={`text-[9px] font-mono px-1.5 py-px rounded-sm border ${
              active ? 'text-[#555] border-[#222]' : 'text-[#333] border-[#181818]'
            }`}>{t}</span>
          ))}
        </div>
      )}
    </button>
  )
}
