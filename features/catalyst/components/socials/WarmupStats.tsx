import { BarMeter } from '@/features/catalyst/components/visibility/BarMeter'
import { WARMUP } from '@/features/catalyst/reddit-data'

function Stat({
  eyebrow,
  value,
  sub,
}: {
  eyebrow: string
  value: string
  sub: string
}): JSX.Element {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        {eyebrow}
      </p>
      <p className="mt-1.5 text-[26px] leading-none font-bold tracking-tight text-[var(--cat-ink)]">
        {value}
      </p>
      <p className="mt-1.5 text-[12px] text-[var(--cat-ink-3)]">{sub}</p>
    </div>
  )
}

export function WarmupStats(): JSX.Element {
  const remaining = WARMUP.total - WARMUP.completed
  const pct = Math.round((WARMUP.completed / WARMUP.total) * 100)
  return (
    <div className="rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <Stat
          eyebrow="Days completed"
          value={`${WARMUP.completed}/${WARMUP.total}`}
          sub={`${remaining} days remaining`}
        />
        <Stat eyebrow="Ready to promote" value="In 20 days" sub={WARMUP.readyDate} />
      </div>
      <div className="mt-4 border-t border-[var(--cat-border-soft)] pt-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
            Overall progress
          </p>
          <span className="text-[13px] font-bold text-[#e04a3d] tabular-nums">{pct}%</span>
        </div>
        <BarMeter value={pct} color="#e04a3d" />
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
          <span>Day 1</span>
          <span>Day {WARMUP.total}</span>
        </div>
      </div>
    </div>
  )
}
