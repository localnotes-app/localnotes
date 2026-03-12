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
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-[#f0f0f0] mb-1">localnotes</h1>
        <p className="text-sm text-[#555] mb-8">Enter your password to unlock.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-[#444] uppercase tracking-wider mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Master password" autoFocus
              className="bg-[#0a0a0a] border-[#1e1e1e] text-[#f0f0f0] placeholder:text-[#333]" />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <Button type="submit" disabled={loading}
            className="w-full bg-white text-black hover:bg-[#f0f0f0] font-semibold">
            {loading ? 'Unlocking…' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
