"use client"

import { useEffect } from "react"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Digest only — never log arbitrary error content to the console in production.
    if (error.digest) console.error("Docs render error", error.digest)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4">Something went wrong</p>
        <h1 className="font-display text-6xl font-extrabold uppercase leading-none tracking-tight">Box, box</h1>
        <p className="mt-5 text-muted-foreground leading-relaxed">
          This page hit a problem while loading. Try again — if it keeps happening, let us know.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-11 items-center justify-center px-6 bg-primary text-primary-foreground font-semibold text-sm plate hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
