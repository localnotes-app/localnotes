// hooks/useSwipeDismiss.ts
'use client'
import { useRef, useCallback, type RefObject } from 'react'

interface UseSwipeDismissOptions {
  onDismiss: () => void
  threshold?: number // minimum distance in px to trigger dismiss
  direction?: 'down' | 'up'
}

export function useSwipeDismiss<T extends HTMLElement>({
  onDismiss,
  threshold = 80,
  direction = 'down',
}: UseSwipeDismissOptions): {
  ref: RefObject<T | null>
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: () => void
  }
} {
  const ref = useRef<T>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
    const el = ref.current
    if (!el) return

    const delta = currentY.current - startY.current
    const shouldMove = direction === 'down' ? delta > 0 : delta < 0
    const absDelta = Math.abs(delta)

    if (shouldMove && absDelta > 10) {
      el.style.transform = `translateY(${delta}px)`
      el.style.opacity = `${Math.max(0, 1 - absDelta / (threshold * 2))}`
      el.style.transition = 'none'
    }
  }, [direction, threshold])

  const onTouchEnd = useCallback(() => {
    const el = ref.current
    if (!el) return

    const delta = currentY.current - startY.current
    const shouldDismiss = direction === 'down' ? delta > threshold : delta < -threshold

    if (shouldDismiss) {
      el.style.transform = `translateY(${direction === 'down' ? '100%' : '-100%'})`
      el.style.opacity = '0'
      el.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out'
      setTimeout(onDismiss, 200)
    } else {
      el.style.transform = ''
      el.style.opacity = ''
      el.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out'
    }
  }, [direction, threshold, onDismiss])

  return { ref, handlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
