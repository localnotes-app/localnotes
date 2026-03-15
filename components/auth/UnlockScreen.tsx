// components/auth/UnlockScreen.tsx
'use client'
import { useState } from 'react'
import { useCrypto } from '@/context/CryptoContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UnlockScreen() {
  const { unlock } = useCrypto()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await unlock(password)
    if (!ok) { setError('Incorrect password.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground mb-1">localnotes</h1>
        <p className="text-sm text-text-tertiary mb-8">Enter your password to unlock.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Master password" autoFocus
              className="bg-surface-inset border-border text-foreground placeholder:text-text-muted" />
          </div>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold">
            {loading ? 'Unlocking…' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
