import type { Metadata } from "next"
import Link from "next/link"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import { Callout, DataTable, DocDivider, DocH1, DocH2, DocH3, DocLead, DocP, InlineCode, Pill } from "@/components/doc-primitives"
import { CANVAS_FORMATS, FEATURES, SESSIONS } from "@/lib/catalog"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Concepts",
  description: "How T1API addresses sessions, formats responses, caches, reports errors and versions its endpoints.",
}

const toc = [
  { id: "sessions", label: "Sessions & identifiers", level: 1 as const },
  { id: "gp", label: "The gp parameter", level: 2 as const },
  { id: "session-codes", label: "Session codes", level: 2 as const },
  { id: "drivers", label: "Drivers & teams", level: 2 as const },
  { id: "applicability", label: "Which session for which feature", level: 2 as const },
  { id: "formats", label: "Plots, JSON & CSV", level: 1 as const },
  { id: "csv", label: "CSV export", level: 2 as const },
  { id: "canvases", label: "Social canvases", level: 1 as const },
  { id: "caching", label: "Caching & ETags", level: 1 as const },
  { id: "freshness", label: "Freshness & first requests", level: 2 as const },
  { id: "errors", label: "Errors & retries", level: 1 as const },
  { id: "error-envelope", label: "The error envelope", level: 2 as const },
  { id: "retry", label: "What to retry", level: 2 as const },
  { id: "versioning", label: "Versioning", level: 1 as const },
]

const canvasPlots = FEATURES.filter((f) => f.canvas && f.shape === "pair")

