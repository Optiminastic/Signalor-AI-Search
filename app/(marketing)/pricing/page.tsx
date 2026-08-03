'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

import { track } from '@/features/site/amplitude'
import { Crown, Rocket, Zap } from '@/features/site/components/icons'
import { LandingFaq } from '@/features/site/components/landing/landing-faq'
import {
  AudienceSwitch,
  type PricingAudience,
} from '@/features/site/components/pricing/audience-switch'
import { PlanCard } from '@/features/site/components/pricing/plan-card'
import { PlanComparisonTable } from '@/features/site/components/pricing/plan-comparison-table'
import {
  AGENCY_COLUMNS,
  AGENCY_COMPARISON,
  BRAND_COLUMNS,
  BRAND_COMPARISON,
} from '@/features/site/lib/pricing-comparison'
import { CurrencyToggle } from '@/features/site/components/pricing/currency-toggle'
import { PricingHero } from '@/features/site/components/pricing/pricing-hero'
import { PricingStatsSection } from '@/features/site/components/pricing/pricing-stats-section'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { HomeSectionHeader } from '@/features/site/components/landing/home-section-header'
import { SignalorLoader } from '@/features/site/components/ui/signalor-loader'
import { setAccountType as persistAccountType } from '@/features/site/lib/api/account'
import { pingCheckoutStarted, pingPricingViewed } from '@/features/site/lib/api/drip'
import {
  CheckoutSessionError,
  createCheckoutSession,
  getPlanPrices,
  getSubscriptionStatus,
  type DodoMode,
  type DodoPlanPrice,
} from '@/features/site/lib/api/payments'
import { useSession } from '@/features/site/lib/auth-client'
import { routes } from '@/features/site/lib/config'
import { useCurrency } from '@/features/site/lib/hooks/use-currency'
import {
  POST_CHECKOUT_REDIRECT_KEY,
  safeInternalReturnPath,
} from '@/features/site/lib/internal-nav'
import { PRICING_FAQ_ITEMS } from '@/features/site/lib/pricing-marketing-content'
import { useOrgStore } from '@/features/site/lib/stores/org-store'
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

type PlanCta = 'checkout' | 'contact'

interface PlanConfig {
  id: string
  label: string
  /** Base monthly price in GBP. `null` renders as "Custom" (Enterprise). */
  price: number | null
  /** Extra qualifier under the price, e.g. "per brand". */
  priceNote?: string
  period: string
  description: string
  icon: typeof Zap
  popular?: boolean
  features: string[]
  /** Optional "Everything in X, plus:" lead-in, matching the home page cards. */
  featuresLead?: string
  comingSoonFeatures?: string[]
  /** "checkout" → Dodo checkout (starter/pro only); "contact" → Contact Sales. */
  cta: PlanCta
  ctaLabel?: string
}

// Card id → Dodo plan key. Only mapped ids may start a checkout; everything
// else routes to Contact Sales.
//
// Exactly two plans are sold: the brand plan (£79.99, Dodo "Signalor Brand
// Starter Plan") and the agency plan (£69.99, "Signalor Agency Starter Plan").
// They are separate Dodo products, so the agency card no longer borrows the
// individual product the way it did when agency pricing was a discount on it.
const CHECKOUT_PLAN_KEY: Record<string, 'starter' | 'agency'> = {
  starter: 'starter',
  'agency-brand-10': 'agency',
}
const CHECKOUTABLE = new Set(Object.keys(CHECKOUT_PLAN_KEY))

// ── Individual flow ────────────────────────────────────────────────────────
const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    label: 'Self-Serve Brand',
    price: 79.99,
    period: '/month',
    description: 'Run it yourself — onboard, track, and improve your AI visibility.',
    icon: Zap,
    cta: 'checkout',
    features: [
      '1 brand / domain',
      '10 prompts to rank & track',
      'AI visibility score',
      'Prompt ranking across AI engines',
      'Competitor visibility tracking',
      'Recommendations & improvement guidance',
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: null,
    period: '',
    description: 'For larger brands with higher prompt, multi-domain, or support needs.',
    icon: Rocket,
    cta: 'contact',
    ctaLabel: 'Contact sales',
    features: [
      'Custom prompt volume',
      'Multiple brands / domains',
      'Advanced & dedicated support',
      'Choose the AI engines you track',
      'Preferred currency & billing terms',
    ],
  },
]

