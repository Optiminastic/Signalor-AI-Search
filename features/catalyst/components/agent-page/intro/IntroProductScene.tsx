import { SignalorMark } from '@/components/SignalorMark'

const TICKS = 20
const PLAN_ROWS = [
  { week: 'Week 1', task: 'Publish 5 answer-first pages', tag: 'Content' },
  { week: 'Week 2', task: 'Pitch the listicles AI cites', tag: 'Outreach' },
  { week: 'Week 3', task: 'Comparison pages for lost prompts', tag: 'Content' },
]

function VisibilityMeter(): JSX.Element {
  return (
    <div className="rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-content)] p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-[var(--cat-ink-2)]">AI visibility</span>
        <span className="text-[13px] font-semibold text-[var(--cat-ink)]">
          1% <span className="text-[var(--cat-ink-3)]">→</span>{' '}
          <span className="text-[#e04a3d]">11%</span>
        </span>
      </div>
      <div className="cat-intro-ticks mt-2 flex gap-[2px]" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, i) => (
          <span key={i} className="h-3.5 w-[3px] rounded-[1px] bg-[var(--cat-hover)]" />
        ))}
      </div>
    </div>
  )
}

function PlanRows(): JSX.Element {
  return (
    <ul className="cat-intro-rows mt-3 space-y-1.5">
      {PLAN_ROWS.map(row => (
        <li
          key={row.week}
          className="cat-intro-row flex items-center gap-2 rounded-lg border border-[var(--cat-card-border)] bg-[var(--cat-content)] px-2.5 py-2 text-[11px]"
        >
          <span className="font-semibold text-[var(--cat-ink)]">{row.week}</span>
          <span className="min-w-0 flex-1 truncate text-[var(--cat-ink-2)]">{row.task}</span>
          <span className="rounded-full bg-[#e04a3d]/10 px-1.5 py-px text-[10px] font-medium text-[#e04a3d]">
            {row.tag}
          </span>
        </li>
      ))}
    </ul>
  )
}

function RunPlanButton(): JSX.Element {
  return (
    <div className="relative mt-3 flex justify-end">
      <span className="relative">
        <span
          className="cat-intro-ripple absolute inset-0 rounded-md bg-[#e04a3d]/50"
          aria-hidden="true"
        />
        <span className="cat-intro-press relative inline-flex h-8 items-center rounded-md bg-[#e04a3d] px-3 text-[12px] font-semibold text-white shadow-[0_6px_18px_rgba(224,74,61,.35)]">
          Run plan
        </span>
      </span>
      <svg
        className="cat-intro-cursor absolute -right-3 -bottom-4 h-6 w-6 drop-shadow"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 3l14 7-6 2-2 6z" fill="var(--cat-ink)" stroke="white" strokeWidth="1.2" />
      </svg>
    </div>
  )
}

/** Scene 2 (1.7-3.7s): the agent's workspace glides in, in 3D, and a cursor clicks "Run plan". */
export function IntroProductScene(): JSX.Element {
  return (
    <div className="cat-intro-scene2 absolute inset-0 grid place-items-center">
      <div className="cat-intro-card cat-card-edge w-[min(480px,88vw)] rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-4 shadow-[0_30px_80px_rgba(224,74,61,.18)]">
        <div className="flex items-center gap-2">
          <SignalorMark className="h-5 w-5 text-[#e04a3d]" />
          <span className="text-[13px] font-semibold text-[var(--cat-ink)]">SignalorAI Agent</span>
          <span className="ml-auto rounded-full bg-[var(--cat-track)] px-1.5 py-px text-[10px] text-[var(--cat-ink-2)]">
            This month
          </span>
        </div>
        <div className="mt-3">
          <VisibilityMeter />
          <PlanRows />
          <RunPlanButton />
        </div>
      </div>
    </div>
  )
}
