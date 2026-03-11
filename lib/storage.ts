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
