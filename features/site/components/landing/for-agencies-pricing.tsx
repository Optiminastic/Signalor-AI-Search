import Link from 'next/link'

import { ArrowRight, Check } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { PlanBadge } from '@/features/site/components/landing/plan-badge'
import { cn } from '@/features/site/lib/utils'

// Display-only agency pricing — mirrors the Agency flow on /pricing (no public
// checkout exists for agency plans; every CTA routes to Contact Sales).
type AgencyPlan = {
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

const AGENCY_PLANS: AgencyPlan[] = [
  {
    popular: true,
    id: 'agency-brand-10',
    label: 'Per Brand · 10 prompts',
    price: '69.99',
    priceNote: 'per brand',
    tagline: 'Each client brand you onboard, billed per brand.',
    features: [
      '1 brand / domain per client',
      '10 prompts to rank & track',
      'AI visibility score',
      'Prompt ranking across AI engines',
      'Competitor visibility tracking',
      'Recommendations & improvement guidance',
      '15% agency discount applied',
    ],
  },
  {
    id: 'agency-account',
    label: 'Agency Account',
    price: '99.69',
    tagline: 'Manage multiple client brands from one SignalorAI workspace.',
    comingSoon: true,
    features: [
      'One workspace for all your clients',
      'Add & manage multiple client brands',
      'Consolidated visibility across clients',
      '15% off every brand you onboard',
      'Roster-wide fix planning',
      'White-label, exportable client reports',
    ],
  },
  {
    comingSoon: true,
    id: 'agency-brand-25',
    label: 'Per Brand · 25 prompts',
    price: '99.69',
    priceNote: 'per brand',
    tagline: 'More prompt coverage per client brand.',
    features: [
      'Everything in the 10-prompt brand, plus:',
      '25 prompts to rank & track',
      'Broader competitor coverage per client',
      'Recommendations & improvement guidance',
      '15% agency discount applied',
    ],
  },
]

const AGENCY_ENTERPRISE_FEATURES = [
  'Custom prompt volume',
  'Multiple brands / domains',
  'Advanced & dedicated support',
  'Choose the AI engines you track',
  'Preferred currency & billing terms',
  'White-label, exportable client reports',
]

const CTA_SECONDARY =
  'bg-card text-foreground ring-border hover:bg-muted/60 inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-5 text-sm font-semibold shadow-sm ring-1 shadow-black/5 transition-all'

/** A plan that cannot be bought yet gets an inert control, not a live link -
 *  sending someone to contact sales for something we do not sell is a dead end. */
function PlanCta({ plan }: { plan: AgencyPlan }): JSX.Element {
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
  // No agency plan is self-serve: the backend only sells 'starter'/'pro', so
  // every agency CTA is a sales conversation, highlighted plan included.
  return (
    <Link
      href="/contact-sales"
      className={cn(plan.popular ? LANDING_PRIMARY_CTA_CLASS : CTA_SECONDARY)}
    >
      Talk to us
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  )
}

function PlanCell({ plan }: { plan: AgencyPlan }): JSX.Element {
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

function AgencyEnterpriseRow(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridHandle className="-top-[3.5px] left-1/3 -ml-[3.5px] hidden lg:block" />
      <div className="lg:divide-border grid lg:grid-cols-[1fr_2fr] lg:divide-x">
        <div className="max-lg:border-border p-8 max-lg:border-b">
          <h3 className="text-foreground text-lg font-medium tracking-tight">Enterprise agency</h3>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm text-balance">
            For larger rosters with higher prompt volumes, multi-domain clients, and advanced
            reporting needs.
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
          {AGENCY_ENTERPRISE_FEATURES.map(feature => (
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

export function ForAgenciesPricing(): JSX.Element {
  return (
    <section
      id="agency-pricing"
      className="scroll-mt-20"
      aria-labelledby="for-agencies-pricing-heading"
    >
      <div className="border-border mx-auto max-w-6xl border-x">
        <div className="border-border relative border-t px-6 py-14 sm:py-16">
          <GridCornerHandles top />
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
              Agency pricing
            </p>
            <h2
              id="for-agencies-pricing-heading"
              className="text-foreground mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              One workspace, per-brand pricing
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              All agency plans start with a conversation - no public checkout, no surprises.
            </p>
            <p className="text-muted-foreground mt-6 text-[13px] font-medium">
              <span className="text-primary font-semibold">Save 15%</span> on every brand you
              onboard · Prices in GBP ·{' '}
              <Link
                href="/pricing"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Full plan comparison →
              </Link>
            </p>
          </div>
        </div>
        <div className="border-border relative border-t">
          <GridCornerHandles top />
          <div className="divide-border grid grid-cols-1 max-lg:divide-y lg:grid-cols-3">
            {AGENCY_PLANS.map(plan => (
              <PlanCell key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
        <AgencyEnterpriseRow />
      </div>
    </section>
  )
}
