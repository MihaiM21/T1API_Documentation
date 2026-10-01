"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, Download, Eye, EyeOff, Loader2, Play, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { API_BASE, FEATURES, GROUPS, endpointsOf, paramsOf, type Endpoint, type Feature, type Param } from "@/lib/catalog"
import { buildSnippets, buildUrl, initialValues } from "@/lib/snippets"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import { MethodBadge, Pill } from "@/components/doc-primitives"

const PLAYABLE = FEATURES.filter((f) => f.playground !== false)
const MAX_RENDER_CHARS = 250_000
const TIMEOUT_MS = 90_000

interface Result {
  status: number
  statusText: string
  ms: number
  contentType: string
  bytes: number
  headers: Array<[string, string]>
  kind: "json" | "csv" | "png" | "text"
  text?: string
  truncated?: boolean
  blobUrl?: string
  url: string
}

const SHOWN_HEADERS = [
  "content-type",
  "cache-control",
  "etag",
  "retry-after",
  "deprecation",
  "sunset",
  "content-disposition",
  "x-request-id",
]

const STATUS_HELP: Record<number, string> = {
  400: "A parameter is malformed or out of range. The `detail` field says which.",
  401: "No API key was sent. Paste a key above (or pick an endpoint that doesn't need one).",
  403: "That key isn't valid, or lacks the privileges for this route.",
  404: "No such session / entity. The body may list valid_rounds or suggestions.",
  429: "You're rate limited. Wait a moment and retry — see Rate limits.",
  502: "The upstream F1 feed returned an error. Try again shortly.",
  503: "Data isn't published yet, or an upstream source is down. Honour Retry-After and retry.",
}

function ParamField({
  p,
  value,
  onChange,
}: {
  p: Param
  value: string
  onChange: (v: string) => void
}) {
  const id = `pg-${p.name}`
  const isBool = p.type === "boolean"
  const base =
    "w-full h-9 px-2.5 rounded-md bg-background border border-border text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
        <span className="font-mono">{p.name}</span>
        {p.required && <span className="text-[9px] font-bold uppercase text-primary">req</span>}
        {p.only && <span className="text-[9px] font-mono uppercase text-[var(--cyan)]/80">{p.only}</span>}
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/70">{p.type}</span>
      </label>
      {isBool || p.options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          {!p.required && <option value="">{p.default ? `default (${p.default})` : "— not set —"}</option>}
          {(isBool ? ["true", "false"] : p.options!).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={p.default ? `default ${p.default}` : p.required ? "required" : "optional"}
          className={base}
          autoComplete="off"
          spellCheck={false}
          maxLength={120}
          inputMode={p.type === "integer" ? "numeric" : undefined}
        />
      )}
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground/80">{p.description.replace(/`/g, "")}</p>
    </div>
  )
}

