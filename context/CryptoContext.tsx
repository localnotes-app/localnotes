// context/CryptoContext.tsx
'use client'
import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode
} from 'react'
import { deriveKey, createVerifier, verifyPassword, generateSalt } from '@/lib/crypto'
import { initDB, getConfig, saveConfig } from '@/lib/storage'
import type { AppConfig } from '@/types'

interface CryptoContextValue {
  key: CryptoKey | null
  isSetup: boolean
  isUnlocked: boolean
  isLoading: boolean
  setup: (password: string) => Promise<void>
  unlock: (password: string) => Promise<boolean>
  lock: () => void
}

const CryptoContext = createContext<CryptoContextValue | null>(null)

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initDB().then(() => getConfig()).then(cfg => {
      if (cfg) setConfig(cfg)
      setIsLoading(false)
    })
  }, [])

  const setup = useCallback(async (password: string) => {
    const salt = generateSalt()
    const derivedKey = await deriveKey(password, salt)
    const verifier = await createVerifier(derivedKey)
    const cfg: AppConfig = { salt, verifier, setupComplete: true }
    await saveConfig(cfg)
    setConfig(cfg)
    setKey(derivedKey)
  }, [])

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (!config) return false
    const valid = await verifyPassword(password, config.salt, config.verifier)
    if (!valid) return false
    setKey(await deriveKey(password, config.salt))
    return true
  }, [config])

  const lock = useCallback(() => setKey(null), [])

  return (
    <CryptoContext.Provider value={{
      key,
      isSetup: !!config?.setupComplete,
      isUnlocked: key !== null,
      isLoading,
      setup,
      unlock,
      lock,
    }}>
      {children}
    </CryptoContext.Provider>
  )
}

export function useCrypto(): CryptoContextValue {
  const ctx = useContext(CryptoContext)
  if (!ctx) throw new Error('useCrypto must be inside CryptoProvider')
  return ctx
}
