// lib/renderMarkdown.ts
// Markdown → HTML string for PDF export (runs client-side via dynamic import)
export async function renderMarkdownToHTML(markdown: string): Promise<string> {
  const [
    { unified }, { default: remarkParse }, { default: remarkMath }, { default: remarkGfm },
    { default: remarkRehype }, { default: rehypeKatex }, { default: rehypeStringify }
  ] = await Promise.all([
    import('unified'), import('remark-parse'), import('remark-math'), import('remark-gfm'),
    import('remark-rehype'), import('rehype-katex'), import('rehype-stringify'),
  ])
  const result = await unified()
    .use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkRehype)
    .use(rehypeKatex).use(rehypeStringify)
    .process(markdown)
  return String(result)
}
