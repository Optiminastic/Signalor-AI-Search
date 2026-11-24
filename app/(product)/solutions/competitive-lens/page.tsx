import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Compass,
  Eye,
  LineChart,
  Link2,
  Quote,
  Radar,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
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
  type SolutionsBenefit,
  type SolutionsFeature,
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

const PATH = '/solutions/competitive-lens'

const FAQ_ITEMS = [
  {
    question: 'What is competitive AI visibility benchmarking?',
    answer:
      'A side-by-side comparison of how often you and your competitors appear in generative AI answers, across mentions, citations, and recommendation rate, for the prompts that decide consideration.',
  },
  {
    question: 'How does SignalorAI pick which competitors to track?',
    answer:
      'We auto-suggest competitors AI engines already cite alongside you. Add, remove, or pin any brand. Pro tracks up to five; Max is unlimited.',
  },
  {
    question: "Share of voice vs. citation share, what's the difference?",
    answer:
      'Share of voice is mention frequency. Citation share is whether your URL is actually linked or quoted. Both matter: one is awareness, the other is traffic and authority.',
  },
  {
    question: 'Can I see why a competitor is winning AI citations?',
    answer:
      'Yes. Lens surfaces the signal causing each gap, schema, content depth, EEAT, entity graph, and each one resolves into a ranked fix.',
  },
  {
    question: 'How does SignalorAI identify emerging competitors?',
    answer:
      "We watch the source list each AI engine cites. When a new brand surfaces in the top three over multiple runs, it's flagged with a confidence score.",
  },
  {
    question: 'Can I segment by region or AI engine?',
    answer:
      'Yes. Per-engine, per-region, and per-prompt breakdowns are first-class, so you can see whether your gap is global, local, or model-specific.',
  },
  {
    question: 'What are content gaps and authority gaps?',
    answer:
      "A content gap is a topic competitors win and you don't appear for. An authority gap is a topic where you have content but lack the trust signals to be cited.",
  },
  {
    question: 'Does SignalorAI track AI recommendation rate per competitor?',
    answer:
      'Yes. Recommendation rate is tracked separately from mentions because being championed is different from being merely listed.',
  },
  {
    question: 'How do strategic recommendations work?',
    answer:
      "Each gap becomes a ranked move with expected citation lift relative to the specific competitor you're closing the gap against.",
  },
  {
    question: 'Can I export competitive reports?',
    answer:
      'Yes. Branded PDFs and shareable URLs with citation share, gap analysis, emerging competitors, and ranked moves.',
  },
  {
    question: 'How fresh is competitive data?',
    answer:
      'Snapshots reflect the engine runs at audit time. Saved workspaces re-run on your schedule, with alerts on threshold changes.',
  },
  {
    question: 'Is Competitive Lens on every plan?',
    answer:
      'Full Competitive Lens unlocks on Pro and Max. Starter includes baseline competitive context inside the visibility report.',
  },
]

const FEATURES: SolutionsFeature[] = [
  {
    icon: Trophy,
    title: 'Share of voice',
    description: 'AI mention frequency across every competitor, per engine, with trend lines.',
  },
  {
    icon: Quote,
    title: 'Citation comparison',
    description: "Who's being cited, how often, and from which pages.",
  },
  {
    icon: Compass,
    title: 'Content gaps',
    description: "Prompts where competitors win and you don't appear, and the missing signal.",
  },
  {
    icon: Eye,
    title: 'Authority gaps',
    description: 'EEAT, schema, and off-site signal scoring per competitor.',
  },
  {
    icon: BarChart3,
    title: 'Recommendation analysis',
    description: 'How often each brand is championed by name vs. merely listed.',
  },
  {
    icon: Radar,
    title: 'Emerging competitors',
    description: 'New entrants flagged the moment they break into the top three sources.',
  },
]

