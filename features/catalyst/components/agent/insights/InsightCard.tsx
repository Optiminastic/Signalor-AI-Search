import type { ReactNode } from 'react'

interface InsightCardProps {
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
}

/** Tight, titled analytics card — the shared shell of the Answer Engine Insights grid. */
export function InsightCard({ title, subtitle, right, children }: InsightCardProps): JSX.Element {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[var(--cat-ink)]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-[var(--cat-ink-3)]">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </div>
  )
}
