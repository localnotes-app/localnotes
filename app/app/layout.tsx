// app/app/layout.tsx
'use client'
import { CryptoProvider } from '@/context/CryptoContext'
import { NotesProvider } from '@/context/NotesContext'
import { SyncProvider } from '@/context/SyncContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <CryptoProvider>
        <NotesProvider>
          <SyncProvider>{children}</SyncProvider>
        </NotesProvider>
      </CryptoProvider>
    </ErrorBoundary>
  )
}
