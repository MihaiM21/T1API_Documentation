import type { Feature, Group, GroupId, Param, V1Mapping } from "./types"
import { analysisFeatures } from "./features-analysis"
import { telemetryFeatures } from "./features-telemetry"
import { otherFeatures } from "./features-other"

export type { Feature, Group, GroupId, Param, V1Mapping } from "./types"

export const API_BASE = "https://api.t1f1.com"

export const GROUPS: Group[] = [
  { id: "latest", title: "Latest session", blurb: "One call for whatever just finished." },
  { id: "simple", title: "Simple analysis", blurb: "Whole-field metrics: top speed, throttle, speed traces." },
  { id: "qualifying", title: "Qualifying", blurb: "Results, sectors, theoretical bests and head-to-head laps." },
  { id: "pace", title: "Pace", blurb: "Driver and team pace, tyre stints." },
  { id: "race", title: "Race analysis", blurb: "Positions, gaps, degradation, strategy, weather and the story of the race." },
  { id: "telemetry", title: "Telemetry", blurb: "Lap duels, corner duels, track maps and raw lap frames." },
  { id: "car", title: "Car characteristics", blurb: "Energy clipping, cornering, efficiency and field dominance." },
  { id: "season", title: "Season & career", blurb: "Calendars, teammate battles, form guides and radars." },
  { id: "standings", title: "Standings", blurb: "Championship tables — season, per-round and live." },
  { id: "discovery", title: "Discovery & batch", blurb: "Find what's available and fetch many features at once." },
  { id: "static", title: "Reference data", blurb: "Drivers, teams, circuits, portraits and logos. No key needed." },
  { id: "general", title: "Service", blurb: "Banner, health and ping." },
]

export const FEATURES: Feature[] = [...otherFeatures.filter((f) => f.group === "latest"), ...analysisFeatures, ...telemetryFeatures, ...otherFeatures.filter((f) => f.group !== "latest")]

export const SESSIONS = [
  { code: "FP1", long: "Practice 1", meaning: "Free Practice 1" },
  { code: "FP2", long: "Practice 2", meaning: "Free Practice 2" },
  { code: "FP3", long: "Practice 3", meaning: "Free Practice 3" },
  { code: "Q", long: "Qualifying", meaning: "Grand Prix qualifying" },
  { code: "SQ", long: "Sprint Qualifying", meaning: "Sprint qualifying / shootout" },
  { code: "S", long: "Sprint", meaning: "Sprint race" },
  { code: "R", long: "Race", meaning: "The Grand Prix" },
] as const

export const CANVAS_FORMATS = [
  { name: "landscape", size: "1920 × 1080", ratio: "16:9", use: "YouTube, web, slides" },
  { name: "square", size: "1080 × 1080", ratio: "1:1", use: "Instagram and X feeds" },
  { name: "portrait", size: "1080 × 1350", ratio: "4:5", use: "Instagram portrait posts" },
  { name: "story", size: "1080 × 1920", ratio: "9:16", use: "Stories, Reels, Shorts, TikTok" },
] as const

// ───────────────────────── Derived helpers ─────────────────────────

export interface Endpoint {
  featureId: string
  variant: "plot" | "data" | "single"
  method: "GET" | "POST"
  path: string
  /** PNG or JSON. */
  response: "png" | "json"
  limit: "standard" | "data" | "public"
  auth: boolean
}

export function endpointsOf(f: Feature): Endpoint[] {
  const method = f.method ?? "GET"
  const auth = f.auth !== false
  if (f.shape === "pair") {
    return [
      { featureId: f.id, variant: "plot", method, path: `${f.stem}-plot`, response: "png", limit: "standard", auth },
      { featureId: f.id, variant: "data", method, path: `${f.stem}-data`, response: "json", limit: "data", auth },
    ]
  }
  return [
    {
      featureId: f.id,
      variant: "single",
      method,
      path: f.stem,
      response: f.shape === "png" ? "png" : "json",
      limit: f.limit ?? (f.shape === "png" ? "standard" : "data"),
      auth,
    },
  ]
}

