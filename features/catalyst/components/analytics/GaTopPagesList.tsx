import type { GaTopPage } from '@/lib/api/integrations'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** Top pages by sessions, with bounce rate and avg. duration per page. */
export function GaTopPagesList({ pages }: { pages: GaTopPage[] }): JSX.Element {
  const top = [...pages].sort((a, b) => b.sessions - a.sessions).slice(0, 10)

  return (
    <div className="divide-y divide-[var(--cat-border-soft)]">
      {top.map((p, i) => (
        <div
          key={p.path || i}
          className="flex items-center justify-between gap-3 py-2 text-[12.5px]"
        >
          <span className="truncate font-medium text-[var(--cat-ink)]">{p.path || '/'}</span>
          <span className="shrink-0 text-[12px] text-[var(--cat-ink-3)] tabular-nums">
            {p.sessions.toLocaleString()} sess · {Math.round(p.bounce_rate * 100)}% bounce ·{' '}
            {formatDuration(p.avg_duration)}
          </span>
        </div>
      ))}
    </div>
  )
}
