# localnotes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully local, encrypted PWA notes app with Markdown + KaTeX support, hosted on Vercel.

**Architecture:** Next.js 16 App Router with a pure client-side `/app` route — all notes logic runs in the browser via IndexedDB + Web Crypto API. The landing page at `/` is server-rendered. Serwist caches `/app` assets so the installed PWA works fully offline.

**Tech Stack:** Next.js 16, shadcn/ui, Tailwind CSS, Geist font, Serwist, `idb`, Web Crypto API (AES-256-GCM + PBKDF2), `react-markdown`, `remark-math`, `rehype-katex`, `@shikijs/rehype`, `jspdf`, `html2canvas`, `uuid`, Vitest

**Spec:** `docs/superpowers/specs/2026-03-11-localnotes-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `types/index.ts` | TypeScript interfaces: Note, AppConfig, BackupFile |
| `lib/crypto.ts` | PBKDF2 key derivation, AES-256-GCM encrypt/decrypt, verifier |
| `lib/storage.ts` | IndexedDB CRUD via `idb` (notes + meta stores) |
| `lib/export.ts` | PDF export (hidden render + html2canvas + jspdf), JSON export |
| `lib/renderMarkdown.ts` | Markdown → HTML via unified pipeline (for PDF export) |
| `lib/backup.ts` | Backup create (encrypt all notes), restore (decrypt), file download/read |
| `context/CryptoContext.tsx` | React context: holds CryptoKey in memory, setup/unlock/lock |
| `context/NotesContext.tsx` | React context: notes CRUD, content cache, search, tag filter |
| `hooks/useKeyboardShortcuts.ts` | Global keyboard shortcut registration |
| `components/auth/SetupScreen.tsx` | First-launch password setup form |
| `components/auth/UnlockScreen.tsx` | Unlock form for returning users |
| `components/notes/Sidebar.tsx` | Sidebar container (header, search, tags, list, footer) |
| `components/notes/SearchBox.tsx` | Collapsible search input |
| `components/notes/TagFilter.tsx` | Tag filter pill row |
| `components/notes/NoteList.tsx` | Scrollable list of NoteItem |
| `components/notes/NoteItem.tsx` | Single note row (title, date, tags) |
| `components/notes/AppShell.tsx` | Main app layout — wires sidebar + editor area |
| `components/notes/Toolbar.tsx` | Note toolbar (title input, toggle buttons, export, delete) |
| `components/notes/Editor.tsx` | Markdown textarea with editor-scoped shortcuts |
| `components/notes/Preview.tsx` | Rendered Markdown + KaTeX + syntax-highlighted code |
| `components/notes/SyntaxPanel.tsx` | Markdown/KaTeX cheatsheet + shortcuts reference |
| `components/notes/BackupModal.tsx` | Backup export + import modal |
| `app/layout.tsx` | Root layout (Geist font, metadata) |
| `app/page.tsx` | Landing page (EN) |
| `app/manifest.ts` | PWA manifest (start_url: '/app') |
| `app/sw.ts` | Serwist service worker entry |
| `app/app/layout.tsx` | `/app` route layout — wraps CryptoProvider + NotesProvider |
| `app/app/page.tsx` | Auth gate: renders Setup → Unlock → AppShell |
| `next.config.ts` | Next.js config with Serwist wrapper |
| `vitest.config.ts` | Vitest config (jsdom, path aliases) |
| `tests/setup.ts` | Test setup (jest-dom matchers) |
| `tests/lib/crypto.test.ts` | Unit tests for crypto primitives |
| `tests/lib/storage.test.ts` | Unit tests for storage CRUD |
| `tests/lib/backup.test.ts` | Unit tests for backup create/restore |

---

## Chunk 1: Project Bootstrap

### Task 1: Initialize project + dependencies

**Files:**
- Create: (root project — `create-next-app` output)
- Create: `types/index.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Create Next.js 16 project**

Run in `/Users/justuswaechter/Documents/`:
```bash
npx create-next-app@16 localnotes \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-turbopack
cd localnotes
```

- [ ] **Step 2: Install runtime dependencies**

```bash
# geist font may be scaffolded by create-next-app, but install explicitly to be safe
npm install geist idb uuid react-markdown remark-math rehype-katex katex \
  rehype-highlight highlight.js jspdf html2canvas serwist @serwist/next \
  unified remark-parse remark-rehype rehype-stringify
```

Note: We use `rehype-highlight` (not `@shikijs/rehype`) because `@shikijs/rehype` requires async initialization that complicates React component rendering. `rehype-highlight` is synchronous and works directly in `rehypePlugins`.

- [ ] **Step 3: Install dev dependencies**

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom \
  fake-indexeddb @types/uuid @types/katex
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```
Choose: Style → Default, Base color → Neutral, CSS variables → yes.

Then add components:
```bash
npx shadcn@latest add button input badge dialog scroll-area separator tooltip kbd
```

- [ ] **Step 5: Create types/index.ts**

```typescript
// types/index.ts
export interface Note {
  id: string
  title: string       // plaintext — never derive from content to avoid leaking encrypted data
  content: string     // Markdown, encrypted at rest in IndexedDB
  tags: string[]      // plaintext
  createdAt: number   // Unix ms
  updatedAt: number
}

export interface AppConfig {
  salt: string        // Base64 32-byte PBKDF2 salt
  verifier: string    // Base64 AES-GCM encryption of "localnotes-ok" — used to verify password
  setupComplete: boolean
}

export interface BackupFile {
  version: 1
  exportedAt: number
  salt: string        // Base64 32-byte salt used to encrypt this specific backup
  notes: string       // Base64: [12-byte IV][AES-GCM ciphertext of JSON.stringify(Note[])]
}
```

- [ ] **Step 6: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 7: Create tests/setup.ts**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Add test scripts to package.json**

Add to `"scripts"` in `package.json`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 9: Configure Tailwind for dark-first design**

Replace `tailwind.config.ts` content:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 10: Configure app/layout.tsx**

```tsx
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
```

- [ ] **Step 11: Verify build compiles**

```bash
npm run build
```
Expected: build succeeds, no TypeScript errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: initialize localnotes — Next.js 16, shadcn/ui, Vitest, Tailwind"
```

---

### Task 2: Serwist + PWA Manifest

**Files:**
- Create: `app/sw.ts`
- Create: `app/manifest.ts`
- Modify: `next.config.ts`
- Create: `public/icons/icon-192.png` (placeholder)
- Create: `public/icons/icon-512.png` (placeholder)

- [ ] **Step 1: Create app/sw.ts**

```typescript
// app/sw.ts
import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}
declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()
```

- [ ] **Step 2: Replace next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {}

export default withSerwist(nextConfig)
```

- [ ] **Step 3: Create app/manifest.ts**

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'localnotes',
    short_name: 'localnotes',
    description: 'Encrypted local notes. Yours alone.',
    start_url: '/app',
    scope: '/app',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

- [ ] **Step 4: Create placeholder icons**

```bash
mkdir -p public/icons
# Use ImageMagick if available:
convert -size 192x192 xc:black -fill white -font Helvetica -pointsize 72 \
  -gravity center -annotate 0 "ln" public/icons/icon-192.png 2>/dev/null || \
  echo "ImageMagick not found — manually place icon-192.png and icon-512.png in public/icons/"
convert -size 512x512 xc:black -fill white -font Helvetica -pointsize 180 \
  -gravity center -annotate 0 "ln" public/icons/icon-512.png 2>/dev/null || true
