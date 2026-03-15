// components/notes/Preview.tsx
'use client'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

// Extend default sanitization schema to allow KaTeX and highlight.js classes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow class on all elements (needed for KaTeX + highlight.js)
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'class', 'style'],
    // KaTeX uses specific elements with attributes
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'aria-hidden'],
    math: ['xmlns', 'display'],
    annotation: ['encoding'],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    // KaTeX elements
    'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub',
    'mfrac', 'munderover', 'msqrt', 'mroot', 'mtext', 'mspace',
    'mtable', 'mtr', 'mtd', 'annotation', 'menclose', 'mover', 'munder',
    'msubsup', 'mprescripts', 'mmultiscripts', 'mpadded', 'mstyle',
  ],
  // Block dangerous protocols
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
  },
}

// Validate URL to prevent javascript: protocol attacks
function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url, 'https://example.com')
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    // Relative URLs are safe
    return !url.startsWith('javascript:') && !url.startsWith('data:') && !url.startsWith('vbscript:')
  }
}

interface PreviewProps {
  content: string
  onClose?: () => void
}

export function Preview({ content, onClose }: PreviewProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle overflow-hidden">
      <div className="px-3.5 py-2 border-b border-border-subtle bg-surface-inset flex-shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[1px]">preview</span>
        <div className="flex-1" />
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors p-0.5" title="Close preview">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeHighlight as never, [rehypeSanitize, sanitizeSchema]]}
          components={{
            h1: ({ children }) => <h1 className="text-xl sm:text-[22px] font-semibold text-foreground border-b border-border pb-3 mb-5 mt-0 tracking-tight">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base sm:text-[16px] font-semibold text-foreground/90 mt-7 mb-3 tracking-tight">{children}</h2>,
            h3: ({ children }) => <h3 className="text-[13px] font-semibold text-foreground/75 mt-5 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-[13px] text-text-secondary leading-[1.8] mb-4">{children}</p>,
            ul: ({ children }) => <ul className="mb-4 space-y-1 pl-0">{children}</ul>,
            ol: ({ children }) => <ol className="mb-4 space-y-1 list-decimal pl-5 text-text-secondary">{children}</ol>,
            li: ({ children, className, node }) => {
              const isTask = className?.includes('task-list-item')
              if (isTask) {
                const inputNode = (node as any)?.children?.find(
                  (c: any) => c.type === 'element' && c.tagName === 'input'
                )
                const checked = inputNode?.properties?.checked === true
                const filteredChildren = Array.isArray(children)
                  ? children.filter((c: any) => {
                      if (c && typeof c === 'object' && 'type' in c) {
                        return (c as any).type !== 'input'
                      }
                      return true
                    })
                  : children
                return (
                  <li className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-[1.7] list-none">
                    <span className={`inline-flex items-center justify-center w-[14px] h-[14px] rounded-[3px] border flex-shrink-0 mt-[3px] ${
                      checked ? 'bg-primary border-primary' : 'bg-transparent border-border-strong'
                    }`}>
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" className="stroke-primary-foreground" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {filteredChildren}
                  </li>
                )
              }
              return <li className="text-[13px] text-text-secondary leading-[1.7] ml-5 list-disc marker:text-text-muted">{children}</li>
            },
            input: () => null,
            a: ({ href, children }) => {
              if (!isSafeUrl(href)) return <span className="text-destructive line-through">{children}</span>
              return <a href={href} className="text-text-secondary underline underline-offset-2 hover:text-foreground transition-colors" target="_blank" rel="noreferrer noopener">{children}</a>
            },
            blockquote: ({ children }) => <blockquote className="border-l-2 border-border-strong pl-4 text-text-tertiary italic my-4">{children}</blockquote>,
            hr: () => <hr className="border-border my-6" />,
            table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-[12px] border-collapse">{children}</table></div>,
            thead: ({ children }) => <thead className="border-b border-border-strong">{children}</thead>,
            th: ({ children }) => <th className="text-left text-text-secondary font-medium py-2 pr-4 text-[11px] uppercase tracking-wider">{children}</th>,
            td: ({ children }) => <td className="text-text-secondary py-1.5 pr-4 border-b border-border">{children}</td>,
            pre: ({ children }) => <pre className="bg-surface-inset border border-border rounded-md overflow-x-auto my-4">{children}</pre>,
            code: ({ className, children }) => {
              const isBlock = className?.startsWith('language-')
              if (isBlock) return (
                <code className={`block p-4 text-[11px] font-mono text-text-secondary ${className}`}>
                  {children}
                </code>
              )
              return <code className="bg-muted border border-border rounded px-1.5 py-0.5 text-[11px] font-mono text-text-secondary">{children}</code>
            },
            strong: ({ children }) => <strong className="text-foreground/85 font-semibold">{children}</strong>,
            em: ({ children }) => <em className="text-text-secondary italic">{children}</em>,
            del: ({ children }) => <del className="text-text-tertiary line-through">{children}</del>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
