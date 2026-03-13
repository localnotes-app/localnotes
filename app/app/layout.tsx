// app/app/layout.tsx
'use client'
import { CryptoProvider } from '@/context/CryptoContext'
import { NotesProvider } from '@/context/NotesContext'
import { SyncProvider } from '@/context/SyncContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CryptoProvider>
      <NotesProvider>
        <SyncProvider>{children}</SyncProvider>
      </NotesProvider>
    </CryptoProvider>
  )
}