```

If ImageMagick is not available, create the icons using any image editor or https://favicon.io. Place them at `public/icons/icon-192.png` and `public/icons/icon-512.png`.

- [ ] **Step 5: Verify icon files exist**

```bash
ls -la public/icons/
```
Expected: both `icon-192.png` and `icon-512.png` are present and non-zero size. If either is missing, create them before continuing.

- [ ] **Step 6: Verify build**

```bash
npm run build
```
Expected: succeeds. `public/sw.js` is generated.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Serwist service worker and PWA manifest"
```

---

## Chunk 2: Crypto + Storage Layer

### Task 3: Crypto library (TDD)

**Files:**
- Create: `lib/crypto.ts`
- Create: `tests/lib/crypto.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/crypto.test.ts
import { describe, it, expect } from 'vitest'
import {
  generateSalt,
  deriveKey,
  encrypt,
  decrypt,
  createVerifier,
  verifyPassword,
} from '@/lib/crypto'

describe('generateSalt', () => {
  it('returns a 32-byte Base64 string', () => {
    const salt = generateSalt()
    const bytes = atob(salt)
    expect(bytes.length).toBe(32)
  })

  it('returns different values each call', () => {
    expect(generateSalt()).not.toBe(generateSalt())
  })
})

describe('deriveKey', () => {
  it('derives a non-extractable AES-GCM CryptoKey', async () => {
    const key = await deriveKey('test-password', generateSalt())
    expect(key).toBeInstanceOf(CryptoKey)
    expect(key.type).toBe('secret')
    expect(key.usages).toContain('encrypt')
    expect(key.usages).toContain('decrypt')
    expect(key.extractable).toBe(false)
  })

  it('same password + salt round-trips through encrypt/decrypt', async () => {
    const salt = generateSalt()
    const key1 = await deriveKey('password', salt)
    const key2 = await deriveKey('password', salt)
    const ciphertext = await encrypt('hello', key1)
    expect(await decrypt(ciphertext, key2)).toBe('hello')
  })

  it('different passwords cannot decrypt each other', async () => {
    const salt = generateSalt()
    const key1 = await deriveKey('password-a', salt)
    const key2 = await deriveKey('password-b', salt)
    const ciphertext = await encrypt('secret', key1)
    await expect(decrypt(ciphertext, key2)).rejects.toThrow()
  })
})

describe('encrypt / decrypt', () => {
  it('round-trips plaintext including unicode', async () => {
    const key = await deriveKey('test', generateSalt())
    const original = 'Hello 🔐 — localnotes $E=mc^2$'
    expect(await decrypt(await encrypt(original, key), key)).toBe(original)
  })

  it('produces different ciphertext each call (random IV)', async () => {
    const key = await deriveKey('test', generateSalt())
    const c1 = await encrypt('same', key)
    const c2 = await encrypt('same', key)
    expect(c1).not.toBe(c2)
  })

  it('ciphertext is a valid Base64 string', async () => {
    const key = await deriveKey('test', generateSalt())
    const result = await encrypt('test', key)
    expect(() => atob(result)).not.toThrow()
  })
})

describe('createVerifier / verifyPassword', () => {
  it('verifies correct password', async () => {
    const salt = generateSalt()
    const key = await deriveKey('mypassword', salt)
    const verifier = await createVerifier(key)
    expect(await verifyPassword('mypassword', salt, verifier)).toBe(true)
  })

  it('rejects wrong password', async () => {
    const salt = generateSalt()
    const key = await deriveKey('mypassword', salt)
    const verifier = await createVerifier(key)
    expect(await verifyPassword('wrongpassword', salt, verifier)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm run test:run -- tests/lib/crypto.test.ts
```
Expected: `Error: Cannot find module '@/lib/crypto'`

- [ ] **Step 3: Implement lib/crypto.ts**

```typescript
// lib/crypto.ts
const PBKDF2_ITERATIONS = 310_000
const VERIFIER_PLAINTEXT = 'localnotes-ok'

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
}

export async function deriveKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const saltBytes = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0))
  const passwordBytes = new TextEncoder().encode(password)
  const importedKey = await crypto.subtle.importKey(
    'raw', passwordBytes, 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Returns Base64: [12-byte IV][AES-GCM ciphertext] */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), 12)
  return btoa(String.fromCharCode(...combined))
}

/** Decrypts a Base64 string produced by encrypt(). Throws if key is wrong. */
export async function decrypt(ciphertextBase64: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0))
  const plaintextBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: combined.slice(0, 12) },
    key,
    combined.slice(12)
  )
  return new TextDecoder().decode(plaintextBytes)
}

export async function createVerifier(key: CryptoKey): Promise<string> {
  return encrypt(VERIFIER_PLAINTEXT, key)
}

export async function verifyPassword(
  password: string,
  saltBase64: string,
  verifierBase64: string
): Promise<boolean> {
  try {
    const key = await deriveKey(password, saltBase64)
    return await decrypt(verifierBase64, key) === VERIFIER_PLAINTEXT
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm run test:run -- tests/lib/crypto.test.ts
```
Expected: all PASS. (PBKDF2 at 310k iterations takes ~5–10s per key derivation — this is normal.)

- [ ] **Step 5: Commit**

```bash
git add lib/crypto.ts tests/lib/crypto.test.ts
git commit -m "feat: add AES-256-GCM crypto layer with PBKDF2 key derivation"
```

---

### Task 4: Storage library (TDD)

**Files:**
- Create: `lib/storage.ts`
- Create: `tests/lib/storage.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { initDB, resetDB, getConfig, saveConfig, getAllNotes, saveNote, deleteNote } from '@/lib/storage'
import type { Note, AppConfig } from '@/types'

function note(overrides: Partial<Note> = {}): Note {
  return {
    id: 'id-1', title: 'Test', content: 'enc-content',
    tags: ['#work'], createdAt: 1000, updatedAt: 2000,
    ...overrides,
  }
}

describe('storage', () => {
  beforeEach(async () => {
    // Give each test a completely fresh IndexedDB — prevents state leaking between tests
    // via the module-level `db` singleton in storage.ts
    vi.stubGlobal('indexedDB', new IDBFactory())
    resetDB()
    await initDB()
  })

  it('saveConfig / getConfig round-trips', async () => {
    const config: AppConfig = { salt: 'abc', verifier: 'xyz', setupComplete: true }
    await saveConfig(config)
    expect(await getConfig()).toEqual(config)
  })

  it('getConfig returns null when unset', async () => {
    expect(await getConfig()).toBeNull()
  })

  it('saveNote / getAllNotes round-trips', async () => {
    await saveNote(note())
    const notes = await getAllNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0].id).toBe('id-1')
  })

  it('saveNote overwrites note with same id', async () => {
    await saveNote(note())
    await saveNote(note({ title: 'Updated' }))
    const notes = await getAllNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('Updated')
  })

  it('deleteNote removes the note', async () => {
    await saveNote(note())
    await deleteNote('id-1')
    expect(await getAllNotes()).toHaveLength(0)
  })

  it('getAllNotes returns sorted by updatedAt desc', async () => {
    await saveNote(note({ id: 'a', updatedAt: 1000 }))
    await saveNote(note({ id: 'b', updatedAt: 2000 }))
    const notes = await getAllNotes()
    expect(notes[0].id).toBe('b')
    expect(notes[1].id).toBe('a')
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm run test:run -- tests/lib/storage.test.ts
```
Expected: `Error: Cannot find module '@/lib/storage'`

- [ ] **Step 3: Implement lib/storage.ts**

