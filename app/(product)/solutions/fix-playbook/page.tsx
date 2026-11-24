import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Binary,
  Bot,
  CircleAlert,
  Eye,
  FileCheck2,
  Gauge,
  Layers,
  Link2,
  ListChecks,
  Radar,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  Zap,
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

const PATH = '/solutions/fix-playbook'

const FAQ_ITEMS = [
  {
    question: 'What is a GEO Fix Playbook?',
    answer:
      'The prioritized, ship-ready set of actions SignalorAI generates after auditing your site against how generative AI engines decide what to cite, each scored by expected visibility lift and effort.',
  },
  {
    question: 'How does SignalorAI decide which fixes have the most impact?',
    answer:
      'Every recommendation is scored against expected citation lift, signal strength on the engines you track, and your current baseline. Quick wins on top, compounding investments below, never random.',
  },
  {
    question: 'What AI visibility issues does SignalorAI detect?',
    answer:
      'Missing entities, weak citations, content structure issues, missing or broken schema, low authority signals, llms.txt and robots.txt issues, and EEAT gaps, across six GEO pillars.',
  },
  {
    question: 'Does the Fix Playbook integrate with Shopify and WordPress?',
    answer:
      'Yes. Schema and content fixes apply with one click from the recommendation card. Manual recommendations include the exact markup, copy, or code to ship.',
  },
  {
    question: 'Can I assign recommendations to teammates?',
    answer:
      'Yes. Shared workspaces let you assign owners, track in-progress and shipped, and watch the verify step prove each fix landed.',
  },
  {
    question: 'How fast do shipped fixes register?',
    answer:
      "Schema and technical fixes register inside 24-72 hours. Content, EEAT, and authority compound over two to six weeks. Every recommendation tells you which bucket it's in.",
  },
  {
    question: 'Does SignalorAI auto-fix or only recommend?',
    answer:
      "Both. Safe fixes (Organization schema, FAQ markup, llms.txt, AI meta tags) auto-apply on Shopify and WordPress. Editorial work stays in your team's hands with full context.",
  },
  {
    question: 'How are recommendations prioritized for B2B SaaS vs Shopify brands?',
    answer:
      'Same scoring engine, different weights. Shopify surfaces Product and Review schema first; B2B SaaS surfaces EEAT and comparison content. Prioritization reflects what each category actually rewards.',
  },
  {
    question: "What's the difference between a recommendation and an action?",
    answer:
      'A recommendation describes the gap. An action is the explicit next step. Every recommendation resolves into at least one action so nothing stays abstract.',
  },
  {
    question: 'Can I export the playbook as a PDF?',
    answer:
      'Yes. Every audit produces a branded PDF with the prioritized playbook, expected impact, and a diff from the previous run.',
  },
  {
    question: 'How does the verify step work?',
    answer:
      "After you mark a recommendation as shipped, SignalorAI re-checks the affected page or signal and tracks citation impact through the next audit cycle. If a fix didn't land, verify flags it.",
  },
  {
    question: 'Is the Fix Playbook free?',
    answer:
      'A baseline playbook is free for any public URL. Saved workspaces, scheduled re-audits, and one-click apply unlock on paid plans.',
  },
]

const PROBLEM_ITEMS = [
  {
    icon: AlertTriangle,
    title: 'Missing entities',
    body: "No Organization schema or sameAs, your brand can't disambiguate.",
  },
  {
    icon: CircleAlert,
    title: 'Weak citation signals',
    body: "Content that's hard for an LLM to extract and re-use in an answer.",
  },
  {
    icon: Layers,
    title: 'Poor content structure',
    body: 'Long paragraphs, ambiguous headings, missing FAQ blocks.',
  },
  {
    icon: Binary,
    title: 'Missing schema',
    body: 'Product, Article, FAQ, Review, each one a free citation-lift win.',
  },
  {
    icon: Shield,
    title: 'Low authority signals',
    body: 'No bylines, no expertise pages, no validated sources.',
  },
  {
    icon: Eye,
    title: 'Unreadable to AI',
    body: 'JS-only render, blocked crawlers, broken llms.txt, invisible to the engines.',
  },
]

const PLAYBOOK_CATEGORIES: SolutionsFeature[] = [
  {
    icon: Zap,
    title: 'Technical SEO',
    description: 'Crawl health, llms.txt, robots directives, render performance.',
  },
  {
    icon: Radar,
    title: 'GEO optimization',
    description: 'Answer-shaped content, entity disambiguation, source-quality signals.',
  },
  {
    icon: Binary,
    title: 'Schema fixes',
    description: 'Organization, Product, FAQ, Article, Review, auto-applied where supported.',
  },
  {
    icon: FileCheck2,
    title: 'Content enhancements',
    description: 'FAQ expansions, comparison blocks, entity-rich rewrites.',
  },
  {
    icon: Shield,
    title: 'Authority signals',
    description: 'Bylines, expertise pages, the EEAT scaffolding that earns citations.',
  },
  {
    icon: Link2,
    title: 'Citation improvements',
    description: 'Citation-ready pages: clean URLs, extractable answers, topical linking.',
  },
]

