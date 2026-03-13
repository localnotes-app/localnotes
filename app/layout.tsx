// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const basePath = process.env.GITHUB_PAGES === 'true' ? '/localnotes' : ''

export const metadata: Metadata = {
  title: 'localnotes — Encrypted notes, locally yours',
  description: 'A fully local, encrypted note-taking PWA. No accounts. No servers.',
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'localnotes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="bg-black text-[#f0f0f0] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
