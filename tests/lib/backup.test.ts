// @vitest-environment node
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
