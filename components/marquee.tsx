"use client"

import { useEffect, useRef, useState } from "react"

/** A ticker that only animates while it is on screen (saves battery / GPU when scrolled away). */
export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: "100px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="overflow-hidden" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap" style={{ animationPlayState: running ? "running" : "paused" }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-2xl font-bold uppercase tracking-wide text-muted-foreground/60">
            {t}
            <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
          </span>
        ))}
      </div>
    </div>
  )
}
