// components/notes/Sidebar.tsx
'use client'
import { useState } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useCrypto } from '@/context/CryptoContext'
import { SearchBox } from './SearchBox'
import { TagFilter } from './TagFilter'
import { NoteList } from './NoteList'
import { Kbd } from '@/components/ui/kbd'

function IconBtn({ onClick, title, children }: { onClick?: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="w-[26px] h-[26px] flex items-center justify-center border border-[#2a2a2a] rounded-[4px] text-[#444] hover:text-[#999] hover:border-[#444] transition-colors text-xs font-mono">
      {children}
    </button>
  )
}

interface SidebarProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onOpenBackup: () => void
}

export function Sidebar({ searchInputRef, onOpenBackup }: SidebarProps) {
  const { createNote } = useNotes()
  const { lock } = useCrypto()
  const [searchCollapsed, setSearchCollapsed] = useState(false)

  return (
    <div className="w-[252px] min-w-[252px] bg-[#0a0a0a] border-r border-[#1e1e1e] flex flex-col">
      <div className="px-3.5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">localnotes</span>
        <div className="flex gap-1">
          <IconBtn onClick={() => setSearchCollapsed(c => !c)} title="Toggle search">⌕</IconBtn>
          <IconBtn onClick={() => document.documentElement.classList.toggle('dark')} title="Toggle theme">◐</IconBtn>
          <IconBtn onClick={onOpenBackup} title="Backup / Restore (⌘⇧B)">⇅</IconBtn>
          <IconBtn onClick={lock} title="Lock vault">🔒</IconBtn>
        </div>
      </div>

      <SearchBox collapsed={searchCollapsed} inputRef={searchInputRef} />
      <TagFilter />
      <NoteList />

      <div className="p-3 border-t border-[#1e1e1e] flex items-center gap-2">
        <button onClick={createNote}
          className="flex-1 bg-[#f0f0f0] text-black rounded-[4px] py-1.5 text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
          + New
          <div className="flex gap-0.5">
            <Kbd className="bg-black/10 border-black/10 text-black/40">⌘</Kbd>
            <Kbd className="bg-black/10 border-black/10 text-black/40">N</Kbd>
          </div>
        </button>
        <span className="text-[9px] font-mono text-[#2a2a2a]">AES-256</span>
      </div>
    </div>
  )
}
