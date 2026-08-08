import { WARMUP, WARMUP_DAYS } from '@/features/catalyst/reddit-data'
import { ArrowRight } from '@/lib/icons'

export function TodayTaskCard(): JSX.Element {
  const today = WARMUP_DAYS[WARMUP.currentDay - 1]
  return (
    <div className="cat-rise flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-[#e04a3d] uppercase">
          Today’s task
        </p>
        <p className="mt-1.5 text-[14px] font-medium text-[var(--cat-ink)]">{today?.task}</p>
        <p className="mt-1 text-[12px] text-[var(--cat-ink-3)]">
          Day {WARMUP.currentDay} of {WARMUP.total}
        </p>
      </div>
      <button
        type="button"
        className="auth-cta-btn inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-[13px] font-semibold text-white"
      >
        Start task
        <ArrowRight size={15} strokeWidth={2.2} />
      </button>
    </div>
  )
}
