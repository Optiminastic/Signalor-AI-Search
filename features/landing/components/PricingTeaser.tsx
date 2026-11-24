import Link from 'next/link'

import { ScreenHR } from '@/components/ui/intersection-diamonds'
import { ArrowRight, Check } from '@/lib/icons'
import { cn } from '@/lib/utils'

type TeaserPlan = {
  id: string
  label: string
  price: string
  tagline: string
  popular?: boolean
  features: string[]
}

const CURRENCY_SYMBOL = '$'

const TEASER_PLANS: TeaserPlan[] = [
  {
    id: 'starter',
    label: 'Starter',
    price: '19.99',
    tagline: 'Solo brands getting started with GEO.',
    features: [
      '2 projects · 25 prompts',
      'Gemini & Google visibility',
      'GEO analysis & scoring',
      'PDF report exports',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '49.99',
    tagline: 'Growing teams tracking multiple brands.',
    popular: true,
    features: [
      '3 projects · 75 prompts',
      'ChatGPT, Gemini & Perplexity',
      'Shopify & WordPress integration',
      'Scheduled re-analysis & trends',
    ],
  },
  {
    id: 'business',
    label: 'Max',
    price: '59.99',
    tagline: 'Full power for agencies and operators.',
    features: [
      '6 projects · 200 prompts',
      'All engines, including Claude',
      'Advanced competitor analysis',
      'Priority support',
    ],
  },
]

export function PricingTeaser(): JSX.Element {
  return (
    <section className="relative bg-transparent" aria-labelledby="landing-pricing-teaser-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 lg:px-12 lg:pt-16 lg:pb-14">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
          [ pricing ]
        </p>
        <h2
          id="landing-pricing-teaser-heading"
          className="text-foreground mt-4 max-w-4xl text-3xl leading-[1.12] font-bold tracking-tight sm:text-4xl lg:text-[2.65rem]"
        >
          Plans from{' '}
          <span className="text-primary-ink relative whitespace-nowrap">
            {CURRENCY_SYMBOL}
            {TEASER_PLANS[0].price} / month
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          Cancel anytime. No setup fees, no seats, no surprise usage bills, just one clear monthly
          number.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TEASER_PLANS.map(p => (
            <div
              key={p.label}
              className={cn(
                'relative flex flex-col gap-5 px-6 py-10 md:px-8 md:py-12 lg:px-10',
                p.popular ? 'from-primary/5 to-primary/10 bg-gradient-to-br via-white' : 'bg-white',
              )}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
                  {p.label}
                </h3>
                {p.popular ? (
                  <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    Most Popular
                  </span>
                ) : null}
              </div>
              <div className="flex items-start">
                <span className="text-foreground mt-1.5 text-base font-semibold">
                  {CURRENCY_SYMBOL}
                </span>
                <span className="text-foreground ml-0.5 text-4xl font-bold tracking-tight tabular-nums">
                  {p.price}
                </span>
                <span className="text-muted-foreground mt-4 ml-2 text-xs font-medium">/ month</span>
              </div>
              <p className="text-muted-foreground text-[13px] leading-relaxed">{p.tagline}</p>
              <ul className="space-y-2.5">
                {p.features.map(feature => (
                  <li
                    key={feature}
                    className="text-accent-foreground flex items-start gap-2 text-[13px] leading-snug"
                  >
                    <Check
                      className="text-primary-ink mt-0.5 h-3.5 w-3.5 shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={cn(
                  'mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 text-[13px] font-semibold transition',
                  p.popular
                    ? 'bg-primary-strong text-primary-foreground shadow-[0_4px_14px_-4px_rgba(224,74,61,0.5)] hover:opacity-90'
                    : 'border-primary/25 bg-primary/5 text-primary-ink hover:bg-primary/10 border',
                )}
              >
                Get {p.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
