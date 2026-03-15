import Link from 'next/link'
import type { Metadata } from 'next'
import { InstallButton } from '@/components/InstallButton'

const basePath = process.env.GITHUB_PAGES === 'true' ? '/localnotes' : ''
const siteUrl = 'https://localnotes-app.github.io/localnotes'

export const metadata: Metadata = {
  title: 'localnotes — Free Encrypted Note-Taking App | AES-256 Privacy',
  description: 'localnotes is a free, open-source encrypted Markdown note-taking app. AES-256-GCM encryption, 100% offline PWA, KaTeX math support. No accounts, no servers, no tracking. Your notes stay on your device.',
  keywords: ['encrypted notes', 'local notes', 'privacy notes app', 'markdown editor', 'offline note taking', 'PWA notes', 'AES-256 encryption', 'open source notes', 'private notes', 'secure notes'],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'localnotes — Free Encrypted Note-Taking App',
    description: 'A fully local, encrypted Markdown note-taking PWA. No accounts, no servers, no tracking. AES-256-GCM encryption right in your browser.',
    url: siteUrl,
    siteName: 'localnotes',
    images: [{ url: `${siteUrl}/screenshots/editor.png`, width: 1280, height: 800, alt: 'localnotes encrypted note editor' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'localnotes — Free Encrypted Note-Taking App',
    description: 'Encrypted Markdown notes, 100% offline. No accounts, no servers. AES-256-GCM.',
    images: [`${siteUrl}/screenshots/editor.png`],
  },
}

// JSON-LD structured data for search engines
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'localnotes',
  description: 'A fully local, encrypted Markdown note-taking Progressive Web App. AES-256-GCM encryption, 100% offline, no accounts needed.',
  url: siteUrl,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, iOS, Android, Windows, macOS, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AES-256-GCM encryption',
    'Offline-first PWA',
    'Markdown editor with live preview',
    'KaTeX math rendering',
    'Syntax highlighting',
    'Tag-based organization',
    'Full-text search',
    'PDF and JSON export',
    'Encrypted backups',
    'Dark and light mode',
  ],
  screenshot: `${siteUrl}/screenshots/editor.png`,
  softwareVersion: '0.1.0',
  license: 'https://opensource.org/licenses/MIT',
}

const FEATURES = [
  { title: 'AES-256 encrypted', desc: 'Every note is encrypted in your browser. Your master password never leaves your device.' },
  { title: 'Offline-first PWA', desc: 'Install once, use forever — no internet required after installation.' },
  { title: 'Markdown + Math', desc: 'Write in Markdown with KaTeX math rendering for equations and formulas.' },
  { title: 'Export anywhere', desc: 'Export notes as PDF or JSON. Download encrypted backups anytime.' },
  { title: 'Tags + full-text search', desc: 'Organize with tags and search across all decrypted note content.' },
  { title: 'No account needed', desc: 'No sign-up, no email, no tracking. Open the app and start writing.' },
]

const HOW_IT_WORKS = [
  ['1', 'Set your password', 'Visit localnotes and set a master password. This is the only key to your notes — there is no recovery, so keep it safe.'],
  ['2', 'Install as a PWA', 'Add to your home screen or install via Chrome on desktop. Works fully offline after install.'],
  ['3', 'Write and organize', 'Create notes in Markdown with math, code, checkboxes, and tags.'],
  ['4', 'Back up your data', 'Download an encrypted backup anytime. Restore it on any device with your password.'],
]

const INSTALL = [
  { platform: 'iOS (Safari)', steps: ['Open the app in Safari', 'Tap the Share button (□↑)', 'Tap "Add to Home Screen"', 'Tap "Add"'] },
  { platform: 'Android (Chrome)', steps: ['Open the app in Chrome', 'Tap the menu (⋮)', 'Tap "Add to Home Screen"', 'Tap "Add"'] },
  { platform: 'Desktop (Chrome / Edge)', steps: ['Open the app', 'Click the install icon in the address bar', 'Click "Install"', 'Opens as a standalone window'] },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <rect x="9" y="13" width="6" height="5" rx="1" fill="currentColor"/>
              <path d="M10 13V11C10 10.17 10.67 9.5 11.5 9.5C12.33 9.5 13 10.17 13 11V13" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="text-[13px] font-semibold tracking-tight">localnotes</span>
          </div>
          <Link href="/app" className="text-[12px] text-text-tertiary hover:text-foreground transition-colors font-mono">
            Open app →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <h1 className="text-3xl sm:text-[40px] font-semibold tracking-tight leading-tight mb-4">
          Notes that stay<br />on your device.
        </h1>
        <p className="text-[14px] sm:text-[15px] text-text-tertiary mb-8 sm:mb-10 max-w-xl leading-relaxed">
          localnotes is a Markdown note-taking app that runs entirely in your browser.
          No accounts. No servers. No tracking. Everything encrypted with AES-256-GCM.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/app"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity">
            Open app
          </Link>
          <InstallButton />
          <a href="#install"
            className="border border-border text-text-tertiary px-5 py-2.5 rounded-md text-[13px] hover:text-foreground hover:border-border-strong transition-colors">
            Install guide
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div key={f.title} className="border border-border rounded-md p-4 hover:border-border-strong transition-colors">
              <h3 className="text-[12px] font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-[11px] text-text-tertiary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-16 sm:pb-20 border-t border-border pt-10 sm:pt-12">
        <h2 className="text-[17px] font-semibold mb-8">How it works</h2>
        <div className="space-y-5">
          {HOW_IT_WORKS.map(([num, title, desc]) => (
            <div key={num} className="flex gap-4">
              <span className="text-[10px] font-mono text-text-muted mt-0.5 w-4 flex-shrink-0">{num}</span>
              <div>
                <div className="text-[13px] font-semibold text-foreground mb-1">{title}</div>
                <p className="text-[12px] text-text-tertiary leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Install guide */}
      <section id="install" className="max-w-4xl mx-auto px-6 pb-16 sm:pb-24 border-t border-border pt-10 sm:pt-12">
        <h2 className="text-[17px] font-semibold mb-8">Install guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {INSTALL.map(({ platform, steps }) => (
            <div key={platform} className="border border-border rounded-md p-4">
              <h3 className="text-[12px] font-semibold text-foreground mb-3">{platform}</h3>
              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className="text-[11px] text-text-tertiary flex gap-2">
                    <span className="font-mono text-text-muted flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots */}
      <section className="max-w-4xl mx-auto px-6 pb-16 sm:pb-20 border-t border-border pt-10 sm:pt-12">
        <h2 className="text-[17px] font-semibold mb-6">Screenshots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['Editor view', `${basePath}/screenshots/editor.png`],
            ['Preview & KaTeX', `${basePath}/screenshots/preview.png`],
          ].map(([label, src]) => (
            <div key={label} className="border border-border rounded-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="w-full object-cover bg-surface-inset" />
              <p className="text-[10px] font-mono text-text-muted px-3 py-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="text-[10px] font-mono text-text-muted">localnotes · open source · AES-256-GCM</p>
      </footer>
    </main>
  )
}
