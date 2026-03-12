// app/app/layout.tsx
'use client'
import { CryptoProvider } from '@/context/CryptoContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <CryptoProvider>{children}</CryptoProvider>
}
