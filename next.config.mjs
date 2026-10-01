const isDev = process.env.NODE_ENV !== 'production'

/**
 * Content-Security-Policy
 *
 * The site is static documentation plus one interactive feature (the API
 * playground) that talks to api.t1f1.com from the browser. Everything else is
 * locked to same-origin. `'unsafe-inline'` for scripts/styles is required by
 * Next.js' inline bootstrap data; in development React also needs `eval`.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://api.t1f1.com",
  "font-src 'self' data:",
  `connect-src 'self' https://api.t1f1.com https://vitals.vercel-insights.com${isDev ? ' ws: http://localhost:*' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      // The SDK page described packages that aren't published; replaced by plain-HTTP recipes.
      { source: '/docs/sdks', destination: '/docs/recipes', permanent: true },
      // T1API is REST-only; live-data guidance now lives in the recipes.
      { source: '/docs/websocket', destination: '/docs/recipes#live-data', permanent: true },
    ]
  },
}

export default nextConfig
