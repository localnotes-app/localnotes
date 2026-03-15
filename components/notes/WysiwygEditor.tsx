// components/notes/WysiwygEditor.tsx
'use client'
import { useEffect, useRef } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
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
        // Mount editor into the <Milkdown> container
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, contentRef.current)
      })
      .use(listener)
      .use(commonmark)
      .use(gfm)
      .use(math)
      .use(history)
      .config((ctx) => {
        // Configure listener AFTER .use(listener) so listenerCtx is injected
        ctx.get(listenerCtx)
          .markdownUpdated((_ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              isInternalUpdate.current = true
              onChangeRef.current(markdown)
            }
          })
      })
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
