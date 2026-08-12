import type { Metadata, Viewport } from 'next'
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

// Mona Sans (GitHub) as the global sans font — variable weight 200–900.
const monaSans = localFont({
  src: './fonts/MonaSans.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '200 900',
  preload: true,
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
    <html lang="en" className={cn('antialiased', monaSans.variable, 'font-sans')}>
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
