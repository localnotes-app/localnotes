# localnotes — Design Spec
**Date:** 2026-03-11
**Status:** Approved

---

## Overview

A fully local, encrypted, PWA-based notes app. Hosted on Vercel as an installable Progressive Web App — users install it once, then it runs 100% offline. Notes are encrypted at rest in IndexedDB. The Vercel deployment also serves an English-language landing page for discovery and installation.

---

## Architecture

### Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** shadcn/ui + Tailwind CSS (including `Kbd` component)
- **PWA:** Built-in Next.js 16 web app manifest (`app/manifest.ts`) + Serwist for service worker / offline asset caching
- **Storage:** IndexedDB via `idb` library
- **Encryption:** Web Crypto API — AES-256-GCM, native browser crypto, no external library
- **Markdown:** `react-markdown` + `remark-math` + `rehype-katex`
- **Math rendering:** KaTeX (inline `$...$` and block `$$...$$`)
- **Code highlighting:** `shiki` (via `rehype-shiki`)
- **PDF export:** `jspdf` + `html2canvas`
- **Hosting:** Vercel (standard Next.js deployment, not static export)

### Project Structure
```
/app
  page.tsx                  ← Landing page (EN)
  layout.tsx
  manifest.ts               ← PWA manifest
  /app
    page.tsx                ← Notes app
    layout.tsx
/components
  /ui/                      ← shadcn components (incl. Kbd)
  /notes/
    NoteList.tsx
    NoteItem.tsx
    Editor.tsx
    Preview.tsx
    SyntaxPanel.tsx
    TagFilter.tsx
    SearchBox.tsx
    BackupModal.tsx
/lib
  crypto.ts                 ← AES-256-GCM encrypt/decrypt via Web Crypto API
  storage.ts                ← IndexedDB via idb
  export.ts                 ← PDF + JSON export
  backup.ts                 ← Backup serialize/deserialize
/public
  sw.js                     ← Serwist service worker (generated)
  icons/                    ← PWA icons
```

### Data Flow
1. On first launch: user sets a master password → PBKDF2 derives a `CryptoKey` (`extractable: false`) → held in React context (memory only, never written to any storage)
2. Notes are encrypted (AES-256-GCM) before writing to IndexedDB
3. Notes are decrypted on read, never stored plain in memory longer than needed
4. Service worker caches all Next.js assets on install → full offline support after first load

**Crypto storage in IndexedDB (`meta` object store, key `"config"`):**
```typescript
interface AppConfig {
  salt: string        // Base64-encoded 32-byte PBKDF2 salt (generated once, stored plaintext)
  verifier: string    // Base64: AES-GCM encryption of the fixed string "localnotes-ok" using the derived key. Used to verify correct password on unlock without decrypting real notes.
  setupComplete: boolean
}
```

---

## Data Model

```typescript
interface Note {
  id: string           // uuid v4
  title: string        // plaintext (for list display)
  content: string      // Markdown, encrypted at rest
  tags: string[]       // plaintext tags
  createdAt: number    // Unix timestamp
  updatedAt: number
}

interface BackupFile {
  version: 1
  exportedAt: number
  // Always encrypted. JSON export uses a separate plain .json code path, not this type.
  notes: string  // Base64: [16-byte IV][AES-GCM ciphertext of JSON.stringify(Note[])]
}
```

---

## Features

### Notes
| Feature | Detail |
|---|---|
| Create / Edit | Classic split: sidebar list + main editor |
| Markdown | Headings, lists, checkboxes, code blocks, blockquotes, tables, links, dividers |
| Math (KaTeX) | `$inline$` and `$$block$$` rendering |
| Code highlighting | Syntax-highlighted code blocks |
| Tags | Multiple tags per note, filter in sidebar |
| Search | Full-text search over title + content (client-side, decrypted in memory) |
| Dark / Light mode | System default + manual toggle (`◐` button) |

### Encryption

**Crypto primitives:**
- Key derivation: PBKDF2 (SHA-256, 310,000 iterations)
- Encryption: AES-256-GCM
- IV: 12-byte random IV generated per encryption operation, prepended to ciphertext: `[12 bytes IV][ciphertext]`, stored as Base64 string
- Salt: 32-byte random salt generated once on first launch, stored plaintext in IndexedDB (salt is not secret)

**Session key lifecycle:**
- On unlock: PBKDF2 derives a `CryptoKey` object (`extractable: false`) from password + stored salt
- The `CryptoKey` is held in module-level memory (React context) for the session — never serialized or written to storage
- On tab close / page unload: key is garbage-collected automatically
- Manual lock: clears the key from React context → app returns to locked state

**Data stored plaintext (intentional trade-off):** `title`, `tags`, `createdAt`, `updatedAt` are stored unencrypted to enable sidebar display and search without requiring decryption of every note. Only `content` is encrypted. Users are informed of this on the setup screen.

