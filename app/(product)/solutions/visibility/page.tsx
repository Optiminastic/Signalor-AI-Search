import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import {
  BarChart3,
  Bot,
  Eye,
  Gauge,
  Globe,
  LineChart,
  Link2,
  Quote,
  Radar,
  Radio,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Check,
} from '@/features/site/components/icons'
import { LandingFaq } from '@/features/site/components/landing/landing-faq'
import { JsonLd } from '@/features/site/components/seo/json-ld'
import {
  SolutionsBenefitsList,
  SolutionsBottomCTA,
  SolutionsFeatureGrid,
  SolutionsHero,
  SolutionsInlineCTA,
  SolutionsInternalLinks,
  SolutionsSection,
  SolutionsSteps,
  type SolutionsBenefit,
  type SolutionsFeature,
  type SolutionsStep,
} from '@/features/site/components/solutions/solutions-shared'
import {
  AGGREGATE_RATING,
  SITE_BRAND,
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '@/features/site/lib/seo'

const PATH = '/solutions/visibility'

const FAQ_ITEMS = [
  {
    question: 'What is AI visibility and how does SignalorAI measure it?',
    answer:
      'AI visibility is how often, how prominently, and how favorably your brand surfaces in generative answers. SignalorAI scores it across mention frequency, citation share, and recommendation strength, every result timestamped so you can correlate shifts with what you shipped.',
  },
  {
    question: 'Which AI engines does SignalorAI track?',
    answer:
      'ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews, and Microsoft Copilot. Engine coverage scales with plan; Max includes all of them.',
  },
  {
    question: 'How is AI visibility different from traditional SEO ranking?',
    answer:
      'SEO measures position on a results page. AI visibility measures whether the generated answer mentions, paraphrases, or links to you. Generative Engine Optimization (GEO) is the discipline of optimizing for that second layer.',
  },
  {
    question: 'How often does SignalorAI refresh visibility data?',
    answer:
      'Audit snapshots reflect the crawl and prompt run at trigger time. Saved workspaces re-run on a daily, weekly, or monthly schedule with alerts on critical citation changes.',
  },
  {
    question: 'Can I track AI visibility for specific prompts and audiences?',
    answer:
      'Yes. Pin the prompts that matter, segment by country, and break down by AI surface to see where the gap is widest.',
  },
  {
    question: 'Does SignalorAI track AI visibility for competitors too?',
    answer:
      'Yes. Every report compares your brand against the competitors you choose, with citation share, mention share, and recommendation rate side by side.',
  },
  {
    question: 'What inputs does SignalorAI need to score AI visibility?',
    answer:
      'Just a URL. No SDK, no DNS change, no engineering ticket. Sign-in unlocks saved workspaces, alerts, and the fix queue.',
  },
  {
    question: 'How accurate is AI citation tracking when models change so often?',
    answer:
      'Every run records engine, model version, region, and prompt, so each score is reproducible and you can tell when an answer changed because the model shifted versus because your site did.',
  },
  {
    question: 'Can I export AI visibility reports for stakeholders?',
    answer:
      'Yes. Shareable report URLs and downloadable PDFs with the visibility score, citation breakdown, sentiment, and prioritized actions.',
  },
  {
    question: 'How does sentiment analysis fit into the visibility score?',
    answer:
      'Every mention is classified as recommended, neutral, comparison, or cautionary, so you measure not just visibility, but the quality of that visibility.',
  },
  {
    question: 'Does SignalorAI support both B2B SaaS and Shopify or WordPress brands?',
    answer:
      'Yes. The platform is engine-agnostic, any public URL can be scored. Shopify and WordPress unlock one-click apply for schema and content fixes.',
  },
  {
    question: 'Is the first visibility scan really free?',
    answer:
      'Yes. Paste any URL, get a GEO score, citation breakdown, and prioritized fix list, no signup required.',
  },
]

const FEATURES: SolutionsFeature[] = [
  {
    icon: Quote,
    title: 'AI mention monitoring',
    description:
      'Every time ChatGPT, Claude, Gemini, or Perplexity names your brand, captured, attributed, classified.',
  },
  {
    icon: Link2,
    title: 'Citation tracking',
    description:
      'Which of your URLs get linked, quoted, or paraphrased in generative answers, and which get skipped.',
  },
  {
    icon: Search,
    title: 'AI search presence',
    description:
      'Share of voice across every major AI surface for the prompts that drive buyer consideration.',
  },
  {
    icon: TrendingUp,
    title: 'Visibility trends',
    description:
      'Daily, weekly, monthly trend lines that correlate score shifts with the changes you actually shipped.',
  },
  {
    icon: BarChart3,
    title: 'Sentiment analysis',
    description:
      'Recommended, neutral, comparison, or cautionary, know the quality of every mention, not just the count.',
  },
  {
    icon: Radar,
    title: 'Market coverage map',
    description:
      "Find the prompts, regions, and answer types where you're invisible, and competitors aren't.",
  },
]

const HOW_IT_WORKS: SolutionsStep[] = [
  {
    n: '1',
    title: 'Connect your site',
    body: 'Paste any URL. No SDK, no DNS change.',
    icon: Globe,
  },
  {
    n: '2',
    title: 'Scan AI engines',
    body: 'Tracked prompts run against ChatGPT, Claude, Gemini, Perplexity, AI Overviews, and Copilot.',
    icon: Bot,
  },
  {
    n: '3',
    title: 'Receive insights',
    body: 'GEO score, citation share, top competitors, and gaps, in seconds.',
    icon: Eye,
  },
  {
    n: '4',
    title: 'Ship and re-measure',
    body: "Apply fixes, re-run, watch each action's lift trend live.",
    icon: Gauge,
  },
]

const BENEFITS: SolutionsBenefit[] = [
  {
    icon: TrendingUp,
    title: 'Increased discoverability',
    description: 'Move from invisible to recommended on the prompts your buyers actually ask.',
  },
  {
    icon: Link2,
    title: 'Stronger citations',
    description: 'Earn the citations that loop AI-search traffic back to your site.',
  },
  {
    icon: Sparkles,
    title: 'Compounding awareness',
    description:
      "Once you're cited, every future answer in the same prompt cluster reinforces your brand.",
  },
  {
    icon: Target,
    title: 'Edge in zero-click search',
    description: 'Win the answer, not just the link, where modern discovery actually happens.',
  },
]

const INTERNAL_LINKS = [
  {
    label: 'Fix Playbook',
    href: '/solutions/fix-playbook',
    description: 'Turn AI visibility findings into prioritized, ship-ready actions.',
  },
  {
    label: 'Competitive Lens',
    href: '/solutions/competitive-lens',
    description: 'Benchmark citation share and recommendation rate against rivals.',
  },
  {
    label: 'AI Visibility Tracking',
    href: '/ai-visibility',
    description: 'Score how ChatGPT, Claude, Gemini, and Perplexity cite your brand.',
  },
  {
    label: 'Prompt Tracking',
    href: '/prompt-tracking',
    description: 'Watch which AI prompts surface your brand and how rankings shift.',
  },
  {
    label: 'Recommendations',
    href: '/recommendations',
    description: 'Prioritized GEO fixes generated for your site each week.',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    description: 'Starter, Pro, and Max plans built for teams shipping GEO programs.',
  },
]

export const metadata: Metadata = buildMetadata({
  title: 'Visibility | AI Search Visibility & Citation Tracking',
  description:
    'Track AI visibility, brand mentions, citations, and recommendation share across ChatGPT, Claude, Gemini, Perplexity, Copilot, and Google AI. SignalorAI scores AI search visibility and turns it into prioritized GEO actions.',
  path: PATH,
  keywords: [
    'AI visibility platform',
    'AI search visibility',
    'AI citation tracking',
    'AI mention monitoring',
    'Brand visibility in ChatGPT',
    'Brand visibility in Perplexity',
    'Generative Engine Optimization',
    'GEO optimization',
    'LLM SEO',
    'AI search analytics',
    'AI brand monitoring',
    'SignalorAI',
    'SignalorAI',
  ],
})

export default function VisibilitySolutionPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions/visibility' },
    { name: 'Visibility', path: PATH },
  ])

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(PATH)}#webpage`,
    url: absoluteUrl(PATH),
    name: `Visibility | ${SITE_BRAND}`,
    description:
      'AI search visibility platform that tracks brand mentions, citations, and recommendation share across ChatGPT, Claude, Gemini, Perplexity, and other AI engines.',
    isPartOf: { '@id': `${SITE_URL}#website` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/carousel1.png`,
    },
    inLanguage: 'en-US',
    breadcrumb: { '@type': 'BreadcrumbList', '@id': `${absoluteUrl(PATH)}#breadcrumbs` },
  }

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${SITE_BRAND} Visibility`,
    description:
      'AI visibility scoring, citation tracking, and brand mention monitoring across ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews, and Microsoft Copilot.',
    brand: { '@type': 'Brand', name: 'SignalorAI' },
    url: absoluteUrl(PATH),
    image: `${SITE_URL}/carousel1.png`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: '19.99',
      highPrice: '59.99',
      offerCount: 3,
      url: `${SITE_URL}/pricing`,
    },
    aggregateRating: AGGREGATE_RATING,
  }

  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${SITE_BRAND} Visibility Platform`,
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'SEO',
    url: absoluteUrl(PATH),
    description:
      'AI visibility tracking platform measuring brand mentions, citations, and recommendation share across all major AI search engines.',
    publisher: { '@id': `${SITE_URL}#organization` },
    featureList: [
      'AI mention monitoring',
      'Citation tracking',
      'AI search presence',
      'Visibility trends',
      'Sentiment analysis',
      'Market coverage',
    ],
    aggregateRating: AGGREGATE_RATING,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: '19.99',
      highPrice: '59.99',
      offerCount: 3,
      url: `${SITE_URL}/pricing`,
    },
  }

  return (
    <MarketingShell>
      <JsonLd id="ld-solutions-visibility-org" data={organizationJsonLd()} />
      <JsonLd id="ld-solutions-visibility-website" data={websiteJsonLd()} />
      <JsonLd id="ld-solutions-visibility-breadcrumb" data={breadcrumbs} />
      <JsonLd id="ld-solutions-visibility-webpage" data={webPage} />
      <JsonLd id="ld-solutions-visibility-product" data={product} />
      <JsonLd id="ld-solutions-visibility-software" data={softwareApp} />
      <JsonLd id="ld-solutions-visibility-faq" data={faqJsonLd(FAQ_ITEMS)} />

      <SolutionsHero
        eyebrow="solutions · ai visibility"
        heading="See how visible your brand is across"
        highlight="AI search"
        description="Track brand mentions, citations, visibility scores, and competitive presence across ChatGPT, Perplexity, Gemini, Claude, Copilot, and other AI search platforms, in one workspace your team can actually ship from."
        primaryCta={{ label: 'Start free analysis', href: '/sign-up' }}
        secondaryCta={{ label: 'View sample report', href: '/tools/url-analyzer' }}
      />

      <SolutionsSection
        id="visibility-dashboard"
        eyebrow="dashboard preview"
        heading="Every AI visibility signal,"
        highlight="one workspace"
        description="Score, citation share, mention trends, sentiment, and platform coverage, at a glance."
      >
        <VisibilityDashboardPreview />
      </SolutionsSection>

      <SolutionsSection
        id="why-visibility-matters"
        eyebrow="why it matters"
        heading="AI search is the new front door"
        description="Discovery is moving from blue links to synthesized recommendations. AI visibility is the metric that decides whether buyers ever see you."
        bg="neutral"
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: 'AI search growth', v: 'Billions of queries a month resolve inside AI answers.' },
            { k: 'Zero-click reality', v: 'Most informational queries never produce a click.' },
            {
              k: 'LLM recommendations',
              v: "Engines now suggest brands by name. That's the new SERP.",
            },
            { k: 'Brand discovery', v: 'New audiences meet brands through AI first.' },
          ].map(c => (
            <li key={c.k} className="rounded-none border border-black/8 bg-white p-5">
              <p className="text-primary-ink text-[11px] font-semibold tracking-[0.18em] uppercase">
                {c.k}
              </p>
              <p className="text-accent-foreground mt-2.5 text-sm leading-relaxed font-light">
                {c.v}
              </p>
            </li>
          ))}
        </ul>
      </SolutionsSection>

      <SolutionsSection
        id="visibility-features"
        eyebrow="features"
        heading="Built for teams who treat AI visibility as a"
        highlight="core KPI"
      >
        <SolutionsFeatureGrid features={FEATURES} />
      </SolutionsSection>

      <SolutionsSection
        id="visibility-how-it-works"
        eyebrow="how it works"
        heading="Pasted URL to insight in"
        highlight="under a minute"
        bg="neutral"
      >
        <SolutionsSteps steps={HOW_IT_WORKS} />
      </SolutionsSection>

      <SolutionsSection
        id="visibility-benefits"
        eyebrow="benefits"
        heading="What measurable visibility"
        highlight="unlocks"
      >
        <SolutionsBenefitsList benefits={BENEFITS} />
        <div className="mt-10">
          <SolutionsInlineCTA
            heading="See your AI visibility score in 60 seconds"
            description="Paste any URL and get a baseline GEO score, citation breakdown, and prioritized actions, no signup required."
            primaryCta={{ label: 'Run free audit', href: '/sign-up' }}
            secondaryCta={{ label: 'Compare plans', href: '/pricing' }}
          />
        </div>
      </SolutionsSection>

      <SolutionsSection
        id="visibility-related"
        eyebrow="explore the platform"
        heading="Where to go next"
      >
        <SolutionsInternalLinks heading="Related solutions and tools" links={INTERNAL_LINKS} />
      </SolutionsSection>

      <LandingFaq
        sectionId="visibility-faq"
        headingId="visibility-faq-heading"
        heading="Visibility FAQs"
        description="How AI visibility tracking works."
        items={FAQ_ITEMS}
      />

      <SolutionsBottomCTA
        eyebrow="start free"
        heading="Score your AI visibility today"
        description="Paste any URL. Get a GEO score, citation breakdown, and prioritized actions, in under a minute."
        primaryCta={{ label: 'Start free analysis', href: '/sign-up' }}
        secondaryCta={{ label: 'See pricing', href: '/pricing' }}
      />
    </MarketingShell>
  )
}

