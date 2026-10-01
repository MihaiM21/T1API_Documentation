import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  FileSpreadsheet,
  FlaskConical,
  Gauge,
  Layers,
  Radar,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Timer,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ApiVersionBadge } from "@/components/api-status"
import { HeroVisual } from "@/components/hero-visual"
import { Marquee } from "@/components/marquee"
import { TabCodeBlock, CodeBlock } from "@/components/code-block"
import { ART } from "@/components/plot-illustrations"
import { CANVAS_FORMATS, FEATURES, STATS } from "@/lib/catalog"

// A short ticker: the animated track is 2× this width, so keep it compact for low-end GPUs.
const marquee = [
  "Lap duel",
  "Tyre degradation",
  "Pit strategy",
  "Energy clipping",
  "Race story",
  "Sector gaps",
  "Driver radar",
  "Field dominance",
]

const gallery = [
  "lap-duel",
  "position-changes",
  "tyre-stint-usage",
  "track-map",
  "race-gaps",
  "sector-gap",
  "driver-radar",
  "race-pace-heatmap",
  "energy-clipping",
] as const

const pillars = [
  {
    icon: Gauge,
    title: "Fast by default",
    body: "Finished sessions never change, so responses are cached for a day and carry ETags. Send If-None-Match and get a 304 instead of a download.",
  },
  {
    icon: Boxes,
    title: "Batch & discover",
    body: "Ask what exists with /features, see what's already built with /availability, then fetch up to 25 features in one POST.",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV for analysts",
    body: "Append ?format=csv to any JSON endpoint. Per-driver series are expanded to long format, ready for pandas or a spreadsheet.",
  },
  {
    icon: RefreshCcw,
    title: "Errors that tell you what to do",
    body: "A session that isn't published yet is a 503 with Retry-After — not a 404. Typos come back with suggestions and valid rounds.",
  },
  {
    icon: Layers,
    title: "Flexible addressing",
    body: "Pass a round number, an event key or the official name. gp=Italian Grand Prix just works.",
  },
  {
    icon: ShieldCheck,
    title: "Safe to integrate",
    body: "Hashed API keys shown once, per-tier rate limits, validated inputs and a consistent error envelope with a request_id.",
  },
]