```typescript
// lib/storage.ts
import { openDB, type IDBPDatabase } from 'idb'
import type { Note, AppConfig } from '@/types'

const DB_NAME = 'localnotes'
const DB_VERSION = 1
const NOTES_STORE = 'notes'
const META_STORE = 'meta'
const CONFIG_KEY = 'config'

let db: IDBPDatabase | null = null

/** Reset the cached DB connection — used in tests to get a fresh DB per test. */
export function resetDB(): void { db = null }

export async function initDB(): Promise<IDBPDatabase> {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE)
      }
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const store = db.createObjectStore(NOTES_STORE, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    },
  })
  return db
}

async function getDB(): Promise<IDBPDatabase> {
  if (!db) await initDB()
  return db!
}

export async function getConfig(): Promise<AppConfig | null> {
  return (await (await getDB()).get(META_STORE, CONFIG_KEY)) ?? null
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await (await getDB()).put(META_STORE, config, CONFIG_KEY)
}

export async function getAllNotes(): Promise<Note[]> {
  const notes: Note[] = await (await getDB()).getAll(NOTES_STORE)
  return notes.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function saveNote(note: Note): Promise<void> {
  await (await getDB()).put(NOTES_STORE, note)
}

export async function deleteNote(id: string): Promise<void> {
  await (await getDB()).delete(NOTES_STORE, id)
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm run test:run -- tests/lib/storage.test.ts
```
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts tests/lib/storage.test.ts
git commit -m "feat: add IndexedDB storage layer via idb"
```

---

## Chunk 3: Auth Screens + CryptoContext

### Task 5: CryptoContext

**Files:**
- Create: `context/CryptoContext.tsx`

- [ ] **Step 1: Create context/CryptoContext.tsx**

```tsx
// context/CryptoContext.tsx
'use client'
import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode
} from 'react'
import { deriveKey, createVerifier, verifyPassword, generateSalt } from '@/lib/crypto'
import { initDB, getConfig, saveConfig } from '@/lib/storage'
import type { AppConfig } from '@/types'

interface CryptoContextValue {
  key: CryptoKey | null
  isSetup: boolean
  isUnlocked: boolean
  isLoading: boolean
  setup: (password: string) => Promise<void>
  unlock: (password: string) => Promise<boolean>
  lock: () => void
}

const CryptoContext = createContext<CryptoContextValue | null>(null)

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initDB().then(() => getConfig()).then(cfg => {
      if (cfg) setConfig(cfg)
      setIsLoading(false)
    })
  }, [])

  const setup = useCallback(async (password: string) => {
    const salt = generateSalt()
    const derivedKey = await deriveKey(password, salt)
    const verifier = await createVerifier(derivedKey)
    const cfg: AppConfig = { salt, verifier, setupComplete: true }
    await saveConfig(cfg)
    setConfig(cfg)
    setKey(derivedKey)
  }, [])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (!config) return false
    const valid = await verifyPassword(password, config.salt, config.verifier)
    if (!valid) return false
    setKey(await deriveKey(password, config.salt))
    return true
  }, [config])

  const lock = useCallback(() => setKey(null), [])

  return (
    <CryptoContext.Provider value={{
      key,
      isSetup: !!config?.setupComplete,
      isUnlocked: key !== null,
      isLoading,
      setup,
      unlock,
      lock,
    }}>
      {children}
    </CryptoContext.Provider>
  )
}

