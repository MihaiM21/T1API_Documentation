export type ChangeType = "new" | "improved" | "fixed" | "deprecated" | "breaking"

export interface Change {
  type: ChangeType
  text: string
  /** Endpoint / doc link for readers who want to jump straight in. */
  href?: string
}

export interface Release {
  version: string
  date: string
  iso: string
  summary: string
  changes: Change[]
}

/**
 * User-facing release notes, newest first. Derived from the API repository's CHANGELOG and commit
 * history; internal/operator-only work (admin console, backups, CI) is intentionally left out.
 */
export const releases: Release[] = [
  {
    version: "1.7.0",
    date: "September 11, 2026",
    iso: "2026-09-11",
    summary: "Discovery, batch, CSV export, lap-level telemetry, live standings and a documented-everywhere API.",
    changes: [
      { type: "new", text: "CSV export: append ?format=csv to any JSON endpoint under /api/v1 or /api/v2.", href: "/docs/concepts#csv" },
      { type: "new", text: "Feature discovery — GET /api/v2/features lists every generatable feature; /sessions/{year}/{gp}/{session}/availability shows what's ready.", href: "/docs/endpoints#features-catalog" },
      { type: "new", text: "POST /api/v2/batch fetches up to 25 JSON features for one session in a single request.", href: "/docs/endpoints#batch" },
      { type: "new", text: "Lap-level telemetry: resampled multi-driver frames (/telemetry/laps-data) and session circuit geometry (/telemetry/track-map).", href: "/docs/endpoints#telemetry-laps" },
      { type: "new", text: "Live drivers' and constructors' standings that bypass the cache.", href: "/docs/endpoints#standings-drivers-live" },
      { type: "new", text: "Driver portrait and team logo media endpoints under /api/static/media.", href: "/docs/endpoints#media-drivers" },
      { type: "new", text: "Full single-lap data — GET /api/v2/lap-all-data.", href: "/docs/endpoints#lap-all-data" },
      { type: "improved", text: "Circuit layouts are now stored and served in our own schema, with better processing and Madring added.", href: "/docs/endpoints#static-circuit-data" },
      { type: "improved", text: "The OpenAPI / Swagger documentation describes every response and error shape, with a common error envelope." },
      { type: "deprecated", text: "API V1 is deprecated. Every /api/v1 response now carries Deprecation and Sunset (2027-09-01) headers.", href: "/docs/migration" },
      { type: "fixed", text: "Qualifying results on sprint weekends returned the sprint shootout for the Grand Prix session — now correct." },
      { type: "fixed", text: "Corner-duel corner numbering, plus clean-lap selection for duels." },
      { type: "fixed", text: "Hardened API-key handling." },
    ],
  },
  {
    version: "1.6.0",
    date: "July 18, 2026",
    iso: "2026-07-18",
    summary: "More plots, better caching and race-only stint charts.",
    changes: [
      { type: "new", text: "New plots available, with better caching behind them." },
      { type: "new", text: "Tyre stint charts for race sessions.", href: "/docs/endpoints#tyre-stint-usage" },
      { type: "fixed", text: "Assorted data-pipeline errors." },
    ],
  },
  {
    version: "1.5.0",
    date: "June 20, 2026",
    iso: "2026-06-20",
    summary: "Championship standings and pace analysis.",
    changes: [
      { type: "new", text: "Drivers' and constructors' standings — for a season, after any round, or current.", href: "/docs/endpoints#group-standings" },
      { type: "new", text: "Driver and team pace analysis.", href: "/docs/endpoints#driver-pace" },
    ],
  },
  {
    version: "1.4.2",
    date: "June 13, 2026",
    iso: "2026-06-13",
    summary: "Data-acquisition fixes.",
    changes: [{ type: "fixed", text: "Fixed data acquisition." }],
  },
  {
    version: "1.4.1",
    date: "June 6, 2026",
    iso: "2026-06-06",
    summary: "More accurate latest-session detection.",
    changes: [{ type: "fixed", text: "The latest finished session is now found more accurately.", href: "/docs/endpoints#dashboard" }],
  },
  {
    version: "1.4.0",
    date: "June 3, 2026",
    iso: "2026-06-03",
    summary: "Accounts, self-service API keys and a typed error model.",
    changes: [
      { type: "breaking", text: "Internal restructure of the platform (new project structure and test suite)." },
      { type: "new", text: "User accounts and self-service API keys, with per-key usage.", href: "/docs/account" },
      { type: "new", text: "V2 latest-session dashboard.", href: "/docs/endpoints#dashboard" },
      { type: "improved", text: "Redis caching layer.", href: "/docs/concepts#caching" },
      { type: "improved", text: "Structured errors: 404 session_not_found and 503 data_not_available / upstream_unavailable with Retry-After.", href: "/docs/concepts#errors" },
    ],
  },
  {
    version: "1.3.7",
    date: "May 5, 2026",
    iso: "2026-05-05",
    summary: "Pipeline fix.",
    changes: [{ type: "fixed", text: "Pipeline fix." }],
  },
  {
    version: "1.3.6",
    date: "May 1, 2026",
    iso: "2026-05-01",
    summary: "Fallback when the static client is unavailable.",
    changes: [{ type: "fixed", text: "Added a fallback for when our F1 static client is not working.", href: "/docs/concepts#versioning" }],
  },
  {
    version: "1.3.5",
    date: "April 18, 2026",
    iso: "2026-04-18",
    summary: "Schedule correction.",
    changes: [{ type: "fixed", text: "Marked the Bahrain and Saudi Arabian Grands Prix as cancelled." }],
  },
  {
    version: "1.3.4",
    date: "April 7, 2026",
    iso: "2026-04-07",
    summary: "Static reference data.",
    changes: [{ type: "new", text: "Static data endpoints for driver and team data.", href: "/docs/endpoints#group-static" }],
  },
  {
    version: "1.3.3",
    date: "April 3, 2026",
    iso: "2026-04-03",
    summary: "Deployment updates.",
    changes: [{ type: "improved", text: "Docker files updated." }],
  },
  {
    version: "1.3.2",
    date: "April 2, 2026",
    iso: "2026-04-02",
    summary: "Dockerfile fix.",
    changes: [{ type: "fixed", text: "Dockerfile fix." }],
  },
  {
    version: "1.3.1",
    date: "April 2, 2026",
    iso: "2026-04-02",
    summary: "Swagger sign-in.",
    changes: [{ type: "improved", text: "Added authorisation login for the Swagger UI." }],
  },
  {
    version: "1.3.0",
    date: "March 13, 2026",
    iso: "2026-03-13",
    summary: "A new plot analysis type.",
    changes: [{ type: "new", text: "New plot analysis type, with a refactored static client and dashboard endpoint." }],
  },
  {
    version: "1.2.1",
    date: "March 7, 2026",
    iso: "2026-03-07",
    summary: "Storage fix.",
    changes: [{ type: "fixed", text: "Fixed a bug when saving to MongoDB." }],
  },
  {
    version: "1.2.0",
    date: "March 1, 2026",
    iso: "2026-03-01",
    summary: "Flexible gp, event discovery and V2 throttle comparison.",
    changes: [
      { type: "new", text: "Endpoints for the available Grands Prix and their sessions.", href: "/docs/endpoints#season-events" },
      { type: "new", text: "Throttle comparison on V2, with better static-client data mapping.", href: "/docs/endpoints#throttle-comparison" },
      { type: "new", text: "V2 accepts a round number, event key or official name for gp.", href: "/docs/concepts#gp" },
      { type: "fixed", text: "V2 top speed calculation." },
    ],
  },
  {
    version: "1.1.0",
    date: "February 7, 2026",
    iso: "2026-02-07",
    summary: "Monitoring, and a driver-number correction.",
    changes: [
      { type: "new", text: "Monitoring." },
      { type: "fixed", text: "Lando Norris's 2026 driver number (4 → 1)." },
    ],
  },
  {
    version: "1.0.2",
    date: "January 1, 2026",
    iso: "2026-01-01",
    summary: "Two-driver comparison fix.",
    changes: [{ type: "fixed", text: "Fixed two-driver comparison data processing." }],
  },
  {
    version: "1.0.1",
    date: "December 31, 2025",
    iso: "2025-12-31",
    summary: "Deployment fix.",
    changes: [{ type: "fixed", text: "Docker Compose fix." }],
  },
  {
    version: "1.0.0",
    date: "December 31, 2025",
    iso: "2025-12-31",
    summary: "First stable release.",
    changes: [
      { type: "new", text: "Pipeline and versioning update." },
      { type: "fixed", text: "Lap-times distribution and latest-session retrieval." },
    ],
  },
  {
    version: "0.1.0",
    date: "December 12, 2025",
    iso: "2025-12-12",
    summary: "Initial release.",
    changes: [{ type: "new", text: "First public build of the API." }],
  },
]

export function releaseId(version: string) {
  return `v${version.replace(/\./g, "-")}`
}
