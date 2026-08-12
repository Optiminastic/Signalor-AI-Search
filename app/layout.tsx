import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import type React from 'react'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { QueryProvider } from '@/components/providers/query-provider'
import { Amplitude } from '@/features/site/amplitude'
import { AffiliateCapture } from '@/features/site/components/analytics/affiliate-capture'
import { AhrefsAnalytics } from '@/features/site/components/analytics/ahrefs-analytics'
import { ClarityInit } from '@/features/site/components/analytics/clarity'
import { GitBookWidget } from '@/features/site/components/analytics/gitbook-widget'
import { GoogleAnalytics } from '@/features/site/components/analytics/google-analytics'
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/features/site/components/analytics/google-tag-manager'
import { ReferralCapture } from '@/features/site/components/analytics/referral-capture'
import { CookieConsentBanner } from '@/features/site/components/cookies/cookie-consent'
import { ChunkReloadGuard } from '@/features/site/components/system/chunk-reload-guard'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import {
  buildMetadata,
  organizationJsonLd,
  siteNavigationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '@/features/site/lib/seo'

import './globals.css'
import { cn } from '@/lib/utils'

// BoardUI's typeface — Inter (400/500/600/700). Exposed as --font-boardui and
// applied to the /dashboard (catalyst) surface; the marketing site keeps Mona Sans.
//
// `preload: false` on purpose: this is four weight files, and next/font preloads
// by default for any family whose variable sits on <html> — so every marketing
// visitor was downloading four Inter files to render a dashboard they may never
// open, competing with the LCP image for bandwidth. It still loads on demand
// when CatalystShell asks for var(--font-boardui).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-boardui',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
})

// Mona Sans (GitHub) as the global sans font — variable weight 200–900.
const monaSans = localFont({
  src: './fonts/MonaSans.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '200 900',
  preload: true,
})

// Kept as the --font-serif design token, but NOT preloaded: nothing currently
// renders it, so preloading spent a font download on every page for type that
// never appears. Downloads on demand the moment something uses font-serif.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: ['400'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  ...buildMetadata({ path: '/' }),
  title: {
    default: 'SignalorAI | AI search visibility & GEO platform',
    template: '%s | SignalorAI',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html
      lang="en"
      className={cn(
        'antialiased',
        monaSans.variable,
        instrumentSerif.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="SignalorAI Blog"
          href="/blog/rss.xml"
        />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <JsonLd id="ld-organization" data={organizationJsonLd()} />
        <JsonLd id="ld-website" data={websiteJsonLd()} />
        <JsonLd id="ld-software" data={softwareApplicationJsonLd()} />
        <JsonLd id="ld-sitenav" data={siteNavigationJsonLd()} />
        <GoogleTagManager />
      </head>
      <body className="font-sans antialiased">
        <GoogleTagManagerNoScript />
        <ChunkReloadGuard />
        <Amplitude />
        <ClarityInit />
        <GoogleAnalytics />
        <AhrefsAnalytics />
        {/* <GitBookWidget /> */}
        <Suspense fallback={null}>
          <ReferralCapture />
          <AffiliateCapture />
        </Suspense>
        <QueryProvider>{children}</QueryProvider>
        <CookieConsentBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
