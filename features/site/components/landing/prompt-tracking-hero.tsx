import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '@/features/site/components/icons'

import { Button } from '@/features/site/components/ui/button'
import { cn } from '@/features/site/lib/utils'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import {
  PROMPT_TRACKING_HERO,
  PROMPT_TRACKING_HUB_CARDS,
} from '@/features/site/lib/landing-prompt-tracking-content'
import type { LucideIcon } from '@/features/site/components/icons'

type HeroContent = {
  titleLine1: string
  /** @deprecated Legacy "AI" badge text — no longer rendered now that the hero uses a leading icon. */
  titleBadge?: string
  /** Page-relevant glyph shown alongside the headline as a bare accent icon (no box). */
  titleIcon?: LucideIcon
  titleLine2: string
  titleAccent: string
  subhead: string
  primaryCta: string
  secondaryCta: string
  footnote: string
}
type HubCard = {
  slug: string
  href: string
  title: string
  description: string
  Icon: LucideIcon
  /** Optional real brand logo (image path). When set, shown instead of `Icon`. */
  logo?: string
  cta: string
}

export function PromptTrackingHero({
  hero = PROMPT_TRACKING_HERO,
  cards = PROMPT_TRACKING_HUB_CARDS,
}: {
  hero?: HeroContent
  cards?: readonly HubCard[]
}) {
  const h = hero
  const TitleIcon = h.titleIcon
  return (
    <section className="bg-background relative px-6 pt-16 pb-16 lg:px-12 lg:pt-20 lg:pb-24">
      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-center lg:gap-8 xl:gap-12">
        <div className="relative z-10 max-w-xl min-w-0 text-left lg:max-w-none">
          <h1 className="text-foreground text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            <span className="block">
              {h.titleLine1}{' '}
              {TitleIcon ? (
                <>
                  <TitleIcon
                    className="text-primary-ink inline-block h-8 w-8 align-[-0.18em] sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                    strokeWidth={1.75}
                    aria-hidden
                  />{' '}
                </>
              ) : null}
              {h.titleLine2}
            </span>
            <span className="text-primary-ink relative inline-block whitespace-nowrap">
              {h.titleAccent}
              <span
                className="border-primary/50 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
                aria-hidden
              />
            </span>
          </h1>

          <p className="text-accent-foreground mt-5 max-w-lg text-base leading-relaxed font-light sm:text-lg">
            {h.subhead}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, 'px-5')}>
              <Link href="/sign-up">
                {h.primaryCta}
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-black/15 px-5">
              <Link href="/sign-up">{h.secondaryCta}</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-5 text-xs font-medium">{h.footnote}</p>
        </div>

        <div className="relative z-10 grid min-w-0 gap-3 sm:grid-cols-2 lg:max-w-xl lg:justify-self-end">
          {cards.map(card => {
            const CardIcon = card.Icon
            return (
              <Link
                key={card.slug}
                href={card.href}
                className="group flex flex-col rounded-none border border-black/8 bg-white/90 p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-black/12 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-none border border-black/8 bg-white">
                  {card.logo ? (
                    <Image
                      src={card.logo}
                      alt={`${card.title} logo`}
                      width={24}
                      height={24}
                      unoptimized
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    <CardIcon className="text-primary-ink h-5 w-5" strokeWidth={1.75} aria-hidden />
                  )}
                </span>
                <span className="text-foreground mt-3 text-lg font-semibold tracking-tight">
                  {card.title}
                </span>
                <span className="text-muted-foreground mt-1.5 text-sm leading-snug font-light">
                  {card.description}
                </span>
                <span className="text-primary-ink mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                  {card.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
