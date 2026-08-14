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
  /** Weeks of history on record. A window must be narrower than this to appear. */
  available: number
}

/**
 * Segmented track control — this is a filter over the plot, so it deliberately
 * uses the dashboard's filter affordance, not the brand-soft nav chips.
 *
 * A window the history cannot fill is dropped, not rendered disabled. Under four
 * weeks of data every window was wider than the data, so the control showed
 * three greyed buttons that could never respond — a dead control reads as a
 * broken one. With nothing left to choose between (only "All" survives) the
 * control hides entirely rather than offering a single fixed option.
 */
export function TrendRangeTabs({
  value,
  onChange,
  available,
}: TrendRangeTabsProps): JSX.Element | null {
  const offered = TREND_RANGES.filter(range => range.weeks === 0 || range.weeks < available)
  if (offered.length < 2) return null
  return (
    <div className="inline-flex gap-0.5 rounded-md bg-[var(--cat-track)] p-[3px]">
      {offered.map(range => {
        const on = range.weeks === value
        return (
          <button
            key={range.label}
            type="button"
            onClick={() => onChange(range.weeks)}
            className={`rounded-sm px-2.5 py-1 text-[11px] transition-colors ${
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
