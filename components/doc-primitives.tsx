import { AlertTriangle, Info, Lightbulb, OctagonAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Param } from "@/lib/catalog"

export function DocH1({ id, children, eyebrow }: { id?: string; children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-2">
          <span className="h-px w-6 bg-primary" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h1
        id={id}
        className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground scroll-mt-24 uppercase leading-[0.95]"
      >
        {children}
      </h1>
    </div>
  )
}

export function DocLead({ children }: { children: React.ReactNode }) {
  return <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl text-pretty">{children}</p>
}

function Anchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a href={`#${id}`} className="group/a inline-flex items-center gap-2 hover:text-primary transition-colors">
      {children}
      <span
        aria-hidden="true"
        className="opacity-0 group-hover/a:opacity-100 text-primary/70 text-[0.7em] font-mono transition-opacity"
      >
        #
      </span>
    </a>
  )
}

export function DocH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-14 mb-4 scroll-mt-24 uppercase"
    >
      <Anchor id={id}>{children}</Anchor>
    </h2>
  )
}

export function DocH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-base md:text-lg font-semibold text-foreground mt-9 mb-3 scroll-mt-24">
      <Anchor id={id}>{children}</Anchor>
    </h3>
  )
}

export function DocP({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-muted-foreground leading-relaxed mb-4 text-[15px]", className)}>{children}</p>
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.84em] bg-secondary/80 border border-border text-[oklch(0.82_0.1_30)] px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

export type Method = "GET" | "POST" | "DELETE" | "PUT" | "PATCH"

export function MethodBadge({ method }: { method: Method }) {
  const colors: Record<Method, string> = {
    GET: "bg-[var(--green)]/12 text-[var(--green)] border-[var(--green)]/30",
    POST: "bg-[var(--blue)]/12 text-[var(--blue)] border-[var(--blue)]/30",
    DELETE: "bg-primary/12 text-primary border-primary/30",
    PUT: "bg-[var(--yellow)]/12 text-[var(--yellow)] border-[var(--yellow)]/30",
    PATCH: "bg-[var(--purple)]/12 text-[var(--purple)] border-[var(--purple)]/30",
  }
  return (
    <span
      className={cn(
        "inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0",
        colors[method],
      )}
    >
      {method}
    </span>
  )
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode
  tone?: "neutral" | "red" | "green" | "purple" | "yellow" | "blue" | "cyan"
  className?: string
}) {
  const tones = {
    neutral: "border-border bg-secondary/60 text-muted-foreground",
    red: "border-primary/30 bg-primary/10 text-primary",
    green: "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]",
    purple: "border-[var(--purple)]/30 bg-[var(--purple)]/10 text-[var(--purple)]",
    yellow: "border-[var(--yellow)]/30 bg-[var(--yellow)]/10 text-[var(--yellow)]",
    blue: "border-[var(--blue)]/30 bg-[var(--blue)]/10 text-[var(--blue)]",
    cyan: "border-[var(--cyan)]/30 bg-[var(--cyan)]/10 text-[var(--cyan)]",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EndpointCard({
  method,
  path,
  description,
}: {
  method: Method
  path: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-card mb-2.5 card-glow">
      <MethodBadge method={method} />
      <div className="flex-1 min-w-0">
        <code className="text-[13px] font-mono text-foreground break-all">{path}</code>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

/** Inline-code-ify `backticked` spans inside plain strings. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") && p.length > 2 ? (
          <code key={i} className="font-mono text-[0.92em] text-[oklch(0.82_0.1_30)]">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function ParamTable({ params }: { params: Array<Param & { required?: boolean }> }) {
  if (params.length === 0) return null
  return (
    <div className="rounded-lg border border-border overflow-hidden mb-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/70">
              {["Parameter", "Type", "Description"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="text-left px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {params.map((p, i) => (
              <tr key={p.name} className={cn("border-b border-border last:border-0 align-top", i % 2 !== 0 && "bg-secondary/20")}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <code className="text-xs font-mono text-primary">{p.name}</code>
                  {p.required && (
                    <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-primary/80" title="Required">
                      req
                    </span>
                  )}
                  {p.in && p.in !== "query" && (
                    <span className="ml-1.5 text-[9px] font-mono uppercase text-muted-foreground/70">{p.in}</span>
                  )}
                  {p.only && (
                    <span className="ml-1.5 text-[9px] font-mono uppercase text-[var(--cyan)]/80">{p.only} only</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <code className="text-xs font-mono text-muted-foreground">{p.type}</code>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground leading-relaxed min-w-[14rem]">
                  <RichText text={p.description} />
                  {p.options && (
                    <span className="block mt-1.5 space-x-1">
                      {p.options.map((o) => (
                        <code
                          key={o}
                          className="inline-block font-mono text-[10.5px] px-1.5 py-px rounded bg-secondary border border-border text-foreground/80"
                        >
                          {o}
                        </code>
                      ))}
                    </span>
                  )}
                  {p.default && (
                    <span className="block mt-1 text-muted-foreground/70">
                      Default: <code className="font-mono">{p.default}</code>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "tip" | "danger"
  title?: string
  children: React.ReactNode
}) {
  const styles = {
    info: { box: "border-[var(--blue)]/30 bg-[var(--blue)]/5", icon: "text-[var(--blue)]", Icon: Info, label: "Note" },
    warning: { box: "border-[var(--yellow)]/30 bg-[var(--yellow)]/5", icon: "text-[var(--yellow)]", Icon: AlertTriangle, label: "Heads up" },
    tip: { box: "border-[var(--green)]/30 bg-[var(--green)]/5", icon: "text-[var(--green)]", Icon: Lightbulb, label: "Tip" },
    danger: { box: "border-primary/40 bg-primary/5", icon: "text-primary", Icon: OctagonAlert, label: "Important" },
  }[variant]
  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border mb-6 text-sm", styles.box)} role="note">
      <styles.Icon className={cn("h-4 w-4 mt-0.5 shrink-0", styles.icon)} aria-hidden="true" />
      <div className="min-w-0">
        <p className={cn("font-semibold text-[11px] uppercase tracking-widest mb-1", styles.icon)}>{title ?? styles.label}</p>
        <div className="leading-relaxed text-[13.5px] text-foreground/85 [&_code]:text-[0.9em]">{children}</div>
      </div>
    </div>
  )
}

export function DataTable({
  headers,
  rows,
  mono = [0],
}: {
  headers: string[]
  rows: React.ReactNode[][]
  /** Column indexes rendered as code. */
  mono?: number[]
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/70">
              {headers.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="text-left px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={cn("border-b border-border last:border-0 align-top", i % 2 !== 0 && "bg-secondary/20")}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                    {mono.includes(j) && typeof cell === "string" ? (
                      <code className={cn("font-mono", j === 0 && "text-primary")}>{cell}</code>
                    ) : typeof cell === "string" ? (
                      <RichText text={cell} />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="relative space-y-7 my-6 ml-3 border-l border-border pl-8 list-none">{children}</ol>
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="relative">
      <span
        className="absolute -left-[2.85rem] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-primary/50 bg-background font-mono text-xs font-bold text-primary"
        aria-hidden="true"
      >
        {n}
      </span>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <div>{children}</div>
    </li>
  )
}

export function DocDivider() {
  return <hr className="border-border my-10" />
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[10px] border border-border rounded px-1.5 py-0.5 bg-secondary text-muted-foreground">
      {children}
    </kbd>
  )
}

/** A compact tyre-compound chip, used in examples and tables. */
export function Tyre({ c }: { c: "S" | "M" | "H" | "I" | "W" }) {
  const map = {
    S: "var(--tyre-soft)",
    M: "var(--tyre-medium)",
    H: "var(--tyre-hard)",
    I: "var(--tyre-inter)",
    W: "var(--tyre-wet)",
  }
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 text-[9px] font-black"
      style={{ borderColor: map[c], color: map[c] }}
    >
      {c}
    </span>
  )
}
