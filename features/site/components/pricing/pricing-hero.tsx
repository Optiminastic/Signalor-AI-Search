'use client'

import type { ReactNode } from 'react'

import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { PricingEngineStrip } from '@/features/site/components/pricing/pricing-engine-strip'

interface PricingHeroProps {
  /** The audience toggle (and currency control) rendered under the headline. */
  children?: ReactNode
  onboardingBanner?: boolean
}

/**
 * The pricing page's opening, modelled on the reference: eyebrow, a large
 * headline, a one-line trust statement, and the brand/agency toggle directly
 * beneath it — then the engine strip. The cards carry the detail, so the hero
 * only sets context.
 */
export function PricingHero({ children, onboardingBanner }: PricingHeroProps): JSX.Element {
  return (
    <section aria-labelledby="pricing-hero-heading">
      <div className="border-border relative z-10 mx-auto max-w-6xl border-x px-6 pt-16 pb-12 sm:pt-20 sm:pb-14">
        <GridCornerHandles top />

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
            Pricing
          </p>

          <h1
            id="pricing-hero-heading"
            className="text-foreground text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.06]"
          >
            Pricing for{' '}
            <span className="text-primary relative whitespace-nowrap">
              SignalorAI
              <span
                className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
                aria-hidden
              />
            </span>
          </h1>

          {children ? <div className="mt-9 flex justify-center">{children}</div> : null}

          <PricingEngineStrip />

          {onboardingBanner ? (
            <p className="border-success/30 bg-success/5 text-success mx-auto mt-8 max-w-lg rounded-md border px-4 py-3 text-sm leading-relaxed">
              You&apos;ve finished setup — choose a plan below to launch GEO analysis from the final
              step.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
