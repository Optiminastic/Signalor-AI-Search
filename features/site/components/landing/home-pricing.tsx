'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { ArrowRight, Check } from '@/features/site/components/icons'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { CurrencyToggle } from '@/features/site/components/pricing/currency-toggle'
import { getPlanPrices, type DodoPlanPrice } from '@/features/site/lib/api/payments'
import { useCurrency, formatPrice, type Currency } from '@/features/site/lib/hooks/use-currency'
import { cn } from '@/features/site/lib/utils'

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥',
  SGD: 'S$',
  AED: 'AED ',
  BRL: 'R$',
  MXN: 'MX$',
  ZAR: 'R',
}

// Plan ids must match the backend keys in /api/payments/plan-prices/ for the
// checkout-able tiers. Enterprise links to sales.
type HomePlan = {
  id: string
  label: string
  price: number
  tagline: string
  popular?: boolean
  featuresLead?: string
  features: string[]
  href: string
  cta: string
}

const HOME_PLANS: HomePlan[] = [
  {
    id: 'starter',
    label: 'Self-Serve Brand',
    price: 79.99,
    popular: true,
    tagline: 'Run it yourself - one brand, ten tracked prompts.',
    features: [
      '1 brand · 10 prompts',
      'AI visibility score',
      'Prompt ranking & competitor tracking',
      'Recommendations & guidance',
    ],
    href: '/pricing?checkout=starter',
    cta: 'Get Self-Serve',
  },
]

const ENTERPRISE_FEATURES = [
  'Custom prompt volume',
  'Multiple brands / domains',
  'Advanced & dedicated support',
  'Preferred currency & terms',
  'Custom reporting cadence',
  'Agency plans available',
]