export function Playground() {
  const search = useSearchParams()
  const initialId = search.get("f")
  const initialFeature = PLAYABLE.find((f) => f.id === initialId) ?? PLAYABLE.find((f) => f.id === "qualifying-results")!

  const [featureId, setFeatureId] = useState(initialFeature.id)
  const feature: Feature = PLAYABLE.find((f) => f.id === featureId) ?? initialFeature
  const eps = useMemo(() => endpointsOf(feature), [feature])
  const [variant, setVariant] = useState<Endpoint["variant"]>(eps[0].variant)
  const ep = eps.find((e) => e.variant === variant) ?? eps[0]

  const params = useMemo(() => paramsOf(feature, ep.variant).filter((p) => p.in !== "body"), [feature, ep.variant])
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(feature, eps[0]))
  const [csv, setCsv] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const blobRef = useRef<string | null>(null)

  // Switching feature resets the form to sensible values.
  const selectFeature = useCallback((id: string) => {
    const f = PLAYABLE.find((x) => x.id === id)
    if (!f) return
    const e = endpointsOf(f)
    setFeatureId(id)
    setVariant(e[0].variant)
    setValues(initialValues(f, e[0]))
    setCsv(false)
    setResult(null)
    setError(null)
    const url = new URL(window.location.href)
    url.searchParams.set("f", id)
    window.history.replaceState(null, "", url.toString())
  }, [])

  // Changing plot/data variant keeps matching values but drops params that no longer apply.
  const selectVariant = (v: Endpoint["variant"]) => {
    setVariant(v)
    setCsv(false)
    const allowed = new Set(paramsOf(feature, v).map((p) => p.name))
    setValues((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => allowed.has(k))))
  }

  useEffect(
    () => () => {
      abortRef.current?.abort()
      if (blobRef.current) URL.revokeObjectURL(blobRef.current)
    },
    [],
  )

  const canCsv = ep.response === "json" && feature.stem !== "/api/v2/telemetry/laps-data" && ep.method === "GET" && !ep.path.startsWith("/api/static") && ep.path !== "/" && ep.path !== "/api/health" && ep.path !== "/api/test/ping"
  const effectiveValues = useMemo(() => (csv && canCsv ? { ...values, format: "csv" } : values), [values, csv, canCsv])
  const url = buildUrl(ep, effectiveValues)
  const missing = params.filter((p) => p.required && !values[p.name]?.trim())
  const needsKey = ep.auth && !apiKey.trim()
  const snippets = useMemo(() => buildSnippets(feature, ep, effectiveValues), [feature, ep, effectiveValues])

  const send = async () => {
    setError(null)
    if (missing.length) {
      setError(`Fill in the required parameter${missing.length > 1 ? "s" : ""}: ${missing.map((m) => m.name).join(", ")}.`)
      return
    }
    // Defence in depth: only ever call the API origin, and only paths that exist in the catalog.
    const target = new URL(url)
    if (target.origin !== API_BASE) {
      setError("Refusing to send: target is not the T1API origin.")
      return
    }

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    setLoading(true)
    setResult(null)
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current)
      blobRef.current = null
    }

    const t0 = performance.now()
    try {
      const res = await fetch(target.toString(), {
        method: ep.method,
        signal: ctrl.signal,
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: apiKey.trim() ? { "X-API-Key": apiKey.trim() } : undefined,
      })
      const ms = Math.round(performance.now() - t0)
      const contentType = res.headers.get("content-type") ?? ""
      const headers = SHOWN_HEADERS.flatMap((h) => {
        const v = res.headers.get(h)
        return v ? ([[h, v]] as Array<[string, string]>) : []
      })
      const base = { status: res.status, statusText: res.statusText, ms, contentType, headers, url: target.toString() }

      if (contentType.startsWith("image/")) {
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        blobRef.current = blobUrl
        setResult({ ...base, kind: "png", bytes: blob.size, blobUrl })
      } else {
        const raw = await res.text()
        const isJson = contentType.includes("json")
        const isCsv = contentType.includes("csv")
        let text = raw
        if (isJson) {
          try {
            text = JSON.stringify(JSON.parse(raw), null, 2)
          } catch {
            /* show raw */
          }
        }
        const truncated = text.length > MAX_RENDER_CHARS
        setResult({
          ...base,
          kind: isCsv ? "csv" : isJson ? "json" : "text",
          bytes: new Blob([raw]).size,
          text: truncated ? text.slice(0, MAX_RENDER_CHARS) : text,
          truncated,
        })
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setError(ctrl.signal.aborted && performance.now() - t0 >= TIMEOUT_MS - 50 ? "The request timed out." : "Request cancelled.")
      } else {
        setError(
          "The browser couldn't complete the request. This is usually CORS (the API only allows known origins) or a network issue. Copy the curl command below to run it from your terminal instead.",
        )
      }
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  const download = () => {
    if (!result) return
    const name = ep.path.split("/").filter(Boolean).pop() ?? "response"
    const a = document.createElement("a")
    if (result.blobUrl) {
      a.href = result.blobUrl
      a.download = `${name}.png`
    } else {
      const blob = new Blob([result.text ?? ""], { type: result.kind === "csv" ? "text/csv" : "application/json" })
      a.href = URL.createObjectURL(blob)
      a.download = `${name}.${result.kind === "csv" ? "csv" : "json"}`
      setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    }
    a.click()
  }

  const ok = result ? result.status >= 200 && result.status < 300 : false

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      {/* ───────────── Request builder ───────────── */}
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div>
            <label htmlFor="pg-feature" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Endpoint
            </label>
            <select
              id="pg-feature"
              value={featureId}
              onChange={(e) => selectFeature(e.target.value)}
              className="w-full h-10 px-2.5 rounded-md bg-background border border-border text-sm focus:border-primary/60 focus:outline-none"
            >
              {GROUPS.map((g) => {
                const list = PLAYABLE.filter((f) => f.group === g.id)
                if (!list.length) return null
                return (
                  <optgroup key={g.id} label={g.title}>
                    {list.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground leading-snug">{feature.summary}</p>
          </div>

          {eps.length > 1 && (
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Response</span>
              <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg border border-border bg-background" role="group" aria-label="Response type">
                {eps.map((e) => (
                  <button
                    key={e.variant}
                    type="button"
                    onClick={() => selectVariant(e.variant)}
                    aria-pressed={variant === e.variant}
                    className={cn(
                      "h-8 rounded-md text-xs font-medium transition-colors",
                      variant === e.variant ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {e.response === "png" ? "PNG plot" : "JSON data"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3.5">
            {params.map((p) => (
              <ParamField
                key={`${featureId}-${p.name}`}
                p={p}
                value={values[p.name] ?? ""}
                onChange={(v) => setValues((prev) => ({ ...prev, [p.name]: v }))}
              />
            ))}
          </div>

          {canCsv && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={csv} onChange={(e) => setCsv(e.target.checked)} className="accent-[var(--primary)]" />
              Return CSV instead of JSON <code className="font-mono text-[10.5px]">?format=csv</code>
            </label>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <label htmlFor="pg-key" className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            API key
            {!ep.auth && <Pill tone="green">not needed here</Pill>}
          </label>
          <div className="relative">
            <input
              id="pg-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="t1_live_…"
              className="w-full h-10 pl-2.5 pr-10 rounded-md bg-background border border-border text-sm font-mono focus:border-primary/60 focus:outline-none"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore
              maxLength={200}
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--green)] mt-px" aria-hidden="true" />
            <span>
              Your key stays in this tab&apos;s memory. It is sent only to{" "}
              <code className="font-mono">api.t1f1.com</code> in the <code className="font-mono">X-API-Key</code> header, never
              stored, logged or placed in a URL — and it&apos;s gone when you close or reload the page.
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={send}
          disabled={loading || needsKey}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Sending…" : needsKey ? "Add an API key to send" : "Send request"}
        </button>
      </div>

      {/* ───────────── Response ───────────── */}
      <div className="space-y-4 min-w-0">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <MethodBadge method={ep.method} />
            <code className="text-[12.5px] font-mono text-foreground break-all">{url}</code>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex gap-3 p-4 rounded-lg border border-primary/40 bg-primary/5 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <p className="leading-relaxed text-foreground/90">{error}</p>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm">Waiting for the API…</p>
            <p className="text-xs text-center max-w-sm">
              The first request for a session can take a few seconds while it&apos;s generated; repeats are served from cache.
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="rounded-xl border border-border bg-card overflow-hidden" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 border-b border-border bg-secondary/40 text-xs">
              <span className={cn("font-mono font-bold", ok ? "text-[var(--green)]" : result.status >= 500 ? "text-primary" : "text-[var(--yellow)]")}>
                {result.status} {result.statusText}
              </span>
              <span className="text-muted-foreground font-mono">{result.ms} ms</span>
              <span className="text-muted-foreground font-mono">{(result.bytes / 1024).toFixed(result.bytes > 10240 ? 0 : 1)} KB</span>
              <button type="button" onClick={download} className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
              </button>
            </div>

            {!ok && STATUS_HELP[result.status] && (
              <p className="px-4 py-3 text-xs text-muted-foreground border-b border-border">{STATUS_HELP[result.status].replace(/`/g, "")}</p>
            )}

            {result.headers.length > 0 && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 px-4 py-3 border-b border-border text-[11px] font-mono">
                {result.headers.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-foreground/90 break-all">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {result.kind === "png" && result.blobUrl && (
              <div className="p-3 bg-[oklch(0.08_0_0)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.blobUrl} alt={`${feature.title} plot returned by the API`} className="w-full h-auto rounded-md" />
              </div>
            )}
            {result.kind !== "png" && (
              <div>
                <CodeBlock
                  className="!my-0 !border-0 !rounded-none"
                  language={result.kind === "json" ? "json" : "text"}
                  filename={result.contentType.split(";")[0] || "response"}
                  code={result.text ?? ""}
                  maxHeight={560}
                />
                {result.truncated && (
                  <p className="px-4 py-2 text-[11px] text-[var(--yellow)] border-t border-border">
                    Response truncated for display — use Download for the full payload.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Ready when you are</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Pick an endpoint, tweak the parameters, add your key and send. Plots render inline; JSON is pretty-printed.
            </p>
          </div>
        )}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Run it anywhere</p>
          <TabCodeBlock tabs={snippets} />
        </div>
      </div>
    </div>
  )
}
