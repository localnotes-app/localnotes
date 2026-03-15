// hooks/useEditorMode.ts
'use client'
import { useState, useEffect, useCallback } from 'react'

export type EditorMode = 'raw' | 'wysiwyg'

const STORAGE_KEY = 'localnotes:editor-mode'
const MOBILE_BREAKPOINT = 768

function isMobile(): boolean {
  if (typeof window === 'undefined') return true
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useEditorMode() {
  const [mode, setModeState] = useState<EditorMode>('raw')

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (isMobile()) {
      setModeState('raw')
      return
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'wysiwyg') setModeState('wysiwyg')
    } catch {
      // localStorage unavailable
    }
  }, [])

  // Force raw mode on resize to mobile
  useEffect(() => {
    function handleResize() {
      if (isMobile()) setModeState('raw')
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const setMode = useCallback((next: EditorMode) => {
    // Never allow WYSIWYG on mobile
    if (next === 'wysiwyg' && isMobile()) return
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const toggle = useCallback(() => {
    setMode(mode === 'raw' ? 'wysiwyg' : 'raw')
  }, [mode, setMode])

  return { mode, setMode, toggle, isMobile: isMobile() }
}
