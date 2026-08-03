'use client'

import type { CurrencyCode, Currency } from '@/features/site/lib/hooks/use-currency'
import { cn } from '@/features/site/lib/utils'

// GBP-only while multi-currency display is parked (see use-currency.ts).
// Uncommenting these brings the toggle back on its own — it renders nothing
// while there is only one currency to choose from.
const OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'GBP', label: '£ GBP' },
  // { code: "INR", label: "₹ INR" },
  // { code: "USD", label: "$ USD" },
  // { code: "EUR", label: "€ EUR" },
]

export function CurrencyToggle({
  currency,
  onSelect,
  className,
}: {
  currency: Currency
  onSelect: (code: CurrencyCode) => void
  className?: string
}): JSX.Element | null {
  // A one-option switcher is just a dead button — hide it entirely.
  if (OPTIONS.length < 2) return null

  return (
    <div
      className={cn(
        'bg-muted/70 inline-flex items-center rounded-full border border-black/10 p-0.5',
        className,
      )}
      role="group"
      aria-label="Select display currency"
    >
      {OPTIONS.map(opt => (
        <button
          key={opt.code}
          type="button"
          onClick={() => onSelect(opt.code)}
          aria-pressed={currency.code === opt.code}
          className={cn(
            'rounded-full px-3.5 py-1 text-xs font-semibold transition-all',
            currency.code === opt.code
              ? 'text-foreground bg-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
