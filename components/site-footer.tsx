"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { StatusDot, useApiState } from "@/components/api-status"

const footerLinks = {
  Documentation: [
    { label: "Introduction", href: "/docs" },
    { label: "Endpoints", href: "/docs/endpoints" },
    { label: "Playground", href: "/docs/playground" },
    { label: "Recipes", href: "/docs/recipes" },
    { label: "Changelog", href: "/docs/changelog" },
  ],
  Reference: [
    { label: "Concepts", href: "/docs/concepts" },
    { label: "Response schemas", href: "/docs/schemas" },
    { label: "Account & keys", href: "/docs/account" },
    { label: "Migrating from V1", href: "/docs/migration" },
  ],
  Resources: [
    { label: "Turn One", href: "https://turnonehub.com", external: true },
    { label: "Dashboard", href: "https://turnonehub.com/dashboard", external: true },
    { label: "Status", href: "https://status.t1f1.com", external: true },
    { label: "GitHub", href: "https://github.com/Turn-One-Organization", external: true },
    { label: "Discord", href: "https://discord.gg/rFWq3F6C8t", external: true },
  ],
}

export function SiteFooter() {
  const api = useApiState()
  const statusText =
    api.phase === "up" ? (api.degraded ? "API degraded" : "API operational") : api.phase === "loading" ? "Checking API…" : "API status"

  return (
    <footer className="relative border-t border-border bg-card/40 mt-20">
      <div className="h-2 bg-checker opacity-[0.07]" aria-hidden="true" />
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3" aria-label="T1API home">
              <Image src="/logo.png" alt="" width={28} height={28} />
              <span className="font-display text-xl font-extrabold tracking-tight uppercase leading-none">
                T1<span className="text-primary">API</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
              Formula 1 telemetry, strategy and standings as charts and JSON. Built by Turn One.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{section}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                        <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-border flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-[11px] leading-relaxed text-muted-foreground max-w-2xl">
            &copy; {new Date().getFullYear()} Turn One. T1API is an independent project and is not affiliated with,
            endorsed by or sponsored by Formula 1, the FIA, Formula One Management or any team. F1, Formula 1 and
            related marks belong to their respective owners. Underlying timing data is subject to the
            data provider&apos;s terms.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {api.phase === "up" && (
              <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded border border-border bg-secondary">
                v{api.version}
              </span>
            )}
            <a
              href="https://status.t1f1.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <StatusDot state={api} />
              {statusText}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
