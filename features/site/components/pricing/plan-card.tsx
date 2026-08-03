'use client'

import { ArrowRight, Check, Clock } from '@/features/site/components/icons'
import { LANDING_PRIMARY_CTA_CLASS } from '@/features/site/components/landing/constants'
import { SignalorLoader } from '@/features/site/components/ui/signalor-loader'
import { cn } from '@/features/site/lib/utils'

/** Secondary CTA — the same recipe the landing page's non-popular cards use. */
const SECONDARY_CTA_CLASS =
  'bg-card text-foreground ring-border hover:bg-muted/60 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md px-4 text-[13px] font-semibold shadow-sm ring-1 shadow-black/5 transition-colors'

export interface PlanCardProps {
  /** The plan being rendered. Typed structurally so the page keeps PlanConfig. */
  plan: {
    id: string
    label: string
    price: number | null
    priceNote?: string
    description: string
    popular?: boolean
    featuresLead?: string
    features: string[]
    comingSoonFeatures?: string[]
    ctaLabel?: string
  }
  /** Currency symbol and code, already resolved for display by the page. */
  displaySymbol: string
  displayCurrencyCode: string | null
  /** Pre-formatted amount, grouped and rounded for the active currency. */
  formattedAmount: string
  /** False until a live or converted price is available — dims the figure. */
  priceResolved: boolean
  /** True when the shown amount is a conversion, not the billed amount. */
  isApprox: boolean
  /** Live Dodo currency, when a live price was used. */
  liveCurrency?: string
  isCustom: boolean
  isContact: boolean
  isCurrent: boolean
  isLoading: boolean
  /** Any plan mid-checkout — disables the other buttons. */
  anyLoading: boolean
  signedIn: boolean
  onSelect: () => void
}

/** The "approx." qualifier, or '' when there is nothing to qualify. */
function priceNoteFor(props: PlanCardProps): string {
  const { plan, displayCurrencyCode, liveCurrency, isApprox } = props
  // Zero converts to zero in every currency, so an "approx." note on the free
  // tier is a rounding disclaimer for a number that cannot be wrong.
  let note = ''
  if (plan.price !== 0) {
    if (liveCurrency && isApprox) note = `approx. — billed in ${liveCurrency.toUpperCase()}`
    else if (isApprox && displayCurrencyCode) note = `approx. in ${displayCurrencyCode}`
  }
  return [plan.priceNote, note].filter(Boolean).join(' · ')
}

/** What the button says, in priority order. */
function ctaLabel(props: PlanCardProps): string {
  if (props.isCurrent) return 'Current plan'
  if (props.isContact) return props.plan.ctaLabel ?? 'Contact sales'
  return props.plan.ctaLabel ?? (props.signedIn ? 'Subscribe now' : 'Get started')
}

/** Price cell — kept separate so the card body stays inside the 40-line limit. */
function PriceCell(props: PlanCardProps): JSX.Element {
  if (props.isCustom) {
    return (
      <div className="self-end">
        <p className="text-foreground text-3xl font-semibold tracking-tight">Custom</p>
        <p className="text-muted-foreground mt-0.5 text-xs font-medium">
          Tailored to your prompt &amp; domain needs
        </p>
      </div>
    )
  }
  return (
    <div className="self-end">
      <p className="flex items-start">
        <span className="text-foreground mt-0.5 text-base font-semibold">
          {props.displaySymbol}
        </span>
        <span
          className={cn(
            'text-foreground text-3xl font-semibold tracking-tight tabular-nums transition-opacity duration-300',
            !props.priceResolved && 'opacity-40',
          )}
        >
          {props.formattedAmount}
        </span>
        <span className="text-muted-foreground mt-3 ml-1.5 text-xs font-medium">/ month</span>
      </p>
      {/* Height reserved even when empty, so the CTA row cannot drift between
          a tier that carries an "approx." note and one that does not. */}
      <p className="text-muted-foreground mt-0.5 min-h-4 text-xs font-medium">
        {priceNoteFor(props)}
      </p>
    </div>
  )
}

/**
 * One pricing tier.
 *
 * Laid out as a **subgrid** spanning four of the parent's rows — header, price,
 * CTA, features. Without it every row drifted: "Managed Growth Brand" wraps to
 * two lines, which pushed its price, button and feature list below its
 * neighbours', and a tier with no "approx." note sat higher still. Sharing the
 * parent's row tracks makes all four cards line up whatever the copy does,
 * which is how the for-brands and for-agencies cards already work.
 */
export function PlanCard(props: PlanCardProps): JSX.Element {
  const { plan, isCurrent, isLoading, isContact, anyLoading, onSelect } = props
  const emphasised = plan.popular && !isCurrent

  return (
    <div
      className={cn(
        'bg-card grid gap-6 p-6 xl:row-span-4 xl:grid-rows-subgrid',
        isCurrent && 'ring-success/40 m-2 rounded-xl ring-1',
        emphasised && 'ring-primary/50 m-2 rounded-xl shadow-sm ring-1 shadow-black/5',
      )}
    >
      {/* Bottom-aligned so a one-line description still meets the price row. */}
      <div className="self-end">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground text-base font-semibold tracking-tight">{plan.label}</h3>
          {isCurrent ? (
            <span className="bg-success/10 text-success shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              Current
            </span>
          ) : plan.popular ? (
            <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              Popular
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
          {plan.description}
        </p>
      </div>

      <PriceCell {...props} />

      <button
        type="button"
        onClick={onSelect}
        disabled={(anyLoading && !isContact) || isCurrent}
        className={cn(
          'self-end disabled:cursor-not-allowed disabled:opacity-70',
          emphasised ? `${LANDING_PRIMARY_CTA_CLASS} w-full` : SECONDARY_CTA_CLASS,
        )}
      >
        {isLoading ? (
          <SignalorLoader size="sm" />
        ) : (
          <>
            {ctaLabel(props)}
            {!isCurrent && <ArrowRight className="h-3.5 w-3.5" aria-hidden />}
          </>
        )}
      </button>

      <ul className="border-border space-y-2.5 border-t pt-5">
        {plan.featuresLead ? (
          <li className="text-foreground text-[13px] font-semibold">{plan.featuresLead}</li>
        ) : null}
        {plan.features.map(f => (
          <li
            key={f}
            className="text-foreground/90 flex items-start gap-2 text-[13px] leading-snug"
          >
            <Check className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {f}
          </li>
        ))}
        {plan.comingSoonFeatures?.map(f => (
          <li
            key={f}
            className="text-muted-foreground flex items-start gap-2 text-[13px] leading-snug"
          >
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