const BENEFITS: SolutionsBenefit[] = [
  {
    icon: Target,
    title: 'Decisive moves',
    description:
      'Exact citation, mention, and recommendation deltas, and which gap to close first.',
  },
  {
    icon: TrendingUp,
    title: 'Catch share shifts early',
    description: 'Spot inflections when they happen, not when the quarter tells you.',
  },
  {
    icon: Trophy,
    title: 'Win category-defining prompts',
    description: "See who's winning the 20-40 prompts that drive 80% of consideration.",
  },
  {
    icon: Sparkles,
    title: 'Claim whitespace first',
    description: 'Find prompt clusters with no clear leader, move before the field crowds in.',
  },
]

const INTERNAL_LINKS = [
  {
    label: 'Visibility',
    href: '/solutions/visibility',
    description: 'Track brand mentions, citations, and AI visibility across every major engine.',
  },
  {
    label: 'Fix Playbook',
    href: '/solutions/fix-playbook',
    description: 'Turn the gaps Lens surfaces into a ranked, ship-ready action queue.',
  },
  {
    label: 'Competitors analysis tool',
    href: '/tools/competitors-analysis',
    description: 'Rank your AI citation share against up to 5 competitors, free to start.',
  },
  {
    label: 'AI Visibility Tracking',
    href: '/ai-visibility',
    description: 'Score how ChatGPT, Claude, Gemini, and Perplexity cite your brand.',
  },
  {
    label: 'Explorer',
    href: '/explorer',
    description: 'Surface emerging prompts, citations, and competitor gaps.',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    description: 'Pro and Max plans include full competitive benchmarking.',
  },
]

export const metadata: Metadata = buildMetadata({
  title: 'Competitive Lens | Benchmark AI Visibility vs. Competitors',
  description:
    'Benchmark your AI visibility against competitors. Compare citation share, mention share, and recommendation rate across ChatGPT, Claude, Gemini, and Perplexity. Spot gaps, claim whitespace, ship the right fixes.',
  path: PATH,
  keywords: [
    'AI Visibility Platform',
    'AI Brand Monitoring',
    'Generative Engine Optimization',
    'AI Search Visibility',
    'AI Citation Tracking',
    'competitive AI analysis',
    'share of voice AI',
    'GEO Optimization',
    'LLM SEO',
    'SignalorAI GEO',
    'SignalorAI',
    'SignalorAI',
  ],
})

export default function CompetitiveLensSolutionPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions/competitive-lens' },
    { name: 'Competitive Lens', path: PATH },
  ])

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(PATH)}#webpage`,
    url: absoluteUrl(PATH),
    name: `Competitive Lens | ${SITE_BRAND}`,
    description:
      'AI visibility competitive benchmarking, citation share, mention share, recommendation rate, content gaps, and authority gaps across ChatGPT, Claude, Gemini, and Perplexity.',
    isPartOf: { '@id': `${SITE_URL}#website` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/carousel1.png`,
    },
    inLanguage: 'en-US',
  }

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${SITE_BRAND} Competitive Lens`,
    description:
      'Competitive AI visibility benchmarking. Compare citation share, mention share, and recommendation rate against rivals across every major AI engine.',
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
    name: `${SITE_BRAND} Competitive Lens`,
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'SEO',
    url: absoluteUrl(PATH),
    description:
      'Competitive AI visibility benchmarking platform with citation share comparison, content and authority gap detection, and emerging competitor tracking.',
    publisher: { '@id': `${SITE_URL}#organization` },
    featureList: [
      'Share of voice',
      'Citation comparison',
      'Content gaps',
      'Authority gaps',
      'AI recommendation analysis',
      'Emerging competitors',
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
      <JsonLd id="ld-solutions-lens-org" data={organizationJsonLd()} />
      <JsonLd id="ld-solutions-lens-website" data={websiteJsonLd()} />
      <JsonLd id="ld-solutions-lens-breadcrumb" data={breadcrumbs} />
      <JsonLd id="ld-solutions-lens-webpage" data={webPage} />
      <JsonLd id="ld-solutions-lens-product" data={product} />
      <JsonLd id="ld-solutions-lens-software" data={softwareApp} />
      <JsonLd id="ld-solutions-lens-faq" data={faqJsonLd(FAQ_ITEMS)} />

      <SolutionsHero
        eyebrow="solutions · competitive lens"
        heading="Benchmark your AI visibility against"
        highlight="competitors"
        description="Understand where competitors outperform you across citations, mentions, authority signals, and AI recommendations, and exactly what to ship to close each gap."
        primaryCta={{ label: 'Start free benchmark', href: '/sign-up' }}
        secondaryCta={{ label: 'See sample report', href: '/tools/competitors-analysis' }}
      />

      <SolutionsSection
        id="lens-overview"
        eyebrow="competitive overview"
        heading="Every competitive signal,"
        highlight="side by side"
        description="Visibility, citation share, mentions, and recommendation rate, at a glance, per engine."
      >
        <LensOverviewPreview />
      </SolutionsSection>

      <SolutionsSection
        id="lens-features"
        eyebrow="competitive analysis"
        heading="Six views, built for"
        highlight="operators"
        bg="neutral"
      >
        <SolutionsFeatureGrid features={FEATURES} />
      </SolutionsSection>

      <SolutionsSection
        id="gap-detection"
        eyebrow="gap detection"
        heading="Opportunities your team usually"
        highlight="never sees"
      >
        <GapDetectionPreview />
      </SolutionsSection>

      <SolutionsSection
        id="lens-recommendations"
        eyebrow="strategic recommendations"
        heading="From insight to"
        highlight="ranked moves"
        description="Each gap becomes a ranked move with expected citation lift attached."
        bg="neutral"
      >
        <RecommendationsPreview />
        <div className="mt-10">
          <SolutionsInlineCTA
            heading="See your competitive AI visibility gap"
            description="Run a free competitive benchmark against up to five competitors, citation share, content gaps, and the ranked moves to close them."
            primaryCta={{ label: 'Start free benchmark', href: '/sign-up' }}
            secondaryCta={{ label: 'Try the free tool', href: '/tools/competitors-analysis' }}
          />
        </div>
      </SolutionsSection>

      <SolutionsSection
        id="growth-opportunities"
        eyebrow="growth opportunities"
        heading="Quick wins competitors"
        highlight="haven't shipped"
      >
        <GrowthOpportunitiesPreview />
      </SolutionsSection>

      <SolutionsSection
        id="lens-benefits"
        eyebrow="benefits"
        heading="What Lens"
        highlight="unlocks"
        bg="neutral"
      >
        <SolutionsBenefitsList benefits={BENEFITS} />
      </SolutionsSection>

      <SolutionsSection
        id="lens-related"
        eyebrow="explore the platform"
        heading="Where to go next"
        bg="neutral"
      >
        <SolutionsInternalLinks heading="Related solutions and tools" links={INTERNAL_LINKS} />
      </SolutionsSection>

      <LandingFaq
        sectionId="competitive-lens-faq"
        headingId="competitive-lens-faq-heading"
        heading="Competitive Lens FAQs"
        description="How competitive AI benchmarking works."
        items={FAQ_ITEMS}
      />

      <SolutionsBottomCTA
        eyebrow="start free"
        heading="See where you trail, and close it"
        description="Run a free benchmark: citation share, gaps, and ranked moves in under a minute."
        primaryCta={{ label: 'Start free benchmark', href: '/sign-up' }}
        secondaryCta={{ label: 'See pricing', href: '/pricing' }}
      />
    </MarketingShell>
  )
}

