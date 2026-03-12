// lib/backup.ts
import { generateSalt, deriveKey, encrypt, decrypt } from '@/lib/crypto'
import type { Note, BackupFile } from '@/types'

// Notes passed to createBackup should have PLAINTEXT content.
// The backup encrypts the entire Note[] with the backup password.
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

// Returns Note[] with PLAINTEXT content.
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
