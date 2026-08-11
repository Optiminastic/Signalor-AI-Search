'use client'

import { useSearchParams } from 'next/navigation'

import {
  ActionFilters,
  type ActionFilter,
  type ActionFilterCount,
} from '@/features/catalyst/components/actions/ActionFilters'
import { AgentSections } from '@/features/catalyst/components/agent/AgentSections'
import { PlanProjection } from '@/features/catalyst/components/agent/PlanProjection'
import { RunPlanButton } from '@/features/catalyst/components/agent/RunPlanButton'
import { TasksView } from '@/features/catalyst/components/tasks/TasksView'
import { useActionCounts } from '@/hooks/useActionCounts'
import { useAgentPlan } from '@/hooks/useAgentPlan'
import { useBrandPath } from '@/hooks/useBrandPath'

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

/**
 * Today: the ranked, grouped plan.
 *
 * Deliberately not the flat table. The ranking and the pillar grouping are the
 * product's actual opinion about what to do first — that is what "today" means
 * here, and a plain list would throw it away.
 */
function TodayView(): JSX.Element {
  const { plan, isLoading, isError, noRun } = useAgentPlan()
  if (noRun) return <NoRun />
  return (
    <div className="cat-stagger flex flex-col gap-3">
      <PlanProjection plan={plan} />
      <AgentSections plan={plan} isLoading={isLoading} isError={isError} />
    </div>
  )
}

function isFilter(value: string | null): value is ActionFilter {
  return value === 'today' || value === 'backlog' || value === 'done' || value === 'all'
}

/**
 * Actions — one surface, one list, four filters.
 *
 * Previously three tabs: "Today's Plan", "All actions" and "Market Intel". The
 * first two were the same objects under different filters (the plan tab printed
 * a Backlog count for a backlog that lived on the other tab), and Market Intel
 * was evidence to read rather than work to start, so it now sits under Signals
 * beside the measurements it is made of.
 *
 * The filter is in the URL (`?view=`) so a filtered board stays shareable.
 */
export function ActionsView(): JSX.Element {
  const params = useSearchParams()
  const raw = params.get('view')
  const current: ActionFilter = isFilter(raw) ? raw : 'today'
  const brandPath = useBrandPath()
  const counts = useActionCounts()

  const filters: ActionFilterCount[] = [
    { key: 'today', label: 'Today', count: counts.today },
    { key: 'backlog', label: 'Backlog', count: counts.backlog },
    { key: 'done', label: 'Done', count: counts.done },
    { key: 'all', label: 'All', count: counts.all },
  ]

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 pb-3">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">Actions</h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            What to do next for this brand, ranked by impact
          </p>
        </div>
        {current === 'today' && (
          <div className="ml-auto">
            <RunPlanButton />
          </div>
        )}
      </div>
      <ActionFilters current={current} counts={filters} basePath={brandPath('actions')} />
      <div className="-mx-3 mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
        {current === 'today' ? <TodayView /> : <TasksView filter={current} />}
      </div>
    </>
  )
}