export default function ConceptsPage() {
  const { prev, next } = neighbours("/docs/concepts")
  return (
    <DocsPageWrapper toc={toc} prev={prev} next={next}>
      <DocH1 eyebrow="Fundamentals">Concepts</DocH1>
      <DocLead>
        Six ideas explain almost everything about how T1API behaves. Read this once and the endpoint reference will feel familiar.
      </DocLead>

      {/* ───────────── Sessions ───────────── */}
      <section id="sessions" className="scroll-mt-24">
        <DocH2 id="sessions">Sessions &amp; identifiers</DocH2>
        <DocP>
          Most analyses describe one session and take the same three parameters. Learn them once:
        </DocP>
        <CodeBlock language="bash" code={`?year=2025&gp=1&session=Q`} />

        <DocH3 id="gp">The gp parameter</DocH3>
        <DocP>
          In V2, <InlineCode>gp</InlineCode> is deliberately flexible. All three of these address the same event:
        </DocP>
        <DataTable
          headers={["Form", "Example", "Notes"]}
          mono={[1]}
          rows={[
            ["Round number", "gp=1", "Position in that season's calendar."],
            ["Event key", "gp=1254", "F1's numeric meeting id, from the events endpoint."],
            ["Official name", "gp=Italian Grand Prix", "Case-insensitive; URL-encode spaces as %20 or +."],
          ]}
        />
        <Callout variant="tip">
          Not sure of the round or name? Call <Link href="/docs/endpoints#season-events" className="text-primary hover:underline">Season events</Link>,
          then <Link href="/docs/endpoints#season-event-sessions" className="text-primary hover:underline">Event sessions</Link> to see exactly which sessions
          a weekend has — sprint weekends have a different set.
        </Callout>

        <DocH3 id="session-codes">Session codes</DocH3>
        <DocP>Short codes and long names are interchangeable, and matching is case-insensitive.</DocP>
        <DataTable
          headers={["Code", "Long name", "Meaning"]}
          mono={[0, 1]}
          rows={SESSIONS.map((s) => [s.code, s.long, s.meaning])}
        />
        <Callout variant="info">
          On sprint weekends, <InlineCode>Q</InlineCode> returns the Grand Prix qualifying and <InlineCode>SQ</InlineCode> the sprint qualifying — they
          are never mixed up.
        </Callout>

        <DocH3 id="drivers">Drivers &amp; teams</DocH3>
        <DocP>
          Drivers are identified by their three-letter code (TLA) — <InlineCode>VER</InlineCode>, <InlineCode>NOR</InlineCode>,{" "}
          <InlineCode>LEC</InlineCode> — case-insensitive. Get the full grid, with team colours and numbers, from{" "}
          <Link href="/docs/endpoints#static-drivers" className="text-primary hover:underline">/api/static/drivers</Link>. Two-driver endpoints name their
          parameters <InlineCode>d1</InlineCode>/<InlineCode>d2</InlineCode> or <InlineCode>driver1</InlineCode>/<InlineCode>driver2</InlineCode>; the
          reference page for each one says which.
        </DocP>

        <DocH3 id="applicability">Which session for which feature</DocH3>
        <DocP>Every feature states where it works. The short version:</DocP>
        <DataTable
          headers={["Kind", "Sessions", "Examples"]}
          mono={[]}
          rows={[
            [<Pill key="a" tone="green">Any session</Pill>, "FP1–FP3, Q, SQ, S, R", "Top speed, lap duel, corner duel, track map, full lap data"],
            [<Pill key="b" tone="blue">Practice & qualifying</Pill>, "FP1–FP3, Q, SQ", "Track evolution"],
            [<Pill key="c" tone="purple">Qualifying only</Pill>, "Q, SQ", "Theoretical best, sector gap to pole"],
            [<Pill key="d" tone="red">Race only</Pill>, "S, R", "Position changes, race gaps, tyre degradation, pit strategy, race story, pace heatmap"],
          ]}
        />
        <p className="text-[13px] text-muted-foreground mb-6">
          Ask a race-only feature about a qualifying session and expect an error response rather than a chart. To see what&apos;s
          available for a specific session, use{" "}
          <Link href="/docs/endpoints#session-availability" className="text-primary hover:underline">session availability</Link>.
        </p>
      </section>

      <DocDivider />

      {/* ───────────── Formats ───────────── */}
      <section id="formats" className="scroll-mt-24">
        <DocH2 id="formats">Plots, JSON &amp; CSV</DocH2>
        <DocP>
          Most features come as a matched pair that share the same parameters and the same underlying computation:
        </DocP>
        <DataTable
          headers={["Suffix", "Returns", "Content-Type", "Rate-limit bucket"]}
          mono={[0, 2]}
          rows={[
            ["-plot", "A rendered, branded PNG chart", "image/png", "Standard"],
            ["-data", "The numbers behind the chart as JSON", "application/json", "Data (60/min)"],
          ]}
        />
        <DocP>
          JSON keys keep their natural names — some are title-cased with units (<InlineCode>Top Speed (km/h)</InlineCode>), others are snake_case. The{" "}
          <Link href="/docs/schemas" className="text-primary hover:underline">response schemas</Link> page lists the real shapes.
        </DocP>

        <DocH3 id="csv">CSV export</DocH3>
        <DocP>
          Add <InlineCode>?format=csv</InlineCode> to any JSON endpoint under <InlineCode>/api/v1</InlineCode> or <InlineCode>/api/v2</InlineCode> and you get the same
          payload as a CSV download with a <InlineCode>Content-Disposition</InlineCode> filename.
        </DocP>
        <CodeBlock
          language="bash"
          code={`curl "https://api.t1f1.com/api/v2/race-gaps-data?year=2025&gp=1&session=R&format=csv" \\
  -H "X-API-Key: $T1_API_KEY" --output race-gaps.csv`}
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-muted-foreground mb-4">
          <li>
            <strong className="text-foreground">Nested series are expanded to long format.</strong> A payload that nests a <InlineCode>laps</InlineCode> array under each driver
            becomes one row per lap with the driver columns repeated — exactly what a DataFrame wants.
          </li>
          <li>
            <strong className="text-foreground">Non-tabular payloads are refused, not mangled.</strong> Endpoints with no natural row shape (the dashboard, for example) return{" "}
            <InlineCode>400</InlineCode> instead of a half-flattened file.
          </li>
          <li>
            Without the parameter, responses are unchanged. <InlineCode>format</InlineCode> on a <em>plot</em> means a social canvas (below), and{" "}
            <InlineCode>/telemetry/laps-data</InlineCode> uses its own <InlineCode>format=frames|columnar</InlineCode>.
          </li>
        </ul>
        <TabCodeBlock
          tabs={[
            {
              label: "pandas",
              language: "python",
              code: `import io, os, requests, pandas as pd

r = requests.get(
    "https://api.t1f1.com/api/v2/race-gaps-data",
    params={"year": 2025, "gp": 1, "session": "R", "format": "csv"},
    headers={"X-API-Key": os.environ["T1_API_KEY"]},
    timeout=60,
)
r.raise_for_status()
df = pd.read_csv(io.StringIO(r.text))
print(df.groupby("driver")["gap_s"].mean().sort_values().head())`,
            },
          ]}
        />
      </section>

      <DocDivider />

      {/* ───────────── Canvases ───────────── */}
      <section id="canvases" className="scroll-mt-24">
        <DocH2 id="canvases">Social canvases</DocH2>
        <DocP>
          A chart that looks great at 16:9 is unreadable squeezed into 9:16 — the data ends up under the platform&apos;s buttons. So plots that support it{" "}
          <strong className="text-foreground">re-compose</strong> for each format rather than cropping: new layout, larger fonts, and a safe area that stays clear of the UI
          overlays on Stories, Reels, Shorts and TikTok.
        </DocP>
        <DataTable
          headers={["format=", "Size", "Ratio", "Good for"]}
          mono={[0, 1, 2]}
          rows={CANVAS_FORMATS.map((c) => [c.name, c.size, c.ratio, c.use])}
        />
        <DocP>Omit <InlineCode>format</InlineCode> for the classic image the dashboards use. An unknown value returns <InlineCode>400</InlineCode>.</DocP>
        <Callout variant="info" title="Fallbacks are always classic">
          If a plot has to fall back to the FastF1 source because live timing has no data, the fallback image is always the classic one, whatever{" "}
          <InlineCode>format</InlineCode> asked for.
        </Callout>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Plots that accept format</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {canvasPlots.map((f) => (
            <Link key={f.id} href={`/docs/endpoints#${f.id}`}>
              <Pill tone="blue" className="hover:bg-[var(--blue)]/20 transition-colors text-xs py-1 px-2.5">
                {f.title}
              </Pill>
            </Link>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground">
          The season and career radars take <InlineCode>portrait=true</InlineCode> instead (a 4:5 crop), and lap duel adds{" "}
          <InlineCode>hero=true</InlineCode> for driver headshots.
        </p>
      </section>

      <DocDivider />

      {/* ───────────── Caching ───────────── */}
      <section id="caching" className="scroll-mt-24">
        <DocH2 id="caching">Caching &amp; ETags</DocH2>
        <DocP>
          A session that has finished never changes, so historical responses are cached aggressively and tell your client so:
        </DocP>
        <DataTable
          headers={["Response", "Cache-Control", "Validator"]}
          mono={[1]}
          rows={[
            ["Finished-session JSON (V1/V2)", "private, max-age=86400, immutable", "Weak ETag"],
            ["Latest-session dashboard, live standings", "private, max-age=30, must-revalidate", "Weak ETag"],
            ["PNG plots", "Served from disk with their own validators", "—"],
          ]}
        />
        <DocP>
          <InlineCode>private</InlineCode> is intentional: responses are gated by your API key, so a shared CDN or proxy must not hand one caller&apos;s payload to another.
          Browsers and your own server-side HTTP cache are fine.
        </DocP>
        <DocP>Replay the ETag with <InlineCode>If-None-Match</InlineCode> and an unchanged response costs a <InlineCode>304</InlineCode> instead of a body:</DocP>
        <CodeBlock
          language="bash"
          code={`# first call — note the ETag header
curl -i "https://api.t1f1.com/api/v2/driver-pace-data?year=2025&gp=1&session=R" -H "X-API-Key: $T1_API_KEY"
#   ETag: W/"9b1c6f…"

# later — send it back
curl -i "https://api.t1f1.com/api/v2/driver-pace-data?year=2025&gp=1&session=R" \\
  -H "X-API-Key: $T1_API_KEY" -H 'If-None-Match: W/"9b1c6f…"'
#   HTTP/1.1 304 Not Modified`}
        />

        <DocH3 id="freshness">Freshness &amp; first requests</DocH3>
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-muted-foreground mb-4">
          <li>
            <strong className="text-foreground">The first request for a session can be slow.</strong> The analysis is generated on demand, then stored. Every later request is
            served from cache — and common ones are pre-generated after sessions finish.
          </li>
          <li>
            <strong className="text-foreground">Just-finished sessions.</strong> Until upstream publishes the data you get <InlineCode>503</InlineCode> with <InlineCode>Retry-After</InlineCode> —
            not a 404. See below.
          </li>
          <li>
            <strong className="text-foreground">Not everything is immutable.</strong> <InlineCode>/api/v2/dashboard</InlineCode> follows the latest session, and{" "}
            <InlineCode>/api/v2/standings/*/live</InlineCode> skips the cache entirely.
          </li>
        </ul>
      </section>

      <DocDivider />

      {/* ───────────── Errors ───────────── */}
      <section id="errors" className="scroll-mt-24">
        <DocH2 id="errors">Errors &amp; retries</DocH2>

        <DocH3 id="error-envelope">The error envelope</DocH3>
        <DocP>
          Every handled error shares one JSON shape, so you only need one parser. Quote the <InlineCode>request_id</InlineCode> when you contact support.
        </DocP>
        <CodeBlock
          language="json"
          code={`{
  "detail": "Invalid API key",
  "request_id": "3f2a9c14",
  "timestamp": "2026-09-02T10:15:30.123456+00:00"
}`}
        />
        <DataTable
          headers={["Status", "When", "Retry?"]}
          mono={[0]}
          rows={[
            ["400", "A parameter is malformed or out of range (bad session, unknown format, too many batch items…).", "No — fix the request"],
            ["401", "API key missing.", "No"],
            ["403", "API key invalid, revoked, or not allowed.", "No"],
            ["404", "The session or entity doesn't exist.", "No — use the suggestions"],
            ["429", "Rate limit exceeded for your tier.", "Yes, after backing off"],
            ["502", "The upstream F1 feed returned an error.", "Yes"],
            ["503", "Data isn't published yet, or an upstream source is down.", "Yes, after Retry-After"],
            ["500", "Unhandled server error.", "Once or twice, then report it"],
          ]}
        />
        <p className="text-sm font-semibold text-foreground mb-2">Richer session errors</p>
        <DocP>Endpoints addressed by year / gp / session add fields that let you self-correct:</DocP>
        <TabCodeBlock
          tabs={[
            {
              label: "404 session_not_found",
              language: "json",
              code: `{
  "error": "session_not_found",
  "detail": "No round 99 in the 2025 schedule",
  "year": 2025, "gp": 99, "session": "Q",
  "valid_rounds": [1, 2, 3, 4, 5],
  "suggestions": ["Bahrain Grand Prix"],
  "request_id": "3f2a9c14",
  "timestamp": "2026-09-02T10:15:30.123456+00:00"
}`,
            },
            {
              label: "503 data_not_available",
              language: "json",
              code: `// Retry-After: 300
{
  "error": "data_not_available",
  "detail": "Session data has not been published yet",
  "year": 2025, "gp": 1, "session": "Q",
  "sources_tried": ["fastf1", "livetiming"],
  "retry_after_seconds": 300,
  "request_id": "3f2a9c14",
  "timestamp": "2026-09-02T10:15:30.123456+00:00"
}`,
            },
            {
              label: "503 upstream_unavailable",
              language: "json",
              code: `// Retry-After: 60
{
  "error": "upstream_unavailable",
  "detail": "Live timing is not responding",
  "source": "livetiming",
  "retry_after_seconds": 60,
  "request_id": "3f2a9c14",
  "timestamp": "2026-09-02T10:15:30.123456+00:00"
}`,
            },
          ]}
        />

        <DocH3 id="retry">What to retry</DocH3>
        <Callout variant="info" title="Why 503 and not 404?">
          A scheduled session whose data simply hasn&apos;t been published yet is a <em>temporary</em> condition, so you get <InlineCode>503 + Retry-After</InlineCode> (try later) rather than{" "}
          <InlineCode>404</InlineCode> (this will never exist). That distinction is what makes polling for a freshly finished session safe to automate.
        </Callout>
        <DocP>A retry loop that does the right thing — honours <InlineCode>Retry-After</InlineCode>, backs off on <InlineCode>429</InlineCode>, and never retries a client error:</DocP>
        <TabCodeBlock
          tabs={[
            {
              label: "Python",
              language: "python",
              code: `import os, time, requests

RETRY_STATUS = {429, 502, 503}

def t1_get(path, params=None, attempts=5):
    for n in range(attempts):
        r = requests.get(
            f"https://api.t1f1.com{path}",
            params=params,
            headers={"X-API-Key": os.environ["T1_API_KEY"]},
            timeout=90,
        )
        if r.status_code not in RETRY_STATUS:
            r.raise_for_status()          # 4xx: fix the request, don't retry
            return r
        wait = float(r.headers.get("Retry-After", 2 ** n))
        time.sleep(min(wait, 600))
    raise RuntimeError(f"gave up after {attempts} attempts: {r.status_code}")`,
            },
            {
              label: "JavaScript",
              language: "js",
              code: `const RETRY = new Set([429, 502, 503])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function t1Get(path, params = {}, attempts = 5) {
  const url = new URL(path, "https://api.t1f1.com")
  url.search = new URLSearchParams(params)
  let res
  for (let n = 0; n < attempts; n++) {
    res = await fetch(url, { headers: { "X-API-Key": process.env.T1_API_KEY } })
    if (!RETRY.has(res.status)) {
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`) // 4xx: don't retry
      return res
    }
    const wait = Number(res.headers.get("retry-after")) || 2 ** n
    await sleep(Math.min(wait, 600) * 1000)
  }
  throw new Error(\`gave up after \${attempts} attempts: \${res.status}\`)
}`,
            },
          ]}
        />
      </section>

      <DocDivider />

      {/* ───────────── Versioning ───────────── */}
      <section id="versioning" className="scroll-mt-24">
        <DocH2 id="versioning">Versioning</DocH2>
        <DataTable
          headers={["", "V2 — /api/v2", "V1 — /api/v1"]}
          mono={[]}
          rows={[
            ["Status", <Pill key="s2" tone="green">Current</Pill>, <Pill key="s1" tone="red">Deprecated · sunset 2027-09-01</Pill>],
            ["Primary source", "F1 live-timing feed", "FastF1"],
            ["gp", "Round, event key or name", "Round number 1–24 only"],
            ["Two-driver params", "d1 / d2 (or driver1 / driver2 on duels)", "driver1 / driver2"],
            ["Coverage", "Everything in the endpoint reference", "A small fixed subset"],
          ]}
        />
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-muted-foreground mb-4">
          <li>
            <strong className="text-foreground">Transparent fallback.</strong> V2 tries live timing first and falls back to the V1 source when it lacks data (for an integer round), and vice versa — the
            response shape is the same either way, so V2 can still answer for older sessions.
          </li>
          <li>
            <strong className="text-foreground">V1 tells you it&apos;s going away.</strong> Every V1 response carries <InlineCode>Deprecation: true</InlineCode> and{" "}
            <InlineCode>Sunset: Sun, 01 Sep 2027 00:00:00 GMT</InlineCode> headers (RFC 8594). Alert on them.
          </li>
          <li>
            <strong className="text-foreground">Stability.</strong> New endpoints and optional parameters are added without changing existing ones. Breaking changes are called out in the{" "}
            <Link href="/docs/changelog" className="text-primary hover:underline">changelog</Link>.
          </li>
        </ul>
        <DocP>
          Moving off V1? See the <Link href="/docs/migration" className="text-primary hover:underline">migration guide</Link> for a route-by-route map.
        </DocP>
      </section>
    </DocsPageWrapper>
  )
}
