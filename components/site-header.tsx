"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ExternalLink, Menu, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSearch } from "@/components/search-dialog"
import { StatusDot, useApiState } from "@/components/api-status"

const navLinks = [
  { label: "Docs", href: "/docs", match: (p: string) => p === "/docs" || p.startsWith("/docs/concepts") },
  { label: "Endpoints", href: "/docs/endpoints", match: (p: string) => p.startsWith("/docs/endpoints") },
  { label: "Playground", href: "/docs/playground", match: (p: string) => p.startsWith("/docs/playground") },
  { label: "Recipes", href: "/docs/recipes", match: (p: string) => p.startsWith("/docs/recipes") },
  { label: "Changelog", href: "/docs/changelog", match: (p: string) => p.startsWith("/docs/changelog") },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { open } = useSearch()
  const api = useApiState()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setMobileOpen(false)
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-14 border-b backdrop-blur-xl transition-colors",
        scrolled ? "border-border bg-background/85" : "border-transparent bg-background/40",
      )}
    >
      <div className="flex items-center h-full px-4 md:px-5 max-w-screen-2xl mx-auto gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="T1API home">
          <Image src="/logo.png" alt="" width={28} height={28} className="group-hover:scale-105 transition-transform" />
          <span className="font-display text-xl font-extrabold tracking-tight uppercase leading-none">
            T1<span className="text-primary">API</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 flex-1" aria-label="Main navigation">
          {navLinks.map((l) => {
            const active = l.match(pathname)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-1.5 text-sm rounded-md transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[13px] h-0.5 bg-primary rounded-full" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={open}
            className="hidden sm:flex items-center gap-2 h-8 pl-2.5 pr-2 rounded-md border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            aria-label="Search documentation"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs w-28 lg:w-40 text-left">Search docs…</span>
            <kbd className="font-mono text-[10px] border border-border rounded px-1 bg-background">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={open}
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Search documentation"
          >
            <Search className="h-4 w-4" />
          </button>

          <span
            className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono px-2 h-8 rounded-md border border-border text-muted-foreground bg-card/70"
            title="Live status of api.t1f1.com"
          >
            <StatusDot state={api} />
            {api.phase === "up" ? `v${api.version}` : "api"}
          </span>

          <a
            href="https://turnonehub.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors plate"
          >
            Get a key <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>

          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="md:hidden absolute top-14 left-0 right-0 bg-background/98 backdrop-blur border-b border-border px-4 py-3 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2.5 text-sm rounded-md",
                l.match(pathname) ? "text-foreground bg-secondary" : "text-muted-foreground hover:bg-secondary/60",
              )}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://turnonehub.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 px-3 py-2.5 text-sm rounded-md bg-primary text-primary-foreground font-semibold text-center"
          >
            Get an API key
          </a>
        </nav>
      )}
    </header>
  )
}
