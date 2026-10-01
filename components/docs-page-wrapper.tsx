"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface TocItem {
  id: string
  label: string
  level: 1 | 2
}

interface DocsPageWrapperProps {
  children: React.ReactNode
  toc: TocItem[]
  prev?: { label: string; href: string }
  next?: { label: string; href: string }
  /** Constrain prose width. Wide pages (explorer, playground) turn this off. */
  wide?: boolean
}

export function DocsPageWrapper({ children, toc, prev, next, wide }: DocsPageWrapperProps) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? "")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (toc.length === 0) return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = toc.find((t) => visible.has(t.id))
        if (first) setActiveId(first.id)
      },
      { rootMargin: "-72px 0px -65% 0px", threshold: 0 },
    )
    toc.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [toc])

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="flex">
      <div
        className="fixed top-14 left-0 right-0 h-[2px] z-40 origin-left bg-primary pointer-events-none"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <article className={cn("flex-1 min-w-0 px-4 py-8 md:px-8 md:py-12 xl:px-12", !wide && "max-w-4xl")}>
        {children}

        {(prev || next) && (
          <nav
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-16 pt-8 border-t border-border"
            aria-label="Previous and next pages"
          >
            {prev ? (
              <Link
                href={prev.href}
                className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-card card-glow"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 group-hover:text-primary transition-all" aria-hidden="true" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Previous</div>
                  <div className="text-sm font-semibold text-foreground">{prev.label}</div>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next && (
              <Link
                href={next.href}
                className="group flex items-center justify-end gap-3 p-4 rounded-lg border border-border bg-card card-glow text-right"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Next</div>
                  <div className="text-sm font-semibold text-foreground">{next.label}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}
      </article>

      {toc.length > 0 && (
        <aside className="hidden xl:block w-60 shrink-0 pr-6 pt-12 pb-8 overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">On this page</p>
          <ul className="space-y-0.5 border-l border-border">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? "location" : undefined}
                  className={cn(
                    "block -ml-px border-l py-1 text-[12.5px] leading-snug transition-colors",
                    item.level === 2 ? "pl-6" : "pl-3",
                    activeId === item.id
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}
