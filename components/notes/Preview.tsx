// components/notes/Preview.tsx
'use client'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

export function Preview({ content }: { content: string }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-[#1e1e1e] overflow-hidden">
      <div className="px-3.5 py-2 border-b border-[#1e1e1e] bg-[#080808] flex-shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-mono text-[#333] uppercase tracking-[1px]">preview</span>
      </div>
      <div className="flex-1 overflow-y-auto px-7 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e1e1e]">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeHighlight as never]}
          components={{
            h1: ({ children }) => <h1 className="text-[22px] font-semibold text-[#f0f0f0] border-b border-[#1a1a1a] pb-3 mb-5 mt-0 tracking-tight">{children}</h1>,
            h2: ({ children }) => <h2 className="text-[16px] font-semibold text-[#e0e0e0] mt-7 mb-3 tracking-tight">{children}</h2>,
            h3: ({ children }) => <h3 className="text-[13px] font-semibold text-[#bbb] mt-5 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-[13px] text-[#777] leading-[1.8] mb-4">{children}</p>,
            ul: ({ children }) => <ul className="mb-4 space-y-1 pl-0">{children}</ul>,
            ol: ({ children }) => <ol className="mb-4 space-y-1 list-decimal pl-5 text-[#777]">{children}</ol>,
            li: ({ children, className, node }) => {
              const isTask = className?.includes('task-list-item')
              if (isTask) {
                // Read checked state directly from hast AST — reliable across all react-markdown versions
                const inputNode = (node as any)?.children?.find(
                  (c: any) => c.type === 'element' && c.tagName === 'input'
                )
                const checked = inputNode?.properties?.checked === true
                // Filter out the raw <input> element from children (react-markdown renders it too)
                const filteredChildren = Array.isArray(children)
                  ? children.filter((c: any) => {
                      if (c && typeof c === 'object' && 'type' in c) {
                        return (c as any).type !== 'input'
                      }
                      return true
                    })
                  : children
                return (
                  <li className="flex items-start gap-2.5 text-[13px] text-[#777] leading-[1.7] list-none">
                    <span className={`inline-flex items-center justify-center w-[14px] h-[14px] rounded-[3px] border flex-shrink-0 mt-[3px] ${
                      checked ? 'bg-[#f0f0f0] border-[#f0f0f0]' : 'bg-transparent border-[#333]'
                    }`}>
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {filteredChildren}
                  </li>
                )
              }
              return <li className="text-[13px] text-[#777] leading-[1.7] ml-5 list-disc marker:text-[#333]">{children}</li>
            },
            input: () => null,
            a: ({ href, children }) => <a href={href} className="text-[#888] underline underline-offset-2 hover:text-[#f0f0f0] transition-colors" target="_blank" rel="noreferrer">{children}</a>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-[#2a2a2a] pl-4 text-[#555] italic my-4">{children}</blockquote>,
            hr: () => <hr className="border-[#1a1a1a] my-6" />,
            table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-[12px] border-collapse">{children}</table></div>,
            thead: ({ children }) => <thead className="border-b border-[#2a2a2a]">{children}</thead>,
            th: ({ children }) => <th className="text-left text-[#999] font-medium py-2 pr-4 text-[11px] uppercase tracking-wider">{children}</th>,
            td: ({ children }) => <td className="text-[#666] py-1.5 pr-4 border-b border-[#111]">{children}</td>,
            pre: ({ children }) => <pre className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-[6px] overflow-x-auto my-4">{children}</pre>,
            code: ({ className, children }) => {
              const isBlock = className?.startsWith('language-')
              if (isBlock) return (
                <code className={`block p-4 text-[11px] font-mono text-[#888] ${className}`}>
                  {children}
                </code>
              )
              return <code className="bg-[#111] border border-[#1e1e1e] rounded px-1.5 py-0.5 text-[11px] font-mono text-[#888]">{children}</code>
            },
            strong: ({ children }) => <strong className="text-[#d0d0d0] font-semibold">{children}</strong>,
            em: ({ children }) => <em className="text-[#888] italic">{children}</em>,
            del: ({ children }) => <del className="text-[#444] line-through">{children}</del>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
