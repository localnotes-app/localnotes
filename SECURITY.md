# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in localnotes, please report it responsibly.

**Do not open a public issue.** Instead, please email or contact the maintainer privately.

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment:** Within 48 hours
- **Assessment:** Within 1 week
- **Fix:** As soon as possible, depending on severity

## Security Model

localnotes uses the following security measures:

- **AES-256-GCM** encryption for note content at rest
- **PBKDF2** key derivation (SHA-256, 310,000 iterations)
- **Web Crypto API** — native browser crypto, no external libraries
- **CryptoKey** objects are non-extractable (`extractable: false`)
- **No server communication** — all data stays on device
- **No password recovery** — by design, there is no backdoor

### What is encrypted

- Note **content** (Markdown) is encrypted at rest in IndexedDB
- Backup files (`.localnotes`) are fully encrypted

### What is NOT encrypted

- Note **titles** and **tags** are stored in plaintext (for sidebar display)
- Note **timestamps** (`createdAt`, `updatedAt`) are stored in plaintext

This is an intentional trade-off documented in the app's setup screen.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Dependencies

We regularly update dependencies to patch known vulnerabilities. If you notice an outdated dependency with a known CVE, please open an issue.
