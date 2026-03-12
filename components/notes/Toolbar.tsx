// components/notes/Toolbar.tsx
'use client'
import { Kbd } from '@/components/ui/kbd'

interface ToolbarProps {
  noteTitle: string
  onTitleChange: (t: string) => void
  showPreview: boolean; onTogglePreview: () => void
  showSyntax: boolean; onToggleSyntax: () => void
  onExportPDF: () => void
  onExportJSON: () => void
  onDelete: () => void
}

function TbBtn({ children, active, onClick, danger }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-[4px] border transition-colors whitespace-nowrap ${
        active ? 'bg-[#111] border-[#2a2a2a] text-[#f0f0f0]'
               : danger ? 'bg-transparent border-[#1e1e1e] text-[#444] hover:border-[#555] hover:text-[#aaa]'
               : 'bg-transparent border-[#1e1e1e] text-[#444] hover:border-[#2a2a2a] hover:text-[#999]'
      }`}>
      {children}
    </button>
  )
}

const Div = () => <div className="w-px h-4 bg-[#2a2a2a] flex-shrink-0" />

export function Toolbar({
  noteTitle, onTitleChange, showPreview, onTogglePreview,
  showSyntax, onToggleSyntax, onExportPDF, onExportJSON, onDelete,
}: ToolbarProps) {
  return (
    <div className="px-4 py-2.5 border-b border-[#1e1e1e] bg-[#0a0a0a] flex items-center gap-1.5 overflow-x-auto">
      <input value={noteTitle} onChange={e => onTitleChange(e.target.value)}
        placeholder="Untitled"
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[14px] font-medium text-[#f0f0f0] placeholder:text-[#333] font-sans" />
      <Div />
      <TbBtn active={!showPreview && !showSyntax}>Edit</TbBtn>
      <TbBtn active={showPreview} onClick={onTogglePreview}>
        Preview <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>P</Kbd></div>
      </TbBtn>
      <TbBtn active={showSyntax} onClick={onToggleSyntax}>
        Syntax <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>?</Kbd></div>
      </TbBtn>
      <Div />
      <TbBtn onClick={onExportPDF}>PDF ↓</TbBtn>
      <TbBtn onClick={onExportJSON}>JSON ↓</TbBtn>
      <Div />
      <TbBtn onClick={onDelete} danger>✕</TbBtn>
    </div>
  )
}
