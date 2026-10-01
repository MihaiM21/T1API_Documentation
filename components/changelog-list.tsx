"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { releases, releaseId, type ChangeType } from "@/lib/changelog"

const TYPES: Record<ChangeType, { label: string; cls: string }> = {
  new: { label: "New", cls: "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]" },
  improved: { label: "Improved", cls: "border-[var(--blue)]/30 bg-[var(--blue)]/10 text-[var(--blue)]" },
  fixed: { label: "Fixed", cls: "border-[var(--yellow)]/30 bg-[var(--yellow)]/10 text-[var(--yellow)]" },
  deprecated: { label: "Deprecated", cls: "border-[var(--purple)]/30 bg-[var(--purple)]/10 text-[var(--purple)]" },
  breaking: { label: "Breaking", cls: "border-primary/40 bg-primary/10 text-primary" },
}

export function ChangelogList() {
  const [filter, setFilter] = useState<ChangeType | "all">("all")

  const visible = useMemo(
    () =>
      releases
        .map((r) => ({ ...r, changes: filter === "all" ? r.changes : r.changes.filter((c) => c.type === filter) }))
        .filter((r) => r.changes.length > 0),
    [filter],
  )

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-8" role="group" aria-label="Filter changes by type">
        {(["all", "new", "improved", "fixed", "deprecated", "breaking"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            aria-pressed={filter === t}
            className={cn(
              "px-3 h-7 rounded-full text-xs border transition-colors",
              filter === t
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
            )}
          >
            {t === "all" ? "Everything" : TYPES[t].label}
          </button>
        ))}
      </div>

      <ol className="relative border-l border-border ml-2 space-y-12">
        {visible.map((r, idx) => {
          const id = releaseId(r.version)
          const latest = r.version === releases[0].version
          return (
            <li key={r.version} id={id} className="relative pl-7 scroll-mt-24">
              <span
                className={cn(
                  "absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 bg-background",
                  latest ? "border-primary" : "border-muted-foreground/50",
                )}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  <a href={`#${id}`} className="hover:text-primary transition-colors">
                    v{r.version}
                  </a>
                </h2>
                <time dateTime={r.iso} className="font-mono text-xs text-muted-foreground">
                  {r.date}
                </time>
                {latest && (
                  <span className="plate bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Latest</span>
                )}
              </div>
              <p className="text-[15px] text-muted-foreground mb-4">{r.summary}</p>
              <ul className="space-y-2.5">
                {r.changes.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span
                      className={cn(
                        "w-[5.5rem] shrink-0 text-center text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider mt-0.5",
                        TYPES[c.type].cls,
                      )}
                    >
                      {TYPES[c.type].label}
                    </span>
                    <span className="text-muted-foreground leading-relaxed min-w-0 break-words">
                      {c.text}
                      {c.href && (
                        <>
                          {" "}
                          <Link href={c.href} className="text-primary hover:underline whitespace-nowrap">
                            Docs →
                          </Link>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {idx === visible.length - 1 && null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
