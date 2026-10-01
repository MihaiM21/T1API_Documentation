import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main id="main" className="flex-1 flex items-center justify-center px-6 pt-14">
        <div className="max-w-xl text-center py-24">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4">Error 404 · Off track</p>
          <h1 className="font-display text-7xl md:text-9xl font-extrabold uppercase leading-[0.85] tracking-tight">
            Red <span className="text-gradient-red">flag</span>
          </h1>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            That page has left the circuit. Try the endpoint reference or search for what you need with <kbd className="font-mono text-xs border border-border rounded px-1.5 py-0.5 bg-secondary">Ctrl K</kbd>.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/docs" className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary text-primary-foreground font-semibold text-sm plate hover:bg-primary/90 transition-colors">
              Back to the docs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/docs/endpoints" className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-border bg-card text-sm font-medium hover:border-primary/50 transition-colors">
              Browse endpoints
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
