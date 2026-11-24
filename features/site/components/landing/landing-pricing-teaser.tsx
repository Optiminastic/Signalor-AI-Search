'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Info } from '@/features/site/components/icons'

import { ScreenHR } from '@/features/site/components/ui/intersection-diamonds'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/features/site/components/ui/tooltip'
import { cn } from '@/features/site/lib/utils'
import { useCurrency, formatPrice } from '@/features/site/lib/hooks/use-currency'
import { getPlanPrices, type DodoPlanPrice } from '@/features/site/lib/api/payments'
import { CurrencyToggle } from '@/features/site/components/pricing/currency-toggle'

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
// checkout-able tiers. Enterprise has no checkout — it links to Contact Sales.
type TeaserPlan = {
  id: string
  label: string
  price: number | null
  tagline: string
  popular?: boolean
  features: string[]
  href?: string
  cta?: string
}

const TEASER_PLANS: TeaserPlan[] = [
  {
    id: 'starter',
    label: 'Self-Serve Brand',
    price: 69.99,
    tagline: 'Run it yourself — one brand, ten tracked prompts.',
    features: [
      '1 brand · 10 prompts',
      'AI visibility score',
      'Prompt ranking & competitor tracking',
      'Recommendations & guidance',
    ],
  },
  {
    id: 'pro',
    label: 'Managed Growth Brand',
    price: 99.69,
    tagline: 'One brand, 25 prompts, daily agency-style support.',
    popular: true,
    features: [
      '1 brand · 25 prompts',
      'Everything in Self-Serve',
      'Daily agency-style support',
      'Guidance on fixes & actions',
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: null,
    tagline: 'Higher prompt volumes, multiple domains, advanced support.',
    href: '/contact-sales',
    cta: 'Contact sales',
    features: [
      'Custom prompt volume',
      'Multiple brands / domains',
      'Advanced & dedicated support',
      'Preferred currency & terms',
    ],
  },
]

function formatLiveAmount(amount: number, ccy: string): string {
  if (ccy === 'INR' || ccy === 'JPY') return Math.round(amount).toLocaleString()
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function localizedPrice(
  live: DodoPlanPrice | null | undefined,
  userCcy: string | null,
): { ccy: string; amount: number; symbol: string; isApprox: boolean } | null {
  if (!live) return null
  const baseCcy = live.currency.toUpperCase()
  const useLocal =
    !!userCcy && userCcy !== baseCcy && live.prices_by_currency?.[userCcy] !== undefined
  const ccy = useLocal ? userCcy! : baseCcy
  const amount = useLocal ? live.prices_by_currency![userCcy!] : live.amount
  return {
    ccy,
    amount,
    symbol: CURRENCY_SYMBOLS[ccy] ?? `${ccy} `,
    isApprox: useLocal,
  }
}

export function LandingPricingTeaser() {
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
  const starterLive = livePrices?.starter ?? null
  const starterLocalized = localizedPrice(starterLive, userCcy)

  const starterLabel = starterLocalized
    ? `${starterLocalized.symbol}${formatLiveAmount(starterLocalized.amount, starterLocalized.ccy)}`
    : currencyReady
      ? `${currency.symbol}${formatPrice(69.99, currency)}`
      : '£69.99'

  const baseCcy = livePrices
    ? (
        livePrices.starter?.currency ||
        livePrices.pro?.currency ||
        livePrices.business?.currency ||
        'GBP'
      ).toUpperCase()
    : null

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
            {starterLabel} / month
            <span
              className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-2 border-dashed"
              aria-hidden
            />
          </span>
        </h2>
        <p className="text-accent-foreground mt-5 max-w-2xl text-base leading-relaxed font-light lg:text-lg">
          Cancel anytime. No setup fees, no seats, no surprise usage bills, just one clear monthly
          number
          {baseCcy
            ? userCcy && userCcy !== baseCcy
              ? ` (approx. in ${userCcy}, billed in ${baseCcy})`
              : ` in ${baseCcy}`
            : currency.code !== 'GBP'
              ? ` (approx. in ${currency.code})`
              : ''}
          .
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 lg:px-12">
        <div className="flex items-center gap-3">
          <CurrencyToggle currency={currency} onSelect={selectCurrency} />
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/pricing"
                  aria-label="See the full plans and feature comparison"
                  className="text-muted-foreground hover:bg-muted/60 hover:text-primary-ink ml-auto flex h-7 w-7 items-center justify-center rounded-full transition"
                >
                  <Info className="h-4 w-4" aria-hidden />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">See full plan</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TEASER_PLANS.map(p => {
            const isCustom = p.price === null
            const live = livePrices?.[p.id] ?? null
            const localized = isCustom ? null : localizedPrice(live, userCcy)
            const symbol = isCustom ? '' : (localized?.symbol ?? currency.symbol)
            const amountLabel = isCustom
              ? 'Custom'
              : localized
                ? formatLiveAmount(localized.amount, localized.ccy)
                : currencyReady
                  ? formatPrice(p.price as number, currency)
                  : (p.price as number).toFixed(2)

            return (
              <div
                key={p.label}
                className={cn(
                  'relative flex flex-col gap-5 px-6 py-10 transition-colors duration-200 md:px-8 md:py-12 lg:px-10',
                  p.popular
                    ? 'from-primary/5 to-primary/10 bg-gradient-to-br via-white'
                    : 'hover:bg-muted/25 bg-white',
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
                  <span className="text-foreground mt-1.5 text-base font-semibold">{symbol}</span>
                  <span
                    className={cn(
                      'ml-0.5 text-4xl font-bold tracking-tight tabular-nums transition-opacity duration-300',
                      localized || currencyReady
                        ? 'text-foreground opacity-100'
                        : 'text-foreground opacity-40',
                    )}
                  >
                    {amountLabel}
                  </span>
                  {!isCustom ? (
                    <span className="text-muted-foreground mt-4 ml-2 text-xs font-medium">
                      / month
                    </span>
                  ) : null}
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
                  href={p.href ?? `/pricing?checkout=${p.id}`}
                  className={cn(
                    'mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 text-[13px] font-semibold transition',
                    p.popular
                      ? 'bg-primary-strong text-primary-foreground shadow-[0_4px_14px_-4px_rgba(224,74,61,0.5)] hover:opacity-90'
                      : 'border-primary/25 bg-primary/5 text-primary-ink hover:bg-primary/10 border',
                  )}
                >
                  {p.cta ?? `Get ${p.label}`}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
