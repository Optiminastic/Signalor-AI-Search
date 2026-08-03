import Link from 'next/link'

import { Gauge, Link2, ListChecks, TrendingUp } from '@/features/site/components/icons'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { cn } from '@/features/site/lib/utils'

const ABOUT_VALUE_CELLS = [
  {
    icon: Gauge,
    title: 'Score what AI sees',
    description:
      'One 0-100 GEO score backed by six pillars: content, schema, E-E-A-T, technical, entity, and AI visibility.',
  },
  {
    icon: Link2,
    title: 'Track every citation',
    description:
      'Brand mentions and citations across ChatGPT, Claude, Gemini, Perplexity, Copilot, and Google AI Overviews.',
  },
  {
    icon: ListChecks,
    title: 'Ship ranked fixes',
    description:
      'Every audit ends in a prioritized fix queue - with Shopify and WordPress connectors that apply many changes for you.',
  },
  {
    icon: TrendingUp,
    title: 'Measure the return',
    description:
      'Connect analytics to watch AI referral traffic move as your visibility improves, week over week.',
  },
] as const

function AboutValueCells(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridCornerHandles top />
      <GridHandle className="-top-[3.5px] left-1/4 -ml-[3.5px] hidden lg:block" />
      <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden sm:block" />
      <GridHandle className="-top-[3.5px] left-3/4 -ml-[3.5px] hidden lg:block" />
      <div className="divide-border grid max-sm:divide-y sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
        {ABOUT_VALUE_CELLS.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className={cn(
              'bg-card flex flex-col px-6 py-8 sm:px-8',
              index % 2 === 1 && 'sm:max-lg:border-border sm:max-lg:border-l',
              index >= 2 && 'sm:max-lg:border-border sm:max-lg:border-t',
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="text-primary h-4.5 w-4.5" strokeWidth={2} aria-hidden />
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

export function AboutHero(): JSX.Element {
  return (
    <section className="border-border border-y" aria-labelledby="about-hero-heading">
      <div className="border-border relative mx-auto max-w-6xl border-x">
        <div className="relative px-6 py-20 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_30%,rgba(224,74,61,0.05),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
              About SignalorAI
            </p>
            <h1
              id="about-hero-heading"
              className="text-foreground mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              We help brands become the ones{' '}
              <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
                AI engines recommend
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              Buyers increasingly ask ChatGPT, Gemini, and Perplexity before they search. SignalorAI
              exists so those answers describe your brand accurately - and cite it.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className={`${LANDING_PRIMARY_CTA_CLASS} w-full sm:w-auto`}>
                Get started
              </Link>
              <Link
                href="/contact-sales"
                className="bg-card text-foreground ring-border hover:bg-muted/60 inline-flex h-9 w-full items-center justify-center rounded-md px-5 text-sm font-semibold shadow-sm ring-1 shadow-black/5 transition-all sm:w-auto"
              >
                Talk to the team
              </Link>
            </div>
          </div>
        </div>
        <AboutValueCells />
      </div>
    </section>
  )
}
