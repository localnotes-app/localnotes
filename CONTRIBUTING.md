# Contributing to localnotes

Thank you for your interest in contributing to localnotes! This guide will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/localnotes-app/localnotes.git
cd localnotes

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** Tailwind CSS 4, shadcn/ui, Geist Fonts
- **Encryption:** Web Crypto API (AES-256-GCM, PBKDF2)
- **Storage:** IndexedDB via `idb`
- **PWA:** Serwist service worker
- **Tests:** Vitest + Testing Library

## Project Structure

```
app/          → Next.js routes (landing page + app)
components/   → React components (ui/ + notes/)
context/      → React context providers (Crypto, Notes)
lib/          → Core logic (crypto, storage, backup, export)
hooks/        → Custom React hooks
types/        → TypeScript types
tests/        → Vitest test files
public/       → Static assets (icons, SW)
```

## Making Changes

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feat/my-feature`
3. **Make your changes** and add tests if applicable
4. **Run tests:** `npm run test:run`
5. **Build:** `npm run build` (must succeed)
6. **Commit** with a descriptive message
7. **Push** and open a **Pull Request**

## Code Style

- TypeScript strict mode is enabled
- Use functional components with hooks
- Follow existing patterns in the codebase
- Keep components focused and small
- All crypto operations use the Web Crypto API — no external crypto libraries

## Commit Messages

Use descriptive commit messages:
- `feat: add dark mode toggle`
- `fix: correct encryption IV length`
- `docs: update installation guide`
- `test: add backup restore tests`

## Security

- **Never** store passwords or keys in plain text
- **Never** log decrypted content
- All encryption uses the Web Crypto API with `extractable: false` keys
- Report security issues privately — see [SECURITY.md](SECURITY.md)

## Questions?

Open an [issue](https://github.com/localnotes-app/localnotes/issues) for questions or suggestions.
