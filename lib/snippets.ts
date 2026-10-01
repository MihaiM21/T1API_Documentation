import { API_BASE, endpointsOf, paramsOf, type Endpoint, type Feature, type Param } from "@/lib/catalog"

const SAMPLE: Record<string, string> = {
  year: "2025",
  gp: "1",
  session: "Q",
  driver: "VER",
  d1: "VER",
  d2: "NOR",
  driver1: "VER",
  driver2: "NOR",
  drivers: "VER,NOR",
  lap: "10",
  lap_from: "5",
  years: "2022-2025",
  round_nr: "5",
  event_name: "Australian Grand Prix",
  driver_name: "Verstappen",
  team_name: "McLaren",
  circuit_id: "10",
  code: "VER",
  short_name: "MCL",
}

export function sampleFor(p: Param): string {
  if (p.default !== undefined && p.default !== "") return p.default
  return SAMPLE[p.name] ?? p.options?.[0] ?? ""
}

/** Values the snippets and playground start from: the common params plus anything required. */
export function initialValues(f: Feature, ep: Endpoint): Record<string, string> {
  const variant = ep.variant
  const values: Record<string, string> = {}
  for (const p of paramsOf(f, variant)) {
    if (p.in === "body") continue
    const isCommon = ["year", "gp", "session"].includes(p.name) && f.scope === "session"
    if (p.required || isCommon || p.in === "path") values[p.name] = sampleFor(p)
  }
  // The example's own query string is the best hint for which params make sense together.
  if (f.example?.query && !f.example.query.startsWith("POST")) {
    for (const [k, v] of new URLSearchParams(f.example.query)) values[k] = v
  }
  if (f.id === "session-availability") {
    values.gp = values.gp || "1"
    values.session = values.session || "Q"
  }
  return values
}

export function resolvePath(path: string, values: Record<string, string>): string {
  return path.replace(/\{(\w+)\}/g, (_, name: string) => encodeURIComponent(values[name] ?? `{${name}}`))
}

export function buildUrl(ep: Endpoint, values: Record<string, string>): string {
  const pathNames = new Set(Array.from(ep.path.matchAll(/\{(\w+)\}/g)).map((m) => m[1]))
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(values)) {
    if (pathNames.has(k) || v === "") continue
    sp.set(k, v)
  }
  const q = sp.toString()
  return `${API_BASE}${resolvePath(ep.path, values)}${q ? `?${q}` : ""}`
}

const BATCH_BODY = `{
  "year": 2025,
  "gp": 1,
  "session": "Q",
  "features": [
    { "key": "qualifying_results" },
    { "key": "top_speed_telemetry" }
  ]
}`

export function buildSnippets(f: Feature, ep: Endpoint, values: Record<string, string>, key = "YOUR_API_KEY") {
  const url = buildUrl(ep, values)
  const needsKey = ep.auth
  const png = ep.response === "png"
  const isPost = ep.method === "POST"

  const curl = [
    `curl ${isPost ? "-X POST " : ""}"${url}"`,
    ...(needsKey ? [`  -H "X-API-Key: ${key}"`] : []),
    ...(isPost ? [`  -H "Content-Type: application/json"`, `  -d '${BATCH_BODY.replace(/\n\s*/g, " ")}'`] : []),
    ...(png ? [`  --output ${ep.path.split("/").pop()}.png`] : []),
  ].join(" \\\n")

  const py = isPost
    ? `import requests

r = requests.post(
    "${url}",
    headers={"X-API-Key": "${key}"},
    json=${BATCH_BODY.replace(/\n/g, "\n    ")},
    timeout=60,
)
r.raise_for_status()
print(r.json())`
    : png
      ? `import requests

r = requests.get(
    "${url}",
    headers={"X-API-Key": "${key}"},
    timeout=60,
)
r.raise_for_status()
open("${ep.path.split("/").pop()}.png", "wb").write(r.content)`
      : `import requests

r = requests.get(
    "${url}",${needsKey ? `\n    headers={"X-API-Key": "${key}"},` : ""}
    timeout=60,
)
r.raise_for_status()
data = r.json()
print(data)`

  const js = isPost
    ? `const res = await fetch("${url}", {
  method: "POST",
  headers: { "X-API-Key": process.env.T1_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify(${BATCH_BODY.replace(/\n/g, "\n  ")}),
})
if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
console.log(await res.json())`
    : `const res = await fetch("${url}"${needsKey ? `, {\n  headers: { "X-API-Key": process.env.T1_API_KEY },\n}` : ""})
if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
${png ? "const png = await res.blob()" : "const data = await res.json()\nconsole.log(data)"}`

  return [
    { label: "curl", language: "bash", code: curl },
    { label: "Python", language: "python", code: py },
    { label: "JavaScript", language: "js", code: js },
  ]
}

export { endpointsOf }