export function useCrypto(): CryptoContextValue {
  const ctx = useContext(CryptoContext)
  if (!ctx) throw new Error('useCrypto must be inside CryptoProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add context/CryptoContext.tsx
git commit -m "feat: add CryptoContext for session key lifecycle management"
```

---

### Task 6: Setup + Unlock screens + app route

**Files:**
- Create: `components/auth/SetupScreen.tsx`
- Create: `components/auth/UnlockScreen.tsx`
- Create: `app/app/layout.tsx`
- Create: `app/app/page.tsx`

- [ ] **Step 1: Create components/auth/SetupScreen.tsx**

```tsx
// components/auth/SetupScreen.tsx
'use client'
import { useState } from 'react'
import { useCrypto } from '@/context/CryptoContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SetupScreen() {
  const { setup } = useCrypto()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!acknowledged) { setError('Please acknowledge the warning below.'); return }
    setLoading(true)
    try {
      await setup(password)
    } catch {
      setError('Setup failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-[#f0f0f0] mb-1">localnotes</h1>
        <p className="text-sm text-[#555] mb-8">Set a master password to encrypt your notes.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-[#444] uppercase tracking-wider mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters" autoFocus
              className="bg-[#0a0a0a] border-[#1e1e1e] text-[#f0f0f0] placeholder:text-[#333]" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#444] uppercase tracking-wider mb-1">Confirm Password</label>
            <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="bg-[#0a0a0a] border-[#1e1e1e] text-[#f0f0f0] placeholder:text-[#333]" />
          </div>
          <div className="flex items-start gap-3 pt-1">
            <input type="checkbox" id="ack" checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)} className="mt-0.5 accent-white" />
            <label htmlFor="ack" className="text-[11px] text-[#444] leading-relaxed">
              I understand there is <span className="text-[#888]">no password recovery</span>.
              Forgotten password = permanent data loss. Note titles and tags are stored
              unencrypted; only note content is encrypted.
            </label>
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <Button type="submit" disabled={loading}
            className="w-full bg-white text-black hover:bg-[#f0f0f0] font-semibold">
            {loading ? 'Setting up…' : 'Create Vault'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/auth/UnlockScreen.tsx**

```tsx
// components/auth/UnlockScreen.tsx
'use client'
import { useState } from 'react'
import { useCrypto } from '@/context/CryptoContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UnlockScreen() {
  const { unlock } = useCrypto()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await unlock(password)
    if (!ok) { setError('Incorrect password.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-[#f0f0f0] mb-1">localnotes</h1>
        <p className="text-sm text-[#555] mb-8">Enter your password to unlock.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-[#444] uppercase tracking-wider mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Master password" autoFocus
              className="bg-[#0a0a0a] border-[#1e1e1e] text-[#f0f0f0] placeholder:text-[#333]" />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <Button type="submit" disabled={loading}
            className="w-full bg-white text-black hover:bg-[#f0f0f0] font-semibold">
            {loading ? 'Unlocking…' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/app/layout.tsx**

```tsx
// app/app/layout.tsx
'use client'
import { CryptoProvider } from '@/context/CryptoContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <CryptoProvider>{children}</CryptoProvider>
}
```

- [ ] **Step 4: Create app/app/page.tsx (auth gate — app shell placeholder)**

```tsx
// app/app/page.tsx
'use client'
import { useCrypto } from '@/context/CryptoContext'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { UnlockScreen } from '@/components/auth/UnlockScreen'

export default function AppPage() {
  const { isSetup, isUnlocked, isLoading } = useCrypto()
  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-[11px] font-mono text-[#333]">loading…</span>
    </div>
  )
  if (!isSetup) return <SetupScreen />
  if (!isUnlocked) return <UnlockScreen />
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-[11px] font-mono text-[#444]">App shell coming soon…</p>
    </div>
  )
}
```

- [ ] **Step 5: Test auth flow in browser**

```bash
npm run dev
```
Navigate to http://localhost:3000/app. Expected:
- First visit: Setup screen with password form
- After setup: app shell placeholder
- After `npm run dev` restart: Unlock screen (password required)

- [ ] **Step 6: Commit**

```bash
git add context/CryptoContext.tsx components/auth/ app/app/
git commit -m "feat: add auth screens and CryptoContext"
```

---

## Chunk 4: Notes State + Sidebar

### Task 7: NotesContext

**Files:**
- Create: `context/NotesContext.tsx`

- [ ] **Step 1: Create context/NotesContext.tsx**

```tsx
// context/NotesContext.tsx
'use client'
import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import { encrypt, decrypt } from '@/lib/crypto'
import { getAllNotes, saveNote as dbSave, deleteNote as dbDelete } from '@/lib/storage'
import { useCrypto } from '@/context/CryptoContext'
import type { Note } from '@/types'

interface NotesContextValue {
  notes: Note[]                        // Note objects with encrypted content
  plainContent: Record<string, string> // noteId -> decrypted content
  activeNote: Note | null
  setActiveNote: (note: Note | null) => void
  createNote: () => Promise<void>
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => Promise<void>
  removeNote: (id: string) => Promise<void>
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeTag: string
  setActiveTag: (tag: string) => void
  filteredNotes: Note[]
  allTags: string[]
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const { key } = useCrypto()
  const [notes, setNotes] = useState<Note[]>([])
  const [plainContent, setPlainContent] = useState<Record<string, string>>({})
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('#all')
  // Keep notes in a ref for callbacks to avoid stale closures
  const notesRef = useRef<Note[]>([])
  notesRef.current = notes

  // Load + decrypt all notes when key becomes available
  useEffect(() => {
    if (!key) { setNotes([]); setPlainContent({}); setActiveNote(null); return }
    ;(async () => {
      const stored = await getAllNotes()
      const cache: Record<string, string> = {}
      await Promise.all(stored.map(async n => {
        try { cache[n.id] = await decrypt(n.content, key) }
        catch { cache[n.id] = '' }
      }))
      setNotes(stored)
      setPlainContent(cache)
    })()
  }, [key])

  const createNote = useCallback(async () => {
    if (!key) return
    const now = Date.now()
    const encContent = await encrypt('', key)
    const note: Note = { id: uuidv4(), title: '', content: encContent, tags: [], createdAt: now, updatedAt: now }
    await dbSave(note)
    setNotes(prev => [note, ...prev])
    setPlainContent(prev => ({ ...prev, [note.id]: '' }))
    setActiveNote(note)
  }, [key])

  const updateNote = useCallback(async (
    id: string,
    patch: Partial<Pick<Note, 'title' | 'content' | 'tags'>>
  ) => {
    if (!key) return
    const existing = notesRef.current.find(n => n.id === id)
    if (!existing) return
    // patch.content is plaintext; encrypt before storing
    const encContent = patch.content !== undefined
      ? await encrypt(patch.content, key)
      : existing.content
    const updated: Note = { ...existing, ...patch, content: encContent, updatedAt: Date.now() }
    await dbSave(updated)
    setNotes(prev => prev.map(n => n.id === id ? updated : n).sort((a, b) => b.updatedAt - a.updatedAt))
    if (patch.content !== undefined) {
      setPlainContent(prev => ({ ...prev, [id]: patch.content! }))
    }
    setActiveNote(prev => prev?.id === id ? updated : prev)
  }, [key])

  const removeNote = useCallback(async (id: string) => {
    await dbDelete(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    setPlainContent(prev => { const c = { ...prev }; delete c[id]; return c })
    setActiveNote(prev => prev?.id === id ? null : prev)
  }, [])

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort()

  const filteredNotes = notes.filter(n => {
    const matchTag = activeTag === '#all' || n.tags.includes(activeTag)
    const q = searchQuery.toLowerCase()
    const matchSearch = !q ||
      n.title.toLowerCase().includes(q) ||
      (plainContent[n.id] ?? '').toLowerCase().includes(q)
    return matchTag && matchSearch
  })

  return (
    <NotesContext.Provider value={{
      notes, plainContent, activeNote, setActiveNote,
      createNote, updateNote, removeNote,
      searchQuery, setSearchQuery,
      activeTag, setActiveTag,
      filteredNotes, allTags,
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be inside NotesProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add context/NotesContext.tsx
git commit -m "feat: add NotesContext with encrypted CRUD and full-text search"
```

---

### Task 8: Sidebar components

**Files:**
- Create: `components/notes/SearchBox.tsx`
- Create: `components/notes/TagFilter.tsx`
- Create: `components/notes/NoteItem.tsx`
- Create: `components/notes/NoteList.tsx`
- Create: `components/notes/Sidebar.tsx`

- [ ] **Step 1: Create components/notes/SearchBox.tsx**

```tsx
// components/notes/SearchBox.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import { Kbd } from '@/components/ui/kbd'

interface SearchBoxProps {
  collapsed: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SearchBox({ collapsed, inputRef }: SearchBoxProps) {
  const { searchQuery, setSearchQuery } = useNotes()
  if (collapsed) return null
  return (
    <div className="px-3 pt-2 pb-1">
      <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-[5px] px-2.5 py-1.5">
        <span className="text-[#444] text-xs">⌕</span>
        <input
          ref={inputRef}
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search notes…"
          className="flex-1 bg-transparent border-none outline-none text-[#f0f0f0] text-[12px] placeholder:text-[#333] font-sans"
        />
        <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/notes/TagFilter.tsx**

```tsx
// components/notes/TagFilter.tsx
'use client'
import { useNotes } from '@/context/NotesContext'

export function TagFilter() {
  const { allTags, activeTag, setActiveTag } = useNotes()
  return (
    <div className="px-3 py-2 flex gap-1.5 flex-wrap">
      {['#all', ...allTags].map(tag => (
        <button key={tag} onClick={() => setActiveTag(tag)}
          className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border transition-colors ${
            activeTag === tag
              ? 'text-[#f0f0f0] border-[#2a2a2a] bg-[#111]'
              : 'text-[#444] border-[#1e1e1e] hover:text-[#999] hover:border-[#2a2a2a]'
          }`}>
          {tag}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create components/notes/NoteItem.tsx**

```tsx
// components/notes/NoteItem.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import type { Note } from '@/types'

function fmt(ts: number): string {
  const d = new Date(ts), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return `today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diff === 1) return 'yesterday'
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function NoteItem({ note }: { note: Note }) {
  const { activeNote, setActiveNote } = useNotes()
  const active = activeNote?.id === note.id
  return (
    <button onClick={() => setActiveNote(note)}
      className={`w-full text-left px-2.5 py-2.5 rounded-[4px] mb-0.5 border transition-colors ${
        active ? 'bg-[#111] border-[#2a2a2a]' : 'bg-transparent border-transparent hover:bg-[#0d0d0d]'
      }`}>
      <div className={`text-[12px] font-medium truncate mb-0.5 ${active ? 'text-[#f0f0f0]' : 'text-[#999]'}`}>
        {note.title.trim() || 'Untitled'}
      </div>
      <div className="text-[10px] font-mono text-[#444] mb-1">{fmt(note.updatedAt)}</div>
      {note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {note.tags.map(t => (
            <span key={t} className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border ${
              active ? 'text-[#999] border-[#2a2a2a]' : 'text-[#444] border-[#1e1e1e]'
            }`}>{t}</span>
          ))}
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 4: Create components/notes/NoteList.tsx**

```tsx
// components/notes/NoteList.tsx
'use client'
import { useNotes } from '@/context/NotesContext'
import { NoteItem } from './NoteItem'

export function NoteList() {
  const { filteredNotes } = useNotes()
  if (filteredNotes.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-[11px] font-mono text-[#2a2a2a]">no notes</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto px-1.5 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2a2a]">
      {filteredNotes.map(note => <NoteItem key={note.id} note={note} />)}
    </div>
  )
}
```

- [ ] **Step 5: Create components/notes/Sidebar.tsx**

```tsx
// components/notes/Sidebar.tsx
'use client'
import { useState } from 'react'
import { useNotes } from '@/context/NotesContext'
import { useCrypto } from '@/context/CryptoContext'
import { SearchBox } from './SearchBox'
import { TagFilter } from './TagFilter'
import { NoteList } from './NoteList'
import { BackupModal } from './BackupModal'
import { Kbd } from '@/components/ui/kbd'

function IconBtn({ onClick, title, children }: { onClick?: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="w-[26px] h-[26px] flex items-center justify-center border border-[#2a2a2a] rounded-[4px] text-[#444] hover:text-[#999] hover:border-[#444] transition-colors text-xs font-mono">
      {children}
    </button>
  )
}

interface SidebarProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onOpenBackup: () => void
}

export function Sidebar({ searchInputRef, onOpenBackup }: SidebarProps) {
  const { createNote } = useNotes()
  const { lock } = useCrypto()
  const [searchCollapsed, setSearchCollapsed] = useState(false)

  return (
    <div className="w-[252px] min-w-[252px] bg-[#0a0a0a] border-r border-[#1e1e1e] flex flex-col">
      <div className="px-3.5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">localnotes</span>
        <div className="flex gap-1">
          <IconBtn onClick={() => setSearchCollapsed(c => !c)} title="Toggle search">⌕</IconBtn>
          <IconBtn onClick={() => document.documentElement.classList.toggle('dark')} title="Toggle theme">◐</IconBtn>
          <IconBtn onClick={onOpenBackup} title="Backup / Restore (⌘⇧B)">⇅</IconBtn>
          <IconBtn onClick={lock} title="Lock vault">🔒</IconBtn>
        </div>
      </div>

      <SearchBox collapsed={searchCollapsed} inputRef={searchInputRef} />
      <TagFilter />
      <NoteList />

      <div className="p-3 border-t border-[#1e1e1e] flex items-center gap-2">
        <button onClick={createNote}
          className="flex-1 bg-[#f0f0f0] text-black rounded-[4px] py-1.5 text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
          + New
          <div className="flex gap-0.5">
            <Kbd className="bg-black/10 border-black/10 text-black/40">⌘</Kbd>
            <Kbd className="bg-black/10 border-black/10 text-black/40">N</Kbd>
          </div>
        </button>
        <span className="text-[9px] font-mono text-[#2a2a2a]">AES-256</span>
      </div>

    </div>
  )
}
```

Note: `BackupModal` is no longer rendered inside `Sidebar` — it is managed by `AppShell` which controls the `showBackup` state and passes `onOpenBackup` down. `Sidebar` only triggers `onOpenBackup`. If TypeScript complains, create a stub first:
```tsx
// components/notes/BackupModal.tsx (stub — replaced in Chunk 6)
'use client'
export function BackupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return null
}
```

- [ ] **Step 6: Create BackupModal stub (required before build)**

```tsx
// components/notes/BackupModal.tsx  — stub, replaced fully in Chunk 6
'use client'
export function BackupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return null
}
```

- [ ] **Step 7: Verify build compiles**

```bash
npm run build
```
Expected: build succeeds. Fix any TypeScript errors before continuing.

- [ ] **Step 8: Commit**

```bash
git add components/notes/SearchBox.tsx components/notes/TagFilter.tsx \
  components/notes/NoteItem.tsx components/notes/NoteList.tsx \
  components/notes/Sidebar.tsx components/notes/BackupModal.tsx \
  context/NotesContext.tsx
git commit -m "feat: add sidebar with note list, search, tag filter, notes context"
```

---

## Chunk 5: Editor + Preview + App Shell

### Task 9: Toolbar + Editor

**Files:**
- Create: `components/notes/Toolbar.tsx`
- Create: `components/notes/Editor.tsx`

- [ ] **Step 1: Create components/notes/Toolbar.tsx**

```tsx
// components/notes/Toolbar.tsx
'use client'
import { Kbd } from '@/components/ui/kbd'

interface ToolbarProps {
  noteTitle: string
  onTitleChange: (t: string) => void
  showPreview: boolean; onTogglePreview: () => void
  showSyntax: boolean; onToggleSyntax: () => void
  onExportPDF: () => void
  onExportJSON: () => void
  onDelete: () => void
}
// Edit is "active" when neither preview nor syntax is shown (editor-only mode)

function TbBtn({ children, active, onClick, danger }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-[4px] border transition-colors whitespace-nowrap ${
        active ? 'bg-[#111] border-[#2a2a2a] text-[#f0f0f0]'
               : danger ? 'bg-transparent border-[#1e1e1e] text-[#444] hover:border-[#555] hover:text-[#aaa]'
               : 'bg-transparent border-[#1e1e1e] text-[#444] hover:border-[#2a2a2a] hover:text-[#999]'
      }`}>
      {children}
    </button>
  )
}

const Div = () => <div className="w-px h-4 bg-[#2a2a2a] flex-shrink-0" />

export function Toolbar({
  noteTitle, onTitleChange, showPreview, onTogglePreview,
  showSyntax, onToggleSyntax, onExportPDF, onExportJSON, onDelete,
}: ToolbarProps) {
  return (
    <div className="px-4 py-2.5 border-b border-[#1e1e1e] bg-[#0a0a0a] flex items-center gap-1.5 overflow-x-auto">
      <input value={noteTitle} onChange={e => onTitleChange(e.target.value)}
        placeholder="Untitled"
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[14px] font-medium text-[#f0f0f0] placeholder:text-[#333] font-sans" />
      <Div />
      <TbBtn active={!showPreview && !showSyntax}>Edit</TbBtn>
      <TbBtn active={showPreview} onClick={onTogglePreview}>
        Preview <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>P</Kbd></div>
      </TbBtn>
      <TbBtn active={showSyntax} onClick={onToggleSyntax}>
        Syntax <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>?</Kbd></div>
      </TbBtn>
      <Div />
      <TbBtn onClick={onExportPDF}>PDF ↓</TbBtn>
      <TbBtn onClick={onExportJSON}>JSON ↓</TbBtn>
      <Div />
      <TbBtn onClick={onDelete} danger>✕</TbBtn>
    </div>
  )
}
```

- [ ] **Step 2: Create components/notes/Editor.tsx**

```tsx
// components/notes/Editor.tsx
'use client'
import { useRef } from 'react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export function Editor({ content, onChange }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // ⌘⌥B = bold, ⌘⌥I = italic (editor-scoped)
    if (e.metaKey && e.altKey) {
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); wrap('**', '**') }
      if (e.key === 'i' || e.key === 'I') { e.preventDefault(); wrap('*', '*') }
    }
  }

  function wrap(before: string, after: string) {
    const ta = ref.current; if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    // Use ta.value (live DOM value) not the React `content` prop to avoid stale closure
    const current = ta.value
    const newContent = current.slice(0, s) + before + current.slice(s, e) + after + current.slice(e)
    onChange(newContent)
    requestAnimationFrame(() => {
      ta.selectionStart = s + before.length
      ta.selectionEnd = e + before.length
    })
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-[#1e1e1e] overflow-hidden">
      <div className="px-3.5 py-2 border-b border-[#1e1e1e] bg-[#0a0a0a] flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-mono text-[#444] uppercase tracking-[0.8px]">editor</span>
        <span className="text-[10px] font-mono text-[#333]">{content.length} chars</span>
      </div>
      <textarea
        ref={ref} value={content} onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown} spellCheck={false}
        placeholder="Start writing in Markdown…"
        className="flex-1 p-5 bg-transparent resize-none outline-none font-mono text-[12px] leading-[1.9] text-[#666] caret-[#f0f0f0] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2a2a]"
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/notes/Toolbar.tsx components/notes/Editor.tsx
git commit -m "feat: add toolbar and markdown editor with ⌘⌥B/I shortcuts"
```

---

### Task 10: Preview + Syntax Panel

**Files:**
- Create: `components/notes/Preview.tsx`
- Create: `components/notes/SyntaxPanel.tsx`

- [ ] **Step 1: Create components/notes/Preview.tsx**

```tsx
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
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
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
```

To add full syntax highlighting, install and integrate `rehype-highlight`:
```bash
npm install rehype-highlight
```
Then import and add `[rehypeHighlight]` to `rehypePlugins` and add `import 'highlight.js/styles/github-dark.css'`.

- [ ] **Step 2: Create components/notes/SyntaxPanel.tsx**

```tsx
// components/notes/SyntaxPanel.tsx
'use client'
import { Kbd } from '@/components/ui/kbd'

const MD = [
  ['# Heading 1', 'Title'], ['## Heading 2', 'Section'],
  ['**bold**', 'Bold'], ['*italic*', 'Italic'], ['~~strike~~', 'Strikethrough'],
  ['- [ ] task', 'Checkbox'], ['- [x] done', 'Checked'],
  ['`code`', 'Inline code'], ['```lang', 'Code block'],
  ['[text](url)', 'Link'], ['> quote', 'Blockquote'], ['---', 'Divider'],
]

const MATH = [
  ['$formula$', 'Inline'], ['$$formula$$', 'Block'],
  ['\\frac{a}{b}', 'Fraction'], ['\\sqrt{x}', 'Square root'],
  ['^{} _{}', 'Super / sub'], ['\\int \\sum', 'Integral / sum'],
  ['\\alpha \\beta', 'Greek letters'],
]

const SHORTCUTS: [string, string[]][] = [
  ['New note', ['⌘', 'N']], ['Search', ['⌘', 'K']],
  ['Toggle preview', ['⌘', 'P']], ['Syntax ref', ['⌘', '?']],
  ['Export PDF', ['⌘', '⇧', 'P']], ['Backup', ['⌘', '⇧', 'B']],
  ['Bold', ['⌘', '⌥', 'B']], ['Italic', ['⌘', '⌥', 'I']],
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[9px] font-mono text-[#333] uppercase tracking-[1px] mb-2 pb-1.5 border-b border-[#1e1e1e]">{title}</div>
      {children}
    </div>
  )
}

export function SyntaxPanel() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="px-3.5 py-2 border-b border-[#1e1e1e] bg-[#0a0a0a] flex-shrink-0">
        <span className="text-[10px] font-mono text-[#444] uppercase tracking-[0.8px]">syntax</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2a2a2a]">
        <Section title="Markdown">
          {MD.map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 mb-1.5">
              <span className="font-mono text-[11px] text-[#888] min-w-[100px] flex-shrink-0">{syn}</span>
              <span className="text-[11px] text-[#444]">{desc}</span>
            </div>
          ))}
        </Section>
        <Section title="Math · KaTeX">
          {MATH.map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 mb-1.5">
              <span className="font-mono text-[11px] text-[#888] min-w-[100px] flex-shrink-0">{syn}</span>
              <span className="text-[11px] text-[#444]">{desc}</span>
            </div>
          ))}
        </Section>
        <Section title="Shortcuts">
          {SHORTCUTS.map(([desc, keys]) => (
            <div key={desc} className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#444]">{desc}</span>
              <div className="flex gap-0.5">{keys.map(k => <Kbd key={k}>{k}</Kbd>)}</div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/notes/Preview.tsx components/notes/SyntaxPanel.tsx
git commit -m "feat: add markdown preview with KaTeX and syntax cheatsheet panel"
```

---

### Task 11: App Shell — wire it all together

**Files:**
- Create: `hooks/useKeyboardShortcuts.ts`
- Create: `components/notes/AppShell.tsx`
- Modify: `app/app/layout.tsx`
- Modify: `app/app/page.tsx`

- [ ] **Step 1: Create hooks/useKeyboardShortcuts.ts**

```typescript
// hooks/useKeyboardShortcuts.ts
'use client'
import { useEffect } from 'react'

export interface Shortcut {
  key: string
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const s of shortcuts) {
        const meta = s.meta !== false ? e.metaKey : !e.metaKey
        const shift = s.shift ? e.shiftKey : !e.shiftKey
        const alt = s.alt ? e.altKey : !e.altKey
        if (meta && shift && alt && e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault(); s.handler(); return
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
```

- [ ] **Step 2: Create components/notes/AppShell.tsx**

```tsx
// components/notes/AppShell.tsx
'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useNotes } from '@/context/NotesContext'
import { Sidebar } from './Sidebar'
import { Toolbar } from './Toolbar'
import { Editor } from './Editor'
import { Preview } from './Preview'
import { SyntaxPanel } from './SyntaxPanel'
import { BackupModal } from './BackupModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppShell() {
  const { activeNote, plainContent, updateNote, removeNote, createNote } = useNotes()
  const [showPreview, setShowPreview] = useState(true)
  const [showSyntax, setShowSyntax] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevId = useRef<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Sync local state when active note changes
  useEffect(() => {
    if (activeNote?.id !== prevId.current) {
      prevId.current = activeNote?.id ?? null
      setLocalTitle(activeNote?.title ?? '')
      setLocalContent(activeNote ? (plainContent[activeNote.id] ?? '') : '')
    }
  }, [activeNote, plainContent])

  const scheduleSave = useCallback((id: string, patch: { title?: string; content?: string }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => updateNote(id, patch), 500)
  }, [updateNote])

  const handleTitleChange = useCallback((title: string) => {
    setLocalTitle(title)
    if (activeNote) scheduleSave(activeNote.id, { title })
  }, [activeNote, scheduleSave])

  const handleContentChange = useCallback((content: string) => {
    setLocalContent(content)
    if (activeNote) scheduleSave(activeNote.id, { content })
  }, [activeNote, scheduleSave])

  const handleDelete = useCallback(async () => {
    if (!activeNote) return
    if (confirm(`Delete "${activeNote.title || 'Untitled'}"?`)) await removeNote(activeNote.id)
  }, [activeNote, removeNote])

  const handleExportPDF = useCallback(async () => {
    if (!activeNote) return
    const { exportToPDF } = await import('@/lib/export')
    await exportToPDF(localTitle || 'Untitled', localContent)
  }, [activeNote, localTitle, localContent])

  const handleExportJSON = useCallback(async () => {
    if (!activeNote) return
    if (!confirm('Export as plain JSON? The content will be unencrypted.')) return
    const { exportToJSON } = await import('@/lib/export')
    exportToJSON(localTitle || 'Untitled', localContent)
  }, [activeNote, localTitle, localContent])

  useKeyboardShortcuts([
    { key: 'n', meta: true, shift: false, alt: false, handler: createNote },
    { key: 'k', meta: true, shift: false, alt: false, handler: () => searchInputRef.current?.focus() },
    { key: 'p', meta: true, shift: false, alt: false, handler: () => setShowPreview(p => !p) },
    { key: '?', meta: true, shift: false, alt: false, handler: () => setShowSyntax(s => !s) },
    { key: 'p', meta: true, shift: true, alt: false, handler: handleExportPDF },
    { key: 'b', meta: true, shift: true, alt: false, handler: () => setShowBackup(true) },
  ])

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar searchInputRef={searchInputRef} onOpenBackup={() => setShowBackup(true)} />
      <BackupModal open={showBackup} onClose={() => setShowBackup(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <>
            <Toolbar
              noteTitle={localTitle}
              onTitleChange={handleTitleChange}
              showPreview={showPreview} onTogglePreview={() => setShowPreview(p => !p)}
              showSyntax={showSyntax} onToggleSyntax={() => setShowSyntax(s => !s)}
              onExportPDF={handleExportPDF}
              onExportJSON={handleExportJSON}
              onDelete={handleDelete}
            />
            <div className="flex-1 flex overflow-hidden">
              <Editor content={localContent} onChange={handleContentChange} />
              {showPreview && <Preview content={localContent} />}
              {showSyntax && <SyntaxPanel />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] font-mono text-[#2a2a2a]">
              Select a note or press ⌘N
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update app/app/layout.tsx to include NotesProvider**

```tsx
// app/app/layout.tsx
'use client'
import { CryptoProvider } from '@/context/CryptoContext'
import { NotesProvider } from '@/context/NotesContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CryptoProvider>
      <NotesProvider>{children}</NotesProvider>
    </CryptoProvider>
  )
}
```

- [ ] **Step 4: Update app/app/page.tsx to render AppShell**

```tsx
// app/app/page.tsx
'use client'
import { useCrypto } from '@/context/CryptoContext'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { UnlockScreen } from '@/components/auth/UnlockScreen'
import { AppShell } from '@/components/notes/AppShell'

export default function AppPage() {
  const { isSetup, isUnlocked, isLoading } = useCrypto()
  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-[11px] font-mono text-[#333]">loading…</span>
    </div>
  )
  if (!isSetup) return <SetupScreen />
  if (!isUnlocked) return <UnlockScreen />
  return <AppShell />
}
```

- [ ] **Step 5: Smoke test in browser**

```bash
npm run dev
```
Navigate to http://localhost:3000/app. Verify:
- Setup → Unlock → App shell renders
- ⌘N creates a new note
- Type `# Hello` + `$E=mc^2$` in editor; toggle Preview (⌘P) — heading and math render
- Toggle Syntax (⌘?); verify cheatsheet appears as a third panel
- Click ⌕ in sidebar header — search bar collapses/expands

- [ ] **Step 6: Commit**

```bash
git add hooks/ components/notes/AppShell.tsx app/app/layout.tsx app/app/page.tsx context/NotesContext.tsx
git commit -m "feat: wire complete app shell with editor, preview, syntax panel, keyboard shortcuts"
```

---

## Chunk 6: Export + Backup

### Task 12: Export + Backup libraries (TDD)

**Files:**
- Create: `lib/renderMarkdown.ts`
- Create: `lib/export.ts`
- Create: `lib/backup.ts`
- Create: `tests/lib/backup.test.ts`

- [ ] **Step 1: Write backup tests**

```typescript
// tests/lib/backup.test.ts
import { describe, it, expect } from 'vitest'
import { createBackup, restoreBackup } from '@/lib/backup'
import type { Note } from '@/types'

const notes: Note[] = [
  { id: '1', title: 'Note A', content: 'enc-a', tags: ['#work'], createdAt: 1000, updatedAt: 2000 },
  { id: '2', title: 'Note B', content: 'enc-b', tags: [], createdAt: 3000, updatedAt: 4000 },
]

describe('backup', () => {
  it('createBackup returns BackupFile with version, exportedAt, salt, notes', async () => {
    const backup = await createBackup(notes, 'testpass')
    expect(backup.version).toBe(1)
    expect(backup.exportedAt).toBeGreaterThan(0)
    expect(typeof backup.salt).toBe('string')
    expect(typeof backup.notes).toBe('string')
  })

  it('createBackup includes a 32-byte salt', async () => {
    const backup = await createBackup(notes, 'testpass')
    expect(atob(backup.salt).length).toBe(32)
  })

  it('restoreBackup decrypts notes with correct password', async () => {
    const backup = await createBackup(notes, 'testpass')
    const restored = await restoreBackup(backup, 'testpass')
    expect(restored).toHaveLength(2)
    expect(restored[0].id).toBe('1')
    expect(restored[1].id).toBe('2')
  })

  it('restoreBackup throws with wrong password', async () => {
    const backup = await createBackup(notes, 'correct')
    await expect(restoreBackup(backup, 'wrong')).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm run test:run -- tests/lib/backup.test.ts
```
Expected: `Error: Cannot find module '@/lib/backup'`

- [ ] **Step 3: Create lib/backup.ts**

```typescript
// lib/backup.ts
import { generateSalt, deriveKey, encrypt, decrypt } from '@/lib/crypto'
import type { Note, BackupFile } from '@/types'

export async function createBackup(notes: Note[], password: string): Promise<BackupFile> {
  const salt = generateSalt()
  const key = await deriveKey(password, salt)
  return {
    version: 1,
    exportedAt: Date.now(),
    salt,
    notes: await encrypt(JSON.stringify(notes), key),
  }
}

export async function restoreBackup(backup: BackupFile, password: string): Promise<Note[]> {
  const key = await deriveKey(password, backup.salt)
  return JSON.parse(await decrypt(backup.notes, key)) as Note[]
}

export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `localnotes-backup-${new Date().toISOString().split('T')[0]}.localnotes`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readBackupFile(file: File): Promise<BackupFile> {
  return JSON.parse(await file.text()) as BackupFile
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm run test:run -- tests/lib/backup.test.ts
```
Expected: all PASS.

- [ ] **Step 5: Create lib/renderMarkdown.ts**

```typescript
// lib/renderMarkdown.ts
// Markdown → HTML string for PDF export (runs client-side via dynamic import)
export async function renderMarkdownToHTML(markdown: string): Promise<string> {
  const [
    { unified }, { default: remarkParse }, { default: remarkMath },
    { default: remarkRehype }, { default: rehypeKatex }, { default: rehypeStringify }
  ] = await Promise.all([
    import('unified'), import('remark-parse'), import('remark-math'),
    import('remark-rehype'), import('rehype-katex'), import('rehype-stringify'),
  ])
  const result = await unified()
    .use(remarkParse).use(remarkMath).use(remarkRehype)
    .use(rehypeKatex).use(rehypeStringify)
    .process(markdown)
  return String(result)
}
```

- [ ] **Step 6: Create lib/export.ts**

```typescript
// lib/export.ts
import { renderMarkdownToHTML } from './renderMarkdown'

export function exportToJSON(title: string, content: string): void {
  const blob = new Blob(
    [JSON.stringify({ title, content, exportedAt: Date.now() }, null, 2)],
    { type: 'application/json' }
  )
  dl(blob, `${safe(title)}.json`)
}

export async function exportToPDF(title: string, content: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'), import('html2canvas'),
  ])
  const html = await renderMarkdownToHTML(content)
  const container = document.createElement('div')
  container.style.cssText =
    'position:absolute;left:-9999px;top:0;width:800px;padding:40px;' +
    'background:white;color:#111;font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;'
  container.innerHTML = html
  document.body.appendChild(container)
  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save(`${safe(title)}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

function dl(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function safe(name: string): string {
  return name.replace(/[^a-z0-9\-_\s]/gi, '').trim().replace(/\s+/g, '-') || 'note'
}
```

- [ ] **Step 7: Run all tests**

```bash
npm run test:run
```
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/backup.ts lib/export.ts lib/renderMarkdown.ts tests/lib/backup.test.ts
git commit -m "feat: add backup, PDF export, and JSON export libraries"
```

---

### Task 13: Backup Modal

**Files:**
- Modify: `components/notes/BackupModal.tsx` (replace stub from Chunk 4)

- [ ] **Step 1: Replace BackupModal stub with full implementation**

```tsx
// components/notes/BackupModal.tsx
'use client'
import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCrypto } from '@/context/CryptoContext'
import { useNotes } from '@/context/NotesContext'
import { getAllNotes, saveNote } from '@/lib/storage'
import { createBackup, downloadBackup, readBackupFile, restoreBackup } from '@/lib/backup'

// Design note: exported notes have content that is already AES-256-GCM encrypted under the
// user's master key. The backup layer adds a second encryption with the backup password.
// Imported notes are stored as-is (still master-key-encrypted) — they are only readable
// on a device that knows the original master key. This is intentional: backups preserve
// the encrypted blobs verbatim, so the master key remains the only path to plaintext.
export function BackupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { key } = useCrypto()
  const { notes, createNote } = useNotes() // createNote used to trigger re-render after import
  const [exportPassword, setExportPassword] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    if (!exportPassword) { alert('Enter a password for the backup.'); return }
    const allNotes = await getAllNotes()
    const backup = await createBackup(allNotes, exportPassword)
    downloadBackup(backup)
    setExportPassword('')
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (!importPassword) { setImportError('Enter the backup password first.'); return }
    setLoading(true); setImportError(''); setImportSuccess('')
    try {
      const backup = await readBackupFile(file)
      const restored = await restoreBackup(backup, importPassword)
      let imported = 0, updated = 0
      for (const note of restored) {
        const exists = notes.some(n => n.id === note.id)
        await saveNote(note)
        if (exists) updated++; else imported++
      }
      setImportSuccess(`${imported} notes imported, ${updated} notes updated.`)
      setImportPassword('')
      // Reload the page to refresh NotesContext state from IndexedDB
      // (saveNote writes directly to IndexedDB, bypassing in-memory context state)
      window.location.reload()
    } catch {
      setImportError('Incorrect backup password or invalid file.')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-[#0a0a0a] border-[#1e1e1e] text-[#f0f0f0] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold">Backup / Restore</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">

          {/* Export */}
          <div>
            <p className="text-[10px] font-mono text-[#333] uppercase tracking-wider mb-2">Export</p>
            <p className="text-[11px] text-[#444] mb-3 leading-relaxed">
              Download an encrypted backup. Enter a password to encrypt it — this can differ from your master password.
            </p>
            <div className="flex gap-2">
              <Input type="password" placeholder="Backup password" value={exportPassword}
                onChange={e => setExportPassword(e.target.value)}
                className="bg-[#111] border-[#2a2a2a] text-[#f0f0f0] text-[12px] flex-1" />
              <Button onClick={handleExport}
                className="bg-[#f0f0f0] text-black hover:bg-white text-[12px] shrink-0">
                Download
              </Button>
            </div>
          </div>

          <div className="border-t border-[#1e1e1e]" />

          {/* Import */}
          <div>
            <p className="text-[10px] font-mono text-[#333] uppercase tracking-wider mb-2">Import</p>
            <p className="text-[11px] text-[#444] mb-3 leading-relaxed">
              Restore from a backup. Local notes absent from the backup are preserved. Notes with matching IDs are overwritten.
            </p>
            <div className="space-y-2">
              <Input type="password" placeholder="Backup password" value={importPassword}
                onChange={e => setImportPassword(e.target.value)}
                className="bg-[#111] border-[#2a2a2a] text-[#f0f0f0] text-[12px]" />
              <label className="flex items-center justify-center w-full border border-[#2a2a2a] rounded-[4px] py-2 text-[12px] text-[#444] hover:text-[#999] hover:border-[#444] transition-colors cursor-pointer">
                {loading ? 'Importing…' : 'Choose .localnotes file'}
                <input ref={fileRef} type="file" accept=".localnotes" className="hidden"
                  onChange={handleImportFile} disabled={loading} />
              </label>
            </div>
            {importError && <p className="text-[11px] text-red-400 mt-2">{importError}</p>}
            {importSuccess && <p className="text-[11px] text-green-500 mt-2">{importSuccess}</p>}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/notes/BackupModal.tsx
git commit -m "feat: add full backup export/import modal"
```

---

## Chunk 7: Landing Page

### Task 14: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace default app/page.tsx with landing page**

```tsx
// app/page.tsx
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
        {/* Replace src values with real screenshots placed in public/screenshots/ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['Editor view', '/screenshots/editor.png'],
            ['Preview & KaTeX', '/screenshots/preview.png'],
          ].map(([label, src]) => (
            <div key={label} className="border border-[#1e1e1e] rounded-[6px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="w-full object-cover bg-[#0a0a0a]"
                onError={e => (e.currentTarget.style.display = 'none')} />
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
```

- [ ] **Step 2: Test landing page**

```bash
npm run dev
```
Navigate to http://localhost:3000. Expected: hero, features grid, how-it-works, install guide, footer all render correctly.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add English landing page with features, how-it-works, install guide"
```

---

## Chunk 8: PWA Icons + Deploy

### Task 15: Final PWA config + production build

**Files:**
- Create: `public/icons/icon-192.png` (real icon)
- Create: `public/icons/icon-512.png` (real icon)

- [ ] **Step 1: Generate real PWA icons**

Option A — ImageMagick:
```bash
convert -size 192x192 xc:black \
  -fill white -font Helvetica-Bold -pointsize 64 \
  -gravity center -annotate 0 "ln" \
  public/icons/icon-192.png

convert -size 512x512 xc:black \
  -fill white -font Helvetica-Bold -pointsize 180 \
  -gravity center -annotate 0 "ln" \
  public/icons/icon-512.png
```

Option B — Use https://favicon.io/favicon-generator/:
- Text: `ln`, Background: #000000, Font color: #ffffff, Font size: large
- Download and place files at `public/icons/icon-192.png` and `public/icons/icon-512.png`

- [ ] **Step 2: Run all tests**

```bash
npm run test:run
```
Expected: all tests PASS.

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: build succeeds. Check for any TypeScript or lint errors and fix them.

- [ ] **Step 4: Fix any TypeScript errors from the build output**

Review the build output. Common issues:
- Missing component props (e.g. `Sidebar` now requires `searchInputRef` and `onOpenBackup`)
- Import paths with typos
Fix all TypeScript errors before proceeding.

- [ ] **Step 5: Re-run build to confirm it passes**

```bash
npm run build
```
Expected: clean build with no errors.

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```
Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
# Stage only relevant changes (icons + any TS fixes)
git status
git add public/icons/
# If Step 4 required source file changes, add those too, e.g.:
# git add components/notes/Sidebar.tsx components/notes/Preview.tsx
git commit -m "feat: add PWA icons and finalize production build"
```

---

### Task 16: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
gh repo create localnotes --public --source=. --push
# OR if repo exists:
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

Option A — Vercel CLI:
```bash
npx vercel --prod
```
Follow prompts. Framework auto-detected as Next.js.

Option B — Vercel dashboard:
1. Go to https://vercel.com/new
2. Import the GitHub repo
3. Click Deploy

- [ ] **Step 3: Verify PWA in production**

After deployment completes:
1. Open the Vercel URL in Chrome on mobile
2. Navigate to `/app` — verify auth flow works
3. Install the PWA (Add to Home Screen on iOS, install prompt on Chrome)
4. Enable airplane mode
5. Open the installed PWA — verify it loads and notes work fully offline
6. Verify `/` landing page renders with correct content

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: production-ready — PWA deployed to Vercel"
git push
```

---

*End of plan. All tests should pass before deployment.*