const WORKFLOW: SolutionsStep[] = [
  {
    n: '1',
    title: 'Scan',
    body: 'Crawl the site, run tracked prompts.',
    icon: Radar,
  },
  {
    n: '2',
    title: 'Detect',
    body: 'Classify gaps across the six GEO pillars.',
    icon: AlertTriangle,
  },
  {
    n: '3',
    title: 'Prioritize',
    body: 'Score each fix by expected lift and effort.',
    icon: ListChecks,
  },
  {
    n: '4',
    title: 'Ship and verify',
    body: 'Apply, re-measure, prove each fix landed.',
    icon: Wrench,
  },
]

const BENEFITS: SolutionsBenefit[] = [
  {
    icon: TrendingUp,
    title: 'Faster lift, every ship',
    description: 'Highest-leverage fix on top, quick wins compound first.',
  },
  {
    icon: Rocket,
    title: 'A queue your team can actually ship',
    description: 'Pre-scoped, pre-prioritized recommendations, not backlog noise.',
  },
  {
    icon: Gauge,
    title: 'Measurable, not vibes',
    description: 'Every fix tracked back to its citation-share and visibility delta.',
  },
  {
    icon: Target,
    title: 'Fewer wasted cycles',
    description: 'Stop shipping plausible-but-low-impact ideas. Score before you scope.',
  },
]

const INTERNAL_LINKS = [
  {
    label: 'Visibility',
    href: '/solutions/visibility',
    description: 'Track brand mentions, citations, and AI visibility across every major engine.',
  },
  {
    label: 'Competitive Lens',
    href: '/solutions/competitive-lens',
    description: 'Benchmark your citation share against rivals and surface ranked gaps.',
  },
  {
    label: 'Recommendations',
    href: '/recommendations',
    description: 'Prioritized GEO fixes generated for your site each week.',
  },
  {
    label: 'Schema validator',
    href: '/tools/schema-validator',
    description: 'Check JSON-LD coverage across Organization, Product, FAQ, and more.',
  },
  {
    label: 'Integrations',
    href: '/integration',
    description: 'One-click fixes on Shopify and WordPress, schema, llms.txt, AI meta tags.',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    description: 'Plans built for teams shipping serious GEO programs.',
  },
]

export const metadata: Metadata = buildMetadata({
  title: 'Fix Playbook | Prioritized GEO & AI Visibility Recommendations',
  description:
    "Turn AI visibility issues into prioritized, ship-ready actions. SignalorAI's Fix Playbook ranks every GEO recommendation by impact, effort, and citation lift across ChatGPT, Claude, Gemini, and Perplexity.",
  path: PATH,
  keywords: [
    'GEO Optimization',
    'Generative Engine Optimization',
    'AI Search Optimization',
    'LLM SEO',
    'AI citation improvements',
    'schema fixes',
    'AI visibility fixes',
    'AI Visibility Platform',
    'GEO Playbook',
    'SignalorAI GEO',
    'SignalorAI',
    'SignalorAI',
  ],
})

