// components/notes/Sidebar.tsx
'use client'
import { useState, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useCrypto } from '@/context/CryptoContext'
import { useSync } from '@/context/SyncContext'
import { SearchBox } from './SearchBox'
import { TagFilter } from './TagFilter'
import { NoteList } from './NoteList'
import { Kbd } from '@/components/ui/kbd'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

// SVG Icons
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="6" r="4.5"/>
    <path d="M9.5 9.5L13 13"/>
  </svg>
)
const SunIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="3"/>
    <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.75 2.75l1.06 1.06M10.19 10.19l1.06 1.06M2.75 11.25l1.06-1.06M10.19 3.81l1.06-1.06"/>
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

// SVG wordmark logo — doc + lock icon
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" className="stroke-foreground" strokeWidth="2" strokeLinejoin="round" fill="none"/>
        <path d="M14 2V8H20" className="stroke-foreground" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="9" y="13" width="6" height="5" rx="1" className="fill-foreground"/>
        <path d="M10 13V11C10 10.17 10.67 9.5 11.5 9.5C12.33 9.5 13 10.17 13 11V13" className="stroke-foreground" strokeWidth="1.5" fill="none"/>
      </svg>
      <span className="text-[13px] font-semibold text-foreground tracking-tight">localnotes</span>
    </div>
  )
}

function IconBtn({ onClick, title, children, active }: { onClick?: () => void; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`w-[28px] h-[28px] flex items-center justify-center rounded-md transition-colors ${
        active
          ? 'text-foreground bg-accent'
          : 'text-text-tertiary hover:text-text-secondary hover:bg-accent/50'
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
  const [isDark, setIsDark] = useState(true)
  const { canInstall, install } = useInstallPrompt()

  useEffect(() => {
    // Persist and restore theme preference
    const saved = localStorage.getItem('localnotes-theme')
    if (saved === 'light') {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('localnotes-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('localnotes-theme', 'light')
    }
  }

  return (
    <div className="w-full h-full bg-surface border-r border-border-subtle flex flex-col">
      {/* Header */}
      <div className="px-3.5 pt-4 pb-3.5 border-b border-border-subtle flex items-center justify-between">
        <Logo />
        <div className="flex gap-0.5">
          <IconBtn onClick={() => setSearchOpen(c => !c)} title="Toggle search" active={searchOpen}>
            <SearchIcon />
          </IconBtn>
          <IconBtn onClick={toggleTheme} title="Toggle theme">
            {isDark ? <SunIcon /> : <MoonIcon />}
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

      {/* Install banner */}
      {canInstall && (
        <div className="px-3 pt-2.5 pb-0">
          <button onClick={install}
            className="w-full border border-border rounded-md py-2 text-[11px] font-medium flex items-center justify-center gap-1.5 text-text-secondary hover:text-foreground hover:border-border-strong transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2v6M3.5 5.5L6 8l2.5-2.5M2 10h8"/>
            </svg>
            Install App
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-border-subtle flex items-center gap-2">
        <button onClick={createNote}
          className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.98]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="5" y1="1" x2="5" y2="9"/><line x1="1" y1="5" x2="9" y2="5"/>
          </svg>
          New note
          <div className="hidden sm:flex gap-0.5 ml-1">
            <Kbd className="text-primary-foreground/50 border-primary-foreground/20 bg-primary-foreground/10">⌘</Kbd>
            <Kbd className="text-primary-foreground/50 border-primary-foreground/20 bg-primary-foreground/10">N</Kbd>
          </div>
        </button>
        <span className="text-[9px] font-mono text-text-muted" title="AES-256-GCM encrypted">⬡</span>
      </div>
    </div>
  )
}
