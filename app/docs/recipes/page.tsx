import type { Metadata } from "next"
import Link from "next/link"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import { Callout, DocDivider, DocH1, DocH2, DocLead, DocP, InlineCode } from "@/components/doc-primitives"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Recipes",
  description: "Copy-paste patterns for T1API: a resilient client, race-weekend workflows, live polling, social posts and lap animation.",
}

const toc = [
  { id: "client", label: "A small, resilient client", level: 1 as const },
  { id: "weekend", label: "Race-weekend workflow", level: 1 as const },
  { id: "social", label: "Charts for social", level: 1 as const },
  { id: "live-data", label: "Live data & polling", level: 1 as const },
  { id: "own-charts", label: "Draw your own chart", level: 1 as const },
  { id: "animation", label: "Animate a lap", level: 1 as const },
]

export default function RecipesPage() {
  const { prev, next } = neighbours("/docs/recipes")
  return (
    <DocsPageWrapper toc={toc} prev={prev} next={next}>
      <DocH1 eyebrow="Guides">Recipes</DocH1>
      <DocLead>
        T1API is plain HTTP, so any language works. These patterns are the ones that come up again and again — copy, adapt, ship.
      </DocLead>
      <Callout variant="info" title="No SDK needed (yet)">
        There&apos;s no official client library published. The ~40 lines below give you retries, ETag caching and sensible errors, which is most of what an
        SDK would do.
      </Callout>

      <section id="client" className="scroll-mt-24">
        <DocH2 id="client">A small, resilient client</DocH2>
        <DocP>
          Retries on <InlineCode>429</InlineCode>/<InlineCode>502</InlineCode>/<InlineCode>503</InlineCode> (honouring <InlineCode>Retry-After</InlineCode>), replays ETags so unchanged
          data costs a <InlineCode>304</InlineCode>, and keeps your key out of logs.
        </DocP>
        <TabCodeBlock
          tabs={[
            {
              label: "Python",
              language: "python",
              code: `import os, time, requests

class T1Client:
    BASE = "https://api.t1f1.com"
    RETRY = {429, 502, 503}

    def __init__(self, api_key=None, timeout=90):
        self.http = requests.Session()
        self.http.headers["X-API-Key"] = api_key or os.environ["T1_API_KEY"]
        self.timeout = timeout
        self._etags, self._bodies = {}, {}

    def get(self, path, attempts=5, **params):
        url = f"{self.BASE}{path}"
        key = (url, tuple(sorted(params.items())))
        for n in range(attempts):
            headers = {"If-None-Match": self._etags[key]} if key in self._etags else {}
            r = self.http.get(url, params=params, headers=headers, timeout=self.timeout)
            if r.status_code == 304:
                return self._bodies[key]
            if r.status_code in self.RETRY:
                time.sleep(min(float(r.headers.get("Retry-After", 2 ** n)), 600))
                continue
            r.raise_for_status()                      # other 4xx: fix the request
            body = r.json() if "json" in r.headers.get("content-type", "") else r.content
            if "ETag" in r.headers:
                self._etags[key], self._bodies[key] = r.headers["ETag"], body
            return body
        raise RuntimeError(f"{path}: gave up after {attempts} attempts")

t1 = T1Client()
quali = t1.get("/api/v2/qualifying-results-data", year=2025, gp=1, session="Q")
print(quali[0]["Driver"], quali[0]["LapTime"])`,
            },
            {
              label: "TypeScript",
              language: "js",
              code: `type Params = Record<string, string | number | boolean | undefined>

export class T1Client {
  private etags = new Map<string, { etag: string; body: unknown }>()
  constructor(private key = process.env.T1_API_KEY!, private base = "https://api.t1f1.com") {}

  async get<T = unknown>(path: string, params: Params = {}, attempts = 5): Promise<T> {
    const url = new URL(path, this.base)
    for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v))
    const id = url.toString()

    for (let n = 0; n < attempts; n++) {
      const cached = this.etags.get(id)
      const res = await fetch(url, {
        headers: { "X-API-Key": this.key, ...(cached && { "If-None-Match": cached.etag }) },
      })
      if (res.status === 304 && cached) return cached.body as T
      if ([429, 502, 503].includes(res.status)) {
        const wait = Number(res.headers.get("retry-after")) || 2 ** n
        await new Promise((r) => setTimeout(r, Math.min(wait, 600) * 1000))
        continue
      }
      if (!res.ok) throw new Error(\`T1API \${res.status} \${path}\`)
      const body = (res.headers.get("content-type") ?? "").includes("json") ? await res.json() : await res.arrayBuffer()
      const etag = res.headers.get("etag")
      if (etag) this.etags.set(id, { etag, body })
      return body as T
    }
    throw new Error(\`T1API: gave up on \${path}\`)
  }
}`,
            },
          ]}
        />
      </section>

      <DocDivider />

      <section id="weekend" className="scroll-mt-24">
        <DocH2 id="weekend">Race-weekend workflow</DocH2>
        <DocP>
          The efficient way to build a session page: find the event, check what&apos;s ready, then fetch everything in one call.
        </DocP>
        <CodeBlock
          language="python"
          filename="weekend.py"
          code={`t1 = T1Client()
YEAR = 2025

# 1. Which events exist? (find the round, key or name you want)
events = t1.get(f"/api/v2/seasons/{YEAR}/events")["events"]
event = next(e for e in events if "Australia" in e["name"])

# 2. What's already generated for the race?
avail = t1.get(f"/api/v2/sessions/{YEAR}/{event['name']}/R/availability", include_drivers="true")
print("ready:", avail["available"], "missing:", avail["missing"])

# 3. Fetch several JSON features at once (max 25) — one request, one shared parse
import requests, os
r = requests.post(
    "https://api.t1f1.com/api/v2/batch",
    headers={"X-API-Key": os.environ["T1_API_KEY"]},
    json={"year": YEAR, "gp": event["name"], "session": "R",
          "features": [{"key": k} for k in avail["available"][:10]]},
    timeout=180,
)
for item in r.json()["results"]:
    print(item["key"], item["status"])   # one failing feature doesn't fail the batch`}
        />
        <Callout variant="tip">
          Use <Link href="/docs/endpoints#features-catalog" className="text-primary hover:underline">/api/v2/features</Link> to list valid batch keys and their{" "}
          <InlineCode>kind</InlineCode> — it&apos;s generated from the same registry the backend uses, so it can&apos;t drift.
        </Callout>
      </section>

      <DocDivider />

      <section id="social" className="scroll-mt-24">
        <DocH2 id="social">Charts for social</DocH2>
        <DocP>
          One chart, four aspect ratios — each re-composed for its platform. Loop over the formats and save them all:
        </DocP>
        <CodeBlock
          language="python"
          code={`import os, requests

params = {"year": 2025, "gp": 1, "session": "R"}
for fmt in ("landscape", "square", "portrait", "story"):
    r = requests.get(
        "https://api.t1f1.com/api/v2/race-story-plot",
        params={**params, "format": fmt},
        headers={"X-API-Key": os.environ["T1_API_KEY"]},
        timeout=120,
    )
    r.raise_for_status()
    with open(f"race-story-{fmt}.png", "wb") as f:
        f.write(r.content)`}
        />
        <DocP>
          Pair a plot with its <InlineCode>-data</InlineCode> twin to write the caption from the numbers —{" "}
          <Link href="/docs/endpoints#race-story" className="text-primary hover:underline">race story</Link> and{" "}
          <Link href="/docs/endpoints#lap-duel" className="text-primary hover:underline">lap duel</Link> both return quotable highlights.
        </DocP>
      </section>

      <DocDivider />

      <section id="live-data" className="scroll-mt-24">
        <DocH2 id="live-data">Live data &amp; polling</DocH2>
        <Callout variant="info" title="REST only — no WebSocket">
          T1API doesn&apos;t stream. It analyses sessions and serves the result over HTTP, so during a live weekend you poll — politely.
        </Callout>
        <ul className="list-disc pl-5 space-y-2 text-[15px] text-muted-foreground mb-5">
          <li>
            <strong className="text-foreground">Waiting for a session to land?</strong> Poll a data endpoint (or{" "}
            <Link href="/docs/endpoints#session-availability" className="text-primary hover:underline">availability</Link>). A{" "}
            <InlineCode>503</InlineCode> with <InlineCode>Retry-After</InlineCode> means &ldquo;not yet&rdquo; — sleep that long, don&apos;t hammer.
          </li>
          <li>
            <strong className="text-foreground">Latest session.</strong> <InlineCode>/api/v2/dashboard</InlineCode> always points at the newest finished session and is revalidated about every 30 seconds —
            polling faster gains nothing.
          </li>
          <li>
            <strong className="text-foreground">Standings.</strong> Use the cached <InlineCode>/api/v2/standings/drivers</InlineCode> normally; reserve the{" "}
            <InlineCode>/live</InlineCode> variants (which bypass the cache) for the moments you truly need them.
          </li>
          <li>
            <strong className="text-foreground">Finished is final.</strong> Once a session&apos;s data is out it never changes — stop polling and cache it for good.
          </li>
        </ul>
        <CodeBlock
          language="python"
          filename="wait_for_session.py"
          code={`import os, time, requests

def wait_for(path, params, every=60, give_up_after=3 * 3600):
    """Poll until a session's data is published."""
    start = time.time()
    while time.time() - start < give_up_after:
        r = requests.get(f"https://api.t1f1.com{path}", params=params,
                         headers={"X-API-Key": os.environ["T1_API_KEY"]}, timeout=120)
        if r.ok:
            return r.json()
        if r.status_code == 503:                      # published later — expected
            time.sleep(float(r.headers.get("Retry-After", every)))
            continue
        r.raise_for_status()                          # anything else is a real error
    raise TimeoutError("session data never appeared")

data = wait_for("/api/v2/qualifying-results-data", {"year": 2025, "gp": 1, "session": "Q"})`}
        />
      </section>

      <DocDivider />

      <section id="own-charts" className="scroll-mt-24">
        <DocH2 id="own-charts">Draw your own chart</DocH2>
        <DocP>
          The <InlineCode>-data</InlineCode> endpoints are the numbers behind the PNGs, with team colours included — so your chart can match the house style. Here, a tyre-stint timeline:
        </DocP>
        <CodeBlock
          language="python"
          code={`import matplotlib.pyplot as plt

stints = t1.get("/api/v2/tyre-stint-usage-data", year=2025, gp=1, session="R")
COMPOUND = {"SOFT": "#e8302a", "MEDIUM": "#f5d130", "HARD": "#f2f2f2",
            "INTERMEDIATE": "#3fd17a", "WET": "#4a90e2"}

drivers = list(dict.fromkeys(s["driver"] for s in stints))   # already finishing order
fig, ax = plt.subplots(figsize=(10, 6))
for row, d in enumerate(drivers):
    for s in (x for x in stints if x["driver"] == d):
        ax.barh(row, s["lap_count"], left=s["start_lap"] - 1,
                color=COMPOUND.get(s["compound"], "#888"), edgecolor="black")
ax.set_yticks(range(len(drivers)), drivers)
ax.invert_yaxis(); ax.set_xlabel("Lap")
plt.show()`}
        />
      </section>

      <DocDivider />

      <section id="animation" className="scroll-mt-24">
        <DocH2 id="animation">Animate a lap</DocH2>
        <DocP>
          Draw the circuit once from <InlineCode>/telemetry/track-map</InlineCode>, then move each car with the uniform frames from{" "}
          <InlineCode>/telemetry/laps-data</InlineCode> — every driver is resampled onto one shared clock, so there&apos;s no interpolation to do.
        </DocP>
        <CodeBlock
          language="js"
          filename="animate.js"
          code={`const q = new URLSearchParams({ year: 2025, gp: 1, session: "R" })
const headers = { "X-API-Key": process.env.T1_API_KEY }

const { track } = await (await fetch(\`https://api.t1f1.com/api/v2/telemetry/track-map?\${q}\`, { headers })).json()

q.set("drivers", "VER,NOR"); q.set("lap_from", 5); q.set("hz", 10)
const { drivers } = await (await fetch(\`https://api.t1f1.com/api/v2/telemetry/laps-data?\${q}\`, { headers })).json()

// frames[i] is the same instant for every driver — just index in lock-step
const n = Math.min(...drivers.map((d) => d.frames.length))
for (let i = 0; i < n; i++) {
  for (const d of drivers) {
    const f = d.frames[i]            // { t, x, y, speed, throttle, brake, gear, rpm, drs, status, … }
    drawCar(d.driver.color, f.x, f.y) // your canvas code
  }
  await nextFrame()                  // 10 Hz → one frame every 100 ms
}`}
        />
        <p className="text-[13px] text-muted-foreground">
          Mind the budget: requests that would exceed the service&apos;s frame limit are rejected with <InlineCode>400</InlineCode> and a suggested lower{" "}
          <InlineCode>hz</InlineCode>. <InlineCode>format=columnar</InlineCode> shrinks the payload when you only need a few fields.
        </p>
      </section>
    </DocsPageWrapper>
  )
}
