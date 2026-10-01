import type { Metadata } from "next"
import Link from "next/link"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { V1Converter } from "@/components/v1-converter"
import { Callout, DataTable, DocH1, DocH2, DocLead, DocP, InlineCode, Pill } from "@/components/doc-primitives"
import { V1_MAP, V1_SUNSET } from "@/lib/catalog"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Migrating from V1",
  description: "Route-by-route map from the deprecated /api/v1 endpoints to /api/v2, with a URL converter.",
}

const toc = [
  { id: "timeline", label: "Timeline", level: 1 as const },
  { id: "changes", label: "What changes", level: 1 as const },
  { id: "converter", label: "URL converter", level: 1 as const },
  { id: "map", label: "Route map", level: 1 as const },
  { id: "detect", label: "Detect V1 usage", level: 1 as const },
]

export default function MigrationPage() {
  const { prev, next } = neighbours("/docs/migration")
  return (
    <DocsPageWrapper toc={toc} prev={prev} next={next}>
      <DocH1 eyebrow="Guides">Migrating from V1</DocH1>
      <DocLead>
        V1 (<InlineCode>/api/v1</InlineCode>, built on FastF1) still works, but it&apos;s deprecated and will be retired. Almost everything has a direct V2
        replacement — usually just a path change.
      </DocLead>

      <section id="timeline" className="scroll-mt-24">
        <DocH2 id="timeline">Timeline</DocH2>
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          {[
            { tone: "green" as const, t: "Now", d: "V1 keeps answering. Every response carries Deprecation and Sunset headers, and Swagger marks each route deprecated." },
            { tone: "yellow" as const, t: "Before sunset", d: "Move calls to V2 using the map below. V2 falls back to the V1 data source automatically, so older sessions still resolve." },
            { tone: "red" as const, t: V1_SUNSET, d: "Sunset date announced in the Sunset header. Plan to be off V1 before then." },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-border bg-card p-4">
              <Pill tone={s.tone} className="mb-2">{s.t}</Pill>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="changes" className="scroll-mt-24">
        <DocH2 id="changes">What changes</DocH2>
        <DataTable
          headers={["", "V1", "V2"]}
          mono={[]}
          rows={[
            ["Paths", "`/api/v1/throttleBrake-comparison-2drivers-plot`", "`/api/v2/throttle-brake-comparison-plot` — kebab-case, `-2drivers` dropped"],
            ["Two-driver params", "`driver1`, `driver2` (default VER / HAM)", "`d1`, `d2` — required, no defaults. (Lap & corner duels use `driver1`/`driver2`.)"],
            ["gp", "Round number `1`–`24`", "Round number, event key **or** official name"],
            ["Lap times", "`driver` optional, default `VER`", "`/laptimes-distribution-data` — `driver` required"],
            ["Top speed", "One endpoint", "`top-speed-telemetry` (CarData) and `top-speed-st` (speed trap)"],
            ["Seasons", "`/api/v1/season/{year}/…` from stored data", "`/api/static/*` (no key, 2025–2026) and `/api/v2/seasons/{year}/events`"],
            ["Extras", "—", "Social canvases (`format=`), CSV (`?format=csv`), ETag caching, batch, discovery"],
          ]}
        />
        <Callout variant="tip">
          The simple endpoints (top speed, throttle, qualifying, pace, stints) return closely matching shapes, so often you can swap the URL and keep your parsing code. Compare one response first — for example, V1 lap times use <code>lap_numbers</code> where V2 uses <code>lap_number</code>.
        </Callout>
      </section>

      <section id="converter" className="scroll-mt-24">
        <DocH2 id="converter">URL converter</DocH2>
        <DocP>Paste a V1 URL and get its V2 equivalent, with the parameter renames applied. Nothing leaves your browser.</DocP>
        <V1Converter />
      </section>

      <section id="map" className="scroll-mt-24">
        <DocH2 id="map">Route map</DocH2>
        <div className="rounded-lg border border-border overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/70">
                  {["V1 route", "V2 replacement", "Notes"].map((h) => (
                    <th key={h} scope="col" className="text-left px-4 py-2.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {V1_MAP.map((m, i) => (
                  <tr key={m.v1} className={`border-b border-border last:border-0 align-top ${i % 2 ? "bg-secondary/20" : ""}`}>
                    <td className="px-4 py-2.5">
                      <code className="text-[12px] font-mono text-muted-foreground line-through decoration-primary/60">{m.v1}</code>
                    </td>
                    <td className="px-4 py-2.5">
                      {m.v2 ? (
                        <code className="text-[12px] font-mono text-[var(--green)]">{m.v2}</code>
                      ) : (
                        <Pill tone="neutral">No replacement</Pill>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground leading-relaxed">{m.note ? m.note.replace(/`/g, "") : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground">
          New to V2? Start at the <Link href="/docs/endpoints" className="text-primary hover:underline">endpoint reference</Link>.
        </p>
      </section>

      <section id="detect" className="scroll-mt-24">
        <DocH2 id="detect">Detect V1 usage</DocH2>
        <DocP>
          Every V1 response includes RFC 8594 headers. Log them in your HTTP client so nothing is left behind:
        </DocP>
        <CodeBlock
          language="http"
          code={`Deprecation: true
Sunset: Sun, 01 Sep 2027 00:00:00 GMT`}
        />
        <CodeBlock
          language="python"
          code={`r = requests.get(url, headers=headers, timeout=60)
if r.headers.get("Deprecation"):
    logger.warning("T1API V1 endpoint in use: %s (sunset %s)", url, r.headers.get("Sunset"))`}
        />
      </section>
    </DocsPageWrapper>
  )
}
