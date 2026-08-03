import Link from 'next/link'

import { ArrowRight, Check } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { PlanBadge } from '@/features/site/components/landing/plan-badge'
import { cn } from '@/features/site/lib/utils'

type BrandPlan = {
  id: string
  label: string
  price: string
  priceNote?: string
  tagline: string
  popular?: boolean
  /** Not yet purchasable — the card shows a badge and the CTA is inert. */
  comingSoon?: boolean
  features: string[]
}

const BRAND_PLANS: BrandPlan[] = [
  {
    popular: true,
    id: 'brand-starter',
    label: 'Starter',
    price: '79.99',
    priceNote: 'per month',
    tagline: 'One brand, one clear baseline for how AI describes you.',
    features: [
      '1 brand / domain',
      '10 prompts to track',
      'AI visibility score',
      'Prompt coverage across core engines',
      'Competitor visibility snapshot',
      'Fix recommendations with clear priorities',
    ],
  },
  {
    id: 'brand-growth',
    label: 'Growth',
    price: '149',
    priceNote: 'per month',
    tagline: 'Built for teams tracking more prompts and more momentum.',
    comingSoon: true,
    features: [
      '3 brands / domains',
      '25 prompts to track',
      'Cross-engine visibility comparisons',
      'Analytics connect for AI referral traffic',
      'Weekly monitoring and alerts',
      'Priority fix queue with expected lift',
    ],
  },
  {
    comingSoon: true,
    id: 'brand-scale',
    label: 'Scale',
    price: '299',
    priceNote: 'per month',
    tagline: 'More brands, more coverage, more support for fast-moving teams.',
    features: [
      'Unlimited brands / domains',
      'Custom prompt volume',
      'Dedicated support and rollout guidance',
      'Expanded competitor and source coverage',
      'White-label reporting for stakeholders',
      'Advanced fix planning across launches',
    ],
  },
]

const BRAND_ENTERPRISE_FEATURES = [
  'Custom prompt volume for every product line',
  'Multi-brand rollouts across campaigns and regions',
  'Advanced reporting for executives and partners',
  'Priority support for launch-critical moments',
  'Flexible billing and rollout planning',
  'Connect your analytics stack and CRM workflows',
]

/** The /pricing plan id this card sells. Only 'starter' and 'pro' are
 *  self-serve checkout-able; everything else routes to sales. */
const CHECKOUT_PLAN_ID = 'starter'

const CTA_SECONDARY =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-card px-5 text-sm font-semibold text-foreground ring-1 ring-border shadow-sm shadow-black/5 transition-all hover:bg-muted/60'

/** A plan that cannot be bought yet gets an inert control, not a live link -
 *  sending someone to contact sales for something we do not sell is a dead end. */
function PlanCta({ plan }: { plan: BrandPlan }): JSX.Element {
  if (plan.comingSoon) {
    return (
      <span
        aria-disabled
        className="bg-muted/60 text-muted-foreground ring-border inline-flex h-9 cursor-not-allowed items-center justify-center rounded-md px-5 text-sm font-semibold ring-1"
      >
        Coming soon
      </span>
    )
  }
  // Hands off to /pricing, which owns the real flow: sign-in gating, currency
  // detection, affiliate discounts and checkout errors.
  if (plan.popular) {
    return (
      <Link href={`/pricing?checkout=${CHECKOUT_PLAN_ID}`} className={LANDING_PRIMARY_CTA_CLASS}>
        Buy
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    )
  }
  return (
    <Link href="/contact-sales" className={CTA_SECONDARY}>
      Talk to us
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  )
}

function PlanCell({ plan }: { plan: BrandPlan }): JSX.Element {
  return (
    <div
      className={cn(
        'grid gap-8 p-8 lg:row-span-4 lg:grid-rows-subgrid',
        plan.comingSoon && 'opacity-70',
        plan.popular &&
          'bg-card ring-primary/60 rounded-xl shadow-md ring-2 shadow-black/10 max-lg:mx-2 max-lg:my-2 lg:my-2',
      )}
    >
      <div className="self-end">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-lg font-medium tracking-tight">{plan.label}</h3>
          <PlanBadge popular={plan.popular} comingSoon={plan.comingSoon} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm text-balance">{plan.tagline}</p>
      </div>
      <div>
        <p className="text-foreground text-3xl font-semibold tracking-tight tabular-nums">
          £{plan.price}
        </p>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Per month{plan.priceNote ? ` · ${plan.priceNote}` : ''}
        </p>
      </div>
      <PlanCta plan={plan} />
      <ul className="space-y-3 text-sm">
        {plan.features.map(feature => (
          <li
            key={feature}
            className="text-foreground/90 first:text-foreground flex items-center gap-2 first:font-medium"
          >
            <Check className="text-primary h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BrandEnterpriseRow(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridHandle className="-top-[3.5px] left-1/3 -ml-[3.5px] hidden lg:block" />
      <div className="lg:divide-border grid lg:grid-cols-[1fr_2fr] lg:divide-x">
        <div className="max-lg:border-border p-8 max-lg:border-b">
          <h3 className="text-foreground text-lg font-medium tracking-tight">Enterprise brand</h3>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm text-balance">
            For bigger portfolios, more frequent launches, and multiple stakeholders who need one
            source of truth.
          </p>
          <Link
            href="/contact-sales"
            className="bg-card text-foreground ring-border hover:bg-muted/60 mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-5 text-sm font-semibold shadow-sm ring-1 shadow-black/5 transition-all"
          >
            Contact sales
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <ul className="grid content-center gap-x-10 gap-y-3 p-8 text-sm sm:grid-cols-2">
          {BRAND_ENTERPRISE_FEATURES.map(feature => (
            <li key={feature} className="text-foreground/90 flex items-center gap-2">
              <Check className="text-primary h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function ForBrandsPricing(): JSX.Element {
  return (
    <section
      id="brand-pricing"
      className="scroll-mt-20"
      aria-labelledby="for-brands-pricing-heading"
    >
      <div className="border-border mx-auto max-w-6xl border-x">
        <div className="border-border relative border-t px-6 py-14 sm:py-16">
          <GridCornerHandles top />
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
              Brand pricing
            </p>
            <h2
              id="for-brands-pricing-heading"
              className="text-foreground mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Pricing that scales with your brand story
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              Start with one brand, expand when you need more coverage, and keep the work grounded
              in the answers your customers actually see.
            </p>
            <p className="text-muted-foreground mt-6 text-[13px] font-medium">
              <span className="text-primary font-semibold">Free audit available</span> · Simple
              plans for one brand or many ·{' '}
              <Link
                href="/pricing"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                See full comparison →
              </Link>
            </p>
          </div>
        </div>
        <div className="border-border relative border-t">
          <GridCornerHandles top />
          <div className="divide-border grid grid-cols-1 max-lg:divide-y lg:grid-cols-3">
            {BRAND_PLANS.map(plan => (
              <PlanCell key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
        <BrandEnterpriseRow />
      </div>
    </section>
  )
}
