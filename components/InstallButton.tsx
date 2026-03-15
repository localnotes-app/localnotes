// components/InstallButton.tsx
'use client'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallButton() {
  const { canInstall, isInstalled, install } = useInstallPrompt()

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-border text-text-tertiary px-5 py-2.5 rounded-md text-[13px]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 7.5l3 3 5-6"/>
        </svg>
        Installed
      </span>
    )
  }

  if (!canInstall) return null

  return (
    <button
      onClick={install}
      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2v8M4 7l3 3 3-3M2 12h10"/>
      </svg>
      Install App
    </button>
  )
}
