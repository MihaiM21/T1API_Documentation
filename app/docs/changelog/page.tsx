import type { Metadata } from "next"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { ChangelogList } from "@/components/changelog-list"
import { Callout, DocH1, DocLead, InlineCode } from "@/components/doc-primitives"
import { releases, releaseId } from "@/lib/changelog"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed in each T1API release.",
}

const toc = releases.slice(0, 12).map((r) => ({ id: releaseId(r.version), label: `v${r.version}`, level: 1 as const }))

export default function ChangelogPage() {
  const { prev } = neighbours("/docs/changelog")
  return (
    <DocsPageWrapper toc={toc} prev={prev}>
      <DocH1 eyebrow="Releases">Changelog</DocH1>
      <DocLead>
        User-facing changes to the API, newest first. T1API uses semantic versioning; the running version is always available from{" "}
        <InlineCode>GET /</InlineCode> and <InlineCode>GET /api/health</InlineCode>.
      </DocLead>
      <Callout variant="info" title="What's listed">
        Only changes that affect people calling the API. Operator-only work — the admin console, backups, deployment — is left out.
      </Callout>
      <ChangelogList />
    </DocsPageWrapper>
  )
}
