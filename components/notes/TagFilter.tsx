// components/notes/TagFilter.tsx
'use client'
import { useNotes } from '@/context/NotesContext'

export function TagFilter() {
  const { allTags, activeTag, setActiveTag } = useNotes()
  return (
    <div className="px-3 py-2 flex gap-1.5 flex-wrap">
      {['#all', ...allTags].map(tag => (
        <button key={tag} onClick={() => setActiveTag(tag)}
          className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border transition-colors ${
            activeTag === tag
              ? 'text-[#f0f0f0] border-[#2a2a2a] bg-[#111]'
              : 'text-[#444] border-[#1e1e1e] hover:text-[#999] hover:border-[#2a2a2a]'
          }`}>
          {tag}
        </button>
      ))}
    </div>
  )
}
