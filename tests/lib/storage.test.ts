// tests/lib/storage.test.ts
// @vitest-environment node
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
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
