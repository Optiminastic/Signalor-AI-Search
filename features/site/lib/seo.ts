import type { Metadata } from 'next'

import { env } from './env'

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL

export const SITE_NAME = 'SignalorAI'
export const SITE_DISPLAY_NAME = 'SignalorAI'
// Registered company name — a factual schema.org `legalName`, not brand copy.
// Only change this if the entity is actually renamed at Companies House.
export const SITE_LEGAL_NAME = 'Signalor Ltd.'
export const SITE_BRAND = 'SignalorAI'

// Names the brand was known by before the SignalorAI rename. Google has these
// indexed, so they stay in `alternateName` / keywords: that is what tells the
// knowledge graph the renamed entity is the same one, instead of a new brand
// starting from zero. Remove only once "SignalorAI" ranks for these terms.
//
// Deliberately NOT including the bare domain "signalor.ai": listing the domain
// as an `alternateName` on the WebSite schema tells Google it is an approved
// site name, and because it matches the URL Google then renders "signalor.ai"
// as the site name above the result instead of "SignalorAI". The domain still
// lives in `SITE_KEYWORDS` for search targeting, which does not affect the
// displayed site name.
export const SITE_PRIOR_NAMES = ['Signalor', 'Signalor AI'] as const
export const SITE_TAGLINE = 'AI search visibility & GEO platform'
export const SITE_DESCRIPTION =
  'SignalorAI is the Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) platform that scores, monitors, and improves how ChatGPT, Claude, Gemini, Perplexity, and Google AI cite your brand.'

export const SITE_KEYWORDS = [
  'GEO',
  'Generative Engine Optimization',
  'AEO',
  'Answer Engine Optimization',
  'AI search visibility',
  'AI discoverability',
  'AI brand visibility',
  'LLM SEO',
  'AI SEO',
  'ChatGPT SEO',
  'Perplexity SEO',
  'Gemini SEO',
  'Claude SEO',
  'Claude citations',
  'AI citation tracking',
  'AI citation monitoring',
  'LLM citation tracking',
  'prompt monitoring',
  'prompt tracking',
  'prompt tracker',
  'prompt performance tracking',
  'AI prompt tracking',
  'AI prompt monitoring',
  'GPT prompt tracker',
  'LLM prompt tracking',
  'Generative AI prompt tracking',
  'prompt and citation tracking tools',
  'AI answer monitoring',
  'AI search monitoring',
  'LLM monitoring',
  'AI visibility tracking',
  'brand monitoring for AI',
  'schema.org',
  'schema validator',
  'schema checker',
  'schema.org validator',
  'JSON-LD validator',
  'JSON-LD checker',
  'structured data validator',
  'structured data testing',
  'llms.txt',
  'AI crawler optimization',
  'brand visibility',
  'SignalorAI',
  // Prior brand terms people still type — keep targeting them through the rename.
  'Signalor',
  'Signalor AI',
  'signalor.ai',
  'platforma signalor',
  'platform signalor',
]

export const SITE_LOCALE = 'en_US'
export const SITE_TWITTER = '@signalorai'
export const SITE_OG_IMAGE = `${SITE_URL}/carousel1.png`

export const ORG_SOCIAL = [
  'https://twitter.com/signalorai',
  'https://github.com/signalorai',
  'https://www.crunchbase.com/organization/signalor-ai',
]

export const DEFAULT_OG = {
  type: 'website' as const,
  siteName: SITE_DISPLAY_NAME,
  locale: SITE_LOCALE,
  url: SITE_URL,
  images: [
    {
      url: SITE_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: `${SITE_BRAND} | ${SITE_TAGLINE}`,
    },
  ],
}

type BuildMetadataInput = {
  title?: string
  description?: string
  path?: string
  keywords?: string[]
  noindex?: boolean
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
}

