"use client"

import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"
import { V1_MAP } from "@/lib/catalog"
import { CodeBlock } from "@/components/code-block"

const DEMO =
  "https://api.t1f1.com/api/v1/track-comparison-2drivers-plot?year=2025&gp=1&session=Q&driver1=VER&driver2=HAM"

const RENAME_DRIVERS = /(track-comparison|throttle-brake-comparison|lap-time-analysis)/

interface Out {
  url?: string
  notes: string[]
  error?: string
}

function convert(input: string): Out {
  const raw = input.trim()
  if (!raw) return { notes: [] }
  let u: URL
  try {
    u = new URL(raw, "https://api.t1f1.com")
  } catch {
    return { notes: [], error: "That doesn't look like a URL or path." }
  }
  const path = u.pathname.replace(/\/+$/, "")
  if (!path.startsWith("/api/v1/")) {
    return { notes: [], error: "Paste a /api/v1/… URL (or just the path)." }
  }
  const params = new URLSearchParams(u.search)
  const notes: string[] = []

  // Season routes carry the year in the path.
  const season = path.match(/^\/api\/v1\/season\/(\d{4})(?:\/(drivers|teams|driver|team)(?:\/([^/]+))?)?$/)
  if (season) {
    const [, year, kind, who] = season
    if (!kind) return { notes: [], error: "No single replacement — compose /api/v2/seasons/{year}/events with /api/static/drivers and /api/static/teams." }
    const base = kind.startsWith("driver") ? "drivers" : "teams"
    const v2 = `https://api.t1f1.com/api/static/${base}${who ? `/${encodeURIComponent(who)}` : ""}?year=${year}`
    notes.push("Reference data now comes from /api/static, which needs no API key. It covers 2025–2026 only.")
    if (kind === "driver") notes.push("V1 took a driver code; the static endpoint matches by driver name (e.g. Verstappen).")
    return { url: v2, notes }
  }

  const hit = V1_MAP.find((m) => m.v1 === path)
  if (!hit) return { notes: [], error: "Unknown V1 route — check it against the table below." }
  if (!hit.v2) return { notes: [hit.note ?? "No replacement."], error: "This V1 route has no V2 equivalent." }

  if (RENAME_DRIVERS.test(hit.v2)) {
    const d1 = params.get("driver1")
    const d2 = params.get("driver2")
    params.delete("driver1")
    params.delete("driver2")
    if (d1) params.set("d1", d1)
    if (d2) params.set("d2", d2)
    notes.push("Two-driver params renamed: driver1/driver2 → d1/d2 (required in V2, no defaults).")
  }
  if (hit.v2.includes("laptimes-distribution") && !params.get("driver")) {
    params.set("driver", "VER")
    notes.push("`driver` is required in V2 — set a driver code.")
  }
  if (hit.note) notes.push(hit.note.replace(/`/g, ""))
  if (hit.v2.endsWith("-plot")) notes.push("Bonus: V2 plots may accept `format=story|portrait|square|landscape`.")
  const q = params.toString()
  return { url: `https://api.t1f1.com${hit.v2}${q ? `?${q}` : ""}`, notes }
}

export function V1Converter() {
  const [input, setInput] = useState(DEMO)
  const out = useMemo(() => convert(input), [input])

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 my-6">
      <label htmlFor="v1-in" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        Paste a V1 URL
      </label>
      <input
        id="v1-in"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={600}
        spellCheck={false}
        autoComplete="off"
        className="w-full h-10 px-3 rounded-md bg-background border border-border text-[13px] font-mono focus:border-primary/60 focus:outline-none"
        placeholder="/api/v1/top-speed-data?year=2025&gp=1&session=Q"
      />
      <div className="flex items-center gap-2 my-3 text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <ArrowRight className="h-4 w-4 text-primary" />
        <span className="h-px flex-1 bg-border" />
      </div>
      {out.url && <CodeBlock language="text" filename="V2 equivalent" className="!my-0" code={out.url} />}
      {out.error && (
        <p role="alert" className="text-sm text-[var(--yellow)]">
          {out.error}
        </p>
      )}
      {out.notes.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground list-disc pl-5">
          {out.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
