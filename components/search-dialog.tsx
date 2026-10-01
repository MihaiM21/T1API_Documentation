"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Hash, Route } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { docsNav } from "@/lib/docs-nav"
import { FEATURES, endpointsOf, groupOf } from "@/lib/catalog"
import { MethodBadge } from "@/components/doc-primitives"

interface SearchCtx {
  open: () => void
}
const Ctx = createContext<SearchCtx>({ open: () => {} })
export const useSearch = () => useContext(Ctx)

/** One global Ctrl/⌘ + K palette searching pages, sections and every endpoint. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  const pages = useMemo(
    () => docsNav.flatMap((s) => s.items.map((i) => ({ label: i.label, href: i.href, section: s.title }))),
    [],
  )

  const endpoints = useMemo(
    () =>
      FEATURES.map((f) => ({
        f,
        eps: endpointsOf(f),
        href: `/docs/endpoints#${f.id}`,
        group: groupOf(f.group).title,
      })),
    [],
  )

  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <CommandDialog
        open={isOpen}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Search pages, sections and every API endpoint"
        className="sm:max-w-2xl"
      >
        <CommandInput placeholder="Search pages, endpoints, parameters…" />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results. Try an endpoint name like “lap duel” or a path like “standings”.</CommandEmpty>
          <CommandGroup heading="Endpoints">
            {endpoints.map(({ f, eps, href, group }) => (
              <CommandItem
                key={f.id}
                value={`${f.title} ${f.summary} ${eps.map((e) => e.path).join(" ")} ${group} ${(f.params ?? []).map((p) => p.name).join(" ")}`}
                onSelect={() => go(href)}
                className="items-start gap-3"
              >
                <Route className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{f.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{group}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <MethodBadge method={eps[0].method} />
                    <code className="truncate text-[11px] font-mono text-muted-foreground">{f.stem}</code>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Pages & sections">
            {pages.map((p) => (
              <CommandItem key={p.href + p.label} value={`${p.section} ${p.label}`} onSelect={() => go(p.href)}>
                {p.href.includes("#") ? (
                  <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="text-sm">{p.label}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{p.section}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </Ctx.Provider>
  )
}
