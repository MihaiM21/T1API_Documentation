import type { Metadata } from "next"
import Link from "next/link"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { EndpointExplorer } from "@/components/endpoint-explorer"
import { Callout, DocH1, DocLead, InlineCode, Pill } from "@/components/doc-primitives"
import { GROUPS, STATS, featuresByGroup } from "@/lib/catalog"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Endpoints",
  description: "Every T1API endpoint: parameters, examples and live try-it links. Search and filter by group.",
}

const toc = GROUPS.map((g) => ({ id: `group-${g.id}`, label: g.title, level: 1 as const }))

export default function EndpointsPage() {
  const { prev, next } = neighbours("/docs/endpoints")
  const groups = featuresByGroup()
  return (
    <DocsPageWrapper toc={toc} prev={prev} next={next} wide>
      <DocH1 eyebrow="Reference">Endpoints</DocH1>
      <DocLead>
        {STATS.analyses} analyses plus reference and service routes — {STATS.features} features in {groups.length} groups, {STATS.endpoints} endpoints in all. Everything lives under{" "}
        <InlineCode>https://api.t1f1.com</InlineCode> and needs an <InlineCode>X-API-Key</InlineCode> header unless marked{" "}
        <Pill tone="green">No key</Pill>.
      </DocLead>

      <div className="grid gap-3 md:grid-cols-3 mb-8 max-w-5xl">
        <Callout variant="info" title="Common parameters">
          Most routes take <InlineCode>year</InlineCode>, <InlineCode>gp</InlineCode> and <InlineCode>session</InlineCode> — see{" "}
          <Link href="/docs/concepts#sessions" className="text-primary hover:underline">Sessions</Link>.
        </Callout>
        <Callout variant="tip" title="Plot & data pairs">
          <InlineCode>-plot</InlineCode> returns a PNG and <InlineCode>-data</InlineCode> returns JSON. Add <InlineCode>?format=csv</InlineCode> to JSON for a spreadsheet.
        </Callout>
        <Callout variant="warning" title="Looking for /api/v1?">
          It&apos;s deprecated. See the{" "}
          <Link href="/docs/migration" className="text-primary hover:underline">V1 → V2 map</Link>.
        </Callout>
      </div>

      <EndpointExplorer />
    </DocsPageWrapper>
  )
}
