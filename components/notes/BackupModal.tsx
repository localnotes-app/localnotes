// components/notes/BackupModal.tsx
'use client'
import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCrypto } from '@/context/CryptoContext'
import { useNotes } from '@/context/NotesContext'
import { getAllNotes, saveNote } from '@/lib/storage'
import { createBackup, downloadBackup, readBackupFile, restoreBackup } from '@/lib/backup'

// Design note: exported notes have content that is already AES-256-GCM encrypted under the
// user's master key. The backup layer adds a second encryption with the backup password.
// Imported notes are stored as-is (still master-key-encrypted) — they are only readable
// on a device that knows the original master key. This is intentional: backups preserve
// the encrypted blobs verbatim, so the master key remains the only path to plaintext.
export function BackupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { key } = useCrypto()
  const { notes } = useNotes()
  const [exportPassword, setExportPassword] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    if (!exportPassword) { alert('Enter a password for the backup.'); return }
    const allNotes = await getAllNotes()
    const backup = await createBackup(allNotes, exportPassword)
    downloadBackup(backup)
    setExportPassword('')
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (!importPassword) { setImportError('Enter the backup password first.'); return }
    setLoading(true); setImportError(''); setImportSuccess('')
    try {
      const backup = await readBackupFile(file)
      const restored = await restoreBackup(backup, importPassword)
      let imported = 0, updated = 0
      for (const note of restored) {
        const exists = notes.some(n => n.id === note.id)
        await saveNote(note)
        if (exists) updated++; else imported++
      }
      setImportSuccess(`${imported} notes imported, ${updated} notes updated.`)
      setImportPassword('')
      // Reload the page to refresh NotesContext state from IndexedDB
      // (saveNote writes directly to IndexedDB, bypassing in-memory context state)
      window.location.reload()
    } catch {
      setImportError('Incorrect backup password or invalid file.')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-[#0a0a0a] border-[#1e1e1e] text-[#f0f0f0] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold">Backup / Restore</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">

          {/* Export */}
          <div>
            <p className="text-[10px] font-mono text-[#333] uppercase tracking-wider mb-2">Export</p>
            <p className="text-[11px] text-[#444] mb-3 leading-relaxed">
              Download an encrypted backup. Enter a password to encrypt it — this can differ from your master password.
            </p>
            <div className="flex gap-2">
              <Input type="password" placeholder="Backup password" value={exportPassword}
                onChange={e => setExportPassword(e.target.value)}
                className="bg-[#111] border-[#2a2a2a] text-[#f0f0f0] text-[12px] flex-1" />
              <Button onClick={handleExport}
                className="bg-[#f0f0f0] text-black hover:bg-white text-[12px] shrink-0">
                Download
              </Button>
            </div>
          </div>

          <div className="border-t border-[#1e1e1e]" />

          {/* Import */}
          <div>
            <p className="text-[10px] font-mono text-[#333] uppercase tracking-wider mb-2">Import</p>
            <p className="text-[11px] text-[#444] mb-3 leading-relaxed">
              Restore from a backup. Local notes absent from the backup are preserved. Notes with matching IDs are overwritten.
            </p>
            <div className="space-y-2">
              <Input type="password" placeholder="Backup password" value={importPassword}
                onChange={e => setImportPassword(e.target.value)}
                className="bg-[#111] border-[#2a2a2a] text-[#f0f0f0] text-[12px]" />
              <label className="flex items-center justify-center w-full border border-[#2a2a2a] rounded-[4px] py-2 text-[12px] text-[#444] hover:text-[#999] hover:border-[#444] transition-colors cursor-pointer">
                {loading ? 'Importing…' : 'Choose .localnotes file'}
                <input ref={fileRef} type="file" accept=".localnotes" className="hidden"
                  onChange={handleImportFile} disabled={loading} />
              </label>
            </div>
            {importError && <p className="text-[11px] text-red-400 mt-2">{importError}</p>}
            {importSuccess && <p className="text-[11px] text-green-500 mt-2">{importSuccess}</p>}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
