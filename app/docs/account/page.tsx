import type { Metadata } from "next"
import Link from "next/link"
import { DocsPageWrapper } from "@/components/docs-page-wrapper"
import { CodeBlock, TabCodeBlock } from "@/components/code-block"
import {
  Callout,
  DataTable,
  DocDivider,
  DocH1,
  DocH2,
  DocH3,
  DocLead,
  DocP,
  EndpointCard,
  InlineCode,
  ParamTable,
} from "@/components/doc-primitives"
import { neighbours } from "@/lib/docs-nav"

export const metadata: Metadata = {
  title: "Account & keys",
  description: "Sign up, mint and revoke API keys, and watch your usage with the T1API account endpoints.",
}

const toc = [
  { id: "overview", label: "Overview", level: 1 as const },
  { id: "flow", label: "End-to-end flow", level: 1 as const },
  { id: "auth", label: "Sign up & sign in", level: 1 as const },
  { id: "keys", label: "API keys", level: 1 as const },
  { id: "create-key", label: "Create a key", level: 2 as const },
  { id: "revoke-key", label: "List & revoke", level: 2 as const },
  { id: "usage", label: "Usage & quotas", level: 1 as const },
  { id: "security", label: "Security notes", level: 1 as const },
]

export default function AccountPage() {
  const { prev, next } = neighbours("/docs/account")
  return (
    <DocsPageWrapper toc={toc} prev={prev} next={next}>
      <DocH1 eyebrow="Self-service">Account &amp; keys</DocH1>
      <DocLead>
        Create an account, mint API keys, and see how much of your quota you&apos;ve used — all over the API, so it fits into your own tooling.
      </DocLead>

      <section id="overview" className="scroll-mt-24">
        <DocP>
          You can also manage keys from your Turn One dashboard at{" "}
          <a className="text-primary hover:underline" href="https://turnonehub.com/dashboard" target="_blank" rel="noopener noreferrer">
            turnonehub.com/dashboard
          </a>
          . The endpoints below are the same thing, scriptable.
        </DocP>
        <Callout variant="warning" title="Two kinds of credentials">
          <p className="mb-2">
            <strong>Account endpoints</strong> (<InlineCode>/api/auth</InlineCode>, <InlineCode>/api/keys</InlineCode>, <InlineCode>/api/me</InlineCode>) use a short-lived login token:{" "}
            <InlineCode>Authorization: Bearer &lt;token&gt;</InlineCode>.
          </p>
          <p>
            <strong>Data endpoints</strong> use the API key you mint here: <InlineCode>X-API-Key: &lt;key&gt;</InlineCode>. Don&apos;t mix them up.
          </p>
        </Callout>
        <DataTable
          headers={["Tier", "Who gets it", "How"]}
          mono={[0]}
          rows={[
            ["standard", "Everyone", "Any key you mint yourself is standard tier."],
            ["premium", "Production partners", "Granted by the Turn One team — it can't be self-served."],
          ]}
        />
      </section>

      <section id="flow" className="scroll-mt-24">
        <DocH2 id="flow">End-to-end flow</DocH2>
        <CodeBlock
          language="bash"
          code={`# 1. Sign up (or POST /api/auth/login) — returns a bearer token
TOKEN=$(curl -s -X POST https://api.t1f1.com/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"a-long-unique-passphrase"}' | jq -r .access_token)

# 2. Mint an API key — raw_key is shown ONCE
curl -s -X POST https://api.t1f1.com/api/keys \\
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\
  -d '{"label":"my-app"}'

# 3. Use the raw_key on data endpoints
curl "https://api.t1f1.com/api/v2/qualifying-results-data?year=2025&gp=1&session=Q" \\
  -H "X-API-Key: t1_live_..."`}
        />
      </section>

      <DocDivider />

      <section id="auth" className="scroll-mt-24">
        <DocH2 id="auth">Sign up &amp; sign in</DocH2>
        <EndpointCard method="POST" path="/api/auth/signup" description="Create an account. Returns a bearer token. 409 if the email is already registered." />
        <EndpointCard method="POST" path="/api/auth/login" description="Exchange email + password for a bearer token. 401 for wrong credentials, 403 if the account is disabled." />
        <EndpointCard method="GET" path="/api/auth/me" description="Your profile and key counts. Requires the bearer token." />
        <ParamTable
          params={[
            { name: "email", type: "string", required: true, in: "body", description: "Your email address." },
            { name: "password", type: "string", required: true, in: "body", description: "8–128 characters." },
          ]}
        />
        <TabCodeBlock
          tabs={[
            {
              label: "Token response",
              language: "json",
              code: `{ "access_token": "<jwt>", "token_type": "bearer", "user_id": "64f1c0…" }`,
            },
            {
              label: "GET /api/auth/me",
              language: "json",
              code: `{
  "id": "64f1c0…",
  "email": "you@example.com",
  "is_admin": false,
  "created_at": "2026-09-01T09:12:44+00:00",
  "key_count": 2,
  "active_key_count": 1
}`,
            },
          ]}
        />
        <p className="text-[13px] text-muted-foreground">
          Sign-up and login share the public rate limit (30/min per IP), so don&apos;t call them in a loop.
        </p>
      </section>

      <DocDivider />

      <section id="keys" className="scroll-mt-24">
        <DocH2 id="keys">API keys</DocH2>
        <DocH3 id="create-key">Create a key</DocH3>
        <EndpointCard method="POST" path="/api/keys" description="Mint a standard-tier key. The raw key is returned once." />
        <ParamTable params={[{ name: "label", type: "string", in: "body", description: "A name to recognise the key later, e.g. the app it's for." }]} />
        <CodeBlock
          language="json"
          filename="response"
          code={`{
  "id": "66aa10…",
  "raw_key": "t1_live_…",
  "key_prefix": "t1_live_ab12",
  "tier": "standard",
  "label": "my-app",
  "created_at": "2026-09-01T09:14:02+00:00",
  "warning": "Store this key now — it will not be shown again."
}`}
        />
        <Callout variant="danger" title="Store it now">
          Only a hash of the key is kept on the server, so <InlineCode>raw_key</InlineCode> can&apos;t be recovered. Lost it? Revoke it and mint another.
        </Callout>

        <DocH3 id="revoke-key">List &amp; revoke</DocH3>
        <EndpointCard method="GET" path="/api/keys" description="Every key you own, active and revoked. Never includes the raw key or hash." />
        <EndpointCard method="DELETE" path="/api/keys/{key_id}" description="Revoke a key. Takes effect immediately." />
        <CodeBlock
          language="json"
          filename="GET /api/keys"
          code={`{
  "keys": [
    {
      "id": "66aa10…", "owner_id": "64f1c0…", "key_prefix": "t1_live_ab12",
      "tier": "standard", "label": "my-app",
      "created_at": "2026-09-01T09:14:02+00:00",
      "last_used_at": "2026-09-01T11:02:10+00:00",
      "revoked_at": null
    }
  ]
}`}
        />
      </section>

      <DocDivider />

      <section id="usage" className="scroll-mt-24">
        <DocH2 id="usage">Usage &amp; quotas</DocH2>
        <DocP>Every key has its own usage history. All of these need your bearer token.</DocP>
        <EndpointCard method="GET" path="/api/me/usage" description="One dashboard across all your active keys: totals, quota and a per-key breakdown." />
        <EndpointCard method="GET" path="/api/keys/{key_id}/dashboard" description="Today / last 7 days / this month, quota, peak UTC hour and the last 24 h series." />
        <EndpointCard method="GET" path="/api/keys/{key_id}/usage" description="Hourly request, error and latency buckets. ?hours=1–720 (default 24)." />
        <EndpointCard method="GET" path="/api/keys/{key_id}/peak-hours" description="24-bucket hour-of-day (UTC) distribution. ?days=1–90 (default 30)." />
        <CodeBlock
          language="json"
          filename="GET /api/keys/{key_id}/dashboard — illustrative values"
          code={`{
  "key": { "id": "66aa10…", "prefix": "t1_live_ab12", "label": "my-app", "tier": "standard" },
  "quota": {
    "monthly_limit": 100000, "used_this_month": 12874, "remaining": 87126,
    "percent_used": 12.9, "resets_at": "2026-10-01T00:00:00+00:00"
  },
  "rate_limit": { "per_minute": 100, "per_hour": 2000 },
  "usage": {
    "today":         { "requests": 412,   "errors": 3,  "avg_ms": 184.2, "error_rate_percent": 0.73 },
    "last_7_days":   { "requests": 3120,  "errors": 21, "avg_ms": 201.9, "error_rate_percent": 0.67 },
    "current_month": { "requests": 12874, "errors": 88, "avg_ms": 196.4, "error_rate_percent": 0.68 }
  },
  "peak_hour_utc": { "hour": 14, "count": 96, "errors": 1 },
  "last_24h": [ { "bucket": "2026090112", "count": 41, "errors": 0, "avg_duration_ms": 177.0 } ]
}`}
        />
        <Callout variant="info">
          The monthly quota is <em>reported</em> so you can plan; the per-minute and per-hour limits are what&apos;s enforced. See{" "}
          <Link href="/docs#rate-limits" className="text-primary hover:underline">Rate limits</Link>.
        </Callout>
      </section>

      <DocDivider />

      <section id="security" className="scroll-mt-24">
        <DocH2 id="security">Security notes</DocH2>
        <ul className="list-disc pl-5 space-y-2 text-[15px] text-muted-foreground">
          <li>Use a long, unique password. Login tokens are bearer credentials — treat them like passwords and don&apos;t log them.</li>
          <li>One key per app or environment, labelled clearly, so you can revoke precisely.</li>
          <li>Keep keys server-side. A key in browser code is a public key — see <Link href="/docs#keep-keys-safe" className="text-primary hover:underline">keeping your key safe</Link>.</li>
          <li>Revoke on any suspicion of exposure. Revocation is immediate and is also visible in <InlineCode>GET /api/keys</InlineCode>.</li>
        </ul>
      </section>
    </DocsPageWrapper>
  )
}
