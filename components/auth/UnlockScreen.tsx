// components/auth/UnlockScreen.tsx
'use client'
import { useState, useRef, useCallback } from 'react'
import { useCrypto } from '@/context/CryptoContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppIcon } from '@/components/AppIcon'

const LOCKOUT_THRESHOLDS = [
  { attempts: 3, delay: 2 },
  { attempts: 5, delay: 5 },
  { attempts: 8, delay: 15 },
  { attempts: 10, delay: 30 },
]

function getLockoutDelay(attempts: number): number {
  let delay = 0
  for (const t of LOCKOUT_THRESHOLDS) {
    if (attempts >= t.attempts) delay = t.delay
  }
  return delay
}

export function UnlockScreen() {
  const { unlock } = useCrypto()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const failedAttempts = useRef(0)

  const startCooldown = useCallback((seconds: number) => {
    setLocked(true)
    setCountdown(seconds)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setLocked(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (locked) return
    setError('')
    setLoading(true)
    const ok = await unlock(password)
    if (!ok) {
      failedAttempts.current++
      const delay = getLockoutDelay(failedAttempts.current)
      if (delay > 0) {
        setError(`Incorrect password. Please wait ${delay}s before trying again.`)
        startCooldown(delay)
      } else {
        setError('Incorrect password.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <AppIcon size={36} />
          <div>
            <h1 className="text-xl font-semibold text-foreground leading-tight">localnotes</h1>
            <p className="text-sm text-text-tertiary">Enter your password to unlock.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Unlock vault">
          <div>
            <label htmlFor="unlock-password" className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Password</label>
            <Input id="unlock-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Master password" autoFocus disabled={locked}
              aria-describedby={error ? 'unlock-error' : undefined}
              className="bg-surface-inset border-border text-foreground placeholder:text-text-muted" />
          </div>
          {error && <p id="unlock-error" className="text-[11px] text-destructive" role="alert">{error}</p>}
          {locked && countdown > 0 && (
            <p className="text-[11px] text-text-tertiary text-center" aria-live="polite">
              Retry in {countdown}s
            </p>
          )}
          <Button type="submit" disabled={loading || locked}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold">
            {loading ? 'Unlocking…' : locked ? `Locked (${countdown}s)` : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
