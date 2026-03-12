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