export const ALL_ENDPOINTS: Endpoint[] = FEATURES.flatMap(endpointsOf)

const sessionParams = (def: string): Param[] => [
  { name: "year", type: "integer", default: "2025", description: "Season, 2018–2030." },
  {
    name: "gp",
    type: "integer | string",
    default: "1",
    description: "Round number, event key, or official event name (e.g. `Italian Grand Prix`).",
  },
  {
    name: "session",
    type: "string",
    default: def,
    description: "FP1, FP2, FP3, Q, SQ, S or R. Long names such as `Qualifying` work too.",
    options: ["FP1", "FP2", "FP3", "Q", "SQ", "S", "R"],
  },
]

const seasonParams: Param[] = [
  { name: "year", type: "integer", required: true, in: "path", description: "Season year." },
]

const canvasParam: Param = {
  name: "format",
  type: "string",
  only: "plot",
  options: ["landscape", "square", "portrait", "story"],
  description: "Social-media canvas. Omit for the classic image. The plot is re-composed, not cropped.",
}

/** Merge the common params for a feature's scope with its own (own params win by name). */
export function paramsOf(f: Feature, variant: "plot" | "data" | "single" = "single"): Param[] {
  const base =
    f.scope === "session" ? sessionParams(f.sessionDefault ?? "Q") : f.scope === "season" ? seasonParams : []
  const own = f.params ?? []
  const ownNames = new Set(own.map((p) => p.name))
  const merged = [...base.filter((p) => !ownNames.has(p.name)), ...own]
  if (f.canvas) merged.push(canvasParam)
  // Keep path params first, then required, then the rest in declared order.
  const rank = (p: Param) => (p.in === "path" ? 0 : p.in === "body" ? 1 : p.required ? 2 : 3)
  const filtered = merged.filter((p) => {
    if (!p.only) return true
    if (variant === "single") return true
    return p.only === variant
  })
  return filtered
    .map((p, i) => [p, i] as const)
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1])
    .map(([p]) => p)
}

export function groupOf(id: GroupId): Group {
  return GROUPS.find((g) => g.id === id)!
}

export function featuresByGroup(): Array<{ group: Group; features: Feature[] }> {
  return GROUPS.map((group) => ({ group, features: FEATURES.filter((f) => f.group === group.id) })).filter(
    (g) => g.features.length > 0,
  )
}

const ANALYSIS_GROUPS: GroupId[] = ["latest", "simple", "qualifying", "pace", "race", "telemetry", "car", "season", "standings"]

export const STATS = {
  features: FEATURES.length,
  analyses: FEATURES.filter((f) => ANALYSIS_GROUPS.includes(f.group)).length,
  endpoints: ALL_ENDPOINTS.length,
  plots: ALL_ENDPOINTS.filter((e) => e.response === "png").length,
  json: ALL_ENDPOINTS.filter((e) => e.response === "json").length,
}

/** Sample default values for playground & curl generation. */
export function defaultValue(p: Param): string {
  if (p.default !== undefined) return p.default
  if (p.options?.length) return p.options[0]
  return ""
}

export function buildQuery(values: Record<string, string>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(values)) if (v !== "") sp.set(k, v)
  const s = sp.toString()
  return s ? `?${s}` : ""
}

// ───────────────────────── V1 → V2 ─────────────────────────

/** Every `/api/v1` route and its v2 replacement. V1 is deprecated; sunset 2027-09-01. */
export const V1_SUNSET = "2027-09-01"

