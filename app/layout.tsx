// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'localnotes — Encrypted notes, locally yours',
  description: 'A fully local, encrypted note-taking PWA. No accounts. No servers.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'localnotes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-black text-[#f0f0f0] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
