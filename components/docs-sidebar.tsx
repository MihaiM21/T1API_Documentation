"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ExternalLink, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { docsNav, type NavSection } from "@/lib/docs-nav"
import { useSearch } from "@/components/search-dialog"

function useHash() {
  const [hash, setHash] = useState("")
  useEffect(() => {
    const read = () => setHash(window.location.hash)
    read()
    window.addEventListener("hashchange", read)
    // next/link hash navigation uses pushState, so also poll on popstate + clicks.
    window.addEventListener("popstate", read)
    const onClick = () => setTimeout(read, 0)
    document.addEventListener("click", onClick)
    return () => {
      window.removeEventListener("hashchange", read)
      window.removeEventListener("popstate", read)
      document.removeEventListener("click", onClick)
    }
  }, [])
  return hash
}

function NavSectionComponent({
  section,
  pathname,
  hash,
}: {
  section: NavSection
  pathname: string
  hash: string
}) {
  const current = pathname + hash
  const sectionActive = section.items.some((item) => item.href.split("#")[0] === pathname)
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? sectionActive)

  // Auto-open the section you navigate into.
  const [prevActive, setPrevActive] = useState(sectionActive)
  if (prevActive !== sectionActive) {
    setPrevActive(sectionActive)
    if (sectionActive) setIsOpen(true)
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          {sectionActive && <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />}
          {section.title}
        </span>
        <ChevronDown className={cn("h-3 w-3 shrink-0 transition-transform", !isOpen && "-rotate-90")} aria-hidden="true" />
      </button>
      {isOpen && (
        <ul className="mb-2 ml-3 border-l border-sidebar-border">
          {section.items.map((item) => {
            const [itemPath, itemHash] = item.href.split("#")
            const isItemActive = itemHash
              ? current === item.href
              : pathname === itemPath && (hash === "" || !section.items.some((i) => i.href === pathname + hash))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isItemActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center justify-between -ml-px pl-3 pr-2 py-1.5 text-[13px] border-l transition-colors",
                    isItemActive
                      ? "text-primary border-primary font-medium bg-primary/5"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/40",
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary leading-none shrink-0 tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function DocsSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const hash = useHash()
  const { open } = useSearch()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 w-72 lg:w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-30 pt-14",
        "transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      aria-label="Documentation sidebar"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-sidebar-border lg:hidden">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Navigation</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 py-3 border-b border-sidebar-border">
        <button
          type="button"
          onClick={open}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-md bg-secondary/70 border border-border text-muted-foreground hover:border-primary/50 transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="text-xs flex-1 text-left">Search docs…</span>
          <kbd className="text-[10px] font-mono border border-border rounded px-1 bg-background">Ctrl K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Documentation navigation">
        {docsNav.map((section) => (
          <NavSectionComponent key={section.title} section={section} pathname={pathname} hash={hash} />
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <a
          href="https://turnonehub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-[8px]">T1</span>
          </span>
          turnonehub.com
          <ExternalLink className="h-3 w-3 ml-auto shrink-0" aria-hidden="true" />
        </a>
      </div>
    </aside>
  )
}
