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
      <div className={`flex items-center gap-2 bg-surface-inset border rounded-md px-2.5 py-2 transition-colors ${
        searchQuery ? 'border-border-strong' : 'border-border-subtle focus-within:border-border-strong'
      }`}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0 text-text-muted">
          <circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/>
        </svg>
        <input
          ref={inputRef}
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="flex-1 bg-transparent border-none outline-none text-foreground text-[12px] placeholder:text-text-muted font-sans"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text-secondary text-xs">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
            </svg>
          </button>
        ) : (
          <div className="flex gap-0.5 opacity-50"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
        )}
      </div>
    </div>
  )
}
