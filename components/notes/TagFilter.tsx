// components/notes/TagFilter.tsx
'use client'
import { useNotes } from '@/context/NotesContext'

export function TagFilter() {
  const { allTags, activeTag, setActiveTag } = useNotes()
  if (allTags.length === 0) return null
  return (
    <div className="px-3 pt-1 pb-2 flex gap-1 flex-wrap border-b border-[#0d0d0d]">
      {['#all', ...allTags].map(tag => (
        <button key={tag} onClick={() => setActiveTag(tag)}
          className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] transition-colors ${
            activeTag === tag
              ? 'text-[#f0f0f0] bg-[#1a1a1a]'
              : 'text-[#333] hover:text-[#666]'
          }`}>
          {tag}
        </button>
      ))}
    </div>
  )
}
