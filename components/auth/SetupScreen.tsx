// components/auth/SetupScreen.tsx
'use client'
import { useState } from 'react'
import { useCrypto } from '@/context/CryptoContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SetupScreen() {
  const { setup } = useCrypto()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!acknowledged) { setError('Please acknowledge the warning below.'); return }
    setLoading(true)
    try {
      await setup(password)
    } catch {
      setError('Setup failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground mb-1">localnotes</h1>
        <p className="text-sm text-text-tertiary mb-8">Set a master password to encrypt your notes.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters" autoFocus
              className="bg-surface-inset border-border text-foreground placeholder:text-text-muted" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Confirm Password</label>
            <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="bg-surface-inset border-border text-foreground placeholder:text-text-muted" />
          </div>
          <div className="flex items-start gap-3 pt-1">
            <input type="checkbox" id="ack" checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)} className="mt-0.5 accent-primary" />
            <label htmlFor="ack" className="text-[11px] text-text-tertiary leading-relaxed">
              I understand there is <span className="text-text-secondary">no password recovery</span>.
              Forgotten password = permanent data loss. Note titles and tags are stored
              unencrypted; only note content is encrypted.
            </label>
          </div>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold">
            {loading ? 'Setting up…' : 'Create Vault'}
          </Button>
        </form>
      </div>
    </div>
  )
}
