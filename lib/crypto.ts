// lib/crypto.ts
const PBKDF2_ITERATIONS = 310_000
const VERIFIER_PLAINTEXT = 'localnotes-ok'

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
}

export async function deriveKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const saltBytes = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0))
  const passwordBytes = new TextEncoder().encode(password)
  const importedKey = await crypto.subtle.importKey(
    'raw', passwordBytes, 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Returns Base64: [12-byte IV][AES-GCM ciphertext] */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), 12)
  return btoa(String.fromCharCode(...combined))
}

/** Decrypts a Base64 string produced by encrypt(). Throws if key is wrong. */
export async function decrypt(ciphertextBase64: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0))
  const plaintextBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: combined.slice(0, 12) },
    key,
    combined.slice(12)
  )
  return new TextDecoder().decode(plaintextBytes)
}

export async function createVerifier(key: CryptoKey): Promise<string> {
  return encrypt(VERIFIER_PLAINTEXT, key)
}

export async function verifyPassword(
  password: string,
  saltBase64: string,
  verifierBase64: string
): Promise<boolean> {
  try {
    const key = await deriveKey(password, saltBase64)
    return await decrypt(verifierBase64, key) === VERIFIER_PLAINTEXT
  } catch {
    return false
  }
}
