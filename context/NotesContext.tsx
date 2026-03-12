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
  notes: Note[]
  plainContent: Record<string, string>
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
  const notesRef = useRef<Note[]>([])
  notesRef.current = notes

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
