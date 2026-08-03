'use client'

/** Week windows for the citation trend. 0 means "every week on record". */
export const TREND_RANGES = [
  { label: '4w', weeks: 4 },
  { label: '12w', weeks: 12 },
  { label: 'All', weeks: 0 },
] as const

export type TrendRange = (typeof TREND_RANGES)[number]['weeks']

interface TrendRangeTabsProps {
  value: TrendRange
  onChange: (weeks: TrendRange) => void
  /** Windows wider than the data are disabled rather than silently identical. */
  available: number
}

/**
 * Segmented track control — this is a filter over the plot, so it deliberately
 * uses the dashboard's filter affordance, not the brand-soft nav chips.
 */
export function TrendRangeTabs({ value, onChange, available }: TrendRangeTabsProps): JSX.Element {
  return (
    <div className="inline-flex gap-0.5 rounded-md bg-[var(--cat-track)] p-[3px]">
      {TREND_RANGES.map(range => {
        const on = range.weeks === value
        const disabled = range.weeks > 0 && available <= range.weeks && available > 0
        return (
          <button
            key={range.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(range.weeks)}
            className={`rounded-sm px-2.5 py-1 text-[11px] transition-colors disabled:opacity-40 ${
              on
                ? 'bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-sm'
                : 'font-medium text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
            }`}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}
