// app/app/layout.tsx
'use client'
import { CryptoProvider } from '@/context/CryptoContext'
import { NotesProvider } from '@/context/NotesContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CryptoProvider>
      <NotesProvider>{children}</NotesProvider>
    </CryptoProvider>
  )
}
