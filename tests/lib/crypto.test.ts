// tests/lib/crypto.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  generateSalt,
  deriveKey,
  encrypt,
  decrypt,
  createVerifier,
  verifyPassword,
} from '@/lib/crypto'

describe('generateSalt', () => {
  it('returns a 32-byte Base64 string', () => {
    const salt = generateSalt()
    const bytes = atob(salt)
    expect(bytes.length).toBe(32)
  })

  it('returns different values each call', () => {
    expect(generateSalt()).not.toBe(generateSalt())
  })
})

describe('deriveKey', () => {
  it('derives a non-extractable AES-GCM CryptoKey', async () => {
    const key = await deriveKey('test-password', generateSalt())
    expect(key).toBeInstanceOf(CryptoKey)
    expect(key.type).toBe('secret')
    expect(key.usages).toContain('encrypt')
    expect(key.usages).toContain('decrypt')
    expect(key.extractable).toBe(false)
  })

  it('same password + salt round-trips through encrypt/decrypt', async () => {
    const salt = generateSalt()
    const key1 = await deriveKey('password', salt)
    const key2 = await deriveKey('password', salt)
    const ciphertext = await encrypt('hello', key1)
    expect(await decrypt(ciphertext, key2)).toBe('hello')
  })

  it('different passwords cannot decrypt each other', async () => {
    const salt = generateSalt()
    const key1 = await deriveKey('password-a', salt)
    const key2 = await deriveKey('password-b', salt)
    const ciphertext = await encrypt('secret', key1)
    await expect(decrypt(ciphertext, key2)).rejects.toThrow()
  })
})

describe('encrypt / decrypt', () => {
  it('round-trips plaintext including unicode', async () => {
    const key = await deriveKey('test', generateSalt())
    const original = 'Hello 🔐 — localnotes $E=mc^2$'
    expect(await decrypt(await encrypt(original, key), key)).toBe(original)
  })

  it('produces different ciphertext each call (random IV)', async () => {
    const key = await deriveKey('test', generateSalt())
    const c1 = await encrypt('same', key)
    const c2 = await encrypt('same', key)
    expect(c1).not.toBe(c2)
  })

  it('ciphertext is a valid Base64 string', async () => {
    const key = await deriveKey('test', generateSalt())
    const result = await encrypt('test', key)
    expect(() => atob(result)).not.toThrow()
  })
})

describe('createVerifier / verifyPassword', () => {
  it('verifies correct password', async () => {
    const salt = generateSalt()
    const key = await deriveKey('mypassword', salt)
    const verifier = await createVerifier(key)
    expect(await verifyPassword('mypassword', salt, verifier)).toBe(true)
  })

  it('rejects wrong password', async () => {
    const salt = generateSalt()
    const key = await deriveKey('mypassword', salt)
    const verifier = await createVerifier(key)
    expect(await verifyPassword('wrongpassword', salt, verifier)).toBe(false)
  })
})