const tiers = [
  {
    name: "Public",
    tag: "No key",
    perMin: "30",
    perHour: "500",
    blurb: "Reference data, health and exploration. Unauthenticated callers are metered by IP.",
    points: ["/api/static/* reference data", "Health & service banner", "Good for trying things out"],
  },
  {
    name: "Standard",
    tag: "Self-serve",
    perMin: "100",
    perHour: "2,000",
    blurb: "Create an account, mint a key, and use every analysis endpoint.",
    points: ["Every V2 analysis endpoint", "100,000 requests / month reported", "Usage dashboards per key"],
    highlight: true,
  },
  {
    name: "Premium",
    tag: "By grant",
    perMin: "300",
    perHour: "10,000",
    blurb: "For production apps and sites with sustained traffic. Granted by the Turn One team.",
    points: ["3× the Standard ceiling", "1,000,000 requests / month reported", "Talk to us about your use case"],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <SiteHeader />

      <main id="main">
        {/* ───────────── Hero ───────────── */}
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-5 md:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_70%)]" aria-hidden="true" />
          <div className="absolute -top-40 -left-32 w-[640px] h-[640px] rounded-full bg-primary/15 blur-[120px]" aria-hidden="true" />

          <div className="relative max-w-screen-xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
            <div>
              <div className="rise" style={{ animationDelay: "0ms" }}>
                <ApiVersionBadge />
              </div>
              <h1
                className="font-display mt-6 text-[clamp(3.2rem,9vw,6.6rem)] font-extrabold uppercase leading-[0.88] tracking-tight rise"
                style={{ animationDelay: "80ms" }}
              >
                Every lap.
                <br />
                Every corner.
                <br />
                <span className="text-gradient-red">One API.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed text-pretty rise" style={{ animationDelay: "180ms" }}>
                T1API turns Formula 1 timing and telemetry into ready-to-post <strong className="text-foreground">PNG charts</strong> and
                clean <strong className="text-foreground">JSON</strong> — lap duels, tyre degradation, race strategy, energy clipping,
                standings and more. {STATS.analyses} analyses, one consistent interface.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 rise" style={{ animationDelay: "260ms" }}>
                <Link
                  href="/docs"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors plate"
                >
                  Start building <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
                <Link
                  href="/docs/playground"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-border bg-card/70 text-foreground font-medium text-sm hover:border-primary/50 hover:bg-card transition-colors"
                >
                  <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" /> Open the playground
                </Link>
              </div>
              <div className="mt-8 rise" style={{ animationDelay: "340ms" }}>
                <CodeBlock
                  language="bash"
                  className="!my-0 max-w-xl"
                  code={`curl "https://api.t1f1.com/api/v2/lap-duel-plot?year=2025&gp=1&session=Q&driver1=VER&driver2=NOR&format=story" \\
  -H "X-API-Key: $T1_API_KEY" --output duel.png`}
                />
              </div>
            </div>

            <div className="rise" style={{ animationDelay: "200ms" }}>
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* ───────────── Stats ───────────── */}
        <section className="border-y border-border bg-card/40" aria-label="The API at a glance">
          <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            {[
              { v: String(STATS.analyses), l: "analyses & datasets" },
              { v: String(STATS.endpoints), l: "documented endpoints" },
              { v: "2018–2030", l: "seasons addressable" },
              { v: "4", l: "social-media canvases" },
            ].map((s) => (
              <div key={s.l} className="text-center md:text-left md:border-l md:border-border md:pl-6 first:md:border-l-0 first:md:pl-0">
                <div className="font-display text-4xl md:text-5xl font-extrabold tabular-nums tracking-tight">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────── Marquee ───────────── */}
        <section className="py-5 border-b border-border">
          <Marquee items={marquee} />
        </section>

        {/* ───────────── Gallery ───────────── */}
        <section id="gallery" className="scroll-mt-14 py-20 md:py-28 px-5 md:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="max-w-2xl mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-primary" aria-hidden="true" /> What you can ask for
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
                The charts you&apos;d build by hand, in one request
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed text-pretty">
                Every analysis comes as a <code className="font-mono text-primary">-plot</code> (PNG) and a{" "}
                <code className="font-mono text-primary">-data</code> (JSON) twin, so you can post the chart or draw your own.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((id) => {
                const f = FEATURES.find((x) => x.id === id)!
                const Art = ART[id]
                return (
                  <Link
                    key={id}
                    href={`/docs/endpoints#${id}`}
                    className="group rounded-xl border border-border bg-card overflow-hidden card-glow"
                  >
                    <div className="border-b border-border overflow-hidden">
                      <div className="transition-transform duration-500 group-hover:scale-[1.04]">
                        <Art />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 flex items-center justify-between">
                        {f.title}
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                      </h3>
                      <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2">{f.summary}</p>
                      <code className="mt-3 block text-[11px] font-mono text-muted-foreground/80 truncate">{f.stem}-plot</code>
                    </div>
                  </Link>
                )
              })}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Thumbnails are illustrations, not API output.{" "}
              <Link href="/docs/endpoints" className="text-primary hover:underline">
                Browse all {STATS.analyses} analyses →
              </Link>
            </p>
          </div>
        </section>

        {/* ───────────── Canvases ───────────── */}
        <section id="canvases" className="scroll-mt-14 py-20 md:py-28 px-5 md:px-8 border-y border-border bg-card/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-carbon opacity-50" aria-hidden="true" />
          <div className="relative max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-primary" aria-hidden="true" /> Made to be posted
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
                Recomposed, <span className="text-gradient-red">not cropped</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed text-pretty">
                Add <code className="font-mono text-primary">format=</code> to a plot and the chart is laid out again for that aspect
                ratio, keeping labels readable and clear of each platform&apos;s buttons.
              </p>
              <ul className="mt-6 space-y-2">
                {CANVAS_FORMATS.map((c) => (
                  <li key={c.name} className="flex items-baseline gap-3 text-sm">
                    <code className="font-mono text-primary w-24 shrink-0">{c.name}</code>
                    <span className="font-mono text-foreground/90 w-28 shrink-0">{c.size}</span>
                    <span className="text-muted-foreground">{c.use}</span>
                  </li>
                ))}
              </ul>
              <Link href="/docs/concepts#canvases" className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-primary hover:underline">
                How canvases work <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex items-end justify-center gap-2 sm:gap-4 min-h-[300px] w-full" aria-hidden="true">
              {[
                { w: "w-[38%]", ratio: "aspect-[16/9]", name: "landscape" },
                { w: "w-[21%]", ratio: "aspect-[1/1]", name: "square" },
                { w: "w-[21%]", ratio: "aspect-[4/5]", name: "portrait" },
                { w: "w-[17%]", ratio: "aspect-[9/16]", name: "story" },
              ].map((c, i) => (
                <div key={c.name} className={`${c.w} shrink-0`}>
                  <div
                    className={`${c.ratio} rounded-lg border border-border bg-gradient-to-br from-[oklch(0.2_0_0)] to-[oklch(0.13_0_0)] relative overflow-hidden`}
                    style={{ boxShadow: "0 12px 40px -12px oklch(0 0 0 / 0.8)" }}
                  >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-90">
                      <polyline
                        points={Array.from({ length: 20 }, (_, k) => `${k * 5.3},${60 - Math.sin(k / 2.5 + i) * 22}`).join(" ")}
                        fill="none"
                        stroke="oklch(0.6 0.23 27)"
                        strokeWidth="2.4"
                        vectorEffect="non-scaling-stroke"
                      />
                      <polyline
                        points={Array.from({ length: 20 }, (_, k) => `${k * 5.3},${72 - Math.cos(k / 3 + i) * 14}`).join(" ")}
                        fill="none"
                        stroke="oklch(0.78 0.12 235)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                  <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── Quick start ───────────── */}
        <section id="quick-start" className="scroll-mt-14 py-20 md:py-28 px-5 md:px-8">
          <div className="max-w-screen-xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-primary" aria-hidden="true" /> Quick start
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
                From zero to qualifying results in a minute
              </h2>
              <ol className="mt-8 space-y-5">
                {[
                  ["Get a key", "Create an account and mint a key — it's shown once, so store it."],
                  ["Pick a session", "year, gp (round, key or name) and session (FP1 … R)."],
                  ["Ask for JSON or a PNG", "Swap -data for -plot, add ?format=csv, or pick a canvas."],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/50 font-mono text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{t}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/docs#quick-start" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  Full quick start <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/docs/recipes" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Recipes
                </Link>
              </div>
            </div>
            <div>
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
for row in r.json():
    print(row["Driver"], row["LapTime"], row["LapTimeDelta"])`,
                  },
                  {
                    label: "JavaScript",
                    language: "js",
                    code: `const url = new URL("https://api.t1f1.com/api/v2/qualifying-results-data")
url.search = new URLSearchParams({ year: 2025, gp: 1, session: "Q" })

const res = await fetch(url, { headers: { "X-API-Key": process.env.T1_API_KEY } })
if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
for (const row of await res.json()) console.log(row.Driver, row.LapTime)`,
                  },
                ]}
              />
              <CodeBlock
                language="json"
                filename="response — illustrative values"
                code={`[
  { "Driver": "NOR", "Team": "McLaren", "LapTime": "1:26.270", "LapTimeDelta": 0.0, "Color": "#FF8000" },
  { "Driver": "VER", "Team": "Red Bull Racing", "LapTime": "1:26.408", "LapTimeDelta": 0.138, "Color": "#3671C6" }
]`}
              />
            </div>
          </div>
        </section>

        {/* ───────────── Pillars ───────────── */}
        <section id="built" className="scroll-mt-14 py-20 md:py-28 px-5 md:px-8 border-y border-border bg-card/30">
          <div className="max-w-screen-xl mx-auto">
            <div className="max-w-2xl mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-primary" aria-hidden="true" /> Built to be integrated
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">
                The boring parts, done right
              </h2>
            </div>
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 rounded-xl overflow-hidden border border-border bg-border">
              {pillars.map((p) => (
                <div key={p.title} className="bg-card p-6 group hover:bg-[oklch(0.15_0_0)] transition-colors">
                  <p.icon className="h-5 w-5 text-primary mb-4" aria-hidden="true" />
                  <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── Tiers ───────────── */}
        <section id="tiers" className="scroll-mt-14 py-20 md:py-28 px-5 md:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="max-w-2xl mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-primary" aria-hidden="true" /> Access tiers
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight">Pick your pit lane</h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed text-pretty">
                Limits are per key. Heavy <code className="font-mono text-primary">-data</code> endpoints also count against a separate
                60 / minute, 1,000 / hour bucket.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className={`relative rounded-xl border p-6 flex flex-col ${t.highlight ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}
                >
                  {t.highlight && (
                    <span className="absolute -top-3 left-6 plate bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      Most used
                    </span>
                  )}
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-display text-3xl font-extrabold uppercase">{t.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.tag}</span>
                  </div>
                  <div className="flex items-end gap-6 mb-4">
                    <div>
                      <div className="font-display text-5xl font-extrabold tabular-nums leading-none">{t.perMin}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">per minute</div>
                    </div>
                    <div>
                      <div className="font-display text-3xl font-bold tabular-nums leading-none text-foreground/80">{t.perHour}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">per hour</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.blurb}</p>
                  <ul className="space-y-2 mt-auto">
                    {t.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                        <BadgeCheck className="h-4 w-4 shrink-0 text-primary mt-px" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground flex items-center gap-2">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" /> Over the limit? You&apos;ll get a <code className="font-mono">429</code> — back off and retry.{" "}
              <Link href="/docs#rate-limits" className="text-primary hover:underline">
                Rate limit details
              </Link>
            </p>
          </div>
        </section>

        {/* ───────────── CTA ───────────── */}
        <section className="relative py-24 px-5 md:px-8 border-t border-border overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-2 bg-checker opacity-[0.07]" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-primary/10 blur-[100px]" aria-hidden="true" />
          <div className="relative max-w-3xl mx-auto text-center">
            <Radar className="h-8 w-8 text-primary mx-auto mb-5" aria-hidden="true" />
            <h2 className="font-display text-5xl md:text-7xl font-extrabold uppercase leading-[0.92] tracking-tight text-balance">
              Lights out. <span className="text-gradient-red">Start building.</span>
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed text-pretty">
              Read the docs, poke every endpoint in the playground, then ship something your audience hasn&apos;t seen.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors plate"
              >
                Read the docs <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/docs/account"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md border border-border bg-card/70 font-medium text-sm hover:border-primary/50 transition-colors"
              >
                <Share2 className="h-4 w-4 text-primary" aria-hidden="true" /> Get your API key
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
