import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Blocks } from '@/lib/icons'

interface IntegrationsSummaryProps {
  connected: number
  total: number
}

function Stat({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="flex flex-col">
      <span className="text-[22px] font-bold tracking-tight text-[var(--cat-ink)] tabular-nums">
        {value}
      </span>
      <span className="text-[11px] font-medium tracking-wide text-[var(--cat-ink-3)] uppercase">
        {label}
      </span>
    </div>
  )
}

export function IntegrationsSummary({ connected, total }: IntegrationsSummaryProps): JSX.Element {
  const pct = total > 0 ? Math.round((connected / total) * 100) : 0
  return (
    <section className="cat-rise mb-4 rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-3.5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(224,74,61,0.1)] text-[#e04a3d]">
            <Blocks size={17} />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-[var(--cat-ink)]">Connect your stack</p>
            <p className="text-[12px] text-[var(--cat-ink-3)]">
              Power GEO analysis and auto-fixes across your tools
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Stat label="Connected" value={connected} />
          <span className="h-8 w-px bg-[var(--cat-border-soft)]" />
          <Stat label="Available" value={total - connected} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-[var(--cat-border-soft)] pt-3">
        <span className="shrink-0 text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
          Coverage
        </span>
        <TickBar value={pct} ticks={28} />
      </div>
    </section>
  )
}
