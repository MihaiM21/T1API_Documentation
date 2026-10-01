import type { Feature } from "./types"

/**
 * Session analysis: simple, qualifying, pace and race groups.
 * Every entry here is a `/api/v2` feature; params listed are in addition to
 * the common `year` / `gp` / `session` trio.
 *
 * Example payloads are illustrative (values are made up) but the keys and
 * nesting mirror the real response models in the API.
 */
export const analysisFeatures: Feature[] = [
  // ───────────────────────── Simple analysis ─────────────────────────
  {
    id: "top-speed-telemetry",
    group: "simple",
    title: "Top speed — telemetry",
    summary: "Each team's maximum speed, computed from CarData telemetry.",
    details: [
      "The fastest speed any car of a team reached in the session, read from the raw car telemetry stream. If live timing has no data for the session the API transparently falls back to the FastF1 source.",
      "Want the official sensor reading instead? Use Top speed — speed trap.",
    ],
    shape: "pair",
    stem: "/api/v2/top-speed-telemetry",
    scope: "session",
    applies: "Any session",
    canvas: true,
    returns: "Array of { Team, Top Speed (km/h), Color }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `[
  { "Team": "McLaren", "Top Speed (km/h)": 331.0, "Color": "#FF8000" },
  { "Team": "Ferrari", "Top Speed (km/h)": 329.4, "Color": "#E8002D" },
  { "Team": "Red Bull Racing", "Top Speed (km/h)": 327.9, "Color": "#3671C6" }
]`,
    },
  },
  {
    id: "top-speed-st",
    group: "simple",
    title: "Top speed — speed trap",
    summary: "Each team's top speed from the official speed-trap sensor.",
    details: [
      "Uses the official Speed Trap figures, a fixed measurement point on track, so it is directly comparable across cars. There is no FastF1 fallback for this one.",
    ],
    shape: "pair",
    stem: "/api/v2/top-speed-st",
    scope: "session",
    applies: "Any session",
    canvas: true,
    returns: "Array of { Team, Top Speed (km/h), Color }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `[
  { "Team": "Williams", "Top Speed (km/h)": 322.0, "Color": "#64C4FF" },
  { "Team": "Mercedes", "Top Speed (km/h)": 320.0, "Color": "#27F4D2" }
]`,
    },
  },
  {
    id: "throttle-comparison",
    group: "simple",
    title: "Throttle comparison",
    summary: "Average throttle application over each driver's fastest lap.",
    shape: "pair",
    stem: "/api/v2/throttle-comparison",
    scope: "session",
    applies: "Any session",
    returns: "Array of { Driver, Average Throttle (%), Color }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `[
  { "Driver": "NOR", "Average Throttle (%)": 71.3, "Color": "#FF8000" },
  { "Driver": "VER", "Average Throttle (%)": 70.8, "Color": "#3671C6" }
]`,
    },
  },
  {
    id: "speed-distribution",
    group: "simple",
    title: "Speed distribution",
    summary: "Speed samples along the fastest lap — overall or for one driver.",
    shape: "pair",
    stem: "/api/v2/speed-distribution",
    scope: "session",
    applies: "Any session",
    params: [
      { name: "driver", type: "string", description: "Optional three-letter driver code (TLA), e.g. VER. Omit for the whole field." },
    ],
    returns: "Array of { Time (s), Speed (km/h), Driver, Color }",
    example: {
      query: "year=2025&gp=1&session=Q&driver=VER",
      response: `[
  { "Time (s)": 0.0, "Speed (km/h)": 281.4, "Driver": "VER", "Color": "#3671C6" },
  { "Time (s)": 0.27, "Speed (km/h)": 284.9, "Driver": "VER", "Color": "#3671C6" }
]`,
    },
  },
  {
    id: "laptimes-distribution",
    group: "simple",
    title: "Lap times distribution",
    summary: "Every lap a driver completed, with lap time and tyre compound.",
    shape: "json",
    stem: "/api/v2/laptimes-distribution-data",
    scope: "session",
    sessionDefault: "R",
    limit: "data",
    applies: "Any session",
    params: [{ name: "driver", type: "string", required: true, description: "Driver TLA, e.g. VER." }],
    returns: "Array of { driver, lap_number, lap_times_formatted, lap_times_seconds, compound }",
    example: {
      query: "year=2025&gp=1&session=R&driver=VER",
      response: `[
  { "driver": "VER", "lap_number": 1, "lap_times_formatted": "1:39.812", "lap_times_seconds": 99.812, "compound": "MEDIUM" },
  { "driver": "VER", "lap_number": 2, "lap_times_formatted": "1:34.210", "lap_times_seconds": 94.21, "compound": "MEDIUM" }
]`,
    },
  },

  // ───────────────────────── Qualifying ─────────────────────────
  {
    id: "qualifying-results",
    group: "qualifying",
    title: "Qualifying results",
    summary: "Classification sorted by lap time, with gap to pole.",
    details: [
      "Correctly resolves the session on sprint weekends: asking for Q returns the Grand Prix qualifying, not the sprint shootout.",
    ],
    shape: "pair",
    stem: "/api/v2/qualifying-results",
    scope: "session",
    applies: "Q / SQ",
    canvas: true,
    returns: "Array of { Driver, Team, LapTime, LapTimeDelta, Color }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `[
  { "Driver": "NOR", "Team": "McLaren", "LapTime": "1:26.270", "LapTimeDelta": 0.0, "Color": "#FF8000" },
  { "Driver": "VER", "Team": "Red Bull Racing", "LapTime": "1:26.408", "LapTimeDelta": 0.138, "Color": "#3671C6" }
]`,
    },
  },
  {
    id: "theoretical-best",
    group: "qualifying",
    title: "Theoretical best lap",
    summary: "Best three sectors stitched together vs the real best lap.",
    details: ["A dumbbell chart of how much time each driver left on the table. Sorted by fastest theoretical lap."],
    shape: "pair",
    stem: "/api/v2/theoretical-best",
    scope: "session",
    applies: "Qualifying only",
    canvas: true,
    returns: "Array of { driver, team, color, theoretical_s, actual_s, delta_s }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `[
  { "driver": "NOR", "team": "McLaren", "color": "#FF8000", "theoretical_s": 86.142, "actual_s": 86.27, "delta_s": 0.128 }
]`,
    },
  },
  {
    id: "sector-gap",
    group: "qualifying",
    title: "Sector gap to pole",
    summary: "Gap to pole split into S1 / S2 / S3 for P2–P10.",
    details: [
      "All three segments are measured on each driver's own fastest lap, so they add up to the lap-time gap. A negative segment means the driver beat pole in that sector. Drivers whose lap can't be matched to a sector triple are listed in `unmatched`.",
      "Only `Q` and `SQ` are accepted; any other session returns 404.",
    ],
    shape: "pair",
    stem: "/api/v2/sector-gap",
    scope: "session",
    applies: "Q / SQ only",
    canvas: true,
    params: [{ name: "session", type: "string", description: "Q or SQ.", default: "Q", options: ["Q", "SQ"] }],
    returns: "{ pole, drivers[], unmatched[], highlights, method, session_info }",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `{
  "pole": { "driver": "NOR", "color": "#FF8000", "lap_time_s": 86.27, "sectors": [27.9, 30.1, 28.27] },
  "drivers": [
    {
      "position": 2, "driver": "VER", "color": "#3671C6",
      "lap_time_s": 86.408, "gap_s": 0.138,
      "sectors": [28.0, 30.05, 28.358],
      "sector_gaps_s": [0.1, -0.05, 0.088]
    }
  ],
  "unmatched": [],
  "session_info": { "year": 2025, "event_name": "Australian Grand Prix", "session_name": "Qualifying" }
}`,
    },
  },
  {
    id: "track-evolution",
    group: "qualifying",
    title: "Track evolution",
    summary: "How the session-best lap improved as the track temperature changed.",
    shape: "pair",
    stem: "/api/v2/track-evolution",
    scope: "session",
    applies: "Practice & Qualifying",
    params: [{ name: "drivers", type: "string", description: "Comma-separated TLAs to include, e.g. VER,NOR." }],
    returns: "{ overall[], drivers{TLA: []}, weather[] } — running-best laps by minute plus track temperature",
    example: {
      query: "year=2025&gp=1&session=Q",
      response: `{
  "overall": [ { "minute": 4.2, "best_s": 88.9 }, { "minute": 11.8, "best_s": 87.4 } ],
  "drivers": { "NOR": [ { "minute": 11.8, "best_s": 87.4 } ] },
  "weather": [ { "minute": 0.0, "track_temp": 38.1 }, { "minute": 15.0, "track_temp": 36.9 } ]
}`,
    },
  },
  {
    id: "throttle-brake-comparison",
    group: "qualifying",
    title: "Throttle & brake comparison",
    summary: "Speed, throttle and brake vs distance for two drivers' fastest laps.",
    shape: "pair",
    stem: "/api/v2/throttle-brake-comparison",
    scope: "session",
    applies: "Any session",
    params: [
      { name: "d1", type: "string", required: true, description: "First driver TLA, e.g. VER." },
      { name: "d2", type: "string", required: true, description: "Second driver TLA, e.g. NOR." },
    ],
    returns: "{ driver1, driver2, driver1_color, driver2_color, telemetry[] } — interleaved samples; filter by `driver` to split",
    example: {
      query: "year=2025&gp=1&session=Q&d1=VER&d2=NOR",
      response: `{
  "driver1": "VER", "driver2": "NOR",
  "driver1_color": "#3671C6", "driver2_color": "#FF8000",
  "telemetry": [
    { "distance": 0.0, "speed": 281.0, "throttle": 100.0, "brake": 0.0, "lap_time": 0.0, "driver": "VER" },
    { "distance": 0.0, "speed": 283.0, "throttle": 100.0, "brake": 0.0, "lap_time": 0.0, "driver": "NOR" }
  ]
}`,
    },
  },
  {
    id: "track-comparison",
    group: "qualifying",
    title: "Track comparison",
    summary: "A track map coloured by which driver is faster in each minisector.",
    shape: "pair",
    stem: "/api/v2/track-comparison",
    scope: "session",
    applies: "Any session",
    canvas: true,
    params: [
      { name: "d1", type: "string", required: true, description: "First driver TLA." },
      { name: "d2", type: "string", required: true, description: "Second driver TLA." },
    ],
    returns: "{ driver1, driver2, colours, telemetry[] (x, y, distance, speed, minisector, fastest_driver), session_info }",
    example: {
      query: "year=2025&gp=1&session=Q&d1=VER&d2=NOR",
      response: `{
  "driver1": "VER", "driver2": "NOR",
  "driver1_color": "#3671C6", "driver2_color": "#FF8000",
  "telemetry": [
    { "x": -1204.0, "y": 312.5, "distance": 12.4, "speed": 281.0, "driver": "VER",
      "minisector": 1, "fastest_driver": "NOR", "fastest_driver_int": 2 }
  ],
  "session_info": { "year": 2025, "event_name": "Australian Grand Prix", "session_name": "Qualifying" }
}`,
    },
  },
  {
    id: "lap-time-analysis",
    group: "qualifying",
    title: "Lap time analysis",
    summary: "Speed, cumulative delta and throttle for two drivers' fastest laps.",
    shape: "pair",
    stem: "/api/v2/lap-time-analysis",
    scope: "session",
    applies: "Any session",
    params: [
      { name: "d1", type: "string", required: true, description: "First driver TLA (the reference for the delta axis)." },
      { name: "d2", type: "string", required: true, description: "Second driver TLA." },
    ],
    returns: "{ driver1, driver2, lap times, reference_driver, telemetry[], delta[], session_info }",
    example: {
      query: "year=2025&gp=1&session=Q&d1=VER&d2=NOR",
      response: `{
  "driver1": "VER", "driver2": "NOR",
  "driver1_laptime": 86.408, "driver2_laptime": 86.27,
  "reference_driver": "VER",
  "telemetry": [ { "distance": 0.0, "speed": 281.0, "throttle": 100.0, "lap_time": 0.0, "driver": "VER" } ],
  "delta": [ { "distance": 0.0, "delta": 0.0 }, { "distance": 50.0, "delta": -0.012 } ]
}`,
    },
  },

  // ───────────────────────── Pace ─────────────────────────
  {
    id: "driver-pace",
    group: "pace",
    title: "Driver pace",
    summary: "Box-and-whisker lap-time distribution per driver.",
    details: ["Laps slower than 107% of the session's quickest are dropped so pit and safety-car laps don't distort the picture."],
    shape: "pair",
    stem: "/api/v2/driver-pace",
    scope: "session",
    sessionDefault: "R",
    applies: "Race-oriented; any session",
    returns: "Array of { driver, team, color, lap_times_seconds[], lap_count, min, q1, median, q3, max }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `[
  {
    "driver": "NOR", "team": "McLaren", "color": "#FF8000",
    "lap_times_seconds": [82.1, 81.9, 82.4],
    "lap_count": 57, "min": 81.6, "q1": 81.95, "median": 82.3, "q3": 82.8, "max": 84.9
  }
]`,
    },
  },
  {
    id: "teams-pace",
    group: "pace",
    title: "Team pace",
    summary: "Lap-time distribution per team, both drivers combined.",
    shape: "pair",
    stem: "/api/v2/teams-pace",
    scope: "session",
    sessionDefault: "R",
    applies: "Race-oriented; any session",
    returns: "Array of { team, color, lap_times_seconds[], lap_count, min, q1, median, q3, max }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `[
  { "team": "McLaren", "color": "#FF8000", "lap_times_seconds": [82.1, 82.3], "lap_count": 114,
    "min": 81.6, "q1": 82.0, "median": 82.4, "q3": 82.9, "max": 85.2 }
]`,
    },
  },
  {
    id: "tyre-stint-usage",
    group: "pace",
    title: "Tyre stint usage",
    summary: "A per-driver timeline of tyre stints across the race.",
    shape: "pair",
    stem: "/api/v2/tyre-stint-usage",
    scope: "session",
    sessionDefault: "R",
    applies: "Race-oriented; any session",
    returns: "Array of { driver, team, position, stint_number, compound, start_lap, end_lap, lap_count, tyre_life_end, color }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `[
  { "driver": "NOR", "team": "McLaren", "position": 1, "stint_number": 1, "compound": "MEDIUM",
    "start_lap": 1, "end_lap": 24, "lap_count": 24, "tyre_life_end": 24, "color": "#FF8000" },
  { "driver": "NOR", "team": "McLaren", "position": 1, "stint_number": 2, "compound": "HARD",
    "start_lap": 25, "end_lap": 57, "lap_count": 33, "tyre_life_end": 33, "color": "#FF8000" }
]`,
    },
  },

  // ───────────────────────── Race analysis ─────────────────────────
  {
    id: "position-changes",
    group: "race",
    title: "Position changes",
    summary: "The classic chart: every driver's race position lap by lap.",
    shape: "pair",
    stem: "/api/v2/position-changes",
    scope: "session",
    sessionDefault: "R",
    applies: "Race / Sprint only",
    canvas: true,
    returns: "Array of { driver, team, color, start_pos, end_pos, positions[{ lap, position }] } ordered by finish. Lap 0 is the grid.",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `[
  {
    "driver": "NOR", "team": "McLaren", "color": "#FF8000",
    "start_pos": 1, "end_pos": 1,
    "positions": [ { "lap": 0, "position": 1 }, { "lap": 1, "position": 1 }, { "lap": 2, "position": 1 } ]
  }
]`,
    },
  },
  {
    id: "race-gaps",
    group: "race",
    title: "Race gaps / race trace",
    summary: "Gap to the leader, or pace vs the field average, every lap.",
    details: [
      "`reference=leader` shows the gap to the per-lap leader (the leader is 0). `reference=average` turns it into a race trace against the field's average pace. A `gap_s` of `null` marks a red-flag lap.",
    ],
    shape: "pair",
    stem: "/api/v2/race-gaps",
    scope: "session",
    sessionDefault: "R",
    applies: "Race / Sprint only",
    params: [
      { name: "reference", type: "string", default: "leader", options: ["leader", "average"], description: "What the gap is measured against." },
      { name: "drivers", type: "string", description: "Comma-separated TLAs to include." },
    ],
    returns: "Array of { driver, team, color, laps[{ lap, gap_s }] } ordered by finish",
    example: {
      query: "year=2025&gp=1&session=R&reference=leader&drivers=VER,NOR",
      response: `[
  { "driver": "NOR", "team": "McLaren", "color": "#FF8000",
    "laps": [ { "lap": 1, "gap_s": 0.0 }, { "lap": 2, "gap_s": 0.0 } ] },
  { "driver": "VER", "team": "Red Bull Racing", "color": "#3671C6",
    "laps": [ { "lap": 1, "gap_s": 1.4 }, { "lap": 2, "gap_s": 2.1 } ] }
]`,
    },
  },
  {
    id: "tyre-degradation",
    group: "race",
    title: "Tyre degradation",
    summary: "Per-compound degradation scatter with a fitted trendline.",
    shape: "pair",
    stem: "/api/v2/tyre-degradation",
    scope: "session",
    sessionDefault: "R",
    applies: "Race / Sprint only",
    params: [
      { name: "driver", type: "string", description: "Optional TLA filter." },
      { name: "fuel_corrected", type: "boolean", default: "false", description: "Apply a fuel-burn correction to lap times." },
    ],
    returns: "Array of { compound, color, points[], deg_rate_s_per_lap, r_squared, n_points }",
    example: {
      query: "year=2025&gp=1&session=R&fuel_corrected=true",
      response: `[
  {
    "compound": "MEDIUM", "color": "#FFD12E",
    "points": [ { "driver": "NOR", "tyre_age": 3, "lap_time_s": 82.4, "fuel_corrected_s": 83.0 } ],
    "deg_rate_s_per_lap": 0.061, "r_squared": 0.71, "n_points": 214
  }
]`,
    },
  },
  {
    id: "pit-strategy",
    group: "race",
    title: "Pit strategy & undercuts",
    summary: "Stop timeline, pit-lane times, undercut attempts and free tyre changes.",
    shape: "pair",
    stem: "/api/v2/pit-strategy",
    scope: "session",
    sessionDefault: "R",
    applies: "Race / Sprint only",
    canvas: true,
    returns: "{ stops[], undercuts[], summary{ fastest_stop, avg_stop_by_team[] }, free_changes[] }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `{
  "stops": [
    { "driver": "NOR", "team": "McLaren", "lap": 24, "stop_n": 1, "pit_lane_time_s": 22.4,
      "compound_in": "HARD", "compound_out": "MEDIUM", "under_sc": false, "drive_through": false }
  ],
  "undercuts": [
    { "attacker": "VER", "defender": "LEC", "lap": 22, "gap_before_s": 1.8, "gap_after_s": -0.4, "gain_s": 2.2, "worked": true }
  ],
  "summary": {
    "fastest_stop": { "driver": "NOR", "lap": 24, "pit_lane_time_s": 22.4 },
    "avg_stop_by_team": [ { "team": "McLaren", "avg_pit_lane_time_s": 22.9, "n_stops": 2 } ]
  },
  "free_changes": []
}`,
    },
  },
  {
    id: "session-weather",
    group: "race",
    title: "Session weather & track status",
    summary: "Weather, humidity, flags and race-control messages on one timeline.",
    shape: "pair",
    stem: "/api/v2/session-weather",
    scope: "session",
    sessionDefault: "R",
    applies: "Any session",
    returns: "{ weather[], track_status_periods[], race_control[] }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `{
  "weather": [ { "time_s": 0.0, "lap": 1, "air_temp": 24.1, "track_temp": 37.5, "humidity": 52.0,
                 "rainfall": 0, "wind_speed": 2.1, "wind_dir": 210.0 } ],
  "track_status_periods": [ { "status": "SC", "start_lap": 14, "end_lap": 17, "start_time_s": 1311.0, "end_time_s": 1602.0 } ],
  "race_control": [ { "time_s": 1302.0, "lap": 14, "category": "SafetyCar", "flag": null, "message": "SAFETY CAR DEPLOYED" } ]
}`,
    },
  },
  {
    id: "race-pace-heatmap",
    group: "race",
    title: "Race pace heatmap",
    summary: "Driver × lap grid of delta to the field-median lap time.",
    shape: "pair",
    stem: "/api/v2/race-pace-heatmap",
    scope: "session",
    sessionDefault: "R",
    applies: "Race / Sprint only",
    returns: "{ drivers[], laps[], grid{TLA: (number|null)[]}, pit_laps{TLA: []}, sc_laps[] }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `{
  "drivers": ["NOR", "VER"],
  "laps": [1, 2, 3],
  "grid": { "NOR": [null, -0.4, -0.5], "VER": [null, 0.1, 0.0] },
  "pit_laps": { "NOR": [24], "VER": [23] },
  "sc_laps": [14, 15, 16]
}`,
    },
  },
  {
    id: "race-story",
    group: "race",
    title: "Race story",
    summary: "Gap traces, pit stops and numbered key moments on one timeline.",
    details: ["Designed for storytelling: the `key_moments` array carries captions you can quote directly."],
    shape: "pair",
    stem: "/api/v2/race-story",
    scope: "session",
    sessionDefault: "R",
    applies: "Race / Sprint only",
    canvas: true,
    returns: "{ drivers[{ driver, team, color, finish_rank, laps[], pit_stops[], last_lap }], key_moments[], track_status_periods[] }",
    example: {
      query: "year=2025&gp=1&session=R",
      response: `{
  "drivers": [
    { "driver": "NOR", "team": "McLaren", "color": "#FF8000", "finish_rank": 1,
      "laps": [ { "lap": 1, "gap_s": 0.0 } ],
      "pit_stops": [ { "lap": 24, "compound": "HARD" } ], "last_lap": 57 }
  ],
  "key_moments": [ { "lap": 14, "kind": "safety_car", "caption": "Safety car after a first-corner incident", "n": 1 } ],
  "track_status_periods": []
}`,
    },
  },
]
