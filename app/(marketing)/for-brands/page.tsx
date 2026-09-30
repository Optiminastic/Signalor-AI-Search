import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { ForBrandsHero } from '@/features/site/components/landing/for-brands-hero'
import { ForBrandsPricing } from '@/features/site/components/landing/for-brands-pricing'
import { ForBrandsSections } from '@/features/site/components/landing/for-brands-sections'
import { HomeFaq } from '@/features/site/components/landing/home-faq'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { FOR_BRANDS_FAQ } from '@/features/site/lib/landing-for-brands-content'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'For Brands | Learn How AI Talks About Your Brand',
  description:
    'See how ChatGPT, Gemini, and Perplexity describe and cite your brand today, then close the gaps with a GEO score, six-pillar audit, and a prioritized fix plan.',
  path: '/for-brands',
})

export default function ForBrandsPage(): JSX.Element {
  return (
    <MarketingShell>
      <p className="sr-only">
        SignalorAI for Brands shows marketing and growth teams how AI engines describe, cite, or
        skip their brand. Track mentions, sentiment, and citations across ChatGPT, Claude, Gemini,
        Perplexity, Copilot, and Google AI Overviews.
      </p>
      <p className="sr-only">
        Get one 0-100 GEO score backed by content, schema, E-E-A-T, technical, entity, and
        AI-visibility checks. Turn every audit into a ranked fix list with connectors that apply
        many changes for you.
      </p>
      <p className="sr-only">
        Connect analytics to watch AI referral traffic move as visibility improves.
      </p>
      <JsonLd
        id="ld-for-brands-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'For brands', path: '/for-brands' },
        ])}
      />
      <JsonLd id="ld-for-brands-faq" data={faqJsonLd([...FOR_BRANDS_FAQ])} />
      <ForBrandsHero />
      <ForBrandsSections />
      <ForBrandsPricing />
      <div className="border-border mx-auto max-w-6xl border-x">
        <HomeFaq items={[...FOR_BRANDS_FAQ]} />
      </div>
    </MarketingShell>
  )
}
