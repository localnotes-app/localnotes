// components/notes/SyntaxPanel.tsx
'use client'
import { Kbd } from '@/components/ui/kbd'

const MD = [
  ['# Heading 1', 'Title'], ['## Heading 2', 'Section'],
  ['**bold**', 'Bold'], ['*italic*', 'Italic'], ['~~strike~~', 'Strikethrough'],
  ['- [ ] task', 'Checkbox'], ['- [x] done', 'Checked'],
  ['`code`', 'Inline code'], ['```lang', 'Code block'],
  ['[text](url)', 'Link'], ['> quote', 'Blockquote'], ['---', 'Divider'],
]

const MATH = [
  ['$formula$', 'Inline'], ['$$formula$$', 'Block'],
  ['\\frac{a}{b}', 'Fraction'], ['\\sqrt{x}', 'Square root'],
  ['^{} _{}', 'Super / sub'], ['\\int \\sum', 'Integral / sum'],
  ['\\alpha \\beta', 'Greek letters'],
]

const SHORTCUTS: [string, string[]][] = [
  ['New note', ['⌘', 'N']], ['Search', ['⌘', 'K']],
  ['Toggle preview', ['⌘', 'P']], ['Syntax ref', ['⌘', '/']],
  ['Export PDF', ['⌘', '⇧', 'P']], ['Backup', ['⌘', '⇧', 'B']],
  ['Bold', ['⌘', '⌥', 'B']], ['Italic', ['⌘', '⌥', 'I']],
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-[1px] mb-2 pb-1.5 border-b border-border">{title}</div>
      {children}
    </div>
  )
}

interface SyntaxPanelProps {
  inModal?: boolean
}

export function SyntaxPanel({ inModal }: SyntaxPanelProps = {}) {
  if (inModal) {
    // Simplified content for modal
    return (
      <div className="p-4">
        <Section title="Markdown">
          {MD.map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 mb-1.5">
              <span className="font-mono text-[11px] text-text-secondary min-w-[100px] flex-shrink-0">{syn}</span>
              <span className="text-[11px] text-text-tertiary">{desc}</span>
            </div>
          ))}
        </Section>
        <Section title="Math · KaTeX">
          {MATH.map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 mb-1.5">
              <span className="font-mono text-[11px] text-text-secondary min-w-[100px] flex-shrink-0">{syn}</span>
              <span className="text-[11px] text-text-tertiary">{desc}</span>
            </div>
          ))}
        </Section>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden max-w-[280px]">
      <div className="px-3.5 py-2 border-b border-border-subtle bg-surface-inset flex-shrink-0">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.8px]">syntax</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <Section title="Markdown">
          {MD.map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 mb-1.5">
              <span className="font-mono text-[11px] text-text-secondary min-w-[100px] flex-shrink-0">{syn}</span>
              <span className="text-[11px] text-text-tertiary">{desc}</span>
            </div>
          ))}
        </Section>
        <Section title="Math · KaTeX">
          {MATH.map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 mb-1.5">
              <span className="font-mono text-[11px] text-text-secondary min-w-[100px] flex-shrink-0">{syn}</span>
              <span className="text-[11px] text-text-tertiary">{desc}</span>
            </div>
          ))}
        </Section>
        <Section title="Shortcuts">
          {SHORTCUTS.map(([desc, keys]) => (
            <div key={desc} className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-text-tertiary">{desc}</span>
              <div className="flex gap-0.5">{keys.map(k => <Kbd key={k}>{k}</Kbd>)}</div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}
