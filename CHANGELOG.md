# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-15

### Added
- AES-256-GCM encryption for note content using Web Crypto API
- PBKDF2 key derivation (SHA-256, 310,000 iterations)
- Markdown editor with live preview
- KaTeX math rendering (inline and block)
- Syntax highlighting for code blocks (highlight.js)
- Tag-based organization with full-text search
- PDF export with multi-page support
- JSON export for plaintext backup
- Encrypted backup/restore (.localnotes files)
- Progressive Web App (PWA) with Serwist service worker
- 100% offline functionality after installation
- Dark and light mode with localStorage persistence
- Mobile responsive layout with collapsible sidebar
- Keyboard shortcuts (⌘N, ⌘K, ⌘P, ⌘/, ⌘⇧P, ⌘⇧B)
- Cross-platform shortcut support (⌘ on Mac, Ctrl on Windows/Linux)
- PWA install prompt button
- XSS protection via rehype-sanitize
- URL validation for markdown links
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (SoftwareApplication schema)
- robots.txt and sitemap.xml
- Capacitor support for native mobile builds (optional)
- GitHub Pages deployment via GitHub Actions
- Comprehensive README with screenshots
- CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- Issue and PR templates

### Security
- rehype-sanitize blocks malicious HTML in markdown rendering
- URL validation prevents javascript:, data:, vbscript: protocol attacks
- Non-extractable CryptoKey objects prevent key export from memory
- Note titles, tags, and timestamps stored unencrypted (documented trade-off)