export const V1_MAP: V1Mapping[] = [
  { v1: "/api/v1/top-speed-plot", v2: "/api/v2/top-speed-telemetry-plot", note: "Same CarData source. V2 adds `format`." },
  { v1: "/api/v1/top-speed-data", v2: "/api/v2/top-speed-telemetry-data" },
  { v1: "/api/v1/throttle-comparison-plot", v2: "/api/v2/throttle-comparison-plot" },
  { v1: "/api/v1/throttle-comparison-data", v2: "/api/v2/throttle-comparison-data" },
  { v1: "/api/v1/qualifying-results-plot", v2: "/api/v2/qualifying-results-plot" },
  { v1: "/api/v1/qualifying-results-data", v2: "/api/v2/qualifying-results-data" },
  { v1: "/api/v1/laptimes", v2: "/api/v2/laptimes-distribution-data", note: "`driver` is required in V2." },
  { v1: "/api/v1/speed-distribution-plot", v2: "/api/v2/speed-distribution-plot" },
  { v1: "/api/v1/speed-distribution-data", v2: "/api/v2/speed-distribution-data" },
  { v1: "/api/v1/track-comparison-2drivers-plot", v2: "/api/v2/track-comparison-plot", note: "`driver1`/`driver2` → `d1`/`d2`." },
  { v1: "/api/v1/track-comparison-2drivers-data", v2: "/api/v2/track-comparison-data", note: "`driver1`/`driver2` → `d1`/`d2`." },
  { v1: "/api/v1/throttleBrake-comparison-2drivers-plot", v2: "/api/v2/throttle-brake-comparison-plot", note: "`driver1`/`driver2` → `d1`/`d2`; kebab-case path." },
  { v1: "/api/v1/throttleBrake-comparison-2drivers-data", v2: "/api/v2/throttle-brake-comparison-data", note: "`driver1`/`driver2` → `d1`/`d2`; kebab-case path." },
  { v1: "/api/v1/lap-time-analysis-plot", v2: "/api/v2/lap-time-analysis-plot", note: "`driver1`/`driver2` → `d1`/`d2`." },
  { v1: "/api/v1/lap-time-analysis-data", v2: "/api/v2/lap-time-analysis-data", note: "`driver1`/`driver2` → `d1`/`d2`." },
  { v1: "/api/v1/driver-pace-plot", v2: "/api/v2/driver-pace-plot" },
  { v1: "/api/v1/driver-pace-data", v2: "/api/v2/driver-pace-data" },
  { v1: "/api/v1/teams-pace-plot", v2: "/api/v2/teams-pace-plot" },
  { v1: "/api/v1/teams-pace-data", v2: "/api/v2/teams-pace-data" },
  { v1: "/api/v1/tyre-stint-usage-plot", v2: "/api/v2/tyre-stint-usage-plot" },
  { v1: "/api/v1/tyre-stint-usage-data", v2: "/api/v2/tyre-stint-usage-data" },
  { v1: "/api/v1/dashboard", v2: "/api/v2/dashboard" },
  { v1: "/api/v1/seasons", v2: null, note: "No equivalent. Use /api/static/drivers?year= for 2025–2026 coverage." },
  { v1: "/api/v1/season/{year}", v2: null, note: "Compose /api/v2/seasons/{year}/events with /api/static/drivers and /api/static/teams." },
  { v1: "/api/v1/season/{year}/drivers", v2: "/api/static/drivers", note: "Curated reference data, 2025–2026 only. Not a drop-in for older years." },
  { v1: "/api/v1/season/{year}/teams", v2: "/api/static/teams", note: "Curated reference data, 2025–2026 only. Not a drop-in for older years." },
  { v1: "/api/v1/season/{year}/driver/{driver_code}", v2: "/api/static/drivers/{driver_name}" },
  { v1: "/api/v1/season/{year}/team/{team_name}", v2: "/api/static/teams/{team_name}" },
  { v1: "/api/v1/daily-data", v2: null, note: "Novelty endpoint, no replacement. Request top-speed / throttle data for a specific session instead." },
  { v1: "/api/v1/analytics/daily", v2: null, note: "Internal request-tracking telemetry. No replacement planned." },
  { v1: "/api/v1/analytics/total", v2: null, note: "Internal request-tracking telemetry. No replacement planned." },
]