// ── Agency flow — per-brand cards are directly buyable (they sell the same
// Dodo products as the Individual tiers, with the agency discount applied at
// checkout); the workspace card stays a sales conversation. ──
const AGENCY_PLANS: PlanConfig[] = [
  {
    id: 'agency-account',
    label: 'Agency Account',
    price: 99.69,
    period: '/month',
    description: 'Manage multiple client brands from one SignalorAI workspace.',
    icon: Crown,
    popular: true,
    cta: 'contact',
    ctaLabel: 'Talk to us',
    features: [
      'One workspace for all your clients',
      'Add & manage multiple client brands',
      '15% off every brand you onboard',
      'Consolidated visibility across clients',
    ],
  },
  {
    id: 'agency-brand-10',
    label: 'Per Brand · 10 prompts',
    price: 69.99,
    priceNote: 'per brand',
    period: '/month',
    description: 'Each client brand you onboard, billed per brand.',
    icon: Zap,
    cta: 'checkout',
    ctaLabel: 'Buy now',
    features: [
      '1 brand / domain',
      '10 prompts to rank & track',
      'AI visibility score & prompt ranking',
      'Competitor visibility tracking',
      '15% agency discount applied',
    ],
  },
  {
    id: 'agency-brand-25',
    label: 'Per Brand · 25 prompts',
    price: 99.69,
    priceNote: 'per brand',
    period: '/month',
    description: 'More prompt coverage per client brand.',
    icon: Rocket,
    cta: 'contact',
    ctaLabel: 'Buy now',
    features: [
      '1 brand / domain',
      '25 prompts to rank & track',
      'Everything in the 10-prompt brand',
      'Recommendations & improvement guidance',
      '15% agency discount applied',
    ],
  },
]

function PricingPageFallback() {
  return (
    <MarketingShell>
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-24">
        <SignalorLoader size="lg" />
      </div>
    </MarketingShell>
  )
}