export function absoluteUrl(path = '/'): string {
  if (!path.startsWith('/')) return path
  return `${SITE_URL}${path}`
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  keywords,
  noindex = false,
  ogImage,
  ogType = 'website',
}: BuildMetadataInput = {}): Metadata {
  const url = absoluteUrl(path)
  const fullTitle = title ? `${title} | ${SITE_BRAND}` : `${SITE_BRAND} | ${SITE_TAGLINE}`
  const image = ogImage || SITE_OG_IMAGE

  return {
    title: title || `${SITE_BRAND} | ${SITE_TAGLINE}`,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_LEGAL_NAME, url: SITE_URL }],
    creator: SITE_LEGAL_NAME,
    publisher: SITE_LEGAL_NAME,
    category: 'technology',
    alternates: { canonical: url },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: ogType,
      title: fullTitle,
      description,
      url,
      siteName: SITE_DISPLAY_NAME,
      locale: SITE_LOCALE,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      title: fullTitle,
      description,
      images: [image],
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.svg',
      apple: '/icon.svg',
    },
    manifest: '/manifest.webmanifest',
    metadataBase: new URL(SITE_URL),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    other: {
      'theme-color': '#0a0a0a',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    // schema.org: `name` is the common/brand name, `legalName` the registered
    // entity. They differ here — the brand is SignalorAI, the company is not.
    name: SITE_DISPLAY_NAME,
    legalName: SITE_LEGAL_NAME,
    alternateName: [...SITE_PRIOR_NAMES],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon.svg`,
      width: 512,
      height: 512,
    },
    description: SITE_DESCRIPTION,
    sameAs: ORG_SOCIAL,
    foundingDate: '2024',
    knowsAbout: [
      'Generative Engine Optimization',
      'Answer Engine Optimization',
      'AI search visibility',
      'Large Language Model SEO',
      'Schema.org structured data',
      'Content citations in AI',
    ],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_DISPLAY_NAME,
    alternateName: [...SITE_PRIOR_NAMES],
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export const AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: '4.8',
  ratingCount: '127',
  bestRating: '5',
  worstRating: '1',
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}#software`,
    name: SITE_BRAND,
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'SEO',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}#organization` },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'GBP',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Self-Serve Brand',
        price: '69.99',
        priceCurrency: 'GBP',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Managed Growth Brand',
        price: '99.69',
        priceCurrency: 'GBP',
        url: `${SITE_URL}/pricing`,
      },
    ],
    featureList: [
      'GEO scoring across six pillars',
      'AI visibility tracking on ChatGPT, Claude, Gemini, Perplexity',
      'Schema.org validation and recommendations',
      'Citation attribution and competitor benchmarking',
      'Prompt tracking and ranking',
      'Shopify and WordPress integrations',
    ],
    aggregateRating: AGGREGATE_RATING,
  }
}

export const SITE_NAV = [
  {
    name: 'Pricing',
    path: '/pricing',
    description: 'SignalorAI plans for every team: Starter, Pro, and Max.',
  },
  {
    name: 'AI Visibility Tracking',
    path: '/ai-visibility',
    description: 'SignalorAI Monitors how ChatGPT, Claude, Gemini, and Perplexity cite your brand.',
  },
  {
    name: 'Prompt Tracking',
    path: '/prompt-tracking',
    description:
      'SignalorAI Tracks which AI prompts surface your brand and how rankings shift over time.',
  },
  {
    name: 'Recommendations',
    path: '/recommendations',
    description: 'SignalorAI Prioritizes GEO fixes automatically generated for your site.',
  },
  {
    name: 'Free Tools',
    path: '/tools',
    description: 'Free GEO tools from SignalorAI: URL analyzer, schema validator, and more.',
  },
  {
    name: 'About SignalorAI',
    path: '/about-us',
    description: 'The team and mission behind the AI search visibility platform.',
  },
  {
    name: 'Blog',
    path: '/blog',
    description: 'Guides, research, and updates on GEO, AEO, and AI search.',
  },
] as const

export function siteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_BRAND} site navigation`,
    itemListElement: SITE_NAV.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      description: item.description,
      url: absoluteUrl(item.path),
    })),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function articleJsonLd(opts: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  author?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(opts.path),
    },
    image: opts.image || SITE_OG_IMAGE,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      '@type': opts.author ? 'Person' : 'Organization',
      name: opts.author || SITE_LEGAL_NAME,
    },
    publisher: {
      '@id': `${SITE_URL}#organization`,
      '@type': 'Organization',
      name: SITE_LEGAL_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
  }
}
