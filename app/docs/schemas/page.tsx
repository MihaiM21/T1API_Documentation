import type { Metadata } from "next"
import Link from "next/link"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import { Callout, DataTable, DocH1, DocH2, DocLead, DocP, InlineCode } from "@/components/doc-primitives"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Response schemas",
  description: "The real JSON shapes returned by T1API, as copy-paste TypeScript and Python types.",
}

const toc = [
  { id: "conventions", label: "Conventions", level: 1 as const },
  { id: "typescript", label: "TypeScript types", level: 1 as const },
  { id: "python", label: "Python types", level: 1 as const },
  { id: "errors", label: "Error shapes", level: 1 as const },
  { id: "tips", label: "Working with the data", level: 1 as const },
]

const TS = `/** Shared building blocks */
export interface SessionInfo { year: number; event_name: string; session_name: string }
export interface TrackStatusPeriod {
  status: string            // GREEN | YELLOW | SC | VSC | RED …
  start_lap: number | null; end_lap: number | null        // end_* null = still active at session end
  start_time_s: number | null; end_time_s: number | null
}
export interface LapGapPoint { lap: number; gap_s: number | null }   // null = red-flag lap; break the line

/** Simple analysis — these return a bare JSON array */
export type TopSpeed = { Team: string; "Top Speed (km/h)": number; Color: string }[]
export type ThrottleComparison = { Driver: string; "Average Throttle (%)": number; Color: string }[]
export type SpeedDistribution = { "Time (s)": number; "Speed (km/h)": number; Driver: string; Color: string }[]
export type LaptimesDistribution = {
  driver: string; lap_number: number
  lap_times_formatted: string; lap_times_seconds: number
  compound: string          // SOFT | MEDIUM | HARD | INTERMEDIATE | WET | UNKNOWN
}[]

/** Qualifying */
export type QualifyingResults = {
  Driver: string; Team: string
  LapTime: string           // "1:32.456"
  LapTimeDelta: number      // seconds behind pole; 0.0 for pole
  Color: string
}[]
export type TheoreticalBest = {
  driver: string; team: string; color: string
  theoretical_s: number; actual_s: number; delta_s: number
}[]
export interface SectorGap {
  pole: { driver: string; color: string; lap_time_s: number; sectors: number[] }
  drivers: { position: number; driver: string; color: string; lap_time_s: number; gap_s: number; sectors: number[]; sector_gaps_s: number[] }[]
  unmatched: string[]
  highlights: Record<string, unknown>; method: Record<string, unknown>
  session_info: SessionInfo
}
export interface TrackEvolution {
  overall: { minute: number; best_s: number }[]
  drivers: Record<string, { minute: number; best_s: number }[]>
  weather: { minute: number; track_temp: number }[]
}

/** Two-driver comparisons */
export interface ThrottleBrakeComparison {
  driver1: string; driver2: string; driver1_color: string; driver2_color: string
  telemetry: { distance: number; speed: number; throttle: number; brake: number; lap_time: number; driver: string }[]
}
export interface TrackComparison {
  driver1: string; driver2: string; driver1_color: string; driver2_color: string
  telemetry: {
    x: number; y: number; distance: number; speed: number; driver: string
    minisector: number; fastest_driver: string; fastest_driver_int: 0 | 1 | 2
  }[]
  session_info: SessionInfo
}
export interface LapTimeAnalysis {
  driver1: string; driver2: string; driver1_color: string; driver2_color: string
  driver1_laptime: number; driver2_laptime: number; reference_driver: string
  telemetry: { distance: number; speed: number; throttle: number; lap_time: number; driver: string }[]
  delta: { distance: number; delta: number }[]
  session_info: SessionInfo
}

/** Pace */
export type DriverPace = {
  driver: string; team: string; color: string; lap_times_seconds: number[]; lap_count: number
  min: number; q1: number; median: number; q3: number; max: number
}[]
export type TeamsPace = {
  team: string; color: string; lap_times_seconds: number[]; lap_count: number   // both cars combined
  min: number; q1: number; median: number; q3: number; max: number
}[]
export type TyreStintUsage = {
  driver: string; team: string; position: number; stint_number: number; compound: string
  start_lap: number; end_lap: number; lap_count: number; tyre_life_end: number | null; color: string
}[]

/** Race */
export type PositionChanges = {
  driver: string; team: string; color: string; start_pos: number; end_pos: number
  positions: { lap: number; position: number }[]       // lap 0 = starting grid
}[]
export type RaceGaps = { driver: string; team: string; color: string; laps: LapGapPoint[] }[]
export type TyreDegradation = {
  compound: string; color: string
  points: { driver: string; tyre_age: number; lap_time_s: number; fuel_corrected_s: number | null }[]
  deg_rate_s_per_lap: number | null; r_squared: number | null; n_points: number
}[]
export interface PitStrategy {
  stops: { driver: string; team: string; lap: number; stop_n: number; pit_lane_time_s: number | null
           compound_in: string | null; compound_out: string | null; under_sc: boolean; drive_through: boolean }[]
  undercuts: { attacker: string; defender: string; lap: number; gap_before_s: number; gap_after_s: number; gain_s: number; worked: boolean }[]
  summary: {
    fastest_stop: { driver: string; lap: number; pit_lane_time_s: number } | null
    avg_stop_by_team: { team: string; avg_pit_lane_time_s: number; n_stops: number }[]
  }
  free_changes: { driver: string; lap: number; compound_in: string; compound_out: string }[]
}
export interface SessionWeather {
  weather: { time_s: number; lap: number | null; air_temp: number | null; track_temp: number | null
             humidity: number | null; rainfall: number; wind_speed: number | null; wind_dir: number | null }[]
  track_status_periods: TrackStatusPeriod[]
  race_control: { time_s: number | null; lap: number | null; category: string | null; flag: string | null; message: string }[]
}
export interface RacePaceHeatmap {
  drivers: string[]; laps: number[]
  grid: Record<string, (number | null)[]>      // delta to field-median lap time, per driver per lap
  pit_laps: Record<string, number[]>; sc_laps: number[]
}
export interface RaceStory {
  drivers: { driver: string; team: string; color: string; finish_rank: number
             laps: LapGapPoint[]; pit_stops: { lap: number; compound: string | null }[]; last_lap: number | null }[]
  key_moments: { lap: number | null; kind: string; caption: string; n: number }[]
  track_status_periods: TrackStatusPeriod[]
}

/** Telemetry */
export interface TrackMap {
  driver: string; color_by: "speed" | "gear"; lap_time_s: number
  points: { distance: number; x: number; y: number; speed: number | null; gear: number | null; brake: number | null }[]
  braking_segments: { start_idx: number; end_idx: number; start_distance: number; end_distance: number }[]
  callouts: { top_speed: Callout | null; slowest_corner: Callout | null }
  circuit: Record<string, unknown> | null; session_info: SessionInfo
}
export interface Callout { distance: number; speed: number; x: number | null; y: number | null }
export interface CornerDuel {
  driver1: string; driver2: string; driver1_color: string; driver2_color: string; same_team: boolean
  delta_series: { distance: number; delta_s: number }[]
  speed_series: Record<string, { dist_m: number; speed_kmh: number }[]>
  corners: { number: number; apex_distance_m: number
             min_speed_kmh: Record<string, number | null>; braking_point_m: Record<string, number | null>
             delta_gain_s: number | null; beneficiary: string | null }[]
  session_info: SessionInfo
}
export interface DriverRadar {
  scope: "session" | "season" | "career"; axes: string[]; hero: boolean
  drivers: { tla: string; team: string; color: string; values: (number | null)[]; raw: Record<string, number | null> }[]
}

/** Car characteristics */
export interface EnergyClipping {
  reference_driver: string
  drivers: { driver: string; team: string | null; color: string; lap_time_s: number; lapTime: string; length_m: number
             clip_m: number; kmh_lost_max: number; time_lost_s: number
             zones: { start_m: number; end_m: number; length_m: number; speed_in_kmh: number; speed_out_kmh: number
                      kmh_lost: number; time_lost_s: number; start_fraction: number; end_fraction: number }[]
             trace: { distance: number[]; speed: number[] } }[]
  track: { x: number[]; y: number[]; fraction: number[]; rotation: number } | null
  highlights: Record<string, unknown>; method: Record<string, unknown>; session_info: SessionInfo
}
export interface CornerSpeedProfile {
  classes: Record<"slow" | "medium" | "fast", { corners: number[]; teams: { team: string; short: string; driver: string | null; color: string | null; avg_kmh: number; delta_kmh: number }[] }>
  corners: { number: number; distance_m: number; median_apex_kmh: number; class: "slow" | "medium" | "fast"; merged: number[] }[]
  highlights: Record<string, unknown>; rules: Record<string, unknown>; reference: Record<string, unknown>; session_info: SessionInfo
}
export interface EfficiencyScatter {
  teams: { team: string; short: string; driver: string | null; color: string | null; top_speed_kmh: number; avg_apex_kmh: number; lap_time_s: number }[]
  field_median: Record<string, number>; highlights: Record<string, unknown>; corners: number[]
  reference: Record<string, unknown>; session_info: SessionInfo
}

/** Season, standings, reference data */
export interface DriverStanding { position: number; points: number; wins: number; driver_code: string; driver_name: string; team: string; nationality: string | null }
export interface ConstructorStanding { position: number; points: number; wins: number; team: string; nationality: string | null }
export interface Standings<T> { year: number; round: number | null; source: string; standings: T[] }

export interface SeasonEvents { year: number; events: { name: string | null; official_name: string | null; location: string | null; country: string | null; key: number | null; code: string | null }[] }
export interface TeammateBattle { teams: { team: string; color: string | null; driver_a: string; driver_b: string; quali_h2h: [number, number]; race_h2h: [number, number]; avg_quali_gap_s: number | null; rounds_counted: number }[] }

export interface StaticDriver { code: string; name: string; full_name: string; team: string; color: string; number: number }
export interface StaticTeam { name: string; alt_name?: string; short_name: string; color: string; drivers: string[] }

/** Batch */
export interface BatchResponse {
  year: number; gp: number | string; session: string
  results: ({ key: string; status: "ok"; data: unknown } | { key: string; status: "error"; error: string })[]
}`

