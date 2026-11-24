import Link from 'next/link'

import { ArrowRight, Gauge, Link2, ListChecks, TrendingUp } from '@/features/site/components/icons'
import {
  FloatingEngineChips,
  type EngineChip,
} from '@/features/site/components/landing/floating-engine-chips'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { cn } from '@/features/site/lib/utils'

// Floating mock engine-mention chips — how each AI surface treats the brand.
const ENGINE_CHIPS: EngineChip[] = [
  {
    engine: 'ChatGPT',
    logo: '/logos/chatgpt.svg',
    cited: true,
    left: '8%',
    top: '20%',
    delay: '0s',
    duration: '5s',
  },
  {
    engine: 'Perplexity',
    logo: '/logos/perplexity.svg',
    cited: true,
    left: '10%',
    top: '62%',
    delay: '1.2s',
    duration: '5.5s',
  },
  {
    engine: 'Gemini',
    logo: '/logos/gemini.svg',
    cited: false,
    left: '80%',
    top: '22%',
    delay: '0.6s',
    duration: '4.8s',
  },
  {
    engine: 'Claude',
    logo: '/logos/claude.svg',
    cited: true,
    left: '79%',
    top: '64%',
    delay: '1.7s',
    duration: '5.8s',
  },
]

const FLOATING_SLOTS = [
  { left: '22%', top: '42%' },
  { left: '74%', top: '44%' },
] as const

const BRAND_VALUE_CELLS = [
  {
    icon: Link2,
    title: 'Know your AI reputation',
    description:
      'Track brand mentions, sentiment, and citations across the major AI engines so you know exactly where you stand.',
  },
  {
    icon: Gauge,
    title: 'One score, six pillars',
    description:
      'A single GEO score backed by content, schema, E-E-A-T, technical, entity, and AI-visibility checks you can act on.',
  },
  {
    icon: ListChecks,
    title: 'Fixes, not just findings',
    description:
      'Every audit ends in a ranked list of changes - and connectors that can apply many of them for you.',
  },
  {
    icon: TrendingUp,
    title: 'Measure the impact',
    description:
      'Connect analytics to watch AI referral traffic move as your visibility improves over time.',
  },
] as const

function BrandAuditForm(): JSX.Element {
  return (
    <div className="mx-auto mt-8 w-full max-w-md">
      <form action="/tools/url-analyzer" method="GET" className="flex gap-2">
        <label htmlFor="brand-audit-url" className="sr-only">
          Website URL
        </label>
        <input
          id="brand-audit-url"
          type="text"
          name="url"
          required
          inputMode="url"
          autoComplete="url"
          placeholder="yourbrand.com"
          className="bg-card text-foreground ring-border placeholder:text-muted-foreground/70 focus:ring-primary/50 h-9 min-w-0 flex-1 rounded-md px-3 text-sm shadow-sm ring-1 shadow-black/5 focus:ring-2 focus:outline-none"
        />
        <button type="submit" className={`${LANDING_PRIMARY_CTA_CLASS} h-9 shrink-0`}>
          Get free GEO score
        </button>
      </form>
      <p className="text-muted-foreground/80 mt-3 text-[13px] font-medium">
        Free score in ~60 seconds · No sign-up needed ·{' '}
        <Link
          href="/sign-up"
          className="text-foreground/70 decoration-border hover:text-foreground inline-flex items-center gap-0.5 underline underline-offset-2 transition-colors"
        >
          or start a free account
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </p>
    </div>
  )
}

function BrandValueCells(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridCornerHandles top />
      <GridHandle className="-top-[3.5px] left-1/4 -ml-[3.5px] hidden lg:block" />
      <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden sm:block" />
      <GridHandle className="-top-[3.5px] left-3/4 -ml-[3.5px] hidden lg:block" />
      <div className="divide-border grid max-sm:divide-y sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
        {BRAND_VALUE_CELLS.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className={cn(
              'bg-card flex flex-col px-6 py-8 sm:px-8',
              index % 2 === 1 && 'sm:max-lg:border-border sm:max-lg:border-l',
              index >= 2 && 'sm:max-lg:border-border sm:max-lg:border-t',
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="text-primary-ink h-4.5 w-4.5" strokeWidth={2} aria-hidden />
              <span className="text-foreground text-[15px] font-semibold tracking-tight">
                {title}
              </span>
            </span>
            <span className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
              {description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ForBrandsHero(): JSX.Element {
  return (
    <section className="border-border border-y" aria-labelledby="for-brands-hero-heading">
      <div className="border-border relative mx-auto max-w-6xl border-x">
        <div className="relative px-6 py-20 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_30%,rgba(224,74,61,0.05),transparent_70%)]"
          />
          <FloatingEngineChips chips={ENGINE_CHIPS} slots={FLOATING_SLOTS} />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
              For brands
            </p>
            <h1
              id="for-brands-hero-heading"
              className="text-foreground mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Learn how AI talks about{' '}
              <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
                your brand
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              See how ChatGPT, Gemini, and Perplexity describe and cite you today - then close the
              gaps with a clear, prioritized plan.
            </p>
            <BrandAuditForm />
          </div>
        </div>
        <BrandValueCells />
      </div>
    </section>
  )
}
