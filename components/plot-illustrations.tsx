/**
 * Decorative chart thumbnails for the landing page. These are *illustrations* — drawn from
 * deterministic synthetic data, not API output — and are marked aria-hidden.
 */

function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 320
const H = 180
const TEAM = ["#FF8000", "#3671C6", "#E80020", "#27F4D2", "#64C4FF", "#229971", "#B6BABD"]

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={label}>
      <rect width={W} height={H} fill="oklch(0.11 0 0)" />
      <g stroke="oklch(1 0 0 / 0.05)" strokeWidth="1">
        {[30, 60, 90, 120, 150].map((y) => (
          <line key={y} x1="0" x2={W} y1={y} y2={y} />
        ))}
      </g>
      {children}
    </svg>
  )
}

export function PositionChangesArt() {
  const r = rng(7)
  const lines = TEAM.slice(0, 6).map((c, i) => {
    let pos = i + 1
    const pts: string[] = []
    for (let x = 0; x <= 20; x++) {
      if (r() > 0.78) pos = Math.max(1, Math.min(6, pos + (r() > 0.5 ? 1 : -1)))
      pts.push(`${20 + x * 14},${22 + pos * 24}`)
    }
    return { c, d: pts.join(" ") }
  })
  return (
    <Frame label="Illustration of a position-changes chart">
      {lines.map((l, i) => (
        <polyline key={i} points={l.d} fill="none" stroke={l.c} strokeWidth="2.2" strokeLinejoin="round" opacity="0.92" />
      ))}
    </Frame>
  )
}

export function TyreStintArt() {
  const r = rng(11)
  const comp = ["#E8302A", "#F5D130", "#F2F2F2"]
  return (
    <Frame label="Illustration of tyre stints">
      {Array.from({ length: 7 }).map((_, row) => {
        let x = 70
        const y = 18 + row * 22
        const segs: React.ReactNode[] = []
        const cuts = 2 + Math.floor(r() * 2)
        for (let s = 0; s < cuts; s++) {
          const w = (W - 90 - (x - 70)) / (cuts - s) * (0.7 + r() * 0.5)
          segs.push(<rect key={s} x={x} y={y} width={Math.max(14, w - 3)} height="14" rx="3" fill={comp[(row + s) % 3]} opacity="0.92" />)
          x += w
        }
        return (
          <g key={row}>
            <text x="14" y={y + 11} fontSize="9" fill="oklch(0.65 0 0)" fontFamily="monospace">
              {["NOR", "VER", "LEC", "HAM", "RUS", "PIA", "ALO"][row]}
            </text>
            {segs}
          </g>
        )
      })}
    </Frame>
  )
}

export function LapDuelArt() {
  const pts = (off: number) =>
    Array.from({ length: 60 }, (_, i) => {
      const x = 14 + i * 5
      const v = 70 + Math.sin(i / 4.2 + off) * 26 + Math.sin(i / 1.6) * 7
      return `${x},${v}`
    }).join(" ")
  const delta = Array.from({ length: 60 }, (_, i) => `${14 + i * 5},${146 - Math.sin(i / 14) * 9 - i * 0.12}`).join(" ")
  return (
    <Frame label="Illustration of a lap duel chart">
      <polyline points={pts(0)} fill="none" stroke="#3671C6" strokeWidth="2" />
      <polyline points={pts(0.25)} fill="none" stroke="#FF8000" strokeWidth="2" />
      <line x1="14" x2="308" y1="146" y2="146" stroke="oklch(1 0 0 / 0.12)" strokeDasharray="3 3" />
      <polyline points={delta} fill="none" stroke="oklch(0.85 0.17 95)" strokeWidth="1.8" />
    </Frame>
  )
}

export function TrackMapArt() {
  const d =
    "M70 130 C52 100 58 62 92 48 C128 34 172 48 200 40 C236 30 262 52 258 86 C255 112 226 118 222 138 C218 158 188 160 166 150 C146 141 122 152 104 158 C82 164 76 146 70 130 Z"
  return (
    <Frame label="Illustration of a telemetry track map">
      <path d={d} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="14" strokeLinecap="round" />
      <path d={d} fill="none" stroke="url(#tm)" strokeWidth="5" strokeLinecap="round" />
      <defs>
        <linearGradient id="tm" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#E8002D" />
          <stop offset="0.35" stopColor="#F5D130" />
          <stop offset="0.6" stopColor="#3FD17A" />
          <stop offset="1" stopColor="#E8002D" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="130" r="4" fill="white" />
    </Frame>
  )
}