const PY = `from typing import Literal, TypedDict, Optional

class SessionInfo(TypedDict):
    year: int
    event_name: str
    session_name: str

class QualifyingRow(TypedDict):
    Driver: str
    Team: str
    LapTime: str            # "1:32.456"
    LapTimeDelta: float     # seconds behind pole
    Color: str

# Keys with spaces / symbols need the functional syntax:
TopSpeedRow = TypedDict("TopSpeedRow", {"Team": str, "Top Speed (km/h)": float, "Color": str})

class DriverPaceRow(TypedDict):
    driver: str
    team: str
    color: str
    lap_times_seconds: list[float]
    lap_count: int
    min: float
    q1: float
    median: float
    q3: float
    max: float

class TyreStint(TypedDict):
    driver: str
    team: str
    position: int
    stint_number: int
    compound: str
    start_lap: int
    end_lap: int
    lap_count: int
    tyre_life_end: Optional[int]
    color: str

class LapGapPoint(TypedDict):
    lap: int
    gap_s: Optional[float]      # None on a red-flag lap

class RaceGapsRow(TypedDict):
    driver: str
    team: str
    color: str
    laps: list[LapGapPoint]

class DriverStanding(TypedDict):
    position: int
    points: float
    wins: int
    driver_code: str
    driver_name: str
    team: str
    nationality: Optional[str]

class Standings(TypedDict):
    year: int
    round: Optional[int]        # None for a full season
    source: str
    standings: list[DriverStanding]

class BatchResult(TypedDict, total=False):
    key: str
    status: Literal["ok", "error"]
    data: object
    error: str`

