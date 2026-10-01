import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono, Barlow_Condensed } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SearchProvider } from '@/components/search-dialog'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
})

const SITE_URL = 'https://docs.t1f1.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'T1API — Formula 1 telemetry API',
    template: '%s — T1API',
  },
  description:
    'Developer documentation for T1API by Turn One: Formula 1 telemetry, lap analysis, race strategy and standings as ready-to-post PNG charts and clean JSON.',
  applicationName: 'T1API Docs',
  keywords: ['Formula 1', 'F1 API', 'telemetry', 'lap analysis', 'race strategy', 'T1API', 'Turn One'],
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    type: 'website',
    siteName: 'T1API Docs',
    title: 'T1API — Formula 1 telemetry API',
    description: 'Formula 1 telemetry, lap analysis, race strategy and standings as PNG charts and clean JSON.',
    url: SITE_URL,
  },
  twitter: { card: 'summary', title: 'T1API — Formula 1 telemetry API' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SearchProvider>{children}</SearchProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
