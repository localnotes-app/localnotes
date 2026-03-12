// components/notes/NoteList.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import { NoteItem } from './NoteItem'

export function NoteList() {
  const { filteredNotes, searchQuery, activeTag } = useNotes()

  if (filteredNotes.length === 0) {
    const isFiltered = searchQuery || activeTag !== '#all'
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round">
          <rect x="5" y="4" width="18" height="20" rx="2"/>
          <line x1="9" y1="9" x2="19" y2="9"/>
          <line x1="9" y1="13" x2="16" y2="13"/>
          <line x1="9" y1="17" x2="13" y2="17"/>
        </svg>
        <p className="text-[10px] font-mono text-[#222] text-center">
          {isFiltered ? 'no matches' : 'no notes yet'}
        </p>
      </div>
    )
  }
  return (
    <div className="flex-1 overflow-y-auto px-1.5 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e1e1e]">
      {filteredNotes.map(note => <NoteItem key={note.id} note={note} />)}
    </div>
  )
}