function formatLiveAmount(amount: number, ccy: string): string {
  if (ccy === 'INR' || ccy === 'JPY') return Math.round(amount).toLocaleString()
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type LocalizedPrice = { ccy: string; amount: number; symbol: string }

function localizedPrice(
  live: DodoPlanPrice | null | undefined,
  userCcy: string | null,
): LocalizedPrice | null {
  if (!live) return null
  const baseCcy = live.currency.toUpperCase()
  const useLocal =
    !!userCcy && userCcy !== baseCcy && live.prices_by_currency?.[userCcy] !== undefined
  const ccy = useLocal && userCcy ? userCcy : baseCcy
  const amount =
    useLocal && userCcy ? (live.prices_by_currency?.[userCcy] ?? live.amount) : live.amount
  return { ccy, amount, symbol: CURRENCY_SYMBOLS[ccy] ?? `${ccy} ` }
}

interface PlanPriceOptions {
  plan: HomePlan
  live: DodoPlanPrice | null
  userCcy: string | null
  currency: Currency
  currencyReady: boolean
}

function planPriceLabel({ plan, live, userCcy, currency, currencyReady }: PlanPriceOptions): {
  symbol: string
  amount: string
  resolved: boolean
} {
  const localized = localizedPrice(live, userCcy)
  if (localized) {
    return {
      symbol: localized.symbol,
      amount: formatLiveAmount(localized.amount, localized.ccy),
      resolved: true,
    }
  }
  if (currencyReady) {
    return { symbol: currency.symbol, amount: formatPrice(plan.price, currency), resolved: true }
  }
  return { symbol: '£', amount: plan.price.toFixed(2), resolved: false }
}

interface PlanCellProps {
  plan: HomePlan
  symbol: string
  amount: string
  resolved: boolean
}

function PlanContent({ plan, symbol, amount, resolved }: PlanCellProps): JSX.Element {
  return (
    <>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-base font-semibold tracking-tight">{plan.label}</h3>
          {plan.popular ? (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              Popular
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-1.5 min-h-10 text-[13px] leading-relaxed">
          {plan.tagline}
        </p>
      </div>
      <div className="mt-5 flex items-start">
        <span className="text-foreground mt-1 text-base font-semibold">{symbol}</span>
        <span
          className={cn(
            'text-foreground text-4xl font-semibold tracking-tight tabular-nums transition-opacity duration-300',
            !resolved && 'opacity-40',
          )}
        >
          {amount}
        </span>
        <span className="text-muted-foreground mt-4 ml-1.5 text-xs font-medium">/ month</span>
      </div>
      <Link
        href={plan.href}
        className={cn(
          'mt-6',
          plan.popular
            ? LANDING_PRIMARY_CTA_CLASS
            : 'bg-card text-foreground ring-border hover:bg-muted/60 inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-4 text-[13px] font-semibold shadow-sm ring-1 shadow-black/5 transition-colors',
        )}
      >
        {plan.cta}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
      <ul className="border-border mt-6 space-y-2.5 border-t pt-5">
        {plan.featuresLead ? (
          <li className="text-foreground text-[13px] font-semibold">{plan.featuresLead}</li>
        ) : null}
        {plan.features.map(feature => (
          <li
            key={feature}
            className="text-foreground/90 flex items-start gap-2 text-[13px] leading-snug"
          >
            <Check
              className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function EnterpriseRow(): JSX.Element {
  return (
    <div className="border-border relative border-t">
      <GridCornerHandles top />
      <GridHandle className="-top-[3.5px] left-1/3 -ml-[3.5px] hidden lg:block" />
      <div className="lg:divide-border grid lg:grid-cols-[1fr_2fr] lg:divide-x">
        <div className="bg-card max-lg:border-border px-6 py-10 max-lg:border-b sm:px-10">
          <h3 className="text-foreground text-base font-semibold tracking-tight">Enterprise</h3>
          <p className="text-muted-foreground mt-1.5 max-w-xs text-[13px] leading-relaxed">
            Higher prompt volumes, multiple domains, and advanced support for larger teams.
          </p>
          <Link
            href="/contact-sales"
            className="bg-card text-foreground ring-border hover:bg-muted/60 mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-4 text-[13px] font-semibold shadow-sm ring-1 shadow-black/5 transition-colors"
          >
            Contact sales
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <ul className="bg-card grid content-center gap-x-10 gap-y-3 px-6 py-10 sm:grid-cols-2 sm:px-10">
          {ENTERPRISE_FEATURES.map(feature => (
            <li
              key={feature}
              className="text-foreground/90 flex items-start gap-2 text-[13px] leading-snug"
            >
              <Check
                className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function HomePricing(): JSX.Element {
  const { currency, ready: currencyReady, selectCurrency } = useCurrency()
  const [livePrices, setLivePrices] = useState<Record<string, DodoPlanPrice | null> | null>(null)

  useEffect(() => {
    getPlanPrices()
      .then(res => {
        if (res.source === 'dodo') {
          setLivePrices({ starter: res.starter, pro: res.pro, business: res.business })
        }
      })
      .catch(() => {
        /* graceful: fall back to static GBP-rate display */
      })
  }, [])

  const userCcy = currencyReady ? currency.code : null

  return (
    <section id="pricing" className="scroll-mt-20" aria-labelledby="home-pricing-heading">
      <div className="border-border relative border-t px-6 py-14 sm:py-16">
        <GridCornerHandles top />
        <HomeSectionHeader
          eyebrow="Pricing"
          headingId="home-pricing-heading"
          title="One clear monthly number"
          description="Cancel anytime. No setup fees, no seats, no surprise usage bills."
        />
        <div className="mt-8 flex items-center justify-center gap-3">
          <CurrencyToggle currency={currency} onSelect={selectCurrency} />
          <Link
            href="/pricing"
            className="text-primary hover:text-primary/80 text-[13px] font-semibold transition-colors"
          >
            Full plan comparison →
          </Link>
        </div>
      </div>
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-1/3 -ml-[3.5px] hidden lg:block" />
        <GridHandle className="-top-[3.5px] left-2/3 -ml-[3.5px] hidden lg:block" />
        <div className="divide-border grid grid-cols-1 max-lg:divide-y lg:grid-cols-3 lg:divide-x">
          {HOME_PLANS.map(plan => {
            const price = planPriceLabel({
              plan,
              live: livePrices?.[plan.id] ?? null,
              userCcy,
              currency,
              currencyReady,
            })
            return (
              <div
                key={plan.id}
                className={cn('bg-card flex', plan.popular ? 'p-4 lg:p-5' : 'px-6 py-9 sm:px-8')}
              >
                {plan.popular ? (
                  <div className="bg-card ring-primary/60 relative z-10 flex w-full flex-col rounded-xl p-6 shadow-md ring-2 shadow-black/10 sm:p-7">
                    <PlanContent
                      plan={plan}
                      symbol={price.symbol}
                      amount={price.amount}
                      resolved={price.resolved}
                    />
                  </div>
                ) : (
                  <div className="flex w-full flex-col">
                    <PlanContent
                      plan={plan}
                      symbol={price.symbol}
                      amount={price.amount}
                      resolved={price.resolved}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <EnterpriseRow />
    </section>
  )
}