**Untitled notes:** If a note has no title (empty string), the sidebar displays `"Untitled"` as a placeholder. The first line of `content` is never used as a title fallback to avoid leaking encrypted content through the plaintext title field.

| Feature | Detail |
|---|---|
| First launch | Setup screen: enter password + confirm password, minimum 8 characters, warning that password cannot be recovered |
| Password recovery | **None by design.** There is no recovery mechanism. Forgotten password = permanent data loss. This is stated explicitly at setup with a confirmation checkbox. |
| Auto-encrypt | Note `content` AES-256-GCM encrypted in IndexedDB on every save |
| Unlock | Enter master password → PBKDF2 derives key → key held in memory. Wrong password: decryption of a test ciphertext fails → show "Incorrect password" error, allow unlimited retries, no lockout. |
| Lock | Manual lock button or tab close clears key from memory |

### Export / Backup
| Feature | Detail |
|---|---|
| PDF export | Per note. Export renders a hidden off-screen `<div>` (appended to `document.body`, positioned off-screen with `position:absolute; left:-9999px`) containing the fully resolved preview HTML (Tailwind classes inlined as style attributes, KaTeX rendered to DOM). `html2canvas` captures this element, `jspdf` converts to PDF. The hidden div is removed after capture. |
| JSON export | Per note or all notes, exports plain decrypted Markdown. A warning dialog confirms before exporting unencrypted content. |
| Backup export | All notes as encrypted `.localnotes` file (AES-256-GCM), keyed to the current master password |
| Backup import | Upload `.localnotes` → user enters the password the backup was created with (may differ from current master password) → decrypt → merge into IndexedDB. If decryption fails (wrong password): show "Incorrect backup password" error, nothing is written. |
| Import conflict | Import only adds or overwrites — it never deletes. Notes that exist locally but are absent from the backup are preserved. If an imported note ID already exists locally, the imported version overwrites it (last-write-wins). User is shown a summary: "X notes imported, Y notes updated" after completion. |

### UI Layout
- **Sidebar (252px):** wordmark, icon buttons (search toggle, theme toggle, backup), collapsible search (`⌘K`), tag filter pills, note list, new note button (`⌘N`) + AES-256 badge
- **Main — Toolbar:** note title input, Edit / Preview / Syntax toggle buttons, PDF + JSON export, delete
- **Main — Editor pane:** Geist Mono, raw Markdown with subtle syntax coloring
- **Main — Preview pane:** collapsible (`⌘P`), rendered Markdown + KaTeX
- **Main — Syntax pane:** collapsible (`⌘?`), cheatsheet for Markdown, KaTeX, and all keyboard shortcuts

### Keyboard Shortcuts (Kbd component)
| Shortcut | Action |
|---|---|
| `⌘N` | New note |
| `⌘K` | Focus search |
| `⌘P` | Toggle preview |
| `⌘?` | Toggle syntax reference |
| `⌘⇧P` | Export PDF |
| `⌘⇧B` | Backup export |
| `⌘⌥B` | Bold (editor-scoped: only fires when editor textarea is focused) |
| `⌘⌥I` | Italic (editor-scoped) |

**Shortcut scoping:** `⌘⌥B` and `⌘⌥I` are editor-scoped. `⌘B` is intentionally avoided as browsers intercept it on some platforms. All global shortcuts fire regardless of focus.

### Visual Design
- **Color:** Pure black/white — `#000000` background, `#f0f0f0` text, grayscale borders
- **Typography:** Geist (UI) + Geist Mono (editor, code, labels)
- **Mode:** Dark by default, light mode toggle
- **Style:** Minimal, tool-like — no decorative elements, tight spacing, monospaced accents

---

## Landing Page

- Language: English
- Sections: hero (app name + tagline), feature highlights, how it works (install → use offline → encrypted), PWA installation guide (platform-specific), screenshots of the app
- Same visual language as the app (black/white, Geist)

---

## PWA & Offline Strategy

- `app/manifest.ts` — Next.js 16 built-in manifest with `start_url: '/app'`, `scope: '/app'`
- Serwist service worker — caches all Next.js JS chunks, CSS, and static assets on install
- The `/app` route (`app/app/page.tsx` in the file system, served at `yourdomain.com/app`) is a **fully client-side page** (`'use client'` throughout, no RSC data fetching, no server actions) — Serwist serves it entirely from cache when offline
- The landing page (`/`) is server-rendered and requires network; this is acceptable since offline use targets the installed PWA which opens directly to `/app`
- Installable on iOS (Add to Home Screen), Android, and desktop Chrome/Edge
- After install: fully offline for the notes app; landing page requires network

---

## Out of Scope

- Multi-user / sync / cloud storage — intentionally excluded, all data stays local
- Rich text editor (WYSIWYG) — Markdown only
- Real-time collaboration
- Note sharing
