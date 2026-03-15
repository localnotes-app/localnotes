// components/notes/WysiwygToolbar.tsx
'use client'
import { useCallback } from 'react'
import { editorViewCtx, schemaCtx } from '@milkdown/core'
import { useInstance } from '@milkdown/react'
import { callCommand } from '@milkdown/utils'
import {
  toggleStrongCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  wrapInHeadingCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  createCodeBlockCommand,
  insertHrCommand,
  toggleLinkCommand,
} from '@milkdown/preset-commonmark'
import {
  toggleStrikethroughCommand,
  insertTableCommand,
} from '@milkdown/preset-gfm'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  SquareCode,
  Minus,
  Link,
  Table,
  Sigma,
  SquareFunction,
} from 'lucide-react'

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // Prevent editor focus loss
        onClick()
      }}
      title={title}
      className="p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-accent/50 transition-colors"
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-border flex-shrink-0 mx-0.5" />
}

export function WysiwygToolbar() {
  const [loading, getInstance] = useInstance()

  const cmd = useCallback(
    <T,>(command: { key: import('@milkdown/core').CmdKey<T> }, payload?: T) => {
      if (loading) return
      const editor = getInstance()
      if (!editor) return
      editor.action(callCommand(command.key, payload))
    },
    [loading, getInstance]
  )

  // Task List: wrap in bullet list, then set checked attribute on list items
  const insertTaskList = useCallback(() => {
    if (loading) return
    const editor = getInstance()
    if (!editor) return

    // First wrap in bullet list
    editor.action(callCommand(wrapInBulletListCommand.key))

    // Then set the list_item checked attribute to false to make it a task list
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const { state, dispatch } = view
      const { selection, tr } = state

      // Find list_item nodes in the current selection
      state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
        if (node.type.name === 'list_item' && node.attrs.checked == null) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: false })
        }
      })

      dispatch(tr)
      view.focus()
    })
  }, [loading, getInstance])

  // Insert math via ProseMirror schema nodes
  const insertMath = useCallback(
    (block: boolean) => {
      if (loading) return
      const editor = getInstance()
      if (!editor) return
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const schema = ctx.get(schemaCtx)
        const { state, dispatch } = view
        const { tr } = state

        if (block) {
          const mathBlockType = schema.nodes['math_block']
          if (mathBlockType) {
            const node = mathBlockType.create(null, schema.text('E = mc^2'))
            dispatch(tr.replaceSelectionWith(node))
          }
        } else {
          const mathInlineType = schema.nodes['math_inline']
          if (mathInlineType) {
            const node = mathInlineType.create(null, schema.text('x^2'))
            dispatch(tr.replaceSelectionWith(node))
          }
        }
        view.focus()
      })
    },
    [loading, getInstance]
  )

  // Insert link with prompt for URL
  const insertLink = useCallback(() => {
    if (loading) return
    const editor = getInstance()
    if (!editor) return

    const href = prompt('Enter URL:')
    if (!href) return

    editor.action(callCommand(toggleLinkCommand.key, { href }))
  }, [loading, getInstance])

  const iconSize = 14

  return (
    <div className="px-3 py-1.5 border-b border-border-subtle bg-surface-inset flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-shrink-0">
      {/* Text formatting */}
      <ToolbarButton onClick={() => cmd(toggleStrongCommand)} title="Bold">
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(toggleEmphasisCommand)} title="Italic">
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(toggleStrikethroughCommand)} title="Strikethrough">
        <Strikethrough size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(toggleInlineCodeCommand)} title="Inline Code">
        <Code size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton onClick={() => cmd(wrapInHeadingCommand, 1)} title="Heading 1">
        <Heading1 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(wrapInHeadingCommand, 2)} title="Heading 2">
        <Heading2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(wrapInHeadingCommand, 3)} title="Heading 3">
        <Heading3 size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton onClick={() => cmd(wrapInBulletListCommand)} title="Bullet List">
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(wrapInOrderedListCommand)} title="Ordered List">
        <ListOrdered size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={insertTaskList} title="Task List">
        <ListChecks size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton onClick={() => cmd(wrapInBlockquoteCommand)} title="Blockquote">
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(createCodeBlockCommand)} title="Code Block">
        <SquareCode size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(insertHrCommand)} title="Horizontal Rule">
        <Minus size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton onClick={insertLink} title="Link">
        <Link size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => cmd(insertTableCommand, { row: 3, col: 3 })} title="Table">
        <Table size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => insertMath(false)} title="Inline Math ($...$)">
        <Sigma size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => insertMath(true)} title="Block Math ($$...$$)">
        <SquareFunction size={iconSize} />
      </ToolbarButton>
    </div>
  )
}