export default function SchemasPage() {
  const { prev, next } = neighbours("/docs/schemas")
  return (
    <DocsPageWrapper toc={toc} prev={prev} next={next}>
      <DocH1 eyebrow="Reference">Response schemas</DocH1>
      <DocLead>
        What the JSON actually looks like. These types are transcribed from the API&apos;s own response models, so you can paste them into a project and
        get autocomplete on every field.
      </DocLead>

      <section id="conventions" className="scroll-mt-24">
        <DocH2 id="conventions">Conventions</DocH2>
        <DataTable
          headers={["Topic", "What to expect"]}
          mono={[]}
          rows={[
            ["Top-level shape", "Simple and pace endpoints return a bare JSON array; richer analyses return an object. The endpoint reference shows which."],
            ["Key style", "Mixed by design. Older simple endpoints use display keys like `Top Speed (km/h)`; newer ones use snake_case. Copy keys exactly."],
            ["Colours", "Hex strings (`#FF8000`) — the team or driver colour, so your chart can match."],
            ["Time", "Lap times as seconds (`lap_time_s`, `…_s`) plus a formatted string (`1:26.270`) where it helps. Gaps and deltas are seconds."],
            ["Distance & speed", "Metres along the lap (`distance`, `…_m`) and km/h."],
            ["Nulls", "A field documented as nullable really is — a red-flag lap has `gap_s: null`; treat it as a break in the line, not zero."],
            ["Delta sign", "`delta = t_b − t_a`: positive means the second driver is behind. Lap duel spells this out in `meta.delta_convention`."],
            ["Drivers", "Three-letter codes (`VER`). Team names are the current constructor names."],
          ]}
        />
        <Callout variant="info">
          Example responses in the endpoint reference use illustrative values with the real key names and nesting. Use <InlineCode>/api/v2/features</InlineCode> and the{" "}
          <Link href="/docs/playground" className="text-primary hover:underline">playground</Link> to see live payloads.
        </Callout>
      </section>

      <section id="typescript" className="scroll-mt-24">
        <DocH2 id="typescript">TypeScript types</DocH2>
        <CodeBlock language="ts" filename="t1api.d.ts" code={TS} maxHeight={640} />
      </section>

      <section id="python" className="scroll-mt-24">
        <DocH2 id="python">Python types</DocH2>
        <DocP>A core subset as <InlineCode>TypedDict</InlineCode>s — enough for type-checked access to the most common payloads.</DocP>
        <CodeBlock language="python" filename="t1api_types.py" code={PY} maxHeight={520} />
      </section>

      <section id="errors" className="scroll-mt-24">
        <DocH2 id="errors">Error shapes</DocH2>
        <TabCodeBlock
          tabs={[
            {
              label: "TypeScript",
              language: "ts",
              code: `interface ErrorEnvelope { detail: string; request_id: string; timestamp: string }

interface SessionNotFound extends ErrorEnvelope {
  error: "session_not_found"
  year?: number; gp?: number | string; session?: string
  valid_rounds?: number[]; suggestions?: string[]
}
interface DataNotAvailable extends ErrorEnvelope {          // 503, Retry-After: 300
  error: "data_not_available"
  sources_tried?: string[]; retry_after_seconds: number
}
interface UpstreamUnavailable extends ErrorEnvelope {       // 503, Retry-After: 60
  error: "upstream_unavailable"
  source?: string; retry_after_seconds: number
}`,
            },
            {
              label: "Python",
              language: "python",
              code: `class ErrorEnvelope(TypedDict):
    detail: str
    request_id: str
    timestamp: str

class DataNotAvailable(ErrorEnvelope, total=False):     # 503, Retry-After: 300
    error: Literal["data_not_available"]
    sources_tried: list[str]
    retry_after_seconds: int`,
            },
          ]}
        />
        <DocP>
          Behaviour and retry guidance live in <Link href="/docs/concepts#errors" className="text-primary hover:underline">Errors &amp; retries</Link>.
        </DocP>
      </section>

      <section id="tips" className="scroll-mt-24">
        <DocH2 id="tips">Working with the data</DocH2>
        <ul className="list-disc pl-5 space-y-2 text-[15px] text-muted-foreground">
          <li>Don&apos;t assume array order unless the endpoint says so — pace and position payloads are ordered by finishing position, others are not.</li>
          <li>Key by driver code, not by index: the set of drivers differs by session (a driver who didn&apos;t set a time simply isn&apos;t there).</li>
          <li>Validate what you depend on. Dashboard blocks, for example, can be <InlineCode>{`{"error": "…"}`}</InlineCode> if one block failed to generate.</li>
          <li>Ask for CSV when you just want rows: <InlineCode>?format=csv</InlineCode> flattens nested series to long format.</li>
        </ul>
      </section>
    </DocsPageWrapper>
  )
}
