// lib/native-storage.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const SYNC_DIR = 'localnotes'
const SYNC_FILE = 'localnotes-sync.localnotes'

export async function writeSyncFile(data: string): Promise<void> {
  await Filesystem.writeFile({
    path: `${SYNC_DIR}/${SYNC_FILE}`,
    data,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  })
}

export async function readSyncFile(): Promise<string | null> {
  try {
    const result = await Filesystem.readFile({
      path: `${SYNC_DIR}/${SYNC_FILE}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    })
    return result.data as string
  } catch {
    return null // File does not exist
  }
}

export async function getSyncFileTimestamp(): Promise<number | null> {
  try {
    const info = await Filesystem.stat({
      path: `${SYNC_DIR}/${SYNC_FILE}`,
      directory: Directory.Documents,
    })
    return info.mtime ?? null
  } catch {
    return null
  }
}
