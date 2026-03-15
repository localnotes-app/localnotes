// components/notes/AppShell.tsx
'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import { Sidebar } from './Sidebar'
import { Toolbar } from './Toolbar'
import { Editor } from './Editor'
import { Preview } from './Preview'
import { SyntaxPanel } from './SyntaxPanel'
import { BackupModal } from './BackupModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppShell() {
  const { activeNote, plainContent, updateNote, removeNote, createNote } = useNotes()
  const [showPreview, setShowPreview] = useState(true)
  const [showSyntax, setShowSyntax] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevId = useRef<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (activeNote?.id !== prevId.current) {
      prevId.current = activeNote?.id ?? null
      setLocalTitle(activeNote?.title ?? '')
      setLocalContent(activeNote ? (plainContent[activeNote.id] ?? '') : '')
      setSidebarOpen(false)
    }
  }, [activeNote, plainContent])

  const scheduleSave = useCallback((id: string, patch: { title?: string; content?: string }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => updateNote(id, patch), 500)
  }, [updateNote])

  const handleTitleChange = useCallback((title: string) => {
    setLocalTitle(title)
    if (activeNote) scheduleSave(activeNote.id, { title })
  }, [activeNote, scheduleSave])

  const handleContentChange = useCallback((content: string) => {
    setLocalContent(content)
    if (activeNote) scheduleSave(activeNote.id, { content })
  }, [activeNote, scheduleSave])

  const handleDelete = useCallback(async () => {
    if (!activeNote) return
    if (confirm(`Delete "${activeNote.title || 'Untitled'}"?`)) await removeNote(activeNote.id)
  }, [activeNote, removeNote])

  const handleExportPDF = useCallback(async () => {
    if (!activeNote) return
    const { exportToPDF } = await import('@/lib/export')
    await exportToPDF(localTitle || 'Untitled', localContent)
  }, [activeNote, localTitle, localContent])

  const handleExportJSON = useCallback(async () => {
    if (!activeNote) return
    if (!confirm('Export as plain JSON? The content will be unencrypted.')) return
    const { exportToJSON } = await import('@/lib/export')
    exportToJSON(localTitle || 'Untitled', localContent)
  }, [activeNote, localTitle, localContent])

  // Changed ⌘? to ⌘/ to avoid browser conflict (⌘? = ⌘⇧/ which triggers browser help)
  useKeyboardShortcuts([
    { key: 'n', meta: true, shift: false, alt: false, handler: createNote },
    { key: 'k', meta: true, shift: false, alt: false, handler: () => searchInputRef.current?.focus() },
    { key: 'p', meta: true, shift: false, alt: false, handler: () => setShowPreview(p => !p) },
    { key: '/', meta: true, shift: false, alt: false, handler: () => setShowSyntax(s => !s) },
    { key: 'p', meta: true, shift: true, alt: false, handler: handleExportPDF },
    { key: 'b', meta: true, shift: true, alt: false, handler: () => setShowBackup(true) },
  ])

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, slide-in on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-200 ease-out
        md:relative md:z-0 md:w-[260px] md:min-w-[260px] md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar searchInputRef={searchInputRef} onOpenBackup={() => setShowBackup(true)} />
      </div>

      <BackupModal open={showBackup} onClose={() => setShowBackup(false)} />

      {/* Syntax panel as modal on mobile */}
      {showSyntax && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSyntax(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-card border border-border rounded-xl max-h-[70vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.8px]">Syntax Reference</span>
              <button onClick={() => setShowSyntax(false)} className="text-text-tertiary hover:text-foreground p-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SyntaxPanel inModal />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <>
            <Toolbar
              noteTitle={localTitle}
              onTitleChange={handleTitleChange}
              showPreview={showPreview} onTogglePreview={() => setShowPreview(p => !p)}
              showSyntax={showSyntax} onToggleSyntax={() => setShowSyntax(s => !s)}
              onExportPDF={handleExportPDF}
              onExportJSON={handleExportJSON}
              onDelete={handleDelete}
              onToggleSidebar={() => setSidebarOpen(s => !s)}
            />
            {/* Desktop: side-by-side. Mobile: stacked vertically */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <Editor content={localContent} onChange={handleContentChange} />
              {showPreview && (
                <div className="md:flex-1 flex flex-col min-w-0 border-t md:border-t-0 max-h-[40vh] md:max-h-none overflow-hidden">
                  <Preview content={localContent} onClose={() => setShowPreview(false)} />
                </div>
              )}
              {/* Syntax panel inline on desktop only */}
              {showSyntax && (
                <div className="hidden md:flex">
                  <SyntaxPanel />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mb-4 p-2 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              title="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="15" x2="17" y2="15"/>
              </svg>
            </button>
            <p className="text-xs font-mono text-text-muted">
              Select a note or press <span className="text-text-tertiary">⌘N</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
