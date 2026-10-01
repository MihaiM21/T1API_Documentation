"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { API_BASE } from "@/lib/catalog"

export type ApiState =
  | { phase: "loading" }
  | { phase: "up"; version: string; degraded: boolean }
  | { phase: "unknown" }

let cached: ApiState | null = null
let inflight: Promise<ApiState> | null = null

function isLocalHost(): boolean {
  const h = window.location.hostname
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]"
}

async function load(): Promise<ApiState> {
  if (cached && cached.phase !== "loading") return cached
  if (inflight) return inflight
  inflight = (async () => {
    // api.t1f1.com only allows CORS from the published docs origin, so a ping from
    // localhost always fails (and logs a browser error). Skip it in local dev.
    if (isLocalHost()) {
      cached = { phase: "unknown" }
      return cached
    }
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 6000)
    try {
      const res = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal, cache: "no-store" })
      const data = await res.json()
      const version = typeof data?.version === "string" ? data.version.slice(0, 16) : ""
      cached = version
        ? { phase: "up", version, degraded: data?.status !== "healthy" }
        : { phase: "unknown" }
    } catch {
      // Network blocked / CORS / API down — show a neutral state, never an error.
      cached = { phase: "unknown" }
    } finally {
      clearTimeout(t)
    }
    return cached!
  })()
  return inflight
}

/** Live status of api.t1f1.com, fetched once per page load and shared by every consumer. */
export function useApiState(): ApiState {
  const [state, setState] = useState<ApiState>(cached ?? { phase: "loading" })
  useEffect(() => {
    let alive = true
    load().then((s) => alive && setState(s))
    return () => {
      alive = false
    }
  }, [])
  return state
}

export function StatusDot({ state, className }: { state: ApiState; className?: string }) {
  const color =
    state.phase === "up"
      ? state.degraded
        ? "bg-[var(--yellow)]"
        : "bg-[var(--green)]"
      : "bg-muted-foreground/50"
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)} aria-hidden="true">
      {state.phase === "up" && !state.degraded && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--green)] animate-pulse-ring" />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)} />
    </span>
  )
}

export function ApiVersionBadge() {
  const state = useApiState()
  const label =
    state.phase === "up"
      ? state.degraded
        ? `API v${state.version} · degraded`
        : `API v${state.version} · operational`
      : state.phase === "loading"
        ? "Checking API…"
        : "api.t1f1.com"
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/70 backdrop-blur text-xs font-medium text-muted-foreground">
      <StatusDot state={state} />
      <span className="font-mono">{label}</span>
    </div>
  )
}