function VisibilityDashboardPreview() {
  return (
    <div className="overflow-hidden rounded-none border border-black/8 bg-white shadow-lg">
      <div className="grid grid-cols-1 divide-y divide-black/6 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        <div className="from-muted bg-gradient-to-br to-white p-6 lg:col-span-4 lg:p-8">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            AI Visibility Score
          </p>
          <p className="text-foreground mt-3 text-5xl font-bold tabular-nums">
            78<span className="text-muted-foreground text-2xl">/100</span>
          </p>
          <div className="text-success mt-4 flex items-center gap-2 text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            <span>+12 vs. last month</span>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { label: 'Content depth', v: 82 },
              { label: 'Schema coverage', v: 71 },
              { label: 'Authority signals', v: 74 },
              { label: 'Entity recognition', v: 88 },
            ].map(p => (
              <div key={p.label}>
                <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium">
                  <span>{p.label}</span>
                  <span className="tabular-nums">{p.v}</span>
                </div>
                <div className="bg-muted mt-1 h-1 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${p.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 lg:col-span-5 lg:p-8">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Citation share by engine
          </p>
          <ul className="mt-4 space-y-3">
            {[
              { label: 'Perplexity', v: 42, color: 'bg-primary' },
              { label: 'ChatGPT', v: 31, color: 'bg-primary/70' },
              { label: 'Gemini', v: 24, color: 'bg-primary/55' },
              { label: 'Claude', v: 18, color: 'bg-primary/40' },
              { label: 'Copilot', v: 9, color: 'bg-primary/30' },
            ].map(c => (
              <li key={c.label}>
                <div className="text-foreground flex items-center justify-between text-xs font-medium">
                  <span>{c.label}</span>
                  <span className="text-muted-foreground tabular-nums">{c.v}% share</span>
                </div>
                <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.v}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 lg:col-span-3 lg:p-8">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Mention sentiment
          </p>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Recommended', v: 18, tone: 'bg-success' },
              { label: 'Neutral mention', v: 24, tone: 'bg-muted' },
              { label: 'Comparison only', v: 11, tone: 'bg-warning' },
              { label: 'Cautionary', v: 2, tone: 'bg-destructive' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.tone}`} />
                <span className="text-foreground flex-1 text-xs font-medium">{s.label}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{s.v}</span>
              </div>
            ))}
          </div>
          <div className="bg-muted mt-6 rounded-none border border-black/6 p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
              <Radio className="h-3 w-3" aria-hidden />
              Live since 14d
            </div>
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
              Prompts re-scored every 24h across all tracked engines.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-black/6 border-t border-black/6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { label: 'Prompts tracked', v: '147', icon: Target },
          { label: 'Citations this month', v: '382', icon: Link2 },
          { label: 'Top competitor gap', v: '−14%', icon: LineChart },
        ].map(m => {
          const I = m.icon
          return (
            <div key={m.label} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <I className="text-muted-foreground h-4 w-4" aria-hidden />
                <span className="text-muted-foreground text-xs font-medium">{m.label}</span>
              </div>
              <span className="text-foreground text-base font-bold tabular-nums">{m.v}</span>
            </div>
          )
        })}
      </div>

      <div className="bg-muted border-t border-black/6 px-6 py-3.5">
        <p className="text-muted-foreground text-[11px] leading-relaxed font-medium">
          <Sparkles className="text-primary-ink mr-1 inline-block h-3 w-3" aria-hidden />{' '}
          Illustrative dashboard, your visibility score, citation share, and sentiment update with
          every re-run.{' '}
          <Link href="/sign-up" className="text-primary-ink font-semibold hover:underline">
            See yours now <Check className="-mb-px ml-0.5 inline-block h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  )
}