export default function FixPlaybookSolutionPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions/fix-playbook' },
    { name: 'Fix Playbook', path: PATH },
  ])

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(PATH)}#webpage`,
    url: absoluteUrl(PATH),
    name: `Fix Playbook | ${SITE_BRAND}`,
    description:
      'Prioritized GEO recommendations and AI visibility fixes scored by expected citation lift across ChatGPT, Claude, Gemini, and Perplexity.',
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
    name: `${SITE_BRAND} Fix Playbook`,
    description:
      'AI-powered GEO recommendation engine: prioritized fixes for schema, content, EEAT, technical SEO, entity recognition, and citation improvements.',
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
    name: `${SITE_BRAND} Fix Playbook`,
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'SEO',
    url: absoluteUrl(PATH),
    description:
      'AI visibility fix engine. Prioritized recommendations across six GEO pillars with one-click apply on Shopify and WordPress.',
    publisher: { '@id': `${SITE_URL}#organization` },
    featureList: [
      'Technical SEO',
      'GEO optimization',
      'Schema fixes',
      'Content enhancements',
      'Authority signals',
      'Citation improvements',
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
      <JsonLd id="ld-solutions-fix-org" data={organizationJsonLd()} />
      <JsonLd id="ld-solutions-fix-website" data={websiteJsonLd()} />
      <JsonLd id="ld-solutions-fix-breadcrumb" data={breadcrumbs} />
      <JsonLd id="ld-solutions-fix-webpage" data={webPage} />
      <JsonLd id="ld-solutions-fix-product" data={product} />
      <JsonLd id="ld-solutions-fix-software" data={softwareApp} />
      <JsonLd id="ld-solutions-fix-faq" data={faqJsonLd(FAQ_ITEMS)} />

      <SolutionsHero
        eyebrow="solutions · fix playbook"
        heading="Fix what AI search engines"
        highlight="can't understand"
        description="Receive prioritized recommendations that improve discoverability, citations, entity recognition, and AI search visibility, scored by impact, ready to ship, and verified once you do."
        primaryCta={{ label: 'Generate my playbook', href: '/sign-up' }}
        secondaryCta={{ label: 'Run free audit', href: '/tools/url-analyzer' }}
      />

      <SolutionsSection
        id="problem-detection"
        eyebrow="problem detection"
        heading="The gaps SignalorAI finds in"
        highlight="every audit"
      >
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-none border border-black/8 bg-black/8 md:grid-cols-2 lg:grid-cols-3">
          {PROBLEM_ITEMS.map(p => {
            const I = p.icon
            return (
              <article key={p.title} className="flex flex-col gap-4 bg-white p-6 lg:p-7">
                <div className="bg-destructive/10 text-destructive inline-flex h-9 w-9 items-center justify-center rounded-md">
                  <I className="h-4 w-4" aria-hidden />
                </div>
                <h3 className="text-foreground text-base font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="text-accent-foreground text-sm leading-relaxed font-light">
                  {p.body}
                </p>
              </article>
            )
          })}
        </div>
      </SolutionsSection>

      <SolutionsSection
        id="ai-recommendations"
        eyebrow="ai-powered recommendations"
        heading="Every fix ranked, scored,"
        highlight="ready to ship"
        description="Each card carries severity, expected lift, effort estimate, and the next action."
        bg="neutral"
      >
        <RecommendationPreview />
      </SolutionsSection>

      <SolutionsSection
        id="playbook-categories"
        eyebrow="playbook categories"
        heading="Six categories. One"
        highlight="ranked queue."
      >
        <SolutionsFeatureGrid features={PLAYBOOK_CATEGORIES} />
      </SolutionsSection>

      <SolutionsSection
        id="workflow"
        eyebrow="workflow"
        heading="A closed loop, not a static report"
        bg="neutral"
      >
        <SolutionsSteps steps={WORKFLOW} />
      </SolutionsSection>

      <SolutionsSection
        id="results"
        eyebrow="results"
        heading="What gets shipped, and what it"
        highlight="moves"
      >
        <ResultsPreview />
        <div className="mt-10">
          <SolutionsInlineCTA
            heading="Get your prioritized Fix Playbook"
            description="Paste any URL and we'll generate a ranked queue of fixes scored by expected AI visibility impact, free to start, no signup required."
            primaryCta={{ label: 'Generate playbook', href: '/sign-up' }}
            secondaryCta={{ label: 'See pricing', href: '/pricing' }}
          />
        </div>
      </SolutionsSection>

      <SolutionsSection
        id="benefits"
        eyebrow="benefits"
        heading="Why teams ship the"
        highlight="Fix Playbook"
        bg="neutral"
      >
        <SolutionsBenefitsList benefits={BENEFITS} />
      </SolutionsSection>

      <SolutionsSection
        id="related"
        eyebrow="explore the platform"
        heading="Where to go next"
        bg="neutral"
      >
        <SolutionsInternalLinks heading="Related solutions and tools" links={INTERNAL_LINKS} />
      </SolutionsSection>

      <LandingFaq
        sectionId="fix-playbook-faq"
        headingId="fix-playbook-faq-heading"
        heading="Fix Playbook FAQs"
        description="Prioritization, integrations, and how teams ship it."
        items={FAQ_ITEMS}
      />

      <SolutionsBottomCTA
        eyebrow="start free"
        heading="Stop guessing. Ship the right fix."
        description="Get your prioritized playbook in under a minute, impact, effort, and next action on every card."
        primaryCta={{ label: 'Generate my playbook', href: '/sign-up' }}
        secondaryCta={{ label: 'See pricing', href: '/pricing' }}
      />
    </MarketingShell>
  )
}

