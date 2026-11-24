import Link from 'next/link'

import { ArrowRight } from '@/features/site/components/icons'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import {
  FOR_AGENCIES_HERO,
  FOR_AGENCIES_HUB_CARDS,
} from '@/features/site/lib/landing-for-agencies-content'
import { cn } from '@/features/site/lib/utils'

type ClientChip = {
  domain: string
  score: number
  delta?: string
  logo?: string
  left: string
  top: string
  delay: string
  duration: string
}

// Floating mock client-score chips — one per imaginary roster brand.
const CLIENT_CHIPS: ClientChip[] = [
  {
    domain: 'amazon.com',
    score: 92,
    delta: '+3',
    left: '6%',
    top: '22%',
    delay: '0s',
    duration: '5s',
  },
  {
    domain: 'nike.com',
    score: 88,
    delta: '+5',
    left: '12%',
    top: '72%',
    delay: '1.1s',
    duration: '5.6s',
  },
  { domain: 'target.com', score: 81, left: '72%', top: '20%', delay: '0.5s', duration: '4.8s' },
  {
    domain: 'walmart.com',
    score: 84,
    delta: '+4',
    left: '76%',
    top: '64%',
    delay: '1.6s',
    duration: '5.4s',
  },
]

const FLOATING_SLOTS = [
  { left: '22%', top: '44%' },
  { left: '72%', top: '44%' },
] as const

function ScoreTicks({ score }: { score: number }): JSX.Element {
  const ticks = 10
  const filled = Math.round((score / 100) * ticks)
  return (
    <span className="flex items-center gap-[2px]" role="presentation">
      {Array.from({ length: ticks }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-3.5 w-[3px] rounded-[1px]',
            i < filled ? 'bg-primary' : 'bg-neutral-200',
          )}
        />
      ))}
    </span>
  )
}

function FloatingClientChips(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {CLIENT_CHIPS.map(chip => (
        <span key={chip.domain} className="absolute" style={{ left: chip.left, top: chip.top }}>
          <span
            className="bg-card ring-border motion-safe:animate-float flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-md ring-1 shadow-black/5"
            style={{ animationDelay: chip.delay, animationDuration: chip.duration }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${chip.domain}&sz=64`}
              alt={chip.domain}
              className="h-4 w-4 rounded-full object-contain"
            />
            <span className="text-muted-foreground font-mono text-[11px]">{chip.domain}</span>
            <ScoreTicks score={chip.score} />
            <span className="text-foreground text-xs font-semibold tabular-nums">{chip.score}</span>
            {chip.delta ? (
              <span className="bg-success/10 text-success rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                {chip.delta}
              </span>
            ) : null}
          </span>
        </span>
      ))}
      {FLOATING_SLOTS.map(slot => (
        <span
          key={`${slot.left}-${slot.top}`}
          className="bg-muted ring-border/60 absolute h-6 w-6 rounded-lg ring-1"
          style={{ left: slot.left, top: slot.top }}
        />
      ))}
    </div>
  )
}

function AgencyValueCards(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridCornerHandles top />
      <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden sm:block" />
      <div className="divide-border grid max-sm:divide-y sm:grid-cols-2 sm:divide-x">
        {FOR_AGENCIES_HUB_CARDS.map(({ slug, title, description, Icon }) => (
          <div key={slug} className="bg-card flex flex-col px-6 py-10 sm:px-10">
            <span className="flex items-center gap-2.5">
              <Icon className="text-primary-ink h-4.5 w-4.5" strokeWidth={2} aria-hidden />
              <span className="text-foreground text-[15px] font-semibold tracking-tight">
                {title}
              </span>
            </span>
            <span className="text-muted-foreground mt-2 max-w-md text-[13px] leading-relaxed">
              {description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ForAgenciesHero(): JSX.Element {
  return (
    <section className="border-border border-y" aria-labelledby="for-agencies-hero-heading">
      <div className="border-border relative mx-auto max-w-6xl border-x">
        <div className="relative px-6 py-20 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_30%,rgba(224,74,61,0.05),transparent_70%)]"
          />
          <FloatingClientChips />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-primary-ink text-[12px] font-semibold tracking-[0.18em] uppercase">
              For agencies
            </p>
            <h1
              id="for-agencies-hero-heading"
              className="text-foreground mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              AI search visibility for{' '}
              <span className="decoration-primary/60 underline decoration-dashed decoration-2 underline-offset-4">
                every client
              </span>{' '}
              you manage
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              Each brand is its own project with separate scores, prompts, and runs - so one
              strategist can deliver GEO for twenty clients from one login.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className={`${LANDING_PRIMARY_CTA_CLASS} w-full sm:w-auto`}>
                {FOR_AGENCIES_HERO.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="bg-card text-foreground ring-border hover:bg-muted/60 inline-flex h-9 w-full items-center justify-center rounded-md px-5 text-sm font-semibold shadow-sm ring-1 shadow-black/5 transition-all sm:w-auto"
              >
                {FOR_AGENCIES_HERO.secondaryCta}
              </Link>
            </div>
            <p className="text-muted-foreground/80 mt-5 text-[13px] font-medium">
              {FOR_AGENCIES_HERO.footnote}
            </p>
          </div>
        </div>
        <AgencyValueCards />
      </div>
    </section>
  )
}
