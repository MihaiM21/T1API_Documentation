export type GroupId =
  | "latest"
  | "simple"
  | "qualifying"
  | "pace"
  | "race"
  | "telemetry"
  | "car"
  | "season"
  | "standings"
  | "discovery"
  | "static"
  | "general"

export interface Group {
  id: GroupId
  title: string
  blurb: string
}

export interface Param {
  name: string
  type: string
  required?: boolean
  default?: string
  description: string
  /** Where the value goes. Defaults to "query". */
  in?: "query" | "path" | "body"
  /** Only meaningful on the PNG (`-plot`) or the JSON (`-data`) variant. */
  only?: "plot" | "data"
  options?: string[]
}

/** How the path parameters that address a session are shaped. */
export type Scope =
  | "session" // year + gp + session
  | "season" // year in path
  | "none" // explicit params only

export interface Feature {
  /** Stable anchor id, e.g. "lap-duel". */
  id: string
  group: GroupId
  title: string
  summary: string
  /** Extra paragraphs shown when the card is expanded. */
  details?: string[]
  /**
   * `pair`  → `${stem}-plot` (PNG) and `${stem}-data` (JSON)
   * `json`  → a single JSON endpoint at `stem`
   * `png`   → a single PNG endpoint at `stem`
   */
  shape: "pair" | "json" | "png"
  stem: string
  method?: "GET" | "POST"
  scope: Scope
  /** Default `session` value when scope === "session". */
  sessionDefault?: string
  /** Human description of which sessions the feature works for. */
  applies?: string
  /** Params beyond the common session params. */
  params?: Param[]
  /** The plot accepts `format=landscape|square|portrait|story`. */
  canvas?: boolean
  /** Requires an API key? Defaults to true. */
  auth?: boolean
  /** Rate-limit counter. `data` endpoints share a separate 60/min bucket. */
  limit?: "standard" | "data" | "public"
  tags?: string[]
  /** One-line description of the JSON shape. */
  returns?: string
  example?: {
    query?: string
    response: string
    note?: string
  }
  /** Can the playground call it? Defaults to true. */
  playground?: boolean
}

export interface V1Mapping {
  v1: string
  v2: string | null
  note?: string
}
