# T1API Docs — Docusaurus

This is the new T1API documentation site built with Docusaurus 3. It replaces the previous Next.js site at the repo root.

## Setup

```bash
cd docusaurus
npm install
npm run start    # dev server on http://localhost:3000
npm run build    # static output in ./build
npm run serve    # serve the built site locally
```

## Layout

| Path | What lives here |
|---|---|
| `docusaurus.config.ts` | Site config, navbar, footer, redirects, search plugin |
| `sidebars.ts` | Sidebar order (curated, mirrors the legacy `lib/docs-nav.ts`) |
| `docs/**/*.mdx` | All documentation content. Custom components (`<EndpointCard>`, `<ParamTable>`, `<Callout>`, `<DataTable>`, `<MethodBadge>`, `<ApiVersionBadge>`) are registered globally — no imports needed in MDX files |
| `src/components/` | Doc primitives ported from the old `components/doc-primitives.tsx`, plus the playground sub-components |
| `src/pages/index.tsx` | Landing page (redesigned, F1 track-divider visuals) |
| `src/pages/playground.tsx` | Interactive API playground at `/playground` |
| `src/css/custom.css` | Turn One palette mapped onto Infima vars (dark-only) |
| `src/theme/MDXComponents.tsx` | Registers global MDX components |
| `static/img/logo.png` | Brand logo |
| `static/openapi.json` | (Optional) drop your OpenAPI spec here — the playground will auto-load it and replace the bundled fallback endpoint list |

## Adding a new doc page

1. Add an MDX file under `docs/<section>/<page>.mdx` with a frontmatter `id` and `title`.
2. Reference it in `sidebars.ts`.
3. Use the registered components directly in MDX (no imports needed):

```mdx
<EndpointCard method="GET" path="/api/foo" description="…" />

<ParamTable
  params={[
    { name: 'year', type: 'integer', required: true, description: '…' },
  ]}
/>
```

## Playground

`/playground` is a static React page that calls `api.t1f1.com` directly from the browser. Users paste their `X-API-Key` (stored in `localStorage`, never transmitted to anything other than `api.t1f1.com`).

If `static/openapi.json` exists at build time, endpoints + params are derived from the spec. Otherwise the playground falls back to a hardcoded catalogue in `src/components/playground/endpoints.ts`.

**Important:** `api.t1f1.com` must allow CORS from your docs origin. If browser fetches fail with a CORS error, add the docs origin to the API's `Access-Control-Allow-Origin` allowlist.

## Deploy

`npm run build` produces a static directory in `./build` — serve this with any static host (Nginx, S3 + CloudFront, your own infra, etc.).
