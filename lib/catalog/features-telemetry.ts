import type { Feature, Param } from "./types"

const lapDuelParams: Param[] = [
  { name: "driver1", type: "string", required: true, description: "First driver TLA, e.g. VER." },
  { name: "driver2", type: "string", required: true, description: "Second driver TLA, e.g. NOR." },
  { name: "lap1", type: "integer", description: "Lap number for driver1. Default: their fastest clean lap." },
  { name: "lap2", type: "integer", description: "Lap number for driver2. Default: their fastest clean lap." },
  { name: "segment1", type: "string", options: ["Q1", "Q2", "Q3"], description: "Use driver1's best lap from that part of qualifying." },
  { name: "segment2", type: "string", options: ["Q1", "Q2", "Q3"], description: "Use driver2's best lap from that part of qualifying." },
  { name: "year2", type: "integer", description: "Season for driver2's lap. Default: `year`." },
  { name: "gp2", type: "integer | string", description: "Event for driver2's lap. Default: `gp`." },
  { name: "session2", type: "string", description: "Session for driver2's lap. Default: `session`." },
  { name: "detail", type: "string", default: "standard", options: ["standard", "full"], description: "`full` adds derived longitudinal / lateral g (indicative only, ~4 Hz telemetry)." },
]

/** Telemetry-level and field-wide car analysis. */
export const telemetryFeatures: Feature[] = [
  // ───────────────────────── Telemetry ─────────────────────────
  {
    id: "lap-duel",
    group: "telemetry",
    title: "Lap duel",
    summary: "Two laps on one distance axis, with a track map of who gained where.",
    details: [
      "Each side is one lap, chosen independently: the driver's fastest clean lap (default), an exact lap number, the best lap inside Q1/Q2/Q3, or even a lap from another session, year or event (2025 pole vs 2026 pole, qualifying vs race pace).",
      "Both laps are placed on one distance grid by lap fraction so cross-year laps line up corner for corner and the delta ends at exactly the lap-time difference.",
      "Delta convention: delta = t_b − t_a. Positive means driver2 is behind driver1. Naming the same lap on both sides, or an unknown segment / detail / format, returns 400.",
    ],
    shape: "pair",
    stem: "/api/v2/lap-duel",
    scope: "session",
    applies: "Any session",
    canvas: true,
    tags: ["Cross-session"],
    params: [
      ...lapDuelParams,
      { name: "hero", type: "boolean", default: "false", only: "plot", description: "Show driver headshots on the driver plates." },
    ],
    returns: "{ a, b, distance[], delta[], corners[], apexes[], sections[], track, highlights, meta, accelerations? }",
    example: {
      query: "year=2025&gp=1&session=Q&driver1=VER&driver2=NOR",
      response: `{
  "a": { "driverCode": "VER", "team": "Red Bull Racing", "color": "#3671C6", "lapTime": "1:26.408",
         "lap_time_s": 86.408, "selection": "fastest", "length_m": 5278.0,
         "speed": [281.0, 283.4], "throttle": [1.0, 1.0], "brake": [0, 0], "gear": [8, 8], "rpm": [11200, 11350], "drs": [12, 12] },
  "b": { "driverCode": "NOR", "lapTime": "1:26.270", "lap_time_s": 86.27, "selection": "fastest" },
  "distance": [0.0, 25.0],
  "delta": [0.0, -0.004],
  "sections": [ { "start_m": 410.0, "end_m": 520.0, "corners": [1], "delta_change_s": -0.061, "label": "T1", "gainer": "b" } ],
  "highlights": { "gap_s": 0.138, "faster": "b", "top_speed_kmh": { "a": 327.0, "b": 331.0 } },
  "same_session": true, "same_team": false,
  "meta": { "delta_convention": "delta = t_b - t_a; positive = driver2 behind driver1", "distance_basis": "lap fraction", "source": "F1 live timing" }
}`,
    },
  },
  {
    id: "corner-duel",
    group: "telemetry",
    title: "Corner duel",
    summary: "Corner-by-corner apex speeds, braking points and time gained.",
    shape: "pair",
    stem: "/api/v2/corner-duel",
    scope: "session",
    applies: "Any session",
    params: [
      { name: "driver1", type: "string", required: true, description: "First driver TLA." },
      { name: "driver2", type: "string", required: true, description: "Second driver TLA." },
    ],
    returns: "{ driver1, driver2, colours, same_team, delta_series[], speed_series{}, corners[] }",
    example: {
      query: "year=2025&gp=1&session=Q&driver1=VER&driver2=NOR",
      response: `{
  "driver1": "VER", "driver2": "NOR",
  "same_team": false,
  "delta_series": [ { "distance": 0.0, "delta_s": 0.0 } ],
  "corners": [
    { "number": 1, "apex_distance_m": 455.0,
      "min_speed_kmh": { "VER": 88.0, "NOR": 91.0 },
      "braking_point_m": { "VER": 352.0, "NOR": 360.0 },
      "delta_gain_s": 0.061, "beneficiary": "NOR" }
  ]
}`,
    },
  },
  {
    id: "track-map",
    group: "telemetry",
    title: "Telemetry track map",
    summary: "A driver's fastest lap drawn on the circuit, coloured by speed or gear.",
    details: ["Includes braking zones and callouts for the top speed and the slowest corner."],
    shape: "pair",
    stem: "/api/v2/track-map",
    scope: "session",
    applies: "Any session",
    params: [
      { name: "driver", type: "string", required: true, description: "Driver TLA." },
      { name: "color_by", type: "string", default: "speed", options: ["speed", "gear"], description: "What colours the racing line." },
    ],
    returns: "{ driver, color_by, lap_time_s, points[], braking_segments[], callouts, circuit, session_info }",
    example: {
      query: "year=2025&gp=1&session=Q&driver=VER&color_by=speed",
      response: `{
  "driver": "VER", "color_by": "speed", "lap_time_s": 86.408,
  "points": [ { "distance": 0.0, "x": -1204.0, "y": 312.5, "speed": 281.0, "gear": 8, "brake": 0.0 } ],
  "braking_segments": [ { "start_idx": 120, "end_idx": 141, "start_distance": 402.0, "end_distance": 455.0 } ],
  "callouts": { "top_speed": { "distance": 1610.0, "speed": 327.0, "x": 910.2, "y": -44.0 },
                "slowest_corner": { "distance": 2980.0, "speed": 71.0, "x": -220.0, "y": 801.0 } }
}`,
    },
  },
  {
    id: "driver-radar",
    group: "telemetry",
    title: "Driver radar — session",
    summary: "A radar of top speed, cornering, pace, consistency and braveness.",
    details: ["Axis values are scaled 0–100; the raw metric behind each spoke is included under `raw`."],
    shape: "pair",
    stem: "/api/v2/driver-radar",
    scope: "session",
    sessionDefault: "R",
    applies: "Any session",
    params: [
      { name: "drivers", type: "string", description: "Comma-separated TLAs (max 3). Defaults to the fastest three." },
      { name: "portrait", type: "boolean", default: "false", only: "plot", description: "4:5 portrait crop for social media." },
    ],
    returns: "{ scope, axes[], drivers[{ tla, team, color, values[], raw{} }], hero }",
    example: {
      query: "year=2025&gp=1&session=R&drivers=VER,NOR,LEC",
      response: `{
  "scope": "session",
  "axes": ["Top speed", "Cornering", "Race pace", "Consistency", "Braveness"],
  "drivers": [
    { "tla": "NOR", "team": "McLaren", "color": "#FF8000",
      "values": [92.0, 88.5, 95.1, 81.0, 76.4],
      "raw": { "top_speed_kmh": 331.0, "median_lap_s": 82.3 } }
  ],
  "hero": false
}`,
    },
  },
  {
    id: "lap-all-data",
    group: "telemetry",
    title: "Full lap data",
    summary: "Everything about one driver's single lap — telemetry, tyre, sectors, weather.",
    details: [
      "Full telemetry time-series (speed, RPM, throttle, brake, gear, DRS, X/Y/Z position, distance) plus lap, tyre, sector and pit metadata, the nearest weather sample, track status and driver context.",
    ],
    shape: "json",
    stem: "/api/v2/lap-all-data",
    scope: "session",
    limit: "data",
    applies: "Any session",
    params: [
      { name: "driver", type: "string", required: true, description: "Driver TLA." },
      { name: "lap", type: "integer", required: true, description: "Lap number (≥ 1)." },
    ],
    returns: "{ driver, lap, tyre, sectors, weather, track_status[], telemetry[], session_info }",
    example: {
      query: "year=2025&gp=1&session=R&driver=VER&lap=10",
      response: `{
  "driver": { "tla": "VER", "name": "Max Verstappen", "team": "Red Bull Racing", "color": "#3671C6", "racing_number": "1" },
  "lap": { "number": 10, "lap_time_s": 83.214, "pit_in": false, "pit_out": false, "position": 2 },
  "tyre": { "compound": "MEDIUM", "stint_number": 1, "tyre_life_end": 10, "start_lap": 1, "end_lap": 24 },
  "sectors": { "s1": 27.4, "s2": 29.9, "s3": 25.9 },
  "telemetry": [
    { "time": 0.0, "distance": 0.0, "speed": 281.0, "rpm": 11200, "throttle": 100, "brake": 0, "gear": 8, "drs": 12, "x": -1204.0, "y": 312.5, "z": 7.0 }
  ]
}`,
    },
  },
  {
    id: "telemetry-laps",
    group: "telemetry",
    title: "Resampled lap frames",
    summary: "Uniform-rate, multi-driver telemetry frames, ready for animation playback.",
    details: [
      "All drivers are resampled onto one shared time grid — one row per tick with position, throttle, brake and the rest — instead of each driver's raw samples landing on different instants. Pair it with the session track map to animate cars over the circuit.",
      "`hz` sets the frame rate (1–20), `format` chooses `frames` (array of samples) or `columnar` (one array per field), and `precision` rounds every float. The response's `range.driver_laps` and `range.frame_count` reflect the real cost of the request; one over the service's frame budget is rejected with 400 before any work is done, and the message suggests a lower `hz`.",
    ],
    shape: "json",
    stem: "/api/v2/telemetry/laps-data",
    scope: "session",
    sessionDefault: "R",
    limit: "data",
    applies: "Any session",
    params: [
      { name: "drivers", type: "string", required: true, description: "Comma-separated TLAs, e.g. VER,HAM." },
      { name: "lap_from", type: "integer", required: true, description: "First lap (≥ 1)." },
      { name: "lap_to", type: "integer", description: "Last lap. Defaults to `lap_from`." },
      { name: "hz", type: "integer", default: "10", description: "Output frame rate, 1–20." },
      { name: "format", type: "string", default: "frames", options: ["frames", "columnar"], description: "Shape of the per-driver payload." },
      { name: "precision", type: "integer", default: "2", description: "Decimal places for floats, 0–6." },
      { name: "include_track", type: "boolean", default: "false", description: "Include the circuit geometry in the response." },
    ],
    returns: "{ session_info, range, drivers[{ driver, laps[], gaps[], frames | columns }], track? }",
    example: {
      query: "year=2025&gp=1&session=R&drivers=VER,NOR&lap_from=5&hz=5",
      response: `{
  "session_info": { "year": 2025, "event_name": "Australian Grand Prix", "session_name": "Race", "round": 1 },
  "range": { "lap_from": 5, "lap_to": 5, "hz": 5, "format": "frames", "precision": 2, "frame_count": 420, "driver_laps": 2 },
  "drivers": [
    {
      "driver": { "tla": "VER", "car_number": "1", "name": "Max Verstappen", "team": "Red Bull Racing", "color": "#3671C6" },
      "laps": [ { "number": 5, "lap_time_s": 83.4, "start_s": 402.1, "end_s": 485.5, "pit_in": false, "pit_out": false } ],
      "gaps": [],
      "frames": [ { "t": 0.0, "lap": 5, "session_time": 402.1, "d": 0.0, "x": -1204.0, "y": 312.5, "z": 7.0,
                    "speed": 281.0, "throttle": 100.0, "brake": 0.0, "gear": 8, "rpm": 11200.0, "drs": 12, "status": "ok" } ]
    }
  ],
  "track": null
}`,
    },
  },
  {
    id: "telemetry-track-map",
    group: "telemetry",
    title: "Circuit geometry",
    summary: "The circuit only — rotation, corners and outline. No driver attached.",
    details: [
      "Distinct from Telemetry track map, which colours one driver's lap. This returns just the circuit so you can draw the track once and animate cars over it with the frames endpoint.",
    ],
    shape: "json",
    stem: "/api/v2/telemetry/track-map",
    scope: "session",
    sessionDefault: "R",
    limit: "data",
    applies: "Any session",
    returns: "{ session_info, track{ rotation, corners[], outline[[x, y]] } }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `{
  "session_info": { "year": 2025, "event_name": "Australian Grand Prix", "session_name": "Race", "round": 1 },
  "track": { "rotation": 44, "corners": [ { "number": 1, "angle": 120.0, "length": 410.0, "position": { "x": -900.0, "y": 210.0 } } ],
             "outline": [[-1204.0, 312.5], [-1190.2, 330.1]] }
}`,
    },
  },

  // ───────────────────────── Car characteristics ─────────────────────────
  {
    id: "energy-clipping",
    group: "car",
    title: "Energy clipping",
    summary: "Estimated time lost where a car runs out of deployable energy at full throttle.",
    details: [
      "2026+ only. Requests for an earlier season return 404, because the pre-2026 rules make the measurement meaningless (a 2025 lap reads zero).",
      "For every driver's fastest clean lap the API finds stretches where speed falls while the driver is flat out (throttle ≥ 98 %, brake off, sustained ≥ 40 m and ≥ 3 km/h). Drag alone can't slow a car at full throttle, so a normal drag-limited plateau is never flagged. The result is deliberately conservative and therefore estimated; `time_lost_s` is the time over the zone compared with holding the zone's entry speed.",
    ],
    shape: "pair",
    stem: "/api/v2/energy-clipping",
    scope: "session",
    applies: "2026+ power units, any session",
    canvas: true,
    tags: ["2026+"],
    params: [
      { name: "year", type: "integer", default: "2026", description: "Season. 2026 or later; earlier returns 404." },
      { name: "driver", type: "string", only: "plot", description: "Driver TLA whose zones are highlighted. Default: the pole lap." },
    ],
    returns: "{ drivers[{ driver, time_lost_s, clip_m, kmh_lost_max, zones[], trace }], reference_driver, track, highlights, method, session_info }",
    example: {
      query: "year=2026&gp=1&session=Q",
      response: `{
  "drivers": [
    { "driver": "NOR", "team": "McLaren", "color": "#FF8000", "lap_time_s": 79.9, "lapTime": "1:19.900",
      "length_m": 5278.0, "clip_m": 410.0, "kmh_lost_max": 14.0, "time_lost_s": 0.21,
      "zones": [ { "start_m": 3410.0, "end_m": 3690.0, "length_m": 280.0, "speed_in_kmh": 312.0, "speed_out_kmh": 298.0,
                   "kmh_lost": 14.0, "time_lost_s": 0.12, "start_fraction": 0.646, "end_fraction": 0.699 } ],
      "trace": { "distance": [0.0, 10.5], "speed": [281.0, 283.0] } }
  ],
  "reference_driver": "NOR",
  "method": { "definition": "speed falls at full throttle", "min_zone_m": 40, "min_loss_kmh": 3, "brake_guard_m": 30, "estimated": true }
}`,
    },
  },
  {
    id: "corner-speed-profile",
    group: "car",
    title: "Corner speed profile",
    summary: "How fast every team takes slow, medium and fast corners.",
    details: [
      "Corners are classed by the field-median apex speed: slow < 120 km/h, medium 120–200, fast > 200. Flat-out kinks above 280 km/h are dropped and chicanes collapse to their slowest piece. Each team's best lap contributes its minimum speed within 50 m of every corner, averaged per class; `delta_kmh` is the gap to the class best.",
    ],
    shape: "pair",
    stem: "/api/v2/corner-speed-profile",
    scope: "session",
    applies: "Any session",
    canvas: true,
    returns: "{ classes{ slow|medium|fast: { corners[], teams[{ team, avg_kmh, delta_kmh }] } }, corners[], highlights, rules, reference, session_info }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `{
  "classes": {
    "slow":   { "corners": [1, 6, 9], "teams": [ { "team": "McLaren", "short": "MCL", "driver": "NOR", "color": "#FF8000", "avg_kmh": 88.4, "delta_kmh": 0.0 } ] },
    "medium": { "corners": [2, 10],   "teams": [] },
    "fast":   { "corners": [3, 11],   "teams": [] }
  },
  "corners": [ { "number": 1, "distance_m": 455.0, "median_apex_kmh": 92.0, "class": "slow", "merged": [] } ]
}`,
    },
  },
  {
    id: "efficiency-scatter",
    group: "car",
    title: "Efficiency scatter",
    summary: "Top speed vs mean apex speed per team — the drag-versus-downforce picture.",
    shape: "pair",
    stem: "/api/v2/efficiency-scatter",
    scope: "session",
    applies: "Any session",
    canvas: true,
    returns: "{ teams[{ team, top_speed_kmh, avg_apex_kmh, lap_time_s }], field_median, highlights, corners[], reference, session_info }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `{
  "teams": [ { "team": "McLaren", "short": "MCL", "driver": "NOR", "color": "#FF8000",
               "top_speed_kmh": 331.0, "avg_apex_kmh": 147.2, "lap_time_s": 86.27 } ],
  "field_median": { "top_speed_kmh": 327.5, "avg_apex_kmh": 144.8 },
  "corners": [1, 2, 3]
}`,
    },
  },
  {
    id: "field-dominance",
    group: "car",
    title: "Field dominance map",
    summary: "A track map coloured by who owns each part of the lap.",
    details: [
      "Every driver's fastest clean lap is cut into 25 equal minisectors on the pole lap's racing line; the candidate with the least time in a minisector owns it, and `margin_s` is how much the runner-up lost there. `mode=team` (default) ranks each team's faster driver; `mode=driver` ranks every driver. An unknown `mode`, `format`, or a `top_n` outside 2–10 is rejected.",
    ],
    shape: "pair",
    stem: "/api/v2/field-dominance",
    scope: "session",
    applies: "Any session",
    canvas: true,
    params: [
      { name: "mode", type: "string", default: "team", options: ["team", "driver"], description: "Rank teams or individual drivers." },
      { name: "top_n", type: "integer", description: "Keep only the fastest N candidates (2–10)." },
    ],
    returns: "{ mode, top_n, minisector_count, minisectors[], track, owners[], candidates[], highlights, method, session_info }",
    example: {
      query: "year=2025&gp=1&session=Q&mode=team&top_n=4",
      response: `{
  "mode": "team", "top_n": 4, "minisector_count": 25,
  "minisectors": [ { "index": 0, "start_fraction": 0.0, "end_fraction": 0.04, "owner": "McLaren", "owner_color": "#FF8000", "margin_s": 0.021 } ],
  "owners": [ { "name": "McLaren", "code": "MCL", "color": "#FF8000", "count": 14, "driver": "NOR", "team": "McLaren", "lap_time_s": 86.27 } ]
}`,
    },
  },
]
