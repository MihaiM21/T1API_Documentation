import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpen, FlaskConical, KeyRound, Route } from "lucide-react"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import {
  Callout,
  DataTable,
  DocH1,
  DocH2,
  DocH3,
  DocLead,
  DocP,
  InlineCode,
  Pill,
  Step,
  Steps,
} from "@/components/doc-primitives"
import { STATS } from "@/lib/catalog"

export const metadata: Metadata = {
  title: "Introduction",
  description: "Get started with T1API: base URL, authentication, rate limits and your first request.",
}

const toc = [
  { id: "introduction", label: "Introduction", level: 1 as const },
  { id: "quick-start", label: "Quick start", level: 1 as const },
  { id: "authentication", label: "Authentication", level: 1 as const },
  { id: "keyless", label: "Endpoints without a key", level: 2 as const },
  { id: "keep-keys-safe", label: "Keeping your key safe", level: 2 as const },
  { id: "rate-limits", label: "Rate limits", level: 1 as const },
  { id: "good-citizen", label: "Being a good citizen", level: 2 as const },
  { id: "next", label: "Where next", level: 1 as const },
]

const cards = [
  { icon: FlaskConical, title: "Playground", body: "Send real requests from your browser and see the chart or JSON come back.", href: "/docs/playground" },
  { icon: Route, title: "Endpoints", body: `All ${STATS.analyses} analyses plus reference data, searchable, with parameters and examples.`, href: "/docs/endpoints" },
  { icon: BookOpen, title: "Concepts", body: "Sessions, formats, caching, errors and versioning explained once.", href: "/docs/concepts" },
  { icon: KeyRound, title: "Account & keys", body: "Sign up, mint keys and watch your usage.", href: "/docs/account" },
]

