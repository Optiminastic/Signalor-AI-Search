import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import type { AgentProgram } from '@/lib/api/agent-mode'

const STAGES = ['Position', 'Plan', 'Execute', 'Track'] as const
/** Max uplift goal the meter is scaled against (percentage points). */
const UPLIFT_SCALE_POINTS = 30

const STAGE_FOR_STATUS: Record<AgentProgram['status'], number> = {
  onboarding: 0,
  active: 2,
  paused: 2,
  stopped: 3,
}

const STATUS_LABEL: Record<AgentProgram['status'], string> = {
  onboarding: 'Mapping your position',
  active: 'Working autonomously',
  paused: 'Paused',
  stopped: 'Stopped',
}

function barClass(index: number, current: number): string {
  if (index < current) return 'bg-[#e04a3d]'
  if (index === current) return 'cat-agent-pulse bg-[#e04a3d]'
  return 'bg-[var(--cat-hover)]'
}

function StagePipeline({ current }: { current: number }): JSX.Element {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STAGES.map((stage, i) => (
        <li key={stage} className="flex flex-col gap-1.5">
          <span className={`h-1 rounded-full ${barClass(i, current)}`} />
          <span
            className={`text-[11px] font-medium ${i <= current ? 'text-[var(--cat-ink)]' : 'text-[var(--cat-ink-3)]'}`}
          >
            {stage}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** The brand's program at a glance: stage of the month loop and the uplift goal. */
export function AgentProgramCard({ program }: { program: AgentProgram }): JSX.Element {
  const goalPercent = Math.round((program.upliftTargetPoints / UPLIFT_SCALE_POINTS) * 100)
  return (
    <section className="cat-agent-step space-y-4" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
          Program
        </p>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--cat-ink-2)]">
          <span className="cat-agent-pulse h-1.5 w-1.5 rounded-full bg-[#e04a3d]" />
          {STATUS_LABEL[program.status]}
        </span>
      </div>
      <StagePipeline current={STAGE_FOR_STATUS[program.status]} />
      <div>
        <p className="mb-1.5 text-[12px] text-[var(--cat-ink-2)]">
          Monthly goal:{' '}
          <span className="font-semibold text-[var(--cat-ink)]">
            +{program.upliftTargetPoints} pts
          </span>{' '}
          AI visibility
        </p>
        <TickBar value={Math.min(100, goalPercent)} showValue={false} />
      </div>
    </section>
  )
}
