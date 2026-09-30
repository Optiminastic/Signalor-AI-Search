import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { ForAgenciesHero } from '@/features/site/components/landing/for-agencies-hero'
import { ForAgenciesPricing } from '@/features/site/components/landing/for-agencies-pricing'
import { ForAgenciesSections } from '@/features/site/components/landing/for-agencies-sections'
import { HomeFaq } from '@/features/site/components/landing/home-faq'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { FOR_AGENCIES_FAQ } from '@/features/site/lib/landing-for-agencies-content'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'AI Search for Agencies | Track GEO Across Your Whole Client Roster',
  description:
    'Run GEO audits, monitor AI share of voice, and ship prioritized fixes across every client from one SignalorAI workspace. Multi-brand projects, white-label reporting, and roster-wide fix planning built for agencies.',
  path: '/for-agencies',
  keywords: [
    'AI search for agencies',
    'GEO for agencies',
    'agency AI visibility',
    'white-label GEO reports',
    'multi-client AI search',
    'answer engine optimization agency',
    'AI SEO agency tool',
    'client AI visibility tracking',
    'agency generative engine optimization',
    'share of AI voice agencies',
  ],
})

const forAgenciesWebPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/for-agencies`,
  name: 'AI Search for Agencies: Track GEO Across Your Whole Client Roster',
  description:
    'Run GEO audits, monitor AI share of voice, and ship prioritized fixes across every client from one SignalorAI workspace, with multi-brand projects and white-label reporting built for agencies.',
  url: `${SITE_URL}/for-agencies`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'For agencies', item: `${SITE_URL}/for-agencies` },
    ],
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'SignalorAI for Agencies',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free GEO audit available',
    },
    featureList: [
      'Multi-brand workspace with a separate project per client',
      'Per-client GEO scoring across schema, content, E-E-A-T, and technical pillars',
      'AI share-of-voice benchmarking per brand',
      'White-label, exportable client reports',
      'Client-scoped, prioritized fix queues tied to expected score lift',
      'Roster-wide impact planning across the whole book of business',
    ],
  },
}

export default function ForAgenciesPage(): JSX.Element {
  return (
    <MarketingShell>
      <p className="sr-only">
        SignalorAI for Agencies lets marketing agencies, SEO consultants, and GEO specialists run AI
        search visibility for an entire client roster from one workspace. Each client is a separate
        project with its own GEO score, prompt library, competitor set, and run schedule.
      </p>
      <p className="sr-only">
        Account managers report a clean 0-100 number while strategists focus on the schema,
        structure, and trust-signal work that moves how ChatGPT, Claude, Gemini, Perplexity,
        Copilot, and Google AI Overviews cite each brand.
      </p>
      <p className="sr-only">
        White-label reporting exports GEO scores and pillar breakdowns for monthly reviews.
        Prioritized fix queues turn every audit into a client-scoped task list ranked by expected
        score lift.
      </p>
      <p className="sr-only">
        Roster-wide impact planning puts retainer hours where they move scores most. Agency plans
        scale with your book of business, turning generative engine optimization (GEO) and answer
        engine optimization (AEO) into repeatable, reportable client delivery.
      </p>
      <JsonLd
        id="ld-for-agencies-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'For agencies', path: '/for-agencies' },
        ])}
      />
      <JsonLd id="ld-for-agencies-webpage" data={forAgenciesWebPageJsonLd} />
      <JsonLd id="ld-for-agencies-faq" data={faqJsonLd([...FOR_AGENCIES_FAQ])} />
      <ForAgenciesHero />
      <ForAgenciesSections />
      <ForAgenciesPricing />
      <div className="border-border mx-auto max-w-6xl border-x">
        <HomeFaq items={[...FOR_AGENCIES_FAQ]} />
      </div>
    </MarketingShell>
  )
}