function LensOverviewPreview() {
  const rows = [
    { name: 'Your brand', share: 24, mentions: 87, recs: 12, you: true },
    { name: 'Competitor A', share: 38, mentions: 142, recs: 31, you: false },
    { name: 'Competitor B', share: 21, mentions: 74, recs: 9, you: false },
    { name: 'Competitor C', share: 11, mentions: 41, recs: 4, you: false },
    { name: 'Competitor D', share: 6, mentions: 19, recs: 2, you: false },
  ]
  return (
    <div className="overflow-hidden rounded-none border border-black/8 bg-white shadow-lg">
      <div className="bg-muted flex items-center justify-between border-b border-black/6 px-5 py-3">
        <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
          <Users className="text-primary-ink h-4 w-4" aria-hidden />
          Competitive benchmark
        </div>
        <div className="text-muted-foreground hidden items-center gap-3 text-[11px] sm:flex">
          <span>147 prompts · 6 engines</span>
          <span className="bg-muted h-1 w-1 rounded-full" />
          <span>Last 30 days</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground border-b border-black/6 text-[11px] font-semibold tracking-[0.16em] uppercase">
              <th className="px-5 py-3 text-left">Brand</th>
              <th className="px-5 py-3 text-left">Citation share</th>
              <th className="px-5 py-3 text-right">Mentions</th>
              <th className="px-5 py-3 text-right">Recommendations</th>
              <th className="px-5 py-3 text-right">Δ vs. you</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const delta = r.you ? null : r.share - rows[0].share
              return (
                <tr
                  key={r.name}
                  className={`border-b border-black/6 last:border-0 ${
                    r.you ? 'bg-primary/[0.04]' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                          r.you ? 'bg-primary-strong text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {r.name
                          .split(' ')
                          .map(s => s[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                      <span
                        className={`text-sm ${
                          r.you ? 'text-foreground font-semibold' : 'text-foreground font-medium'
                        }`}
                      >
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-muted h-1.5 w-32 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full ${r.you ? 'bg-primary' : 'bg-muted'}`}
                          style={{ width: `${r.share * 2}%` }}
                        />
                      </div>
                      <span className="text-foreground text-xs font-medium tabular-nums">
                        {r.share}%
                      </span>
                    </div>
                  </td>
                  <td className="text-foreground px-5 py-3.5 text-right text-[13px] font-medium tabular-nums">
                    {r.mentions}
                  </td>
                  <td className="text-foreground px-5 py-3.5 text-right text-[13px] font-medium tabular-nums">
                    {r.recs}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {delta === null ? (
                      <span className="text-primary-ink text-[11px] font-semibold tracking-wide uppercase">
                        You
                      </span>
                    ) : delta > 0 ? (
                      <span className="text-destructive inline-flex items-center gap-1 text-xs font-semibold tabular-nums">
                        <ArrowUpRight className="h-3 w-3" aria-hidden />+{delta}%
                      </span>
                    ) : (
                      <span className="text-success inline-flex items-center gap-1 text-xs font-semibold tabular-nums">
                        <ArrowDownRight className="h-3 w-3" aria-hidden />
                        {delta}%
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-muted border-t border-black/6 px-5 py-3">
        <p className="text-muted-foreground text-[11px] leading-relaxed font-medium">
          <Sparkles className="text-primary-ink mr-1 inline-block h-3 w-3" aria-hidden />
          Illustrative benchmark, your real Lens compares citation share, mentions, and
          recommendations across every competitor and engine you track.
        </p>
      </div>
    </div>
  )
}

function GapDetectionPreview() {
  const gaps = [
    {
      type: 'Content gap',
      tone: 'bg-destructive/10 text-destructive',
      title: 'Comparison content for "alternatives to [category leader]"',
      detail:
        'Competitor A ranks #1 on 14 "alternative to" prompts. You have no comparison content on the topic.',
      icon: Compass,
    },
    {
      type: 'Entity gap',
      tone: 'bg-warning/10 text-warning',
      title: 'Missing sameAs links to product entity',
      detail:
        "Competitor B has a fully linked entity graph. You're missing sameAs anchors to Crunchbase, G2, and Wikipedia.",
      icon: Link2,
    },
    {
      type: 'Authority gap',
      tone: 'bg-info/10 text-info',
      title: 'No EEAT signals on long-form blog',
      detail:
        'Authority signal lag is closing your gap with Competitor B on 9 informational prompts.',
      icon: Trophy,
    },
    {
      type: 'Whitespace',
      tone: 'bg-success/10 text-success',
      title: '"GEO for Shopify" prompts have no clear leader',
      detail:
        '11 prompts in this cluster show no consistent recommendation. First-mover advantage open for ~6 weeks.',
      icon: Sparkles,
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {gaps.map(g => {
        const I = g.icon
        return (
          <article key={g.title} className="rounded-none border border-black/8 bg-white p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${g.tone}`}
              >
                <I className="h-3 w-3" aria-hidden />
                {g.type}
              </span>
            </div>
            <h3 className="text-foreground mt-4 text-base font-semibold tracking-tight">
              {g.title}
            </h3>
            <p className="text-accent-foreground mt-2 text-sm leading-relaxed font-light">
              {g.detail}
            </p>
            <Link
              href="/sign-up"
              className="text-primary-ink mt-4 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              See the fix path <ArrowRight className="h-3 w-3" />
            </Link>
          </article>
        )
      })}
    </div>
  )
}

function RecommendationsPreview() {
  const moves = [
    {
      vs: 'vs. Competitor A',
      impact: '+11% citation share',
      title: 'Publish "alternatives to [leader]" comparison hub',
      detail:
        'Ship 8 comparison pages with answer-shaped sections + Product schema. Targets the 14 prompts where Competitor A currently leads.',
    },
    {
      vs: 'vs. Competitor B',
      impact: '+6% citation share',
      title: 'Complete entity graph with sameAs and Organization JSON-LD',
      detail:
        'Add sameAs anchors to Crunchbase, G2, Wikipedia, and LinkedIn. One-click apply via the Shopify or WordPress integration.',
    },
    {
      vs: 'vs. category',
      impact: '+8% mention share',
      title: 'Claim the "GEO for Shopify" whitespace cluster',
      detail:
        '11 prompts with no dominant source. Publish a topical authority hub now; the first-mover window is open for ~6 weeks.',
    },
  ]
  return (
    <div className="overflow-hidden rounded-none border border-black/8 bg-white">
      <div className="bg-muted flex items-center justify-between border-b border-black/6 px-5 py-3">
        <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
          <LineChart className="text-primary-ink h-4 w-4" aria-hidden />
          Ranked strategic moves
        </div>
        <span className="text-muted-foreground hidden text-[11px] sm:inline">
          Scored by expected lift
        </span>
      </div>
      <ul className="divide-y divide-black/6">
        {moves.map(m => (
          <li key={m.title} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-muted text-muted-foreground rounded-none px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                  {m.vs}
                </span>
                <span className="text-success text-[11px] font-semibold">{m.impact}</span>
              </div>
              <p className="text-foreground mt-2 text-sm font-semibold">{m.title}</p>
              <p className="text-accent-foreground mt-1.5 text-xs leading-relaxed font-light">
                {m.detail}
              </p>
            </div>
            <div className="flex items-center justify-end">
              <Link
                href="/sign-up"
                className="bg-primary-strong hover:bg-primary-strong/90 inline-flex h-8 items-center gap-1 rounded-md px-3 text-[11px] font-semibold text-white transition"
              >
                Plan this move <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GrowthOpportunitiesPreview() {
  const wins = [
    {
      icon: Sparkles,
      title: 'Claim 1 whitespace cluster',
      effort: '8 pages · 1 sprint',
      lift: '+8% share of voice',
    },
    {
      icon: Trophy,
      title: 'Close 1 authority gap',
      effort: 'Schema + EEAT · 1 week',
      lift: '+5% citation rate',
    },
    {
      icon: TrendingDown,
      title: 'Reverse 1 share decline',
      effort: 'Refresh 6 stale posts',
      lift: 'Stabilize trajectory',
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {wins.map(w => {
        const I = w.icon
        return (
          <article
            key={w.title}
            className="rounded-none border border-black/8 bg-white p-6 shadow-lg"
          >
            <div className="bg-primary/10 text-primary-ink inline-flex h-9 w-9 items-center justify-center rounded-md">
              <I className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="text-foreground mt-5 text-base font-semibold tracking-tight">
              {w.title}
            </h3>
            <p className="text-muted-foreground mt-1.5 text-xs font-medium">{w.effort}</p>
            <p className="bg-success/10 text-success mt-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold">
              <TrendingUp className="h-3 w-3" aria-hidden />
              {w.lift}
            </p>
          </article>
        )
      })}
    </div>
  )
}
