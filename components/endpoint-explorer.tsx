"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, FlaskConical, Image as ImageIcon, KeyRound, Braces, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FEATURES,
  GROUPS,
  endpointsOf,
  paramsOf,
  type Endpoint,
  type Feature,
  type GroupId,
} from "@/lib/catalog"
import { buildSnippets, initialValues } from "@/lib/snippets"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import { MethodBadge, ParamTable, Pill, RichText } from "@/components/doc-primitives"

type ResponseFilter = "all" | "png" | "json" | "open"

function matches(f: Feature, q: string): boolean {
  if (!q) return true
  const hay = [
    f.title,
    f.summary,
    f.stem,
    ...(f.details ?? []),
    ...(f.tags ?? []),
    ...(f.params ?? []).map((p) => p.name),
    f.applies ?? "",
  ]
    .join(" ")
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term))
}

function EndpointLine({ ep }: { ep: Endpoint }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <MethodBadge method={ep.method} />
      <code className="text-[12.5px] font-mono text-foreground truncate">{ep.path}</code>
      <span
        className={cn(
          "hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0",
          ep.response === "png"
            ? "border-[var(--purple)]/30 text-[var(--purple)] bg-[var(--purple)]/10"
            : "border-[var(--cyan)]/30 text-[var(--cyan)] bg-[var(--cyan)]/10",
        )}
      >
        {ep.response === "png" ? <ImageIcon className="h-2.5 w-2.5" aria-hidden="true" /> : <Braces className="h-2.5 w-2.5" aria-hidden="true" />}
        {ep.response === "png" ? "PNG" : "JSON"}
      </span>
    </div>
  )
}