function PricingPageInner() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = safeInternalReturnPath(searchParams.get('returnTo'))
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [checkoutDodoMode, setCheckoutDodoMode] = useState<DodoMode | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, DodoPlanPrice | null> | null>(null)
  // The signup/onboarding flow passes ?audience= so the toggle opens on the
  // account type the user picked at sign-up (no flash of the wrong plans).
  // Without the param, the server-stored account type (fetched below) decides.
  const audienceParam = searchParams.get('audience')
  const explicitAudience: PricingAudience | null =
    audienceParam === 'agency' || audienceParam === 'individual' ? audienceParam : null
  const [audience, setAudience] = useState<PricingAudience>(explicitAudience ?? 'individual')
  const { currency, ready: currencyReady, country: detectedCountry, selectCurrency } = useCurrency()

  // Header prices for the comparison table. Derived from the same plan configs
  // the cards use, so the two can never disagree; the table shows the static
  // converted price rather than the live Dodo amount because a header is a
  // reference point, not the thing being purchased.
  const comparisonColumns = useMemo(() => {
    const source = audience === 'agency' ? AGENCY_PLANS : PLANS
    const cols = audience === 'agency' ? AGENCY_COLUMNS : BRAND_COLUMNS
    const priceOf = (id: string): string => {
      const plan = source.find(pl => pl.id === id)
      if (!plan) return ''
      if (plan.price === null) return 'Custom'
      // `decimals` and `locale` already live on the Currency object — INR wants
      // 0 and en-IN grouping, so deriving them here would just duplicate that.
      const amount = plan.price * currency.rate
      return `${currency.symbol}${amount.toLocaleString(currency.locale, {
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
      })} /mo`
    }
    return cols.map(c => ({ id: c.id, label: c.label, price: priceOf(c.id) }))
  }, [audience, currency])

  useEffect(() => {
    getPlanPrices()
      .then(res => {
        if (res.source === 'dodo') {
          setLivePrices({ starter: res.starter, pro: res.pro, business: res.business })
        }
      })
      .catch(() => {
        /* graceful: keep static fallback */
      })
  }, [])

  // Amplitude: pricing_page_viewed. `geo_score` lives on the user (set during
  // audit_completed); this marketing-tier page can't read it.
  useEffect(() => {
    const activeOrg = useOrgStore.getState().activeOrg
    track('pricing_page_viewed', { domain: activeOrg?.url ?? undefined })

    // Drip: enrol authenticated visitors. Anonymous marketing traffic skips
    // this — the drip is for signed-in users who already have an audit.
    const email = session?.user?.email
    if (email) {
      const fullName = session.user.name ?? ''
      const firstName = fullName.trim().split(/\s+/)[0] ?? ''
      void pingPricingViewed({
        email,
        amplitude_user_id: session.user.id,
        first_name: firstName,
        domain: activeOrg?.url ?? undefined,
      }).catch(() => {
        /* swallow — analytics pings never break UX */
      })
    }
  }, [session?.user?.email, session?.user?.id, session?.user?.name])

  useEffect(() => {
    const email = session?.user?.email
    if (isPending || !email) {
      setCurrentPlanId(null)
      return
    }
    getSubscriptionStatus(email)
      .then(s => {
        // Default the toggle to the user's stored account type so an agency
        // lands on agency plans. An explicit ?audience= param wins — it is the
        // flow's declared intent and arrives synchronously.
        if (s.account_type && !explicitAudience) {
          setAudience(s.account_type)
        }
        if (s.is_active) {
          setCurrentPlanId(s.plan)
          // Preserve onboarding/setup flows: if the user landed here with a
          // returnTo, send them onward. Guarded with a session flag so we
          // never re-redirect to the same path twice in the same tab — that
          // prevented an /pricing ↔ /onboarding/company-info bounce loop for
          // paid users at their project limit.
          if (returnTo) {
            const flagKey = `signalor:pricing-bounce:${returnTo}`
            if (typeof window !== 'undefined' && sessionStorage.getItem(flagKey)) return
            try {
              sessionStorage.setItem(flagKey, '1')
            } catch {
              /* ignore */
            }
            router.replace(returnTo)
          }
        } else {
          setCurrentPlanId(null)
        }
      })
      .catch(() => setCurrentPlanId(null))
  }, [isPending, session?.user?.email, router, returnTo, explicitAudience])

  const handleSubscribe = useCallback(
    async (planId: string) => {
      if (loadingPlan) return
      // Unmapped cards (Enterprise, Agency workspace) are a sales conversation.
      const checkoutKey = CHECKOUT_PLAN_KEY[planId]
      if (!checkoutKey) {
        router.push(routes.contactSales)
        return
      }
      // Amplitude: checkout_started — fire before the auth gate / API call so
      // we capture intent even if checkout creation fails or the user is
      // redirected to sign-in first.
      const activeOrg = useOrgStore.getState().activeOrg
      track('checkout_started', { plan: planId, domain: activeOrg?.url ?? undefined })
      // Drip: permanently exclude this user from the drip sequence.
      if (session?.user?.email) {
        void pingCheckoutStarted(session.user.email).catch(() => {})
      }
      if (!session) {
        router.push(`${routes.signIn}?returnTo=${encodeURIComponent('/pricing')}`)
        return
      }
      setLoadingPlan(planId)
      setError('')
      setCheckoutDodoMode(null)
      try {
        if (returnTo) {
          try {
            sessionStorage.setItem(POST_CHECKOUT_REDIRECT_KEY, returnTo)
          } catch {
            /* ignore */
          }
        }
        // Read partner code from localStorage (set by AffiliateCapture when
        // the visitor lands with ?aff=CODE). Expired codes are ignored so a
        // stale cookie never silently applies a discount.
        let partnerCode: string | undefined
        try {
          const code = localStorage.getItem('signalor.partner.code')
          const expires = Number(localStorage.getItem('signalor.partner.expiresAt') || 0)
          if (code && (!expires || expires > Date.now())) partnerCode = code
        } catch {
          /* ignore */
        }
        const { checkout_url } = await createCheckoutSession(session.user.email, checkoutKey, {
          country: detectedCountry ?? undefined,
          currency: currency.code,
          partnerCode,
        })
        window.location.href = checkout_url
      } catch (e) {
        if (e instanceof CheckoutSessionError) {
          setError(e.message)
          setCheckoutDodoMode(e.dodoMode ?? null)
        } else {
          setError(e instanceof Error ? e.message : 'Failed to start checkout. Please try again.')
          setCheckoutDodoMode(null)
        }
        setLoadingPlan(null)
      }
    },
    [session, loadingPlan, router, returnTo, detectedCountry, currency.code],
  )

  // Direct checkout from the landing pricing teaser: a ?checkout=<planId> param
  // auto-starts checkout for that plan. Anonymous visitors are sent to sign-in
  // with a returnTo that preserves the intent so checkout resumes afterwards.
  const autoCheckoutDone = useRef(false)
  useEffect(() => {
    if (autoCheckoutDone.current || isPending) return
    const planParam = searchParams.get('checkout')
    // Only auto-start checkout for genuinely checkout-able plans. A stale
    // ?checkout=business / agency / enterprise link must no-op, not 400.
    if (!planParam || !CHECKOUTABLE.has(planParam)) return
    autoCheckoutDone.current = true
    if (!session) {
      const back = `/pricing?checkout=${planParam}`
      router.push(`${routes.signIn}?returnTo=${encodeURIComponent(back)}`)
      return
    }
    void handleSubscribe(planParam)
  }, [isPending, session, searchParams, router, handleSubscribe])

  if (isPending) {
    return <PricingPageFallback />
  }

  const showBackLink = !!(returnTo || session)
  const backHref = returnTo || routes.dashboard
  const backLabel = returnTo ? 'Back to setup' : 'Back to dashboard'

  return (
    <MarketingShell>
      <PricingHero
        showBackLink={showBackLink}
        backHref={backHref}
        backLabel={backLabel}
        onboardingBanner={returnTo === routes.onboardingCompanyInfo}
      />

      <section id="plans" className="scroll-mt-20" aria-labelledby="pricing-plans-heading">
        <div className="border-border mx-auto max-w-6xl border-x">
          {/* Controls only — no second heading. The hero already makes this
              exact pitch, and repeating it here ("Pick the plan that matches
              your team") left a screen-height gap between two paragraphs
              saying the same thing. */}
          <div className="border-border relative border-t px-6 py-8">
            <GridCornerHandles top />
            <h2 id="pricing-plans-heading" className="sr-only">
              Choose a plan
            </h2>
            <p className="sr-only">
              SignalorAI measures whether ChatGPT, Gemini, Perplexity, Claude, and other AI engines
              recommend your brand. The Self-Serve Brand plan covers one brand with ten tracked
              prompts you run yourself. The Managed Growth Brand plan covers one brand with
              twenty-five tracked prompts plus daily agency-style support from our team. Enterprise
              adds custom prompt volume, multiple domains, and dedicated support. Agencies manage
              multiple client brands from one workspace with a fifteen percent discount on every
              brand onboarded.
            </p>

            <div className="flex flex-col items-center gap-3">
              <AudienceSwitch
                audience={audience}
                onSelect={value => {
                  setAudience(value)
                  // Let a signed-in user switch their account type straight from
                  // the pricing toggle (best-effort; UI updates regardless).
                  const email = session?.user?.email
                  if (email) {
                    persistAccountType(email, value).catch(() => {})
                  }
                }}
              />
              <CurrencyToggle currency={currency} onSelect={selectCurrency} />
            </div>
          </div>

          <div>
            {error ? (
              <div className="mx-auto mb-10 max-w-lg space-y-2">
                <p className="border-destructive/25 bg-destructive/5 text-destructive rounded-none border px-4 py-3 text-center text-sm">
                  {error}
                </p>
                {checkoutDodoMode === 'test' && (
                  <p className="text-muted-foreground px-2 text-center text-xs leading-relaxed">
                    Test mode: in <code className="text-[11px]">ranking-be/.env</code> use{' '}
                    <code className="text-[11px]">DODO_LIVE_MODE=false</code>, a secret key from the
                    Dodo dashboard <strong>Test</strong> tab, and a product id created in Test (live
                    product ids will not work).
                  </p>
                )}
                {checkoutDodoMode === 'live' && (
                  <p className="text-muted-foreground px-2 text-center text-xs leading-relaxed">
                    Live mode: use <code className="text-[11px]">DODO_LIVE_MODE=true</code>, a{' '}
                    <strong>Live</strong> secret key, and a Live product id in{' '}
                    <code className="text-[11px]">DODO_PRODUCT_ID_STARTER</code>.
                  </p>
                )}
              </div>
            ) : null}

            <div className="border-border relative border-t">
              <GridCornerHandles top />
              <GridHandle className="-top-[3.5px] left-1/4 -ml-[3.5px] hidden xl:block" />
              <GridHandle className="-top-[3.5px] left-2/4 -ml-[3.5px] hidden xl:block" />
              <GridHandle className="-top-[3.5px] left-3/4 -ml-[3.5px] hidden xl:block" />
              <div className="divide-border grid grid-cols-1 max-xl:divide-y md:grid-cols-2 md:max-xl:divide-x xl:grid-cols-4 xl:grid-rows-[auto_auto_auto_1fr] xl:divide-x">
                {(audience === 'individual' ? PLANS : AGENCY_PLANS).map(plan => {
                  const isContact = plan.cta === 'contact'
                  const isCustom = plan.price === null
                  const isLoading = loadingPlan === plan.id
                  // "Current plan" only makes sense for the checkout-able tiers.
                  // Agency per-brand cards map onto starter/pro, so an agency
                  // that bought one sees it marked current on their tab too.
                  const checkoutKey = CHECKOUT_PLAN_KEY[plan.id]
                  const isCurrent = !isContact && currentPlanId === (checkoutKey ?? plan.id)

                  // Live Dodo prices are fetched for the INDIVIDUAL products
                  // only. Agency per-brand cards sell the agency-priced product
                  // (backend swaps it in at checkout), so they keep their static
                  // GBP price rather than borrowing the Individual live amount.
                  const live = livePrices?.[plan.id] ?? null
                  let displaySymbol: string
                  let displayCurrencyCode: string | null
                  let numericAmount: number
                  let isApprox: boolean

                  if (live) {
                    const userCcy = currencyReady ? currency.code : null
                    const localized =
                      userCcy && live.prices_by_currency
                        ? live.prices_by_currency[userCcy]
                        : undefined
                    const useLocal =
                      localized !== undefined && userCcy && userCcy !== live.currency.toUpperCase()
                    const ccy = useLocal && userCcy ? userCcy : live.currency.toUpperCase()
                    const amount = useLocal && localized !== undefined ? localized : live.amount
                    numericAmount = amount
                    displaySymbol = CURRENCY_SYMBOLS[ccy] ?? ccy + ' '
                    displayCurrencyCode = ccy
                    isApprox = !!useLocal
                  } else {
                    displaySymbol = currency.symbol
                    displayCurrencyCode = currency.code
                    numericAmount = isCustom ? 0 : (plan.price as number) * currency.rate
                    isApprox = !isCustom && currencyReady && currency.code !== 'GBP'
                  }

                  const priceDecimals =
                    displayCurrencyCode === 'INR' || displayCurrencyCode === 'JPY' ? 0 : 2

                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      displaySymbol={displaySymbol}
                      displayCurrencyCode={displayCurrencyCode}
                      formattedAmount={numericAmount.toLocaleString(currency.locale, {
                        minimumFractionDigits: priceDecimals,
                        maximumFractionDigits: priceDecimals,
                      })}
                      priceResolved={!!live || currencyReady}
                      isApprox={isApprox}
                      liveCurrency={live?.currency}
                      isCustom={isCustom}
                      isContact={isContact}
                      isCurrent={isCurrent}
                      isLoading={isLoading}
                      anyLoading={!!loadingPlan}
                      signedIn={!!session}
                      onSelect={() => {
                        if (isContact) {
                          router.push(routes.contactSales)
                          return
                        }
                        handleSubscribe(plan.id)
                      }}
                    />
                  )
                })}
              </div>
            </div>

            <p className="text-muted-foreground mt-10 text-center text-[11px] font-medium">
              {audience === 'agency'
                ? 'Agency account is billed monthly; client brands are billed per brand with a 15% discount. Talk to us to get set up.'
                : currency.code === 'GBP'
                  ? 'All prices in GBP. Secure payment. Cancel anytime.'
                  : `Prices shown in ${currency.code}, indicative only. Charged in GBP at checkout. Cancel anytime.`}
            </p>
          </div>
        </div>
      </section>

      {/* The comparison the homepage has always linked to. The cards answer
          "which plan"; this answers "what exactly do I get", which is the
          question that closes a considered purchase. */}
      <section aria-labelledby="plan-comparison-heading" className="scroll-mt-20">
        <div className="border-border mx-auto max-w-6xl border-x">
          <div className="border-border relative border-t px-6 py-14 sm:py-16">
            <GridCornerHandles top />
            <HomeSectionHeader
              eyebrow="Compare"
              headingId="plan-comparison-heading"
              title="Full plan comparison"
              description="Every capability, side by side. A dash means the plan does not include it."
            />
          </div>
          <div className="border-border bg-card border-t">
            <PlanComparisonTable
              columns={comparisonColumns}
              sections={audience === 'agency' ? AGENCY_COMPARISON : BRAND_COMPARISON}
              featuredId={audience === 'agency' ? 'agency-account' : 'pro'}
            />
          </div>
        </div>
      </section>

      <PricingStatsSection />

      <div className="border-border mx-auto max-w-6xl border-x">
        <LandingFaq
          sectionId="pricing-faq"
          headingId="pricing-faq-heading"
          heading="Pricing FAQs"
          description="Plans, billing, and what happens after you subscribe."
          items={[...PRICING_FAQ_ITEMS]}
        />
      </div>
    </MarketingShell>
  )
}

