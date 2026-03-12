// components/notes/SearchBox.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import { Kbd } from '@/components/ui/kbd'

interface SearchBoxProps {
  collapsed: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SearchBox({ collapsed, inputRef }: SearchBoxProps) {
  const { searchQuery, setSearchQuery } = useNotes()
  if (collapsed) return null
  return (
    <div className="px-3 pt-2 pb-1">
      <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-[5px] px-2.5 py-1.5">
        <span className="text-[#444] text-xs">⌕</span>
        <input
          ref={inputRef}
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search notes…"
          className="flex-1 bg-transparent border-none outline-none text-[#f0f0f0] text-[12px] placeholder:text-[#333] font-sans"
        />
        <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
      </div>
    </div>
  )
}
