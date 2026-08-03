'use client'

import { cn } from '@/features/site/lib/utils'

const TICKS = 22

interface UsageMeterProps {
  label: string
  used: number
  /** Plan cap; 0 or less renders as unlimited. */
  cap: number
  /** Overrides the "used / cap" value text (e.g. "42% used"). */
  valueText?: string
  hint?: string
}

/** Segmented tick meter (DESIGN.md §0.4) for one usage quota. */
export function UsageMeter({ label, used, cap, valueText, hint }: UsageMeterProps): JSX.Element {
  const unlimited = cap <= 0
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / cap) * 100))
  const filled = Math.round((pct / 100) * TICKS)
  const atLimit = !unlimited && used >= cap

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-foreground text-sm">{label}</p>
        <p
          className={cn(
            'text-xs font-semibold tabular-nums',
            atLimit ? 'text-destructive' : 'text-foreground',
          )}
        >
          {valueText ?? (unlimited ? `${used} / Unlimited` : `${used} / ${cap}`)}
        </p>
      </div>
      <div className="mt-1.5 flex items-center gap-[2px]">
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-3.5 w-[3px] rounded-[1px]',
              i < filled ? 'bg-primary' : 'bg-neutral-200',
            )}
          />
        ))}
      </div>
      {hint && <p className="text-muted-foreground mt-1 text-[11px]">{hint}</p>}
    </div>
  )
}
