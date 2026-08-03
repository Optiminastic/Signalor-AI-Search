'use client'

import { cn } from '@/features/site/lib/utils'

/** Which pricing model the visitor is looking at. */
export type PricingAudience = 'individual' | 'agency'

const OPTIONS: { value: PricingAudience; label: string; sub: string }[] = [
  { value: 'individual', label: 'For a brand', sub: 'One brand, run by you or with us.' },
  { value: 'agency', label: 'For an agency', sub: 'Multiple client brands, 15% off every one.' },
]

interface AudienceSwitchProps {
  audience: PricingAudience
  onSelect: (value: PricingAudience) => void
  className?: string
}

/**
 * The brand-versus-agency mode switch.
 *
 * Deliberately larger than the currency pills next to it. These two states show
 * entirely different plans at different prices, so the control has to read as a
 * mode switch rather than a filter — the previous small pill sat beside the
 * currency selector and was routinely missed, which meant agencies priced
 * themselves against single-brand plans.
 *
 * Each option carries a one-line description so the choice can be made without
 * flipping between both states to work out the difference.
 */
export function AudienceSwitch({
  audience,
  onSelect,
  className,
}: AudienceSwitchProps): JSX.Element {
  const activeOption = OPTIONS.find(o => o.value === audience) ?? OPTIONS[0]

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
        'bg-muted/70 ring-border grid grid-cols-2 gap-1 rounded-full p-1 ring-1 sm:inline-grid',
      )}
      role="group"
      aria-label="Choose pricing for a single brand or an agency"
    >
      {OPTIONS.map(opt => {
        const active = audience === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={active}
            className={cn(
              'focus-visible:ring-primary/40 rounded-full px-4 py-1.5 text-center text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none',
              active
                ? 'bg-card text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        )
      })}
      </div>
      {/* The consequence of the choice, stated once — it does not fit inside a
          pill, and two paragraphs of it would out-shout the plans below. */}
      <p className="text-muted-foreground text-[12px]" aria-live="polite">
        {activeOption.sub}
      </p>
    </div>
  )
}
