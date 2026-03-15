// components/ErrorBoundary.tsx
'use client'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto text-destructive">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h2>
            <p className="text-sm text-text-tertiary mb-6">
              An unexpected error occurred. Your encrypted data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Reload app
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-[11px] text-text-muted cursor-pointer hover:text-text-tertiary">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-surface-inset rounded-md text-[10px] font-mono text-text-tertiary overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
