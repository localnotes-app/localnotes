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

  useKeyboardShortcuts([
    { key: 'n', meta: true, shift: false, alt: false, handler: createNote },
    { key: 'k', meta: true, shift: false, alt: false, handler: () => searchInputRef.current?.focus() },
    { key: 'p', meta: true, shift: false, alt: false, handler: () => setShowPreview(p => !p) },
    { key: '?', meta: true, shift: false, alt: false, handler: () => setShowSyntax(s => !s) },
    { key: 'p', meta: true, shift: true, alt: false, handler: handleExportPDF },
    { key: 'b', meta: true, shift: true, alt: false, handler: () => setShowBackup(true) },
  ])

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar searchInputRef={searchInputRef} onOpenBackup={() => setShowBackup(true)} />
      <BackupModal open={showBackup} onClose={() => setShowBackup(false)} />
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
            />
            <div className="flex-1 flex overflow-hidden">
              <Editor content={localContent} onChange={handleContentChange} />
              {showPreview && <Preview content={localContent} />}
              {showSyntax && <SyntaxPanel />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] font-mono text-[#2a2a2a]">
              Select a note or press ⌘N
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
