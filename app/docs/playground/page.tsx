import type { Metadata } from "next"
import { Suspense } from "react"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { Playground } from "@/components/playground"
import { Callout, DocH1, DocLead, InlineCode } from "@/components/doc-primitives"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Playground",
  description: "Send live requests to the T1API from your browser and see the chart or JSON come back.",
}

export default function PlaygroundPage() {
  const { prev, next } = neighbours("/docs/playground")
  return (
    <DocsPageWrapper toc={[]} prev={prev} next={next} wide>
      <DocH1 eyebrow="Try it live">Playground</DocH1>
      <DocLead>
        Pick an endpoint, set parameters, and send a real request. PNG plots render inline; JSON is pretty-printed; every request comes with
        ready-to-paste curl, Python and JavaScript.
      </DocLead>
      <Callout variant="warning" title="Use a key you can revoke">
        Requests go from your browser straight to <InlineCode>api.t1f1.com</InlineCode> and count against your rate limits. If the browser
        blocks a call (CORS), copy the curl snippet and run it from a terminal.
      </Callout>
      <Suspense fallback={<div className="skeleton h-96 rounded-xl" aria-hidden="true" />}>
        <Playground />
      </Suspense>
    </DocsPageWrapper>
  )
}
