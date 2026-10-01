"use client"

import { useEffect, useRef } from "react"
import { CIRCUIT } from "@/lib/circuit"

/**
 * A real circuit (Suzuka, from T1API's own layout data) with a dot lapping it. The outline is real;
 * speed, gear, throttle and brake are *synthetic*, derived from the path's curvature, so the HUD
 * reads like telemetry while being purely decorative. Animation pauses when off-screen or when the user prefers reduced motion.
 */
const TRACK = CIRCUIT.path

const SAMPLES = 360

function gearFor(speed: number) {
  if (speed > 300) return 8
  if (speed > 260) return 7
  if (speed > 220) return 6
  if (speed > 180) return 5
  if (speed > 140) return 4
  if (speed > 105) return 3
  if (speed > 80) return 2
  return 1
}

export function HeroVisual() {
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const coloredRef = useRef<SVGGElement>(null)
  const speedRef = useRef<HTMLSpanElement>(null)
  const gearRef = useRef<HTMLSpanElement>(null)
  const thrRef = useRef<HTMLDivElement>(null)
  const brkRef = useRef<HTMLDivElement>(null)
  const traceRef = useRef<SVGPolylineElement>(null)
  const cursorRef = useRef<SVGLineElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const sfRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    const pts: Array<{ x: number; y: number }> = []
    for (let i = 0; i < SAMPLES; i++) pts.push(path.getPointAtLength((i / SAMPLES) * total))

    // Start/finish line: perpendicular to the track at the first sample.
    const sf = sfRef.current
    if (sf) {
      const a = pts[0]
      const b = pts[3]
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const nx = -(b.y - a.y) / len
      const ny = (b.x - a.x) / len
      sf.setAttribute("x1", (a.x - nx * 11).toFixed(1))
      sf.setAttribute("y1", (a.y - ny * 11).toFixed(1))
      sf.setAttribute("x2", (a.x + nx * 11).toFixed(1))
      sf.setAttribute("y2", (a.y + ny * 11).toFixed(1))
    }

    // Curvature → speed profile (smoothed).
    const curv = pts.map((_, i) => {
      const a = pts[(i - 6 + SAMPLES) % SAMPLES]
      const b = pts[i]
      const c = pts[(i + 6) % SAMPLES]
      const a1 = Math.atan2(b.y - a.y, b.x - a.x)
      const a2 = Math.atan2(c.y - b.y, c.x - b.x)
      let d = Math.abs(a2 - a1)
      if (d > Math.PI) d = Math.PI * 2 - d
      return d
    })
    const smooth = curv.map((_, i) => {
      let s = 0
      for (let k = -8; k <= 8; k++) s += curv[(i + k + SAMPLES) % SAMPLES]
      return s / 17
    })
    const maxC = Math.max(...smooth)
    let speed = smooth.map((c) => 322 - (c / maxC) * 250)
    // Momentum: can't brake/accelerate instantly.
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < SAMPLES * 2; i++) {
        const idx = i % SAMPLES
        const prev = (idx - 1 + SAMPLES) % SAMPLES
        speed[idx] = Math.min(speed[idx], speed[prev] + 2.6)
      }
      for (let i = SAMPLES * 2 - 2; i >= 0; i--) {
        const idx = i % SAMPLES
        const nxt = (idx + 1) % SAMPLES
        speed[idx] = Math.min(speed[idx], speed[nxt] + 4.4)
      }
    }
    speed = speed.map((s) => Math.max(68, s))

    // Coloured racing line: one short segment per sample, hue from speed.
    const g = coloredRef.current
    if (g && g.childElementCount === 0) {
      const ns = "http://www.w3.org/2000/svg"
      for (let i = 0; i < SAMPLES; i++) {
        const a = pts[i]
        const b = pts[(i + 1) % SAMPLES]
        const seg = document.createElementNS(ns, "line")
        seg.setAttribute("x1", a.x.toFixed(1))
        seg.setAttribute("y1", a.y.toFixed(1))
        seg.setAttribute("x2", b.x.toFixed(1))
        seg.setAttribute("y2", b.y.toFixed(1))
        const t = (speed[i] - 68) / (322 - 68)
        // slow = blue-ish, mid = yellow, fast = red
        const hue = 250 - t * 235
        seg.setAttribute("stroke", `oklch(0.74 0.2 ${hue})`)
        seg.setAttribute("stroke-linecap", "round")
        g.appendChild(seg)
      }
    }

    // Speed trace polyline (speed vs distance).
    const trace = traceRef.current
    if (trace) {
      trace.setAttribute(
        "points",
        speed.map((s, i) => `${(i / (SAMPLES - 1)) * 300},${44 - ((s - 68) / (322 - 68)) * 40}`).join(" "),
      )
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    let running = false
    let pos = reduced ? 0.18 : 0
    let last = performance.now()

    const paint = () => {
      const idx = (((Math.floor(pos * SAMPLES) % SAMPLES) + SAMPLES) % SAMPLES) || 0
      const p = pts[idx]
      const prev = speed[(idx - 3 + SAMPLES) % SAMPLES]
      const s = speed[idx]
      const accel = s - prev
      dotRef.current?.setAttribute("cx", p.x.toFixed(1))
      dotRef.current?.setAttribute("cy", p.y.toFixed(1))
      if (speedRef.current) speedRef.current.textContent = String(Math.round(s))
      if (gearRef.current) gearRef.current.textContent = String(gearFor(s))
      const thr = accel >= -0.4 ? Math.min(100, 55 + accel * 40 + (s / 322) * 30) : 0
      const brk = accel < -0.4 ? Math.min(100, -accel * 38) : 0
      if (thrRef.current) thrRef.current.style.transform = `scaleY(${(thr / 100).toFixed(2)})`
      if (brkRef.current) brkRef.current.style.transform = `scaleY(${(brk / 100).toFixed(2)})`
      cursorRef.current?.setAttribute("x1", (pos * 300).toFixed(1))
      cursorRef.current?.setAttribute("x2", (pos * 300).toFixed(1))
      // Trail: a short arc behind the car.
      if (trailRef.current) {
        const tail: string[] = []
        for (let k = 26; k >= 0; k -= 2) {
          const q = pts[(idx - k + SAMPLES) % SAMPLES]
          tail.push(`${tail.length ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`)
        }
        trailRef.current.setAttribute("d", tail.join(" "))
      }
    }

    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)) // rAF timestamps can precede performance.now()
      last = now
      // One lap ≈ 9 s.
      pos = (pos + dt / 9) % 1
      paint()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running || reduced) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    paint()
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.1 })
    if (wrapRef.current) io.observe(wrapRef.current)
    const onVis = () => (document.hidden ? stop() : undefined)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full max-w-[640px] mx-auto" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
      <div className="relative rounded-2xl border border-border bg-[oklch(0.11_0_0)]/90 backdrop-blur overflow-hidden shadow-2xl shadow-black/60">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[oklch(0.14_0_0)]">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            GET /api/static/circuits/{CIRCUIT.id}/data
          </div>
          <span className="hidden sm:inline font-mono text-[10px] text-muted-foreground/70">{CIRCUIT.name}, {CIRCUIT.country} · synthetic telemetry</span>
        </div>

        <div className="relative px-2 pt-2">
          <svg viewBox={CIRCUIT.viewBox} className="w-full h-auto">
            <path ref={pathRef} d={TRACK} fill="none" stroke="oklch(1 0 0 / 0.07)" strokeWidth="22" strokeLinejoin="round" />
            <path d={TRACK} fill="none" stroke="oklch(0.2 0 0)" strokeWidth="15" strokeLinejoin="round" />
            <g ref={coloredRef} strokeWidth="5" />
            {/* start / finish line + corner numbers */}
            <line ref={sfRef} stroke="white" strokeWidth="3" strokeDasharray="3 3" />
            {CIRCUIT.corners.map((c) => (
              <text key={c.n} x={c.x} y={c.y} fontSize="8" textAnchor="middle" dominantBaseline="central" fill="oklch(0.75 0 0)" fontFamily="monospace">
                {c.n}
              </text>
            ))}
            <path ref={trailRef} fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
            <circle ref={dotRef} r="6" fill="white" stroke="oklch(0.6 0.23 27)" strokeWidth="3" />
          </svg>

          {/* HUD */}
          <div className="absolute left-4 top-4 flex items-stretch gap-3 rounded-lg border border-border bg-background/80 backdrop-blur px-3 py-2">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">km/h</div>
              <span ref={speedRef} className="font-display text-4xl font-extrabold leading-none tabular-nums">
                0
              </span>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">gear</div>
              <span ref={gearRef} className="font-display text-4xl font-extrabold leading-none text-primary tabular-nums">
                1
              </span>
            </div>
            <div className="flex gap-1 pl-1">
              <div className="w-2 rounded-sm bg-[oklch(0.2_0_0)] overflow-hidden flex items-end" title="throttle">
                <div ref={thrRef} className="w-full h-full origin-bottom bg-[var(--green)]" style={{ transform: "scaleY(0)" }} />
              </div>
              <div className="w-2 rounded-sm bg-[oklch(0.2_0_0)] overflow-hidden flex items-end" title="brake">
                <div ref={brkRef} className="w-full h-full origin-bottom bg-primary" style={{ transform: "scaleY(0)" }} />
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-4 font-mono text-[10px] text-muted-foreground text-right leading-tight">
            <div className="flex items-center justify-end gap-1.5">
              <span className="h-1.5 w-6 rounded-full" style={{ background: "linear-gradient(90deg, oklch(0.74 0.2 250), oklch(0.74 0.2 130), oklch(0.74 0.2 15))" }} />
              speed
            </div>
          </div>
        </div>

        {/* Speed trace */}
        <div className="px-4 pb-4 pt-1">
          <svg viewBox="0 0 300 48" preserveAspectRatio="none" className="w-full h-12">
            <polyline ref={traceRef} fill="none" stroke="oklch(0.85 0.1 200)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            <line ref={cursorRef} x1="0" x2="0" y1="0" y2="48" stroke="oklch(0.6 0.23 27)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
    </div>
  )
}
