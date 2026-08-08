import { WARMUP_DAYS } from '@/features/catalyst/reddit-data'
import type { RoadDay } from '@/features/catalyst/reddit-data'
import { Check, Lock } from '@/lib/icons'

const NODE =
  'relative z-10 grid h-7 w-7 place-items-center rounded-full ring-4 ring-[var(--cat-card)]'
const STEM = 'h-3 w-[2px] shrink-0 bg-[var(--cat-border-soft)]'

function Node({ status }: { status: RoadDay['status'] }): JSX.Element {
  if (status === 'done') {
    return (
      <span className={`${NODE} text-white`} style={{ background: '#2FBE7E' }}>
        <Check size={14} strokeWidth={3} />
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className={NODE} style={{ background: '#e04a3d' }}>
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    )
  }
  return (
    <span
      className={`${NODE} border border-[var(--cat-border)] bg-[var(--cat-hover)] text-[var(--cat-ink-3)]`}
    >
      <Lock size={12} />
    </span>
  )
}

function DayCard({ day }: { day: RoadDay }): JSX.Element {
  const active = day.status === 'active'
  return (
    <div
      className={`w-[162px] rounded-md border p-2.5 ${active ? 'border-[#e04a3d]' : 'border-[var(--cat-border)] bg-[var(--cat-card)]'}`}
      style={active ? { background: 'rgba(224,74,61,0.08)' } : undefined}
    >
      <p
        className={`text-[10px] font-semibold tracking-wider uppercase ${active ? 'text-[#e04a3d]' : 'text-[var(--cat-ink-3)]'}`}
      >
        {active ? 'Today · ' : ''}Day {day.day}
      </p>
      <p
        className={`mt-1.5 text-[12px] leading-snug ${day.status === 'locked' ? 'text-[var(--cat-ink-3)]' : 'text-[var(--cat-ink)]'}`}
      >
        {day.task}
      </p>
    </div>
  )
}

function TimelineCol({ day, above }: { day: RoadDay; above: boolean }): JSX.Element {
  return (
    <div className="flex w-[174px] shrink-0 flex-col items-center">
      <div className="flex h-[128px] w-full flex-col items-center justify-end">
        {above && (
          <>
            <DayCard day={day} />
            <span className={STEM} />
          </>
        )}
      </div>
      <div className="relative flex h-8 w-full items-center justify-center">
        <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--cat-border-soft)]" />
        <Node status={day.status} />
      </div>
      <div className="flex h-[128px] w-full flex-col items-center justify-start">
        {!above && (
          <>
            <span className={STEM} />
            <DayCard day={day} />
          </>
        )}
      </div>
    </div>
  )
}

export function WarmupTimeline(): JSX.Element {
  return (
    <div className="rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <h3 className="text-[13px] font-semibold text-[var(--cat-ink)]">Your warmup plan</h3>
      <div className="mt-1 overflow-x-auto pb-2">
        <div className="flex min-w-max">
          {WARMUP_DAYS.map((day, i) => (
            <TimelineCol key={day.day} day={day} above={i % 2 === 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
