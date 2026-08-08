'use client'

import {
  IconBinocularsFilled,
  IconSparklesFilled,
  IconSquareRoundedCheckFilled,
  type TablerIcon,
} from '@tabler/icons-react'
import { useSearchParams } from 'next/navigation'

import { TransitionLink } from '@/components/TransitionLink'
import { AgentSections } from '@/features/catalyst/components/agent/AgentSections'
import { CompetitorIntel } from '@/features/catalyst/components/agent/CompetitorIntel'
import { AnswerEngineInsights } from '@/features/catalyst/components/agent/insights/AnswerEngineInsights'
import { PlanProjection } from '@/features/catalyst/components/agent/PlanProjection'
import { RunPlanButton } from '@/features/catalyst/components/agent/RunPlanButton'
import { TasksView } from '@/features/catalyst/components/tasks/TasksView'
import { useAgentPlan } from '@/hooks/useAgentPlan'
import { useBrandPath } from '@/hooks/useBrandPath'

type TabKey = 'plan' | 'tasks' | 'intel'

const TABS: { key: TabKey; label: string; icon: TablerIcon }[] = [
  { key: 'plan', label: "Today's Plan", icon: IconSparklesFilled },
  { key: 'tasks', label: 'All Tasks', icon: IconSquareRoundedCheckFilled },
  { key: 'intel', label: 'Market Intel', icon: IconBinocularsFilled },
]

function NoRun(): JSX.Element {
  return (
    <div className="rounded-md border border-dashed border-[var(--cat-border)] bg-[var(--cat-card)] px-4 py-10 text-center">
      <p className="text-[14px] font-semibold text-[var(--cat-ink)]">No analysis yet</p>
      <p className="mt-1 text-[12px] text-[var(--cat-ink-3)]">
        Run an analysis on this brand to generate your daily action plan.
      </p>
    </div>
  )
}

/** Today's ranked plan: the numbers up top, the ranked task groups below. */
function PlanTab(): JSX.Element {
  const { plan, isLoading, isError, noRun } = useAgentPlan()
  if (noRun) return <NoRun />
  return (
    <div className="cat-stagger flex flex-col gap-3">
      <PlanProjection plan={plan} />
      <AgentSections plan={plan} isLoading={isLoading} isError={isError} />
    </div>
  )
}

function IntelTab(): JSX.Element {
  return (
    <div className="cat-stagger flex flex-col gap-4">
      <AnswerEngineInsights />
      <CompetitorIntel />
    </div>
  )
}

function TabBar({ current }: { current: TabKey }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--cat-border)]">
      {TABS.map(tab => {
        const on = tab.key === current
        return (
          <TransitionLink
            key={tab.key}
            href={`${brandPath('actions')}?tab=${tab.key}`}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
              on
                ? 'border-[#e04a3d] text-[var(--cat-ink)]'
                : 'border-transparent text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </TransitionLink>
        )
      })}
    </div>
  )
}

/**
 * Actions — the Growth Agent plan and the Tasks board on one surface:
 * "Today's Plan" (ranked, scored work), "All Tasks" (the full board with
 * assignment and auto-fix) and "Market Intel" (answer-engine + competitor
 * evidence behind the plan). Tab is linkable via `?tab=`.
 */
export function ActionsView(): JSX.Element {
  const params = useSearchParams()
  const raw = params.get('tab')
  const current: TabKey = raw === 'tasks' || raw === 'intel' ? raw : 'plan'

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 pb-3">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">Actions</h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            Today&apos;s ranked plan, every task, and the intel behind them
          </p>
        </div>
        {current === 'plan' && (
          <div className="ml-auto">
            <RunPlanButton />
          </div>
        )}
      </div>
      <TabBar current={current} />
      <div className="-mx-3 mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
        {current === 'plan' && <PlanTab />}
        {current === 'tasks' && <TasksView />}
        {current === 'intel' && <IntelTab />}
      </div>
    </>
  )
}
