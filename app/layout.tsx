import type { Metadata, Viewport } from 'next'
import { Instrument_Serif } from 'next/font/google'
import localFont from 'next/font/local'
import type React from 'react'

import { QueryProvider } from '@/components/providers/query-provider'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import {
  buildMetadata,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '@/features/site/lib/seo'

import './globals.css'

// Mona Sans (GitHub) as the global sans font — variable weight 200–900.
const monaSans = localFont({
  src: './fonts/MonaSans.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '200 900',
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: ['400'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  ...buildMetadata({ path: '/' }),
  title: {
    default: 'Signalor.ai | AI search visibility & GEO platform',
    template: '%s | Signalor.ai',
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
    <html lang="en" className={`${monaSans.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Signalor Blog"
          href="/blog/rss.xml"
        />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <JsonLd id="ld-organization" data={organizationJsonLd()} />
        <JsonLd id="ld-website" data={websiteJsonLd()} />
        <JsonLd id="ld-software" data={softwareApplicationJsonLd()} />
      </head>
      <body className="font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
