<p align="center">
  <img src="public/icons/icon-192.png" width="80" alt="localnotes icon" />
</p>

<h1 align="center">localnotes</h1>

<p align="center">
  Encrypted notes, locally yours.<br />
  <strong>No accounts. No servers. No tracking.</strong>
</p>

<p align="center">
  <a href="https://github.com/localnotes-app/localnotes/actions"><img src="https://github.com/localnotes-app/localnotes/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/encryption-AES--256--GCM-green.svg" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/offline-100%25-brightgreen.svg" alt="100% Offline" />
</p>

---

## What is localnotes?

localnotes is an encrypted, offline-first Markdown note-taking app that runs entirely in your browser. Everything is encrypted with AES-256-GCM using the Web Crypto API. Your notes never leave your device.

## Features

- **AES-256-GCM encryption** — note content encrypted at rest in IndexedDB
- **100% offline** — install as PWA, works without internet
- **Markdown editor** — headings, lists, checkboxes, code blocks, tables, blockquotes
- **KaTeX math** — inline `$...$` and block `$$...$$` rendering
- **Syntax highlighting** — code blocks with language detection
- **Tags + full-text search** — organize and find notes instantly
- **PDF + JSON export** — export individual notes
- **Encrypted backups** — export/import `.localnotes` backup files
- **Keyboard shortcuts** — `Cmd+N`, `Cmd+K`, `Cmd+P`, and more
- **Dark & light mode** — system default with manual toggle

## Install

localnotes is a Progressive Web App (PWA). Visit the app URL and install it:

| Platform | How to install |
|----------|---------------|
| **iOS (Safari)** | Tap Share (□↑) → "Add to Home Screen" |
| **Android (Chrome)** | Tap menu (⋮) → "Add to Home Screen" |
| **Desktop (Chrome/Edge)** | Click install icon in address bar → "Install" |

After installation, the app works fully offline.

## Development

```bash
# Clone
git clone https://github.com/localnotes-app/localnotes.git
cd localnotes

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test:run

# Build for production (static export)
npm run build
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build static export to `out/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Architecture

```
app/              Next.js App Router routes
  page.tsx        Landing page
  app/page.tsx    Notes app (client-side only)
  manifest.ts     PWA manifest
  sw.ts           Service worker (Serwist)

components/
  ui/             shadcn/ui components
  auth/           Setup + Unlock screens
  notes/          App shell, editor, preview, sidebar

context/
  CryptoContext   Password → PBKDF2 → CryptoKey (in-memory)
  NotesContext    CRUD operations with auto-encrypt/decrypt

lib/
  crypto.ts       AES-256-GCM encrypt/decrypt, PBKDF2 key derivation
  storage.ts      IndexedDB via idb
  backup.ts       Encrypted backup export/import
  export.ts       PDF + JSON export
```

### Security model

- **Key derivation:** PBKDF2 (SHA-256, 310,000 iterations)
- **Encryption:** AES-256-GCM with random 12-byte IV per operation
- **CryptoKey:** Non-extractable, held in memory only
- **No recovery:** Forgotten password = permanent data loss (by design)
- **Plaintext fields:** Title, tags, and timestamps are not encrypted (trade-off for usability)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) &copy; 2026 Justus W&auml;chter
