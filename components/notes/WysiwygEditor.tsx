// components/notes/WysiwygEditor.tsx
'use client'
import { useEffect, useRef } from 'react'
import { Editor } from '@milkdown/core'
import { defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { math } from '@milkdown/plugin-math'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { replaceAll } from '@milkdown/utils'
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react'
import { WysiwygToolbar } from './WysiwygToolbar'
import 'katex/dist/katex.min.css'

interface WysiwygEditorProps {
  content: string
  onChange: (content: string) => void
  noteId: string | undefined
}

function MilkdownEditor({ content, onChange, noteId }: WysiwygEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const contentRef = useRef(content)
  contentRef.current = content
  const prevNoteIdRef = useRef(noteId)
  const isInternalUpdate = useRef(false)

  useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(defaultValueCtx, contentRef.current)
        ctx.set(listenerCtx, {
          markdownUpdated: (_ctx: unknown, markdown: string, prevMarkdown: string) => {
            if (markdown !== prevMarkdown) {
              isInternalUpdate.current = true
              onChangeRef.current(markdown)
            }
          },
        } as any)
        root.id = 'milkdown-editor'
      })
      .use(commonmark)
      .use(gfm)
      .use(math)
      .use(history)
      .use(listener)
  }, [])

  const [loading, getInstance] = useInstance()

  // Sync content when note changes (different noteId)
  useEffect(() => {
    if (loading) return
    if (noteId !== prevNoteIdRef.current) {
      prevNoteIdRef.current = noteId
      const editor = getInstance()
      if (editor) {
        editor.action(replaceAll(content))
      }
    }
  }, [noteId, content, loading, getInstance])

  // Sync content when it changes externally (not from our own onChange)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    // Don't update if we just switched notes — that's handled above
    if (noteId !== prevNoteIdRef.current) return
    // Only sync if editor exists and content is externally different
    if (loading) return
    const editor = getInstance()
    if (!editor) return
    // We skip external syncs to prevent cursor jumps during active editing.
    // The listener already handles pushing editor changes outward.
  }, [content, loading, getInstance, noteId])

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle overflow-hidden">
      <div className="px-3.5 py-2 border-b border-border-subtle bg-surface-inset flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.8px]">wysiwyg</span>
        <span className="text-[10px] font-mono text-text-muted">{content.length} chars</span>
      </div>
      <WysiwygToolbar />
      <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 milkdown-wrapper scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <Milkdown />
      </div>
    </div>
  )
}

export default function WysiwygEditorWrapper(props: WysiwygEditorProps) {
  return (
    <MilkdownProvider>
      <MilkdownEditor {...props} />
    </MilkdownProvider>
  )
}
