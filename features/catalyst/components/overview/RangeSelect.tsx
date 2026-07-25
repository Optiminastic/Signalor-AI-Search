'use client'

interface RangeSelectProps {
  value: number | undefined
  onChange: (days: number | undefined) => void
}

/**
 * Analytics date-range selector. "Last 30 days" maps to `undefined` (the fast
 * cached snapshot); 7 / 90 trigger a live fetch for that window.
 */
export function RangeSelect({ value, onChange }: RangeSelectProps): JSX.Element {
  return (
    <select
      aria-label="Date range"
      value={value ?? 30}
      onChange={e => {
        const n = Number(e.target.value)
        onChange(n === 30 ? undefined : n)
      }}
      className="h-8 shrink-0 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-2 text-[12px] font-medium text-[var(--cat-ink-2)] outline-none"
    >
      <option value={7}>Last 7 days</option>
      <option value={30}>Last 30 days</option>
      <option value={90}>Last 90 days</option>
    </select>
  )
}
