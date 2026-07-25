import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import type { GaTrafficSource } from '@/lib/api/integrations'

/** Sessions-by-channel (source / medium) rows with a segmented share meter. */
export function GaTrafficSourcesList({ sources }: { sources: GaTrafficSource[] }): JSX.Element {
  const total = sources.reduce((sum, s) => sum + s.sessions, 0) || 1
  const top = [...sources].sort((a, b) => b.sessions - a.sessions).slice(0, 8)

  return (
    <div className="divide-y divide-[var(--cat-border-soft)]">
      {top.map((s, i) => {
        const pct = Math.round((s.sessions / total) * 1000) / 10
        const label = s.medium ? `${s.source} / ${s.medium}` : s.source || 'Direct'
        return (
          <div key={`${s.source}-${s.medium}-${i}`} className="py-2">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[12.5px]">
              <span className="truncate font-medium text-[var(--cat-ink)]">{label}</span>
              <span className="shrink-0 text-[var(--cat-ink-2)] tabular-nums">
                {s.sessions.toLocaleString()} · {pct}%
              </span>
            </div>
            <TickBar value={pct} ticks={28} showValue={false} />
          </div>
        )
      })}
    </div>
  )
}
