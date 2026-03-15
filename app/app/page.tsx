// app/app/page.tsx
'use client'
import { useCrypto } from '@/context/CryptoContext'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { UnlockScreen } from '@/components/auth/UnlockScreen'
import { AppShell } from '@/components/notes/AppShell'

export default function AppPage() {
  const { isSetup, isUnlocked, isLoading } = useCrypto()
  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="text-[11px] font-mono text-text-muted">loading…</span>
    </div>
  )
  if (!isSetup) return <SetupScreen />
  if (!isUnlocked) return <UnlockScreen />
  return <AppShell />
}
