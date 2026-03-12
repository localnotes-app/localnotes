// app/app/page.tsx
'use client'
import { useCrypto } from '@/context/CryptoContext'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { UnlockScreen } from '@/components/auth/UnlockScreen'

export default function AppPage() {
  const { isSetup, isUnlocked, isLoading } = useCrypto()
  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-[11px] font-mono text-[#333]">loading…</span>
    </div>
  )
  if (!isSetup) return <SetupScreen />
  if (!isUnlocked) return <UnlockScreen />
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-[11px] font-mono text-[#444]">App shell coming soon…</p>
    </div>
  )
}
