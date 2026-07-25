'use client'

import { useState } from 'react'

import { TransitionLink } from '@/components/TransitionLink'
import { ActionCtaButton } from '@/features/catalyst/components/agent/ActionCtaButton'
import { PriorityPill } from '@/features/catalyst/components/agent/PriorityPill'
import { TaskTypeIcon } from '@/features/catalyst/components/agent/TaskTypeIcon'
import { TASK_TYPE_LABEL, taskTypeOf } from '@/features/catalyst/tasks-data'
import { useAgentPlan } from '@/hooks/useAgentPlan'
import { useBrandPath } from '@/hooks/useBrandPath'
import type { AgentAction, AgentPlan } from '@/lib/api/agent'
import { ChevronDown, Sparkles, Timer } from '@/lib/icons'

const MAX_SUGGESTIONS = 4
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function rankSort(a: AgentAction, b: AgentAction): number {
  if (a.is_top_fix !== b.is_top_fix) return a.is_top_fix ? -1 : 1
  const ra = a.rank > 0 ? a.rank : 9999
  const rb = b.rank > 0 ? b.rank : 9999
  if (ra !== rb) return ra - rb
  return (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
}

/** Top high-priority tasks + how many high-priority ones exist for the header. */
function selectSuggestions(plan: AgentPlan): { count: number; cards: AgentAction[] } {
  const sorted = plan.groups
    .flatMap(g => g.actions)
    .slice()
    .sort(rankSort)
  const highPri = sorted.filter(
    a => a.is_top_fix || a.priority === 'critical' || a.priority === 'high',
  )
  const base = highPri.length > 0 ? highPri : sorted
  return { count: base.length, cards: base.slice(0, MAX_SUGGESTIONS) }
}

interface PanelHeaderProps {
  count: number
  tasksHref: string
  open: boolean
  onToggle: () => void
}

function PanelHeader({ count, tasksHref, open, onToggle }: PanelHeaderProps): JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[rgba(224,74,61,0.1)] text-[#e04a3d] ring-1 ring-[rgba(224,74,61,0.16)] ring-inset">
        <Sparkles size={14} strokeWidth={2.2} />
      </span>
      <p className="min-w-0 truncate text-[13px] text-[var(--cat-ink-2)]">
        <span className="font-semibold text-[var(--cat-ink)]">Priority Actions</span>
        <span className="mx-2 text-[var(--cat-ink-3)]">·</span>
        There {count === 1 ? 'is 1 suggestion' : `are ${count} suggestions`} to lift your AI
        visibility.
        <TransitionLink
          href={tasksHref}
          className="ml-2 font-medium text-[#e04a3d] underline decoration-[rgba(224,74,61,0.35)] underline-offset-2 transition-colors hover:decoration-[#e04a3d]"
        >
          View all tasks
        </TransitionLink>
      </p>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? 'Collapse suggestions' : 'Expand suggestions'}
        className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        />
      </button>
    </div>
  )
}

function CardTopRow({ action }: { action: AgentAction }): JSX.Element {
  const type = taskTypeOf(action)
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        title={TASK_TYPE_LABEL[type]}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)] transition-colors group-hover:bg-[rgba(224,74,61,0.1)] group-hover:text-[#e04a3d]"
      >
        <TaskTypeIcon type={type} size={15} />
      </span>
      <PriorityPill priority={action.priority} />
    </div>
  )
}

function SuggestionCard({ action }: { action: AgentAction }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] bg-[var(--cat-card)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--cat-ink-3)] hover:shadow-[0_4px_14px_rgba(16,24,40,0.08)]">
      <CardTopRow action={action} />
      <TransitionLink
        href={brandPath(`tasks/${action.action_id}`)}
        className="line-clamp-2 text-[13px] leading-snug font-semibold text-[var(--cat-ink)] decoration-[var(--cat-ink-3)] underline-offset-2 group-hover:underline after:absolute after:inset-0"
      >
        {action.title}
      </TransitionLink>
      {action.description && (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--cat-ink-3)]">
          {action.description}
        </p>
      )}
      <div className="relative mt-auto flex items-center justify-between gap-2 border-t border-[var(--cat-border-soft)] pt-2.5">
        <ActionCtaButton action={action} quiet />
        {action.effort.minutes > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--cat-ink-3)] tabular-nums">
            <Timer size={12} /> {action.effort.minutes}m
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Dashboard "Priority Actions" — surfaces the brand's top high-priority tasks as
 * actionable suggestion cards, straight from the Growth Agent plan. Hidden until
 * a completed analysis exists and there is at least one open task.
 */
export function AiAssistantPanel(): JSX.Element | null {
  const { plan, isLoading, noRun } = useAgentPlan()
  const brandPath = useBrandPath()
  const [open, setOpen] = useState(true)

  if (noRun || isLoading || !plan) return null
  const { count, cards } = selectSuggestions(plan)
  if (cards.length === 0) return null

  return (
    <section className="col-span-full rounded-md border border-[rgba(224,74,61,0.16)] bg-[rgba(224,74,61,0.04)] p-3">
      <PanelHeader
        count={count}
        tasksHref={brandPath('tasks')}
        open={open}
        onToggle={() => setOpen(o => !o)}
      />
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(action => (
              <SuggestionCard key={action.action_id} action={action} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
