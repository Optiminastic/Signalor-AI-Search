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
    /** Not sold yet — the CTA becomes an inert "Coming soon" control. */
    comingSoon?: boolean
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

/**
 * Price cell — the card's anchor figure. Symbol and amount read as one word
 * ("£79.99"), with the period as a muted suffix, so the eye lands on the number
 * before anything else. 32px at a tight track: large enough to anchor the card,
 * small enough that it doesn't shout over the plan name.
 */
function PriceCell(props: PlanCardProps): JSX.Element {
  const note = props.isCustom ? '' : priceNoteFor(props)
  return (
    // Top-aligned, not bottom: the figures must share a baseline across the
    // grid, and the shared row track is as tall as the one card that carries a
    // note. Bottom-aligning would drop the note-less prices to match it.
    <div className="mt-4 self-start">
      <p className="text-foreground flex items-baseline gap-1 text-[2rem] leading-none font-semibold tracking-[-0.03em]">
        {props.isCustom ? (
          'Custom'
        ) : (
          <>
            <span
              className={cn(
                'tabular-nums transition-opacity duration-300',
                !props.priceResolved && 'opacity-40',
              )}
            >
              {props.displaySymbol}
              {props.formattedAmount}
            </span>
            <span className="text-muted-foreground text-base font-normal tracking-normal">/mo</span>
          </>
        )}
      </p>
      {/* Rendered only when there is something to say. An always-present empty
          line pushed the rule ~16px further from every price than the reference,
          and the subgrid keeps the rules aligned without it. */}
      {note ? <p className="text-muted-foreground mt-2.5 text-xs">{note}</p> : null}
    </div>
  )
}

/**
 * One pricing tier.
 *
 * Laid out as a **subgrid** spanning five of the parent's rows — name, price,
 * description, CTA, features. Without it every row drifted: a label that wraps
 * to two lines pushed its price, button and feature list below its neighbours',
 * and a tier with no "approx." note sat higher still. Sharing the parent's row
 * tracks makes all cards line up whatever the copy does — including the hairline
 * above the description, which reads as one continuous rule across the grid.
 */
const BADGE_BASE =
  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase'

/** Precedence: what you have > what you cannot buy yet > what we promote. */
function PlanBadge({
  isCurrent,
  comingSoon,
  popular,
}: {
  isCurrent: boolean
  comingSoon?: boolean
  popular?: boolean
}): JSX.Element | null {
  if (isCurrent) {
    return <span className={`bg-success/10 text-success ${BADGE_BASE}`}>Current</span>
  }
  if (comingSoon) {
    return <span className={`bg-muted text-muted-foreground ${BADGE_BASE}`}>Coming soon</span>
  }
  if (popular) {
    return <span className={`bg-primary text-primary-foreground ${BADGE_BASE}`}>Popular</span>
  }
  return null
}

/** The plan's action. Extracted so PlanCard stays readable — the disabled
 *  state alone has four independent reasons to fire. */
function PlanCtaButton(
  props: PlanCardProps & { comingSoon: boolean; emphasised: boolean },
): JSX.Element {
  const { isCurrent, isLoading, isContact, anyLoading, onSelect, comingSoon, emphasised } = props
  const blocked = comingSoon || (anyLoading && !isContact) || isCurrent
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={blocked}
      className={cn(
        'mt-3 self-end disabled:cursor-not-allowed disabled:opacity-70',
        emphasised ? `${LANDING_PRIMARY_CTA_CLASS} w-full` : SECONDARY_CTA_CLASS,
        // After the variant so tailwind-merge keeps these: the card CTA is a
        // full-width, taller version of the shared button recipes.
        'h-11 w-full text-sm',
      )}
    >
      {isLoading ? (
        <SignalorLoader size="sm" />
      ) : (
        <>
          {comingSoon ? 'Coming soon' : ctaLabel(props)}
          {!isCurrent && !comingSoon && <ArrowRight className="h-3.5 w-3.5" aria-hidden />}
        </>
      )}
    </button>
  )
}

export function PlanCard(props: PlanCardProps): JSX.Element {
  const { plan, isCurrent, isContact } = props
  const comingSoon = !!plan.comingSoon
  // The filled CTA marks the card you can actually buy. Contact-sales and
  // not-yet-sellable tiers stay secondary, so every grid has exactly one
  // obvious action rather than a row of identical grey buttons.
  const emphasised = (plan.popular || !isContact) && !isCurrent && !comingSoon

  return (
    <div
      className={cn(
        // gap-0: the rhythm between blocks is deliberately uneven (16 / 20 / 12
        // / 16px), set by each block's own margin. A single uniform gap on every
        // row is the tell that makes a card look machine-assembled.
        'bg-card grid gap-0 p-6 sm:p-8 xl:row-span-5 xl:grid-rows-subgrid',
        comingSoon && 'opacity-70',
        isCurrent && 'ring-success/40 m-2 rounded-xl ring-1',
      )}
    >
      {/* Bottom-aligned so a label that wraps still meets the price row. */}
      <div className="flex items-start justify-between gap-2 self-end">
        <h3 className="text-foreground text-[17px] font-semibold tracking-[-0.01em]">
          {plan.label}
        </h3>
        <PlanBadge isCurrent={isCurrent} comingSoon={plan.comingSoon} popular={plan.popular} />
      </div>

      <PriceCell {...props} />

      {/* Stretched, not bottom-aligned: the hairline has to sit at the top of
          the shared row track in every card or the rule breaks across columns. */}
      <p className="border-border text-muted-foreground mt-5 border-t pt-5 text-[13px] leading-[1.55]">
        {plan.description}
      </p>

      <PlanCtaButton {...props} comingSoon={comingSoon} emphasised={emphasised} />

      <div className="mt-4">
        <p className="text-muted-foreground text-[13px]">{plan.featuresLead ?? 'This includes:'}</p>
        <ul className="mt-3.5 space-y-3">
          {plan.features.map(f => (
            <li
              key={f}
              className="text-foreground flex items-start gap-2.5 text-[13px] leading-[1.4] font-medium"
            >
              <Check className="text-muted-foreground mt-px h-4 w-4 shrink-0" aria-hidden />
              {f}
            </li>
          ))}
          {plan.comingSoonFeatures?.map(f => (
            <li
              key={f}
              className="text-muted-foreground flex items-start gap-2.5 text-[13px] leading-[1.4] font-medium"
            >
              <Clock className="mt-px h-4 w-4 shrink-0" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