export default function DocsIntroPage() {
  return (
    <DocsPageWrapper toc={toc} next={{ label: "Concepts", href: "/docs/concepts" }}>
      <section id="introduction" className="scroll-mt-24">
        <DocH1 eyebrow="Turn One · T1API">Documentation</DocH1>
        <DocLead>
          T1API turns Formula 1 timing and telemetry into charts and data you can use straight away. Ask for a session — a
          qualifying lap, a race, a whole season — and get back a rendered <strong className="text-foreground">PNG</strong>, clean{" "}
          <strong className="text-foreground">JSON</strong>, or <strong className="text-foreground">CSV</strong>. It powers the
          dashboards at t1f1.com and turnonehub.com, and it&apos;s open to you.
        </DocLead>

        <div className="grid gap-3 sm:grid-cols-2 mb-10">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="group relative flex gap-4 p-4 rounded-xl border border-border bg-card card-glow">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  {c.title}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                </span>
                <span className="block text-[13px] text-muted-foreground leading-snug mt-0.5">{c.body}</span>
              </span>
            </Link>
          ))}
        </div>

        <DataTable
          headers={["Base URL", "What it serves"]}
          mono={[0]}
          rows={[
            ["https://api.t1f1.com/api/v2", "Current analysis API, built on the F1 live-timing feed. Use this for everything new."],
            ["https://api.t1f1.com/api/static", "Reference data: drivers, teams, circuits, portraits and logos. No key needed."],
            ["https://api.t1f1.com/api/auth · /keys · /me", "Accounts and API-key self-service (bearer-token auth)."],
            ["https://api.t1f1.com/api/v1", "Deprecated FastF1-based predecessor. Still served; retiring on 2027-09-01."],
          ]}
        />
        <Callout variant="warning" title="Building something new?">
          Use <InlineCode>/api/v2</InlineCode>. Every V1 route has a V2 replacement (or an explicit “no replacement” note) on the{" "}
          <Link href="/docs/migration" className="text-primary hover:underline">
            migration page
          </Link>
          , and V1 responses carry <InlineCode>Deprecation</InlineCode> and <InlineCode>Sunset</InlineCode> headers.
        </Callout>
      </section>

      <section id="quick-start" className="scroll-mt-24">
        <DocH2 id="quick-start">Quick start</DocH2>
        <Steps>
          <Step n={1} title="Get an API key">
            <DocP>
              Create an account and mint a key — see <Link href="/docs/account" className="text-primary hover:underline">Account &amp; keys</Link>.
              The key is shown <strong className="text-foreground">once</strong> and stored hashed, so copy it somewhere safe right away. Set it as an
              environment variable for the examples below:
            </DocP>
            <CodeBlock language="bash" code={`export T1_API_KEY="t1_live_..."`} />
          </Step>

          <Step n={2} title="Make your first request">
            <DocP>
              Every analysis is addressed by <InlineCode>year</InlineCode>, <InlineCode>gp</InlineCode> and <InlineCode>session</InlineCode>.
              Here&apos;s qualifying for round 1 of 2025:
            </DocP>
            <TabCodeBlock
              tabs={[
                {
                  label: "curl",
                  language: "bash",
                  code: `curl "https://api.t1f1.com/api/v2/qualifying-results-data?year=2025&gp=1&session=Q" \\
  -H "X-API-Key: $T1_API_KEY"`,
                },
                {
                  label: "Python",
                  language: "python",
                  code: `import os, requests

r = requests.get(
    "https://api.t1f1.com/api/v2/qualifying-results-data",
    params={"year": 2025, "gp": 1, "session": "Q"},
    headers={"X-API-Key": os.environ["T1_API_KEY"]},
    timeout=60,
)
r.raise_for_status()
print(r.json()[0])`,
                },
                {
                  label: "JavaScript",
                  language: "js",
                  code: `const url = new URL("https://api.t1f1.com/api/v2/qualifying-results-data")
url.search = new URLSearchParams({ year: 2025, gp: 1, session: "Q" })

const res = await fetch(url, { headers: { "X-API-Key": process.env.T1_API_KEY } })
if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
console.log((await res.json())[0])`,
                },
              ]}
            />
          </Step>

          <Step n={3} title="Read the response">
            <DocP>
              Data endpoints return plain JSON — here an array with one row per driver. Colours are each team&apos;s hex colour so you can
              theme your own charts.
            </DocP>
            <CodeBlock
              language="json"
              filename="response — illustrative values"
              code={`[
  { "Driver": "NOR", "Team": "McLaren", "LapTime": "1:26.270", "LapTimeDelta": 0.0, "Color": "#FF8000" },
  { "Driver": "VER", "Team": "Red Bull Racing", "LapTime": "1:26.408", "LapTimeDelta": 0.138, "Color": "#3671C6" }
]`}
            />
          </Step>

          <Step n={4} title="Or ask for the picture">
            <DocP>
              Swap <InlineCode>-data</InlineCode> for <InlineCode>-plot</InlineCode> and you get a finished PNG. Add{" "}
              <InlineCode>format=story</InlineCode> for a 9:16 canvas.
            </DocP>
            <CodeBlock
              language="bash"
              code={`curl "https://api.t1f1.com/api/v2/qualifying-results-plot?year=2025&gp=1&session=Q&format=story" \\
  -H "X-API-Key: $T1_API_KEY" --output quali.png`}
            />
          </Step>
        </Steps>
      </section>

      <section id="authentication" className="scroll-mt-24">
        <DocH2 id="authentication">Authentication</DocH2>
        <DocP>
          Send your key in the <InlineCode>X-API-Key</InlineCode> header. Two different things can go wrong, and they&apos;re
          distinguishable:
        </DocP>
        <DataTable
          headers={["Status", "Meaning", "Fix"]}
          mono={[0]}
          rows={[
            ["401", "The header is missing.", "Send X-API-Key."],
            ["403", "The key isn't recognised, was revoked, or isn't allowed on this route.", "Check for typos, or mint a fresh key."],
          ]}
        />
        <DocP>
          Account endpoints (<InlineCode>/api/auth</InlineCode>, <InlineCode>/api/keys</InlineCode>, <InlineCode>/api/me</InlineCode>) are
          different: they use a <InlineCode>Authorization: Bearer &lt;token&gt;</InlineCode> header from login, not an API key. See{" "}
          <Link href="/docs/account" className="text-primary hover:underline">Account &amp; keys</Link>.
        </DocP>

        <DocH3 id="keyless">Endpoints without a key</DocH3>
        <DocP>A few routes are public so you can explore and power simple UIs without credentials:</DocP>
        <ul className="list-disc pl-5 space-y-1.5 mb-4 text-[15px] text-muted-foreground">
          <li>
            <InlineCode>/api/static/*</InlineCode> — drivers, teams, circuits, portraits and logos (2025–2026; circuits from 2024).
          </li>
          <li>
            <InlineCode>/</InlineCode> and <InlineCode>/api/health</InlineCode> — the service banner and health check.
          </li>
        </ul>
        <DocP>They&apos;re still rate limited (by IP), so cache them on your side.</DocP>

        <DocH3 id="keep-keys-safe">Keeping your key safe</DocH3>
        <Callout variant="danger" title="Never ship a key to browsers">
          An API key embedded in front-end JavaScript is public to everyone who opens the page. Call T1API from your server (or a
          serverless function), cache the result, and send your users the output. If a key leaks, revoke it from{" "}
          <Link href="/docs/account" className="text-primary hover:underline">your account</Link> and mint a new one — revocation
          takes effect almost immediately.
        </Callout>
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-muted-foreground">
          <li>Keep keys in environment variables or a secret manager — never in git.</li>
          <li>Use one key per app so you can revoke one without breaking the rest and see usage per key.</li>
          <li>Keys are stored hashed on our side; we can&apos;t show one again, only replace it.</li>
        </ul>
      </section>

      <section id="rate-limits" className="scroll-mt-24">
        <DocH2 id="rate-limits">Rate limits</DocH2>
        <DocP>
          Limits are applied <strong className="text-foreground">per key</strong>; callers without a key are bucketed by IP address. Exceeding a limit
          returns <InlineCode>429 Too Many Requests</InlineCode>.
        </DocP>
        <DataTable
          headers={["Tier", "Who", "Per minute", "Per hour", "Monthly quota*"]}
          mono={[0]}
          rows={[
            ["Public", "No key (by IP)", "30", "500", "5,000"],
            ["Standard", "Self-serve keys", "100", "2,000", "100,000"],
            ["Premium", "Granted by Turn One", "300", "10,000", "1,000,000"],
          ]}
        />
        <p className="text-xs text-muted-foreground -mt-3 mb-5">*Monthly quotas are reported on your usage dashboards; the per-minute and per-hour limits are what&apos;s enforced.</p>

        <DocP>
          Heavier <InlineCode>-data</InlineCode> endpoints (and reference data) also count against a <strong className="text-foreground">separate data bucket</strong> of{" "}
          <strong className="text-foreground">60 / minute and 1,000 / hour</strong>. That way a burst of data pulls can&apos;t use up your plot
          allowance. In the <Link href="/docs/endpoints" className="text-primary hover:underline">endpoint reference</Link> each route shows which bucket it uses.
        </DocP>

        <DocH3 id="good-citizen">Being a good citizen</DocH3>
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-muted-foreground mb-4">
          <li>
            <strong className="text-foreground">Cache.</strong> Finished sessions never change. Reuse responses and send <InlineCode>If-None-Match</InlineCode> — see{" "}
            <Link href="/docs/concepts#caching" className="text-primary hover:underline">caching</Link>.
          </li>
          <li>
            <strong className="text-foreground">Batch.</strong> Need six JSON features for one session? One{" "}
            <Link href="/docs/endpoints#batch" className="text-primary hover:underline">POST /api/v2/batch</Link> beats six requests.
          </li>
          <li>
            <strong className="text-foreground">Back off on 429 and 503.</strong> Wait, then retry with exponential delay — see{" "}
            <Link href="/docs/concepts#errors" className="text-primary hover:underline">errors &amp; retries</Link>.
          </li>
          <li>
            <strong className="text-foreground">Track your own usage.</strong> Responses don&apos;t carry rate-limit headers; use the{" "}
            <Link href="/docs/account#usage" className="text-primary hover:underline">usage endpoints</Link> to see where you stand.
          </li>
        </ul>
      </section>

      <section id="next" className="scroll-mt-24">
        <DocH2 id="next">Where next</DocH2>
        <div className="flex flex-wrap gap-2">
          <Pill tone="red">New to F1 data? Start with Concepts</Pill>
          <Pill tone="blue">Know what you want? Open the Endpoints</Pill>
          <Pill tone="green">Want to tinker? Use the Playground</Pill>
        </div>
      </section>
    </DocsPageWrapper>
  )
}
