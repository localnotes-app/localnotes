// components/notes/Preview.tsx
'use client'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

export function Preview({ content }: { content: string }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-[#1e1e1e] overflow-hidden">
      <div className="px-3.5 py-2 border-b border-[#1e1e1e] bg-[#0a0a0a] flex-shrink-0">
        <span className="text-[10px] font-mono text-[#444] uppercase tracking-[0.8px]">preview</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2a2a]">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight as never]}
          components={{
            h1: ({ children }) => <h1 className="text-[18px] font-semibold text-[#f0f0f0] border-b border-[#1e1e1e] pb-3 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-[14px] font-semibold text-[#ddd] mt-5 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-[13px] font-semibold text-[#ccc] mt-4 mb-1.5">{children}</h3>,
            p: ({ children }) => <p className="text-[12px] text-[#888] leading-relaxed mb-3">{children}</p>,
            li: ({ children }) => <li className="text-[12px] text-[#888] mb-1">{children}</li>,
            a: ({ href, children }) => <a href={href} className="text-[#ccc] underline underline-offset-2 hover:text-white" target="_blank" rel="noreferrer">{children}</a>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-[#2a2a2a] pl-4 text-[#555] italic my-3">{children}</blockquote>,
            hr: () => <hr className="border-[#1e1e1e] my-5" />,
            code: ({ className, children }) => {
              const isBlock = className?.startsWith('language-')
              if (isBlock) return (
                <code className={`block bg-[#111] border border-[#2a2a2a] rounded-[5px] p-3 text-[11px] font-mono text-[#999] overflow-x-auto my-3 ${className}`}>
                  {children}
                </code>
              )
              return <code className="bg-[#111] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-[11px] font-mono text-[#999]">{children}</code>
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
