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
