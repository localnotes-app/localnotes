import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'localnotes — Encrypted notes, locally yours',
  description: 'A fully local, encrypted note-taking PWA. No accounts. No servers. No tracking.',
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
    <main className="min-h-screen bg-black text-[#f0f0f0] font-sans">
      {/* Nav */}
      <nav className="border-b border-[#1e1e1e] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-tight">localnotes</span>
          <Link href="/app" className="text-[12px] text-[#555] hover:text-[#f0f0f0] transition-colors font-mono">
            Open app →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-[40px] font-semibold tracking-tight leading-tight mb-4">
          Notes that stay<br />on your device.
        </h1>
        <p className="text-[15px] text-[#555] mb-10 max-w-xl leading-relaxed">
          localnotes is a Markdown note-taking app that runs entirely in your browser.
          No accounts. No servers. No tracking. Everything encrypted with AES-256-GCM.
        </p>
        <div className="flex gap-3">
          <Link href="/app"
            className="bg-[#f0f0f0] text-black px-5 py-2.5 rounded-[5px] text-[13px] font-semibold hover:bg-white transition-colors">
            Open app
          </Link>
          <a href="#install"
            className="border border-[#2a2a2a] text-[#555] px-5 py-2.5 rounded-[5px] text-[13px] hover:text-[#f0f0f0] hover:border-[#444] transition-colors">
            Install guide
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div key={f.title} className="border border-[#1e1e1e] rounded-[6px] p-4 hover:border-[#2a2a2a] transition-colors">
              <h3 className="text-[12px] font-semibold text-[#f0f0f0] mb-1.5">{f.title}</h3>
              <p className="text-[11px] text-[#444] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-20 border-t border-[#1e1e1e] pt-12">
        <h2 className="text-[17px] font-semibold mb-8">How it works</h2>
        <div className="space-y-5">
          {HOW_IT_WORKS.map(([num, title, desc]) => (
            <div key={num} className="flex gap-4">
              <span className="text-[10px] font-mono text-[#2a2a2a] mt-0.5 w-4 flex-shrink-0">{num}</span>
              <div>
                <div className="text-[13px] font-semibold text-[#f0f0f0] mb-1">{title}</div>
                <p className="text-[12px] text-[#444] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Install guide */}
      <section id="install" className="max-w-4xl mx-auto px-6 pb-24 border-t border-[#1e1e1e] pt-12">
        <h2 className="text-[17px] font-semibold mb-8">Install guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INSTALL.map(({ platform, steps }) => (
            <div key={platform} className="border border-[#1e1e1e] rounded-[6px] p-4">
              <h3 className="text-[12px] font-semibold text-[#f0f0f0] mb-3">{platform}</h3>
              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className="text-[11px] text-[#444] flex gap-2">
                    <span className="font-mono text-[#2a2a2a] flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots */}
      <section className="max-w-4xl mx-auto px-6 pb-20 border-t border-[#1e1e1e] pt-12">
        <h2 className="text-[17px] font-semibold mb-6">Screenshots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['Editor view', '/screenshots/editor.png'],
            ['Preview & KaTeX', '/screenshots/preview.png'],
          ].map(([label, src]) => (
            <div key={label} className="border border-[#1e1e1e] rounded-[6px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="w-full object-cover bg-[#0a0a0a]" />
              <p className="text-[10px] font-mono text-[#333] px-3 py-2">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-mono text-[#2a2a2a] mt-4">
          To add screenshots: take screenshots of the live app and place them at
          public/screenshots/editor.png and public/screenshots/preview.png
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] px-6 py-6 text-center">
        <p className="text-[10px] font-mono text-[#2a2a2a]">localnotes · open source · AES-256-GCM</p>
      </footer>
    </main>
  )
}