export function RaceGapsArt() {
  const r = rng(3)
  return (
    <Frame label="Illustration of race gaps to the leader">
      {TEAM.slice(0, 5).map((c, i) => {
        let g = i * 7
        const pts = Array.from({ length: 30 }, (_, k) => {
          g += (r() - 0.35) * 4
          return `${14 + k * 10},${24 + Math.max(0, g) * 1.15}`
        }).join(" ")
        return <polyline key={i} points={pts} fill="none" stroke={c} strokeWidth="2" opacity="0.92" />
      })}
    </Frame>
  )
}

export function SectorGapArt() {
  const r = rng(21)
  return (
    <Frame label="Illustration of sector gaps to pole">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = 20 + r() * 34
        const b = 14 + r() * 36
        const c = 12 + r() * 30
        const y = 16 + i * 19
        return (
          <g key={i}>
            <rect x="40" y={y} width={a} height="13" fill="oklch(0.68 0.24 310)" rx="2" />
            <rect x={40 + a} y={y} width={b} height="13" fill="oklch(0.8 0.2 150)" />
            <rect x={40 + a + b} y={y} width={c} height="13" fill="oklch(0.86 0.17 95)" rx="2" />
          </g>
        )
      })}
    </Frame>
  )
}

export function RadarArt() {
  const cx = 160
  const cy = 92
  const axes = 6
  const pt = (i: number, rad: number) => {
    const a = (Math.PI * 2 * i) / axes - Math.PI / 2
    return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`
  }
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v)).join(" ")
  return (
    <Frame label="Illustration of a driver radar">
      {[30, 52, 74].map((rad) => (
        <polygon key={rad} points={Array.from({ length: axes }, (_, i) => pt(i, rad)).join(" ")} fill="none" stroke="oklch(1 0 0 / 0.1)" />
      ))}
      <polygon points={poly([64, 50, 68, 44, 60, 70])} fill="#FF8000" fillOpacity="0.25" stroke="#FF8000" strokeWidth="2" />
      <polygon points={poly([56, 66, 48, 62, 70, 52])} fill="#3671C6" fillOpacity="0.25" stroke="#3671C6" strokeWidth="2" />
    </Frame>
  )
}

export function HeatmapArt() {
  const r = rng(5)
  return (
    <Frame label="Illustration of a race pace heatmap">
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 28 }).map((__, col) => {
          const v = (r() - 0.5) * 2 + (row - 4) * 0.12
          const fill = v > 0 ? `oklch(0.6 0.23 27 / ${Math.min(0.9, v * 0.8 + 0.1)})` : `oklch(0.75 0.15 240 / ${Math.min(0.9, -v * 0.8 + 0.1)})`
          return <rect key={`${row}-${col}`} x={16 + col * 10.4} y={14 + row * 19.5} width="9" height="17" rx="1.5" fill={fill} />
        }),
      )}
    </Frame>
  )
}

export function EnergyArt() {
  const pts = Array.from({ length: 70 }, (_, i) => {
    const x = 14 + i * 4.2
    const drop = i > 38 && i < 52 ? (i - 38) * 1.6 : 0
    const y = 50 + Math.sin(i / 9) * 6 + drop - (i < 38 ? i * 0.4 : 0)
    return `${x},${y + 30}`
  }).join(" ")
  return (
    <Frame label="Illustration of an energy clipping trace">
      <rect x="170" y="14" width="56" height="150" fill="oklch(0.6 0.23 27 / 0.14)" />
      <polyline points={pts} fill="none" stroke="oklch(0.85 0.1 200)" strokeWidth="2.2" />
    </Frame>
  )
}

export const ART: Record<string, () => React.ReactElement> = {
  "position-changes": PositionChangesArt,
  "tyre-stint-usage": TyreStintArt,
  "lap-duel": LapDuelArt,
  "track-map": TrackMapArt,
  "race-gaps": RaceGapsArt,
  "sector-gap": SectorGapArt,
  "driver-radar": RadarArt,
  "race-pace-heatmap": HeatmapArt,
  "energy-clipping": EnergyArt,
}
