'use client'

import type { ReactNode } from 'react'

import type { PricingAudience } from '@/features/site/components/pricing/audience-switch'
import { PricingEngineStrip } from '@/features/site/components/pricing/pricing-engine-strip'
import { GridCornerHandles } from '@/features/site/components/landing/home-grid'

interface PricingHeroProps {
  /** Drives the headline and the line under it, so the page speaks to whoever
   *  the toggle currently selects rather than to us. */
  audience: PricingAudience
  /** The audience toggle (and currency control) rendered under the headline. */
  children?: ReactNode
  onboardingBanner?: boolean
}

/** What the page says depends on who is reading it. */
const COPY: Record<PricingAudience, { title: string; blurb: string }> = {
  individual: {
    title: 'Pricing for brands',
    blurb:
      'See whether ChatGPT, Gemini, Perplexity and Claude recommend you when buyers ask — and exactly what to fix so they do.',
  },
  agency: {
    title: 'Pricing for agencies',
    blurb:
      'Run AI visibility for every client from one workspace, with 15% off every brand you onboard.',
  },
}

/**
 * The pricing page's opening.
 *
 * Deliberately short. Everything here costs the visitor scroll before they can
 * see a price, and the page's job is to get them to the cards — so it carries
 * only the two things a price needs to land: who this is for, and what it buys.
 * The eyebrow was dropped as redundant (the headline already says "Pricing"),
 * and the engine strip is one compact row rather than a labelled block.
 */
export function PricingHero({
  audience,
  children,
  onboardingBanner,
}: PricingHeroProps): JSX.Element {
  const copy = COPY[audience]

  return (
    <section aria-labelledby="pricing-hero-heading">
      <div className="border-border relative z-10 mx-auto max-w-6xl border-x px-6 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <GridCornerHandles top />

        <div className="mx-auto max-w-2xl text-center">
          <h1
            id="pricing-hero-heading"
            className="text-foreground text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]"
          >
            {copy.title}
          </h1>

          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-balance sm:text-base">
            {copy.blurb}
          </p>

          {children ? <div className="mt-7 flex justify-center">{children}</div> : null}

          <PricingEngineStrip />

          {onboardingBanner ? (
            <p className="border-success/30 bg-success/5 text-success mx-auto mt-6 max-w-lg rounded-md border px-4 py-3 text-sm leading-relaxed">
              You&apos;ve finished setup — choose a plan below to launch GEO analysis from the final
              step.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
