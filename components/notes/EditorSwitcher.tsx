// components/notes/EditorSwitcher.tsx
'use client'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Editor } from './Editor'
import type { EditorMode } from '@/hooks/useEditorMode'

const WysiwygEditor = lazy(() => import('./WysiwygEditor'))

const LARGE_DOC_THRESHOLD = 50_000

interface EditorSwitcherProps {
  mode: EditorMode
  content: string
  onChange: (content: string) => void
  noteId: string | undefined
  onForceRaw?: () => void
}

function EditorSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle overflow-hidden">
      <div className="px-3.5 py-2 border-b border-border-subtle bg-surface-inset flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.8px]">loading editor...</span>
      </div>
      <div className="flex-1 p-5 animate-pulse">
        <div className="h-3 bg-surface-inset rounded w-3/4 mb-3" />
        <div className="h-3 bg-surface-inset rounded w-1/2 mb-3" />
        <div className="h-3 bg-surface-inset rounded w-2/3" />
      </div>
    </div>
  )
}

export function EditorSwitcher({ mode, content, onChange, noteId, onForceRaw }: EditorSwitcherProps) {
  const [showLargeDocWarning, setShowLargeDocWarning] = useState(false)

  // Large document detection: auto-switch to raw
  useEffect(() => {
    if (mode === 'wysiwyg' && content.length > LARGE_DOC_THRESHOLD) {
      setShowLargeDocWarning(true)
      onForceRaw?.()
    } else {
      setShowLargeDocWarning(false)
    }
  }, [mode, content.length, onForceRaw])

  if (mode === 'raw') {
    return (
      <>
        {showLargeDocWarning && (
          <div className="px-4 py-2 bg-accent/50 border-b border-border-subtle">
            <p className="text-[11px] text-text-secondary">
              Large document ({Math.round(content.length / 1000)}k chars) — switched to raw editor for performance.
            </p>
          </div>
        )}
        <Editor content={content} onChange={onChange} />
      </>
    )
  }

  return (
    <Suspense fallback={<EditorSkeleton />}>
      <WysiwygEditor content={content} onChange={onChange} noteId={noteId} />
    </Suspense>
  )
}
