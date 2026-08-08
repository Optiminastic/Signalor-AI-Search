import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { LandingFaq } from '@/features/site/components/landing/landing-faq'
import { PromptTrackingFeaturesGrid } from '@/features/site/components/landing/prompt-tracking-features-grid'
import { PromptTrackingHero } from '@/features/site/components/landing/prompt-tracking-hero'
import { PromptTrackingWhySection } from '@/features/site/components/landing/prompt-tracking-why-section'
import { PromptTrackingComparisonTable } from '@/features/site/components/landing/prompt-tracking-comparison-table'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import { PROMPT_TRACKING_HUB_FAQ } from '@/features/site/lib/landing-prompt-tracking-content'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'AI Prompt Monitoring | Track Brand Mentions in ChatGPT & Gemini',
  description:
    'Monitor the AI prompts buyers ask ChatGPT, Claude, Gemini, and Perplexity about your category. SignalorAI tracks every citation, paraphrase, and omission, then ties it to your GEO score and prioritized fixes.',
  path: '/prompt-tracking',
  keywords: [
    'AI prompt monitoring',
    'AI prompt tracking',
    'prompt tracking tool',
    'ChatGPT brand monitoring',
    'AI mention tracking',
    'answer engine monitoring',
    'AI citation tracking',
    'AI answer monitoring',
    'Generative Engine Optimization',
    'AEO monitoring',
    'brand visibility AI',
    'Perplexity brand tracking',
    'Gemini brand monitoring',
    'AI search monitoring',
    'share of AI voice',
  ],
})

const promptTrackingWebPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/prompt-tracking`,
  name: 'AI Prompt Monitoring: Track Brand Mentions in ChatGPT & Gemini',
  description:
    'Monitor the AI prompts buyers ask ChatGPT, Claude, Gemini, and Perplexity, then tie every citation, paraphrase, and omission to your SignalorAI GEO score and prioritized fixes.',
  url: `${SITE_URL}/prompt-tracking`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Prompt tracking',
        item: `${SITE_URL}/prompt-tracking`,
      },
    ],
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'SignalorAI Prompt Monitoring',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free GEO audit available',
    },
    featureList: [
      'AI prompt monitoring across ChatGPT, Claude, Gemini, and Perplexity',
      'Branded, category, and head-to-head prompt libraries',
      'Per-surface citation, paraphrase, and omission tracking',
      'Drift alerts when AI answers change after a launch',
      'Competitor share-of-voice benchmarking',
      'Prompt-level deltas linked to the SignalorAI GEO fix queue',
    ],
  },
}

export default function PromptTrackingPage() {
  return (
    <MarketingShell>
      <p className="sr-only">
        SignalorAI Prompt Tracking lets marketing teams, SEO strategists, and brand managers monitor
        which user prompts trigger AI citations of their brand across ChatGPT, Claude, Gemini,
        Perplexity, and Google AI Overviews. You define branded queries, category questions,
        head-to-head comparisons, and buying-intent prompts, and SignalorAI runs live probes on a
        configurable schedule, recording every AI-generated response, paraphrase, direct citation,
        and omission. The prompt library organizes tracked queries by topic, campaign, or funnel
        stage so teams can spot which content gaps cost AI visibility before competitors exploit
        them. AI surfaces reporting gives a per-engine breakdown: which prompts rank on ChatGPT but
        not Gemini, where Perplexity cites a rival instead, and how mention tone shifts over time.
        Prompt Tracking integrates with SignalorAI GEO scoring so every drop in citation rate maps
        to a schema, content, or trust signal that can be actioned. It is the core generative engine
        optimization (GEO) and answer engine optimization (AEO) monitoring layer for brands
        competing in AI search.
      </p>
      <JsonLd
        id="ld-prompt-tracking-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Prompt tracking', path: '/prompt-tracking' },
        ])}
      />
      <JsonLd id="ld-prompt-tracking-webpage" data={promptTrackingWebPageJsonLd} />
      <JsonLd id="ld-prompt-tracking-faq" data={faqJsonLd([...PROMPT_TRACKING_HUB_FAQ])} />
      <PromptTrackingHero />
      <PromptTrackingFeaturesGrid />
      <PromptTrackingWhySection />
      <PromptTrackingComparisonTable />
      <LandingFaq
        sectionId="prompt-tracking-faq"
        headingId="prompt-tracking-faq-heading"
        heading="Prompt tracking FAQs"
        description="How surfaces, libraries, and plans fit together inside SignalorAI."
        items={[...PROMPT_TRACKING_HUB_FAQ]}
      />
    </MarketingShell>
  )
}
