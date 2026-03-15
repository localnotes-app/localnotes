// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const basePath = process.env.GITHUB_PAGES === 'true' ? '/localnotes' : ''
const siteUrl = process.env.GITHUB_PAGES === 'true'
  ? 'https://localnotes-app.github.io/localnotes'
  : 'https://localnotes-app.github.io/localnotes' // fallback to GH Pages

export const metadata: Metadata = {
  title: {
    default: 'localnotes — Encrypted notes, locally yours',
    template: '%s | localnotes',
  },
  description: 'A fully local, encrypted Markdown note-taking PWA. No accounts, no servers, no tracking. Everything encrypted with AES-256-GCM right in your browser. Install as a PWA and use offline.',
  keywords: ['encrypted notes', 'local notes', 'privacy', 'markdown', 'PWA', 'offline', 'AES-256', 'note-taking', 'encrypted', 'no account', 'open source'],
  authors: [{ name: 'localnotes-app' }],
  creator: 'localnotes-app',
  manifest: `${basePath}/manifest.json`,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: `${basePath}/icons/icon.svg`,
    apple: `${basePath}/icons/icon-192.png`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'localnotes',
    title: 'localnotes — Encrypted notes, locally yours',
    description: 'A fully local, encrypted Markdown note-taking PWA. No accounts, no servers, no tracking. Everything encrypted with AES-256-GCM.',
    images: [
      {
        url: `${basePath}/screenshots/editor.png`,
        width: 1280,
        height: 800,
        alt: 'localnotes editor view',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'localnotes — Encrypted notes, locally yours',
    description: 'A fully local, encrypted Markdown note-taking PWA. No accounts, no servers, no tracking.',
    images: [`${basePath}/screenshots/editor.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'localnotes',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('localnotes-theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {
      document.documentElement.classList.add('dark');
    }
  })();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self' blob:;" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