function RecommendationPreview() {
  const recs = [
    {
      severity: 'Critical',
      sevTone: 'bg-destructive/10 text-destructive',
      impact: '+9 visibility',
      title: 'Organization JSON-LD missing on homepage',
      where: '/',
      effort: '5 min · auto-apply',
      action: 'Apply Organization schema with sameAs, logo, contactPoint via Shopify app.',
    },
    {
      severity: 'High',
      sevTone: 'bg-warning/10 text-warning',
      impact: '+6 visibility',
      title: 'Product schema missing on 47 product pages',
      where: '/products/*',
      effort: '1 click · auto-apply',
      action: 'Push Product schema template to all matching templates; verify on next audit.',
    },
    {
      severity: 'High',
      sevTone: 'bg-warning/10 text-warning',
      impact: '+5 visibility',
      title: 'FAQ block on comparison pages',
      where: '/compare/*',
      effort: '30 min · manual',
      action: 'Add 6-8 answer-shaped Q&As per page. FAQ template provided.',
    },
    {
      severity: 'Medium',
      sevTone: 'bg-info/10 text-info',
      impact: '+3 visibility',
      title: 'llms.txt missing',
      where: '/.well-known/',
      effort: '2 min · auto-apply',
      action: 'Publish llms.txt declaring sitemap and AI-bot policy.',
    },
    {
      severity: 'Medium',
      sevTone: 'bg-info/10 text-info',
      impact: '+2 visibility',
      title: 'Author bylines missing on long-form blog',
      where: '/blog/*',
      effort: '1-2h · manual',
      action: 'Add author markup + expertise page links to top 12 posts.',
    },
  ]
  return (
    <div className="overflow-hidden rounded-none border border-black/8 bg-white shadow-lg">
      <div className="bg-muted flex items-center justify-between border-b border-black/6 px-5 py-3">
        <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
          <ListChecks className="text-primary-ink h-4 w-4" aria-hidden />
          Prioritized fix queue
        </div>
        <div className="text-muted-foreground hidden items-center gap-3 text-[11px] sm:flex">
          <span>Ranked by expected lift</span>
          <span className="bg-muted h-1 w-1 rounded-full" />
          <span>5 of 28 shown</span>
        </div>
      </div>
      <ul className="divide-y divide-black/6">
        {recs.map(r => (
          <li
            key={r.title}
            className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded-none px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${r.sevTone}`}
              >
                {r.severity}
              </span>
              <span className="text-success text-[11px] font-semibold">{r.impact}</span>
            </div>
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-semibold">{r.title}</p>
              <p className="text-muted-foreground mt-1 text-xs font-medium">
                <span className="font-mono">{r.where}</span>
                <span className="text-muted-foreground mx-1.5">·</span>
                <span>{r.effort}</span>
              </p>
              <p className="text-accent-foreground mt-1.5 text-xs leading-relaxed font-light">
                <ArrowRight
                  className="text-primary-ink mr-1 -mb-0.5 inline-block h-3 w-3"
                  aria-hidden
                />
                {r.action}
              </p>
            </div>
            <div className="flex items-end justify-end sm:items-center">
              <Link
                href="/sign-up"
                className="bg-primary-strong hover:bg-primary-strong/90 inline-flex h-8 items-center gap-1 rounded-md px-3 text-[11px] font-semibold text-white transition"
              >
                Ship fix <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-muted border-t border-black/6 px-5 py-3">
        <p className="text-muted-foreground text-[11px] leading-relaxed font-medium">
          <Sparkles className="text-primary-ink mr-1 inline-block h-3 w-3" aria-hidden />{' '}
          Illustrative queue, your real playbook ranks every fix by expected lift and effort, then
          verifies each one after ship.
        </p>
      </div>
    </div>
  )
}

function ResultsPreview() {
  const metrics = [
    { label: 'AI visibility growth', before: '61', after: '78', icon: TrendingUp, tone: 'emerald' },
    { label: 'Citation improvements', before: '112', after: '382', icon: Link2, tone: 'emerald' },
    { label: 'Mention growth', before: '48', after: '127', icon: BarChart3, tone: 'emerald' },
    {
      label: 'Coverage increase',
      before: '4 engines',
      after: '6 engines',
      icon: Bot,
      tone: 'primary',
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(m => {
        const I = m.icon
        const toneClass = m.tone === 'emerald' ? 'text-success' : 'text-primary-ink'
        return (
          <article key={m.label} className="rounded-none border border-black/8 bg-white p-5 lg:p-6">
            <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
              <I className="h-3.5 w-3.5" aria-hidden />
              {m.label}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                  Before
                </p>
                <p className="text-muted-foreground mt-0.5 text-xl font-bold tabular-nums">
                  {m.before}
                </p>
              </div>
              <ArrowRight className="text-muted-foreground mb-1 h-4 w-4" aria-hidden />
              <div className="text-right">
                <p className="text-primary-ink text-[10px] font-semibold tracking-wide uppercase">
                  After 30d
                </p>
                <p className={`mt-0.5 text-2xl font-bold tabular-nums ${toneClass}`}>{m.after}</p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
