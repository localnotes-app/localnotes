// components/notes/Sidebar.tsx
'use client'
import { useState } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useCrypto } from '@/context/CryptoContext'
import { useSync } from '@/context/SyncContext'
import { SearchBox } from './SearchBox'
import { TagFilter } from './TagFilter'
import { NoteList } from './NoteList'
import { Kbd } from '@/components/ui/kbd'

// SVG Icons
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="6" r="4.5"/>
    <path d="M9.5 9.5L13 13"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 9A6 6 0 0 1 5 2a6 6 0 1 0 7 7z"/>
  </svg>
)
const BackupIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1v9M4 7l3 3 3-3M2 11h10"/>
  </svg>
)
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="10" height="7" rx="1.5"/>
    <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6"/>
  </svg>
)
const SyncIcon = ({ spinning }: { spinning?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={spinning ? 'animate-spin' : ''}>
    <path d="M1 7a6 6 0 0 1 10.7-3.7M13 7a6 6 0 0 1-10.7 3.7"/>
    <path d="M11.7 1v2.3H9.4M2.3 13v-2.3H4.6"/>
  </svg>
)

// SVG wordmark logo
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="5" fill="#f0f0f0"/>
        <path d="M6 16V6l3.5 7L13 6v10" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="5.5" y1="16" x2="8.5" y2="16" stroke="#000" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      <span className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">localnotes</span>
    </div>
  )
}

function IconBtn({ onClick, title, children, active }: { onClick?: () => void; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`w-[26px] h-[26px] flex items-center justify-center rounded-[4px] transition-colors ${
        active
          ? 'text-[#f0f0f0] bg-[#1e1e1e]'
          : 'text-[#3a3a3a] hover:text-[#888] hover:bg-[#111]'
      }`}>
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
  const { canSync, status, triggerSync } = useSync()
  const [searchOpen, setSearchOpen] = useState(true)

  return (
    <div className="w-[240px] min-w-[240px] bg-[#080808] border-r border-[#141414] flex flex-col">
      {/* Header */}
      <div className="px-3.5 pt-4 pb-3.5 border-b border-[#141414] flex items-center justify-between">
        <Logo />
        <div className="flex gap-0.5">
          <IconBtn onClick={() => setSearchOpen(c => !c)} title="Toggle search" active={searchOpen}>
            <SearchIcon />
          </IconBtn>
          <IconBtn onClick={() => document.documentElement.classList.toggle('dark')} title="Toggle theme">
            <MoonIcon />
          </IconBtn>
          <IconBtn onClick={onOpenBackup} title="Backup / Restore (⌘⇧B)">
            <BackupIcon />
          </IconBtn>
          {canSync && (
            <IconBtn onClick={triggerSync} title="Sync"
              active={status === 'synced'}>
              <SyncIcon spinning={status === 'syncing'} />
            </IconBtn>
          )}
          <IconBtn onClick={lock} title="Lock vault">
            <LockIcon />
          </IconBtn>
        </div>
      </div>

      <SearchBox collapsed={!searchOpen} inputRef={searchInputRef} />
      <TagFilter />
      <NoteList />

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-[#141414] flex items-center gap-2">
        <button onClick={createNote}
          className="flex-1 bg-[#f0f0f0] text-black rounded-[4px] py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="5" y1="1" x2="5" y2="9"/><line x1="1" y1="5" x2="9" y2="5"/>
          </svg>
          New note
          <div className="flex gap-0.5">
            <Kbd className="bg-black/10 border-black/10 text-black/40">⌘</Kbd>
            <Kbd className="bg-black/10 border-black/10 text-black/40">N</Kbd>
          </div>
        </button>
        <span className="text-[9px] font-mono text-[#222]" title="AES-256-GCM encrypted">⬡</span>
      </div>
    </div>
  )
}
