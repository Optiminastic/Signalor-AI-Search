'use client'

import Link from 'next/link'

import { GridCornerHandles } from '@/features/site/components/landing/home-grid'
import { ArrowLeft } from '@/features/site/components/icons'
import { routes } from '@/features/site/lib/config'

interface PricingHeroProps {
  showBackLink?: boolean
  backHref: string
  backLabel: string
  onboardingBanner?: boolean
}

/**
 * The pricing page's opening.
 *
 * Centred, not left-aligned. Every section beneath it is centred, and a
 * left-aligned hero above them left a third of the row empty and read as a
 * different page. It also no longer restates the plan pitch — the section that
 * followed said the same thing again ("Pick the plan that matches your team"),
 * which is what opened ~400px of dead space between the two.
 */
export function PricingHero({
  showBackLink,
  backHref,
  backLabel,
  onboardingBanner,
}: PricingHeroProps): JSX.Element {
  return (
    <section aria-labelledby="pricing-hero-heading">
      <div className="border-border relative z-10 mx-auto max-w-6xl border-x px-6 pt-10 pb-12 sm:pt-12 sm:pb-14">
        <GridCornerHandles top />

        {/* Navigation stays left — it belongs to the chrome, not the message. */}
        {showBackLink ? (
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        ) : null}

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
            Pricing
          </p>

          <h1
            id="pricing-hero-heading"
            className="text-foreground mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Simple plans for{' '}
            <span className="text-primary relative whitespace-nowrap">
              serious GEO teams
              <span
                className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
                aria-hidden
              />
            </span>
          </h1>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            See whether AI engines recommend you, ignore you, or recommend your competitors — and fix
            it. Every tier includes GEO scoring, recommendations, and exports.
          </p>

          <p className="text-muted-foreground mt-3 text-[13px]">
            Priced in GBP, billed monthly. Cancel anytime.
          </p>

          <p className="text-muted-foreground mt-5 text-sm font-medium">
            New here?{' '}
            <Link
              href={routes.signUp}
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              Create an account
            </Link>{' '}
            or{' '}
            <Link
              href={routes.signIn}
              className="text-foreground font-semibold underline-offset-4 hover:underline"
            >
              log in
            </Link>{' '}
            to subscribe.
          </p>

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
