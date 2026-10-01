import type { Feature } from "./types"

/** Latest session, season/career, standings, discovery, reference data and service endpoints. */
export const otherFeatures: Feature[] = [
  // ───────────────────────── Latest session ─────────────────────────
  {
    id: "dashboard",
    group: "latest",
    title: "Latest session dashboard",
    summary: "An aggregated payload for the most recently completed session.",
    details: [
      "Finds the latest finished session from the F1 schedule and returns a bundle routed by session category (practice, qualifying, sprint qualifying, sprint, race). The keys beyond `session_type`, `year`, `round` and `session_name` depend on the session type, and each block is either that feature's normal payload or `{ \"error\": \"…\" }` if that block failed to generate.",
      "Unlike the rest of V2 this response is not immutable: it changes as a race weekend progresses, so it is revalidated every ~30 seconds instead of being cached for a day.",
    ],
    shape: "json",
    stem: "/api/v2/dashboard",
    scope: "none",
    limit: "data",
    tags: ["Live-ish"],
    returns: "{ session_type, year, round, session_name, …blocks depending on session type }",
    example: {
      response: `{
  "session_type": "qualifying",
  "year": 2025,
  "round": 1,
  "session_name": "Qualifying",
  "top_speed": [ { "Team": "McLaren", "Top Speed (km/h)": 331.0, "Color": "#FF8000" } ],
  "throttle_comparison": [ { "Driver": "NOR", "Average Throttle (%)": 71.3, "Color": "#FF8000" } ],
  "qualifying_results": [ { "Driver": "NOR", "Team": "McLaren", "LapTime": "1:26.270", "LapTimeDelta": 0.0, "Color": "#FF8000" } ]
}`,
    },
  },

  // ───────────────────────── Season & career ─────────────────────────
  {
    id: "season-events",
    group: "season",
    title: "Season events",
    summary: "Every Grand Prix weekend (meeting) in a season.",
    details: ["Fetched live from the official F1 static index, not cached. An unknown season returns 404; an upstream failure returns 502."],
    shape: "json",
    stem: "/api/v2/seasons/{year}/events",
    scope: "season",
    limit: "standard",
    returns: "{ year, events[{ name, official_name, location, country, key, code }] }",
    example: {
      response: `{
  "year": 2025,
  "events": [
    { "name": "Australia", "official_name": "FORMULA 1 LOUIS VUITTON AUSTRALIAN GRAND PRIX 2025",
      "location": "Melbourne", "country": "Australia", "key": 1254, "code": "AUS" }
  ]
}`,
    },
  },
  {
    id: "season-event-sessions",
    group: "season",
    title: "Event sessions",
    summary: "All sessions (practice, qualifying, sprint, race) of one event.",
    details: ["`event_name` is a broad match — `Italian Grand Prix` or just `Monza`-style partial names work."],
    shape: "json",
    stem: "/api/v2/seasons/{year}/events/{event_name}/sessions",
    scope: "season",
    limit: "standard",
    params: [{ name: "event_name", type: "string", required: true, in: "path", description: "Event name, broad match. e.g. Italian Grand Prix." }],
    returns: "{ year, event_name, event_key, sessions[{ name, type, number, start_date, end_date, path, key }] }",
    example: {
      response: `{
  "year": 2025,
  "event_name": "Australia",
  "event_key": 1254,
  "sessions": [
    { "name": "Practice 1", "type": "Practice", "number": 1,
      "start_date": "2025-03-14T12:30:00", "end_date": "2025-03-14T13:30:00",
      "path": "2025/2025-03-16_Australian_Grand_Prix/2025-03-14_Practice_1/", "key": 9591 }
  ]
}`,
    },
  },
  {
    id: "teammate-battle",
    group: "season",
    title: "Teammate battle",
    summary: "Season-long head-to-head scorecard for every team's pair of drivers.",
    details: [
      "Qualifying and race wins plus the average qualifying gap, per constructor. For the in-progress season the payload is regenerated on request.",
    ],
    shape: "pair",
    stem: "/api/v2/seasons/{year}/teammate-battle",
    scope: "season",
    canvas: true,
    returns: "{ teams[{ team, color, driver_a, driver_b, quali_h2h[], race_h2h[], avg_quali_gap_s, rounds_counted }] }",
    example: {
      response: `{
  "teams": [
    { "team": "McLaren", "color": "#FF8000", "driver_a": "NOR", "driver_b": "PIA",
      "quali_h2h": [14, 10], "race_h2h": [13, 11], "avg_quali_gap_s": -0.084, "rounds_counted": 24 }
  ]
}`,
    },
  },
  {
    id: "season-form-guide",
    group: "season",
    title: "Form guide",
    summary: "Rolling-average race and qualifying form for each driver across the season.",
    shape: "pair",
    stem: "/api/v2/seasons/{year}/form-guide",
    scope: "season",
    params: [
      { name: "window", type: "integer", default: "3", description: "Rolling average window in races, 2–10." },
      { name: "drivers", type: "string", description: "Comma-separated TLAs. Default: top 10 by mean finish." },
    ],
    returns: "{ window, rounds[], drivers[{ tla, team, color, rounds[], finish[], quali[], finish_rolling[], quali_rolling[] }] }",
    example: {
      response: `{
  "window": 3,
  "rounds": [1, 2, 3],
  "drivers": [
    { "tla": "NOR", "team": "McLaren", "color": "#FF8000", "rounds": [1, 2, 3],
      "finish": [1, 3, 1], "quali": [1, 2, 1],
      "finish_rolling": [null, null, 1.67], "quali_rolling": [null, null, 1.33] }
  ]
}`,
    },
  },
  {
    id: "season-driver-radar",
    group: "season",
    title: "Driver radar — season",
    summary: "Race pace, qualifying, consistency, racecraft, reliability and peak over a season.",
    shape: "pair",
    stem: "/api/v2/seasons/{year}/driver-radar",
    scope: "season",
    params: [
      { name: "drivers", type: "string", description: "Comma-separated TLAs (max 3). Default: best 3 by race pace." },
      { name: "portrait", type: "boolean", default: "false", only: "plot", description: "4:5 portrait crop for social media." },
    ],
    returns: "{ scope: \"season\", axes[], drivers[{ tla, team, color, values[], raw{} }], hero }",
    example: {
      response: `{
  "scope": "season",
  "axes": ["Race pace", "Qualifying", "Consistency", "Racecraft", "Reliability", "Peak"],
  "drivers": [ { "tla": "NOR", "team": "McLaren", "color": "#FF8000", "values": [93.0, 90.2, 84.0, 79.5, 97.0, 88.1], "raw": {} } ],
  "hero": false
}`,
    },
  },
  {
    id: "career-driver-radar",
    group: "season",
    title: "Driver radar — career",
    summary: "The same radar, aggregated over several seasons.",
    shape: "pair",
    stem: "/api/v2/career/driver-radar",
    scope: "none",
    params: [
      { name: "years", type: "string", required: true, description: "A span `2022-2025` or a list `2022,2024,2025`." },
      { name: "drivers", type: "string", description: "Comma-separated TLAs (max 3). Default: best 3 by race pace." },
      { name: "portrait", type: "boolean", default: "false", only: "plot", description: "4:5 portrait crop for social media." },
    ],
    returns: "{ scope: \"career\", axes[], drivers[], hero }",
    example: {
      query: "years=2022-2025&drivers=VER,NOR",
      response: `{
  "scope": "career",
  "axes": ["Race pace", "Qualifying", "Consistency", "Racecraft", "Reliability", "Peak"],
  "drivers": [ { "tla": "VER", "team": "Red Bull Racing", "color": "#3671C6", "values": [95.0, 91.0, 88.0, 92.0, 90.0, 97.0], "raw": {} } ],
  "hero": false
}`,
    },
  },

  // ───────────────────────── Standings ─────────────────────────
  {
    id: "standings-drivers-season",
    group: "standings",
    title: "Drivers' standings — season",
    summary: "Full-season drivers' championship standings. The canonical form.",
    shape: "json",
    stem: "/api/v2/seasons/{year}/drivers-standings",
    scope: "season",
    limit: "standard",
    returns: "{ year, round: null, source, standings[{ position, points, wins, driver_code, driver_name, team, nationality }] }",
    example: {
      response: `{
  "year": 2025,
  "round": null,
  "source": "livetiming",
  "standings": [
    { "position": 1, "points": 423.0, "wins": 7, "driver_code": "NOR", "driver_name": "Lando Norris", "team": "McLaren", "nationality": "GBR" }
  ]
}`,
    },
  },
  {
    id: "standings-constructors-season",
    group: "standings",
    title: "Constructors' standings — season",
    summary: "Full-season constructors' championship standings.",
    shape: "json",
    stem: "/api/v2/seasons/{year}/constructors-standings",
    scope: "season",
    limit: "standard",
    returns: "{ year, round: null, source, standings[{ position, points, wins, team, nationality }] }",
    example: {
      response: `{
  "year": 2025, "round": null, "source": "livetiming",
  "standings": [ { "position": 1, "points": 833.0, "wins": 14, "team": "McLaren", "nationality": "GBR" } ]
}`,
    },
  },
  {
    id: "standings-drivers-round",
    group: "standings",
    title: "Drivers' standings — after a round",
    summary: "The championship as it stood immediately after a given round.",
    shape: "json",
    stem: "/api/v2/seasons/{year}/round/{round_nr}/drivers-standings",
    scope: "season",
    limit: "standard",
    params: [{ name: "round_nr", type: "integer", required: true, in: "path", description: "Round number." }],
    returns: "{ year, round, source, standings[] }",
    example: {
      response: `{
  "year": 2025, "round": 5, "source": "livetiming",
  "standings": [ { "position": 1, "points": 107.0, "wins": 2, "driver_code": "PIA", "driver_name": "Oscar Piastri", "team": "McLaren", "nationality": "AUS" } ]
}`,
    },
  },
  {
    id: "standings-constructors-round",
    group: "standings",
    title: "Constructors' standings — after a round",
    summary: "Constructors' standings immediately after a given round.",
    shape: "json",
    stem: "/api/v2/seasons/{year}/round/{round_nr}/constructors-standings",
    scope: "season",
    limit: "standard",
    params: [{ name: "round_nr", type: "integer", required: true, in: "path", description: "Round number." }],
    returns: "{ year, round, source, standings[] }",
    example: {
      response: `{
  "year": 2025, "round": 5, "source": "livetiming",
  "standings": [ { "position": 1, "points": 203.0, "wins": 3, "team": "McLaren", "nationality": "GBR" } ]
}`,
    },
  },
  {
    id: "standings-drivers-current",
    group: "standings",
    title: "Drivers' standings — current",
    summary: "Current season; falls back to the prior season if nothing has been scored yet.",
    details: ["A short form of the canonical season endpoint. A cached snapshot is fine here; for a race weekend in progress use the live variant."],
    shape: "json",
    stem: "/api/v2/standings/drivers",
    scope: "none",
    limit: "standard",
    returns: "{ year, round, source, standings[] }",
  },
  {
    id: "standings-constructors-current",
    group: "standings",
    title: "Constructors' standings — current",
    summary: "Current season constructors' standings, with the same prior-season fallback.",
    shape: "json",
    stem: "/api/v2/standings/constructors",
    scope: "none",
    limit: "standard",
    returns: "{ year, round, source, standings[] }",
  },
  {
    id: "standings-drivers-live",
    group: "standings",
    title: "Drivers' standings — live",
    summary: "Straight from the upstream feed on every call. No cache.",
    details: ["Use this while a race weekend is in progress. Expect it to be slower and count against your rate limit on every call."],
    shape: "json",
    stem: "/api/v2/standings/drivers/live",
    scope: "none",
    limit: "standard",
    tags: ["No cache"],
    returns: "{ year, round, source, standings[] }",
  },
  {
    id: "standings-constructors-live",
    group: "standings",
    title: "Constructors' standings — live",
    summary: "Straight from the upstream feed on every call. No cache.",
    shape: "json",
    stem: "/api/v2/standings/constructors/live",
    scope: "none",
    limit: "standard",
    tags: ["No cache"],
    returns: "{ year, round, source, standings[] }",
  },

  // ───────────────────────── Discovery & batch ─────────────────────────
  {
    id: "features-catalog",
    group: "discovery",
    title: "Feature catalog",
    summary: "Machine-readable list of every V2 feature the API can generate.",
    details: [
      "Read from the same registry the backend generates from, so it can never drift from what actually exists. Filter by `session` to see only features applicable to that session type, and/or by `kind`. The catalog is static for a given build, so the response is cacheable.",
    ],
    shape: "json",
    stem: "/api/v2/features",
    scope: "none",
    limit: "standard",
    params: [
      { name: "session", type: "string", description: "Only features applicable to this session (e.g. Q, FP1, Qualifying)." },
      { name: "kind", type: "string", options: ["singleton", "per_driver", "per_pair", "per_driver_lap", "season", "career"], description: "Only features of this kind." },
    ],
    returns: "{ features[{ key, label, kind, group, applies_to[], cost, session_scoped }], count, groups[] }",
    example: {
      query: "session=Q",
      response: `{
  "features": [
    { "key": "qualifying_results", "label": "Qualifying Results", "kind": "singleton",
      "group": "Qualifying", "applies_to": ["Q", "SQ"], "cost": "light", "session_scoped": true }
  ],
  "count": 1,
  "groups": [ { "group": "Qualifying", "count": 1 } ]
}`,
    },
  },
  {
    id: "session-availability",
    group: "discovery",
    title: "Session availability",
    summary: "Which features are already generated for a session — render only populated tiles.",
    details: [
      "Lets a frontend ask once instead of firing every analysis endpoint and handling the failures. `gp` accepts a round number, event key or official name. `include_drivers=true` also resolves the participating driver TLAs; that costs a live-timing fetch, so it is off by default.",
    ],
    shape: "json",
    stem: "/api/v2/sessions/{year}/{gp}/{session}/availability",
    scope: "none",
    limit: "data",
    params: [
      { name: "year", type: "integer", required: true, in: "path", description: "Season year." },
      { name: "gp", type: "integer | string", required: true, in: "path", description: "Round number, event key or official name." },
      { name: "session", type: "string", required: true, in: "path", description: "FP1, FP2, FP3, Q, SQ, S or R." },
      { name: "include_drivers", type: "boolean", default: "false", description: "Also resolve participating driver TLAs." },
    ],
    returns: "{ year, gp, round_nr, session, available[], missing[], features[{ data_type, label, available }], drivers? }",
    example: {
      response: `{
  "year": 2025, "gp": "Australian Grand Prix", "round_nr": 1, "session": "Q",
  "available": ["qualifying_results", "top_speed_telemetry"],
  "missing": ["theoretical_best"],
  "features": [ { "data_type": "qualifying_results", "label": "Qualifying Results", "available": true } ],
  "drivers": null
}`,
    },
  },
  {
    id: "batch",
    group: "discovery",
    title: "Batch",
    summary: "Fetch up to 25 JSON features for one session in a single request.",
    details: [
      "Every uncached feature in the batch is generated inside one shared scope, so N features share one set of parsed live-timing streams instead of each re-downloading and re-parsing them. Only JSON data features are supported — no PNG plots.",
      "A failing feature is reported with its own `error` rather than failing the whole batch; always check each result's `status`. An empty list, more than 25 items or an unknown feature key is rejected with 400.",
      "Which fields each item needs depends on the feature's `kind` (see Feature catalog): singleton features need only `key`, per-driver features add `driver`, per-pair features add `driver1` and `driver2`, and per-driver-lap features add `driver` and `lap`.",
    ],
    shape: "json",
    stem: "/api/v2/batch",
    method: "POST",
    scope: "none",
    limit: "data",
    playground: false,
    params: [
      { name: "year", type: "integer", in: "body", default: "2025", description: "Season year (2018–2030)." },
      { name: "gp", type: "integer | string", in: "body", default: "1", description: "Round number, event key or official name." },
      { name: "session", type: "string", in: "body", default: "Q", description: "FP1, FP2, FP3, Q, SQ, S or R." },
      { name: "features", type: "object[]", required: true, in: "body", description: "1–25 items: `{ key, driver?, driver1?, driver2?, lap? }`." },
    ],
    returns: "{ year, gp, session, results[{ key, status: \"ok\"|\"error\", data?, error? }] }",
    example: {
      query: `POST body`,
      response: `// Request body
{
  "year": 2025,
  "gp": 1,
  "session": "Q",
  "features": [
    { "key": "qualifying_results" },
    { "key": "top_speed_telemetry" },
    { "key": "theoretical_best" }
  ]
}

// Response
{
  "year": 2025, "gp": 1, "session": "Q",
  "results": [
    { "key": "qualifying_results", "status": "ok", "data": [ /* … */ ] },
    { "key": "top_speed_telemetry", "status": "ok", "data": [ /* … */ ] },
    { "key": "theoretical_best", "status": "error", "error": "No data available for this session." }
  ]
}`,
    },
  },

  // ───────────────────────── Reference data ─────────────────────────
  {
    id: "static-drivers",
    group: "static",
    title: "Drivers",
    summary: "The grid for a season — codes, names, teams, colours and numbers.",
    details: ["Reference data: no API key needed. Seasons 2025–2026."],
    shape: "json",
    stem: "/api/static/drivers",
    scope: "none",
    auth: false,
    limit: "data",
    params: [{ name: "year", type: "integer", default: "2026", description: "Season, 2025–2026." }],
    returns: "{ drivers[{ code, name, full_name, team, color, number }] }",
    example: {
      query: "year=2026",
      response: `{
  "drivers": [
    { "code": "VER", "name": "Verstappen", "full_name": "Max Verstappen", "team": "Red Bull Racing", "color": "#3671C6", "number": 3 },
    { "code": "HAM", "name": "Hamilton", "full_name": "Lewis Hamilton", "team": "Ferrari", "color": "#E80020", "number": 44 }
  ]
}`,
    },
  },
  {
    id: "static-driver",
    group: "static",
    title: "Driver details",
    summary: "One driver, matched by name.",
    details: ["The matched driver is returned under a key named `team` (a long-standing quirk of the response shape)."],
    shape: "json",
    stem: "/api/static/drivers/{driver_name}",
    scope: "none",
    auth: false,
    limit: "data",
    params: [
      { name: "driver_name", type: "string", required: true, in: "path", description: "Driver name, e.g. Verstappen." },
      { name: "year", type: "integer", default: "2026", description: "Season, 2025–2026." },
    ],
    returns: "{ team: { code, name, full_name, team, color, number } }",
    example: {
      response: `{
  "team": { "code": "VER", "name": "Verstappen", "full_name": "Max Verstappen", "team": "Red Bull Racing", "color": "#3671C6", "number": 3 }
}`,
    },
  },
  {
    id: "static-teams",
    group: "static",
    title: "Teams",
    summary: "Every constructor for a season, with colours and drivers.",
    shape: "json",
    stem: "/api/static/teams",
    scope: "none",
    auth: false,
    limit: "data",
    params: [{ name: "year", type: "integer", default: "2026", description: "Season, 2025–2026." }],
    returns: "{ teams[{ name, alt_name?, short_name, color, drivers[] }] }",
    example: {
      query: "year=2026",
      response: `{
  "teams": [
    { "name": "McLaren", "short_name": "MCL", "color": "#FF8000", "drivers": ["NOR", "PIA"] },
    { "name": "Ferrari", "short_name": "FER", "color": "#E80020", "drivers": ["HAM", "LEC"] }
  ]
}`,
    },
  },
  {
    id: "static-team",
    group: "static",
    title: "Team details",
    summary: "One constructor, matched by name or short name.",
    shape: "json",
    stem: "/api/static/teams/{team_name}",
    scope: "none",
    auth: false,
    limit: "data",
    params: [
      { name: "team_name", type: "string", required: true, in: "path", description: "Team name or short code, e.g. McLaren or MCL." },
      { name: "year", type: "integer", default: "2026", description: "Season, 2025–2026." },
    ],
    returns: "{ team: { name, short_name, color, drivers[] } }",
    example: { response: `{ "team": { "name": "McLaren", "short_name": "MCL", "color": "#FF8000", "drivers": ["NOR", "PIA"] } }` },
  },
  {
    id: "static-circuits",
    group: "static",
    title: "Circuits",
    summary: "Every circuit used in a season.",
    shape: "json",
    stem: "/api/static/circuits",
    scope: "none",
    auth: false,
    limit: "data",
    params: [{ name: "year", type: "integer", default: "2026", description: "Season, 2024–2026." }],
    returns: "{ circuits[{ circuit_id, name, country, country_code, circuit_key, years_available[] }] }",
    example: {
      response: `{
  "circuits": [
    { "circuit_id": "10", "name": "Melbourne", "country": "Australia", "country_code": "AUS", "circuit_key": 10, "years_available": [2024, 2025, 2026] }
  ]
}`,
    },
  },
  {
    id: "static-circuit-info",
    group: "static",
    title: "Circuit summary",
    summary: "Basic information for one circuit by id.",
    shape: "json",
    stem: "/api/static/circuits/{circuit_id}/info",
    scope: "none",
    auth: false,
    limit: "data",
    params: [
      { name: "circuit_id", type: "string", required: true, in: "path", description: "Circuit id from the circuits list." },
      { name: "year", type: "integer", default: "2026", description: "Season, 2024–2026." },
    ],
    returns: "{ circuit: { circuit_id, name, country, country_code, circuit_key, years_available[] } }",
  },
  {
    id: "static-circuit-data",
    group: "static",
    title: "Circuit layout",
    summary: "Full layout: track outline, corners, rotation and marshal lights / sectors.",
    details: [
      "The layout data is stored and served by T1API itself, normalised into our own schema — it is not proxied live from a third party.",
      "The `data` object carries: `circuit_id`, `year`, `name`, `country`, `country_code`, `location`, `rotation`, `round`, `race_date`, `meeting_name`, `track_outline` (`{ x: [], y: [] }`), `corners`, `marshal_lights` and `marshal_sectors` (each a list of `{ number, angle, length, position: { x, y } }`).",
    ],
    shape: "json",
    stem: "/api/static/circuits/{circuit_id}/data",
    scope: "none",
    auth: false,
    limit: "data",
    params: [
      { name: "circuit_id", type: "string", required: true, in: "path", description: "Circuit id from the circuits list." },
      { name: "year", type: "integer", default: "2026", description: "Season, 2024–2026." },
    ],
    returns: "{ data: CircuitLayout }",
    example: {
      response: `{
  "data": {
    "circuit_id": "10", "year": 2026, "name": "Melbourne", "country": "Australia", "location": "Melbourne",
    "rotation": 44, "round": 1,
    "track_outline": { "x": [-1204.0, -1190.2], "y": [312.5, 330.1] },
    "corners": [ { "number": 1, "angle": 120.0, "length": 410.0, "position": { "x": -900.0, "y": 210.0 } } ],
    "marshal_lights": [], "marshal_sectors": []
  }
}`,
    },
  },
  {
    id: "media-drivers",
    group: "static",
    title: "Driver portraits",
    summary: "Portrait URLs for every driver on the grid.",
    details: ["No API key needed. `available` is false when an image hasn't been uploaded for that driver yet; the URL is still returned so you can retry later."],
    shape: "json",
    stem: "/api/static/media/drivers",
    scope: "none",
    auth: false,
    limit: "data",
    params: [{ name: "year", type: "integer", default: "2026", description: "Season, 2025–2026." }],
    returns: "{ year, images[{ code, name, team, number, image_url, available }] }",
    example: {
      response: `{
  "year": 2026,
  "images": [ { "code": "VER", "name": "Max Verstappen", "team": "Red Bull Racing", "number": 3, "image_url": "/assets/drivers/VER.png", "available": true } ]
}`,
    },
  },
  {
    id: "media-driver",
    group: "static",
    title: "Driver portrait redirect",
    summary: "A 302 redirect straight to a driver's PNG — drop it into an <img src>.",
    shape: "json",
    stem: "/api/static/media/drivers/{code}",
    scope: "none",
    auth: false,
    limit: "data",
    playground: false,
    params: [{ name: "code", type: "string", required: true, in: "path", description: "Three-letter driver code, e.g. VER." }],
    returns: "302 → /assets/drivers/{CODE}.png",
  },
  {
    id: "media-teams",
    group: "static",
    title: "Team logos",
    summary: "Logo URLs for every constructor.",
    shape: "json",
    stem: "/api/static/media/teams",
    scope: "none",
    auth: false,
    limit: "data",
    params: [{ name: "year", type: "integer", default: "2026", description: "Season, 2025–2026." }],
    returns: "{ year, logos[{ name, short_name, color, logo_url, available }] }",
    example: {
      response: `{
  "year": 2026,
  "logos": [ { "name": "McLaren", "short_name": "MCL", "color": "#FF8000", "logo_url": "/assets/logos/MCL.png", "available": true } ]
}`,
    },
  },
  {
    id: "media-team",
    group: "static",
    title: "Team logo redirect",
    summary: "A 302 redirect straight to a team's logo.",
    shape: "json",
    stem: "/api/static/media/teams/{short_name}",
    scope: "none",
    auth: false,
    limit: "data",
    playground: false,
    params: [{ name: "short_name", type: "string", required: true, in: "path", description: "Short team code, e.g. RBR." }],
    returns: "302 → /assets/logos/{SHORT_NAME}.png",
  },

  // ───────────────────────── Service ─────────────────────────
  {
    id: "root",
    group: "general",
    title: "Service banner",
    summary: "Name, running version and where to find the docs and health check.",
    shape: "json",
    stem: "/",
    scope: "none",
    auth: false,
    limit: "public",
    returns: "{ message, version, docs, health }",
    example: { response: `{ "message": "Welcome to the T1API", "version": "1.7.0", "docs": "https://docs.t1f1.com", "health": "/api/health" }` },
  },
  {
    id: "health",
    group: "general",
    title: "Health check",
    summary: "Liveness and dependency check — safe to use as a probe.",
    details: ["`healthy` when the database is reachable, `degraded` when it isn't (cached responses are still served), and 503 if the check itself fails."],
    shape: "json",
    stem: "/api/health",
    scope: "none",
    auth: false,
    limit: "public",
    returns: "{ status, version, environment, checks{} }",
    example: {
      response: `{
  "status": "healthy",
  "version": "1.7.0",
  "environment": "production",
  "checks": { "api": "healthy", "mongodb": "healthy", "session_tracker": "healthy", "background_processor": "running", "processed_sessions": 312, "environment": "production" }
}`,
    },
  },
  {
    id: "ping",
    group: "general",
    title: "Ping",
    summary: "A cheap authenticated ping that returns a request id and timing. Handy for checking your key.",
    shape: "json",
    stem: "/api/test/ping",
    scope: "none",
    limit: "public",
    returns: "{ status: \"pong\", request_id, timestamp, message }",
    example: { response: `{ "status": "pong", "request_id": "3f2a9c14", "timestamp": "2026-09-12T10:15:30.123456", "message": "API is responding" }` },
  },
]
