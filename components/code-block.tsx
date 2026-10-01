"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { highlight, tokenClass } from "@/lib/highlight"

function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked (insecure context / permissions); fail quietly.
    }
  }, [text])
  return { copied, copy }
}

function CopyButton({ copied, onClick, label = true }: { copied: boolean; onClick: () => void; label?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[var(--green)]" aria-hidden="true" />
          {label && <span className="text-[var(--green)]">Copied</span>}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {label && <span>Copy</span>}
        </>
      )}
    </button>
  )
}

export function Highlighted({ code, language }: { code: string; language: string }) {
  const tokens = useMemo(() => highlight(code, language), [code, language])
  return (
    <code>
      {tokens.map((t, i) =>
        t.type === "plain" ? t.text : (
          <span key={i} className={tokenClass[t.type]}>
            {t.text}
          </span>
        ),
      )}
    </code>
  )
}

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
  /** Max height in px before the block scrolls. */
  maxHeight?: number
}

export function CodeBlock({ code, language = "bash", filename, className, maxHeight }: CodeBlockProps) {
  const { copied, copy } = useCopy(code)
  return (
    <div className={cn("rounded-lg border border-code-border overflow-hidden my-4 bg-code-bg", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-code-border bg-[oklch(0.14_0_0)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.3_0_0)]" />
            <span className="w-2 h-2 rounded-full bg-[oklch(0.3_0_0)]" />
            <span className="w-2 h-2 rounded-full bg-[oklch(0.3_0_0)]" />
          </span>
          <span className="text-[11px] font-mono text-muted-foreground truncate">
            {filename ?? language}
          </span>
        </div>
        <CopyButton copied={copied} onClick={copy} />
      </div>
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <pre className="px-4 py-3.5 text-[13px] font-mono leading-relaxed text-foreground/90 w-max min-w-full">
          <Highlighted code={code} language={language} />
        </pre>
      </div>
    </div>
  )
}

interface TabCodeBlockProps {
  tabs: Array<{ label: string; language: string; code: string }>
  className?: string
}

export function TabCodeBlock({ tabs, className }: TabCodeBlockProps) {
  const [active, setActive] = useState(0)
  const tab = tabs[Math.min(active, tabs.length - 1)]
  const { copied, copy } = useCopy(tab.code)

  return (
    <div className={cn("rounded-lg border border-code-border overflow-hidden my-4 bg-code-bg", className)}>
      <div className="flex items-center justify-between bg-[oklch(0.14_0_0)] border-b border-code-border">
        <div className="flex overflow-x-auto" role="tablist" aria-label="Code language">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={cn(
                "px-4 py-2.5 text-xs font-mono transition-colors border-b-2 whitespace-nowrap -mb-px",
                active === i
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pr-2">
          <CopyButton copied={copied} onClick={copy} label={false} />
        </div>
      </div>
      <div className="overflow-auto" role="tabpanel">
        <pre className="px-4 py-3.5 text-[13px] font-mono leading-relaxed text-foreground/90 w-max min-w-full">
          <Highlighted code={tab.code} language={tab.language} />
        </pre>
      </div>
    </div>
  )
}
