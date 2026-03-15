// hooks/useKeyboardShortcuts.ts
'use client'
import { useEffect } from 'react'

export interface Shortcut {
  key: string
  meta?: boolean   // ⌘ on Mac, Ctrl on Windows/Linux (default: true)
  shift?: boolean  // ⇧ (default: false)
  alt?: boolean    // ⌥ (default: false)
  handler: () => void
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const mac = isMac()

    function onKeyDown(e: KeyboardEvent) {
      for (const s of shortcuts) {
        // meta defaults to true — use ⌘ on Mac, Ctrl on Windows/Linux
        const wantMeta = s.meta !== false
        const wantShift = s.shift === true
        const wantAlt = s.alt === true

        // Check the correct modifier key per platform
        const metaPressed = mac ? e.metaKey : e.ctrlKey
        const metaMatch = wantMeta ? metaPressed : !metaPressed
        const shiftMatch = wantShift ? e.shiftKey : !e.shiftKey
        const altMatch = wantAlt ? e.altKey : !e.altKey

        if (metaMatch && shiftMatch && altMatch && e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault()
          s.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
