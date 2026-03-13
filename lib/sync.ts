// lib/sync.ts
// File-based sync service for native (Capacitor) platforms.
// Uses the existing backup format for encrypted sync files.

import { createBackup, restoreBackup } from '@/lib/backup'
import { writeSyncFile, readSyncFile } from '@/lib/native-storage'
import type { Note, BackupFile } from '@/types'

const DEBOUNCE_MS = 30_000 // 30 seconds

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Debounced auto-save: writes an encrypted backup to the native Documents folder.
 * Call this after every note change. It debounces at 30s to avoid excessive writes.
 * The resulting file can be synced via iCloud Drive, Google Drive, Dropbox, etc.
 *
 * @param notes - Array of notes with PLAINTEXT content
 * @param password - Password to encrypt the sync file
 */
export function autoSave(notes: Note[], password: string): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      const backup = await createBackup(notes, password)
      await writeSyncFile(JSON.stringify(backup))
    } catch (err) {
      console.error('[sync] auto-save failed:', err)
    }
  }, DEBOUNCE_MS)
}

/** Force an immediate sync write (e.g. on app pause). */
export async function forceSave(notes: Note[], password: string): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  const backup = await createBackup(notes, password)
  await writeSyncFile(JSON.stringify(backup))
}

/**
 * Check for remote updates by reading the sync file and comparing timestamps.
 * Returns the remote BackupFile if it's newer than the given local timestamp,
 * or null if no update is available.
 */
export async function checkForUpdates(
  localTimestamp: number,
): Promise<BackupFile | null> {
  const raw = await readSyncFile()
  if (!raw) return null

  try {
    const remote = JSON.parse(raw) as BackupFile
    if (remote.exportedAt > localTimestamp) {
      return remote
    }
  } catch {
    console.error('[sync] Failed to parse sync file')
  }
  return null
}

/**
 * Merge remote notes into local notes using "last writer wins" per note (by updatedAt).
 * Notes present only in remote are added. Notes present only in local are kept.
 * Notes present in both: the one with the newer updatedAt wins.
 *
 * @param remote - Notes from the sync file (plaintext)
 * @param local - Current local notes (plaintext)
 * @returns Merged notes array
 */
export function mergeNotes(remote: Note[], local: Note[]): Note[] {
  const merged = new Map<string, Note>()

  // Start with all local notes
  for (const note of local) {
    merged.set(note.id, note)
  }

  // Merge remote notes — newer updatedAt wins
  for (const note of remote) {
    const existing = merged.get(note.id)
    if (!existing || note.updatedAt > existing.updatedAt) {
      merged.set(note.id, note)
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * Full sync cycle: check for remote updates, decrypt, merge, and return the result.
 * Returns null if no sync was needed.
 */
export async function performSync(
  localNotes: Note[],
  localTimestamp: number,
  syncPassword: string,
): Promise<{ merged: Note[]; remoteTimestamp: number } | null> {
  const remoteBackup = await checkForUpdates(localTimestamp)
  if (!remoteBackup) return null

  const remoteNotes = await restoreBackup(remoteBackup, syncPassword)
  const merged = mergeNotes(remoteNotes, localNotes)

  return { merged, remoteTimestamp: remoteBackup.exportedAt }
}