/**
 * Server-rendered SEO content (a real <h1> + plan copy) so the page isn't
 * empty / H1-less in the no-JS HTML. The interactive pricing UI below is
 * Suspense-gated by `useSearchParams`, so it only streams in with JS — leaving
 * crawlers (and the Semrush "no H1 / little content" checks) with nothing.
 * Rendered visually hidden to avoid duplicating the styled hero heading.
 */
function PricingSeoContent() {
  return (
    <div className="sr-only">
      <h1>SignalorAI pricing: plans for AI search and GEO visibility</h1>
      <p>
        Compare SignalorAI plans and pick the tier that matches your brand. Every plan shows whether
        AI engines like ChatGPT, Gemini, Perplexity, and Claude recommend your brand, ignore it, or
        recommend your competitors — with prompt ranking, competitor visibility tracking, and
        improvement guidance. Individual brands start with Self-Serve, upgrade to Managed Growth for
        hands-on support, or contact sales for Enterprise. Agencies manage multiple client brands
        from one workspace.
      </p>
      {[...PLANS, ...AGENCY_PLANS].map(plan => (
        <section key={plan.id}>
          <h2>
            {plan.label}: {plan.price === null ? 'Custom pricing' : `${plan.price.toFixed(2)} GBP`}{' '}
            {plan.period}
            {plan.priceNote ? ` (${plan.priceNote})` : ''}
          </h2>
          <p>{plan.description}</p>
          <ul>
            {plan.features.map(f => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default function PricingPage() {
  return (
    <>
      <PricingSeoContent />
      <Suspense fallback={<PricingPageFallback />}>
        <PricingPageInner />
      </Suspense>
    </>
  )
}