function FeatureCard({
  f,
  open,
  onToggle,
}: {
  f: Feature
  open: boolean
  onToggle: () => void
}) {
  const eps = useMemo(() => endpointsOf(f), [f])
  const params = useMemo(() => paramsOf(f, "single"), [f])
  const snippets = useMemo(() => {
    const ep = eps[eps.length - 1] // prefer the JSON variant for code samples
    return buildSnippets(f, ep, initialValues(f, ep))
  }, [f, eps])
  const panelId = `panel-${f.id}`
  const noKey = f.auth === false

  return (
    <div
      id={f.id}
      className={cn(
        "scroll-mt-28 rounded-xl border bg-card transition-colors",
        open ? "border-primary/40" : "border-border hover:border-border/80",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-3 text-left px-4 py-3.5"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1.5">
            <h4 className="text-[15px] font-semibold text-foreground">{f.title}</h4>
            {f.tags?.map((t) => (
              <Pill key={t} tone="purple">
                {t}
              </Pill>
            ))}
            {noKey && (
              <Pill tone="green">
                <KeyRound className="h-2.5 w-2.5" aria-hidden="true" /> No key
              </Pill>
            )}
            {f.canvas && <Pill tone="blue">Social canvases</Pill>}
          </div>
          <p className="text-[13px] text-muted-foreground leading-snug mb-2.5">{f.summary}</p>
          <div className="space-y-1.5">
            {eps.map((ep) => (
              <EndpointLine key={ep.path} ep={ep} />
            ))}
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform", open && "rotate-180 text-primary")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={panelId} className="px-4 pb-5 pt-1 border-t border-border/70">
          <div className="pt-4 space-y-3">
            {f.details?.map((d, i) => (
              <p key={i} className="text-[13.5px] text-muted-foreground leading-relaxed">
                <RichText text={d} />
              </p>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 mb-4">
            {f.applies && <Pill>Works for: {f.applies}</Pill>}
            <Pill>
              {f.shape === "pair" ? "Plot: standard limit · Data: data limit" : f.limit === "public" ? "Public limit" : f.limit === "data" ? "Data rate limit" : "Standard limit"}
            </Pill>
            {f.returns && (
              <Pill className="font-mono normal-case">
                <span className="truncate max-w-[32rem]">{f.returns}</span>
              </Pill>
            )}
          </div>

          {params.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Parameters</p>
              <ParamTable params={params} />
            </>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Request</p>
          <TabCodeBlock tabs={snippets} />

          {f.example && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-5 mb-1">
                Example response <span className="normal-case tracking-normal font-normal">— illustrative values</span>
              </p>
              <CodeBlock language="json" filename={f.example.query ? `?${f.example.query}` : "response"} code={f.example.response} maxHeight={360} />
            </>
          )}

          {f.playground !== false && (
            <Link
              href={`/docs/playground?f=${f.id}`}
              className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              Try it in the playground
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export function EndpointExplorer() {
  const [query, setQuery] = useState("")
  const [group, setGroup] = useState<GroupId | "all">("all")
  const [kind, setKind] = useState<ResponseFilter>("all")
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const rootRef = useRef<HTMLDivElement>(null)

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Deep links: /docs/endpoints#lap-duel opens that card, #group-race scrolls to the group.
  useEffect(() => {
    const apply = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      if (FEATURES.some((f) => f.id === id)) {
        setGroup("all")
        setQuery("")
        setKind("all")
        setOpenIds((prev) => new Set(prev).add(id))
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }))
      } else if (id.startsWith("group-")) {
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }))
      }
    }
    apply()
    window.addEventListener("hashchange", apply)
    return () => window.removeEventListener("hashchange", apply)
  }, [])

  const filtered = useMemo(() => {
    return FEATURES.filter((f) => {
      if (group !== "all" && f.group !== group) return false
      if (!matches(f, query)) return false
      if (kind === "open") return f.auth === false
      if (kind === "png") return endpointsOf(f).some((e) => e.response === "png")
      if (kind === "json") return endpointsOf(f).some((e) => e.response === "json")
      return true
    })
  }, [query, group, kind])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: FEATURES.length }
    for (const f of FEATURES) c[f.group] = (c[f.group] ?? 0) + 1
    return c
  }, [])

  const filtering = query !== "" || group !== "all" || kind !== "all"

  return (
    <div ref={rootRef}>
      {/* Filter bar */}
      <div className="sticky top-14 z-20 -mx-4 md:-mx-8 xl:-mx-12 px-4 md:px-8 xl:px-12 py-3 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter endpoints — try “tyre”, “standings”, “lap”, “/api/v2/…”"
              aria-label="Filter endpoints"
              className="w-full h-10 pl-9 pr-9 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 self-start" role="group" aria-label="Response type">
            {(
              [
                ["all", "All"],
                ["png", "PNG"],
                ["json", "JSON"],
                ["open", "No key"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setKind(v)}
                aria-pressed={kind === v}
                className={cn(
                  "px-3 h-8 rounded-md text-xs font-medium transition-colors",
                  kind === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto mt-3 pb-0.5 -mb-0.5" role="group" aria-label="Endpoint groups">
          {[{ id: "all" as const, title: "All groups" }, ...GROUPS].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              aria-pressed={group === g.id}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs border transition-colors",
                group === g.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
              )}
            >
              {g.title}
              <span className="font-mono text-[10px] opacity-70">{counts[g.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 mb-2 text-xs text-muted-foreground">
        <span aria-live="polite">
          {filtered.length} feature{filtered.length === 1 ? "" : "s"}
          {filtering && " match"}
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            className="hover:text-foreground transition-colors"
            onClick={() => setOpenIds(new Set(filtered.map((f) => f.id)))}
          >
            Expand all
          </button>
          <button type="button" className="hover:text-foreground transition-colors" onClick={() => setOpenIds(new Set())}>
            Collapse all
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-foreground font-medium mb-1">Nothing matches that filter.</p>
          <p className="text-xs text-muted-foreground mb-4">Try a shorter search, or clear the filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setGroup("all")
              setKind("all")
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      {GROUPS.map((g) => {
        const items = filtered.filter((f) => f.group === g.id)
        if (items.length === 0) return null
        return (
          <section key={g.id} id={`group-${g.id}`} className="scroll-mt-44 mt-10 first:mt-4">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">{g.title}</h3>
                <p className="text-sm text-muted-foreground">{g.blurb}</p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                {String(items.length).padStart(2, "0")}
              </span>
            </div>
            <div className="space-y-2.5">
              {items.map((f) => (
                <FeatureCard key={f.id} f={f} open={openIds.has(f.id)} onToggle={() => toggle(f.id)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
