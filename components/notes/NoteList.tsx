// components/notes/NoteList.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import { NoteItem } from './NoteItem'

export function NoteList() {
  const { filteredNotes } = useNotes()
  if (filteredNotes.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-[11px] font-mono text-[#2a2a2a]">no notes</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto px-1.5 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2a2a]">
      {filteredNotes.map(note => <NoteItem key={note.id} note={note} />)}
    </div>
  )
}
