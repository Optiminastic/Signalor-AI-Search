import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import type { GACountry } from '@/lib/api/integrations'

/** Sessions-by-country rows with a segmented share meter, sorted high to low. */
export function GaCountryList({ countries }: { countries: GACountry[] }): JSX.Element {
  const total = countries.reduce((sum, c) => sum + c.sessions, 0) || 1
  const top = [...countries].sort((a, b) => b.sessions - a.sessions).slice(0, 8)

  return (
    <div className="divide-y divide-[var(--cat-border-soft)]">
      {top.map(c => {
        const pct = Math.round((c.sessions / total) * 1000) / 10
        return (
          <div key={c.country_id || c.country} className="py-2">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[12.5px]">
              <span className="truncate font-medium text-[var(--cat-ink)]">{c.country}</span>
              <span className="shrink-0 text-[var(--cat-ink-2)] tabular-nums">
                {c.sessions.toLocaleString()} · {pct}%
              </span>
            </div>
            <TickBar value={pct} ticks={28} showValue={false} />
          </div>
        )
      })}
    </div>
  )
}
