'use client'

import { useState } from 'react'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import type { AgentProgram } from '@/lib/api/agent-mode'
import { ChevronDown } from '@/lib/icons'

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

function ProgramDetails({ program }: { program: AgentProgram }): JSX.Element {
  const goalPercent = Math.round((program.upliftTargetPoints / UPLIFT_SCALE_POINTS) * 100)
  return (
    <div className="space-y-4 px-4 pt-1 pb-4">
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
    </div>
  )
}

/**
 * Small collapsible card for the brand's program: status and goal at a glance;
 * the toggle expands it to the month-loop stages and the goal meter.
 */
export function AgentProgramCard({ program }: { program: AgentProgram }): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <section
      className="cat-agent-step w-full max-w-md overflow-hidden rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-content)] shadow-[0_1px_3px_rgba(16,24,40,.08)]"
      style={{ animationDelay: '0.15s' }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
      >
        <span className="cat-agent-pulse h-1.5 w-1.5 shrink-0 rounded-full bg-[#e04a3d]" />
        <span className="text-[13px] font-medium text-[var(--cat-ink)]">
          {STATUS_LABEL[program.status]}
        </span>
        <span className="ml-auto text-[12px] text-[var(--cat-ink-3)]">
          Goal +{program.upliftTargetPoints} pts
        </span>
        <ChevronDown
          size={15}
          className={`text-[var(--cat-ink-3)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0">
          <ProgramDetails program={program} />
        </div>
      </div>
    </section>
  )
}
