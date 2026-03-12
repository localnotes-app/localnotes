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
    <div className="px-3 pt-3 pb-2">
      <div className={`flex items-center gap-2 bg-[#0d0d0d] border rounded-[5px] px-2.5 py-2 transition-colors ${
        searchQuery ? 'border-[#2a2a2a]' : 'border-[#141414] focus-within:border-[#2a2a2a]'
      }`}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
          <circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/>
        </svg>
        <input
          ref={inputRef}
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="flex-1 bg-transparent border-none outline-none text-[#f0f0f0] text-[12px] placeholder:text-[#2a2a2a] font-sans"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery('')} className="text-[#333] hover:text-[#888] text-xs">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
            </svg>
          </button>
        ) : (
          <div className="flex gap-0.5 opacity-40"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
        )}
      </div>
    </div>
  )
}
