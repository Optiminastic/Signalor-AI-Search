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
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(224,74,61,0.12)] text-[#e04a3d] ring-1 ring-[rgba(224,74,61,0.16)] ring-inset">
        <Sparkles size={16} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-[var(--cat-ink)]">
            Priority Actions
          </span>
          <span className="rounded-full bg-[rgba(224,74,61,0.12)] px-1.5 py-px text-[10px] font-semibold text-[#e04a3d] tabular-nums">
            {count}
          </span>
        </div>
        <p className="truncate text-[11.5px] text-[var(--cat-ink-3)]">
          Quick wins to lift your AI visibility
        </p>
      </div>
      <TransitionLink
        href={tasksHref}
        className="hidden shrink-0 text-[12px] font-medium text-[#e04a3d] transition-colors hover:text-[#c53f34] sm:block"
      >
        View all tasks
      </TransitionLink>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? 'Collapse suggestions' : 'Expand suggestions'}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        />
      </button>
    </div>
  )
}

/** A polished suggestion card: a bare type icon and priority pill up top, the
 *  title, then a CTA + effort footer. The white top-line (cat-card-edge) and a
 *  soft hover-lift give it the same finish as the rest of the dashboard cards. */
function SuggestionCard({ action }: { action: AgentAction }): JSX.Element {
  const brandPath = useBrandPath()
  const type = taskTypeOf(action)
  return (
    <div className="cat-card-edge group relative flex flex-col gap-2.5 rounded-xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--cat-ink-3)]">
      <div className="flex items-center justify-between gap-2">
        <span title={TASK_TYPE_LABEL[type]} className="shrink-0 text-[var(--cat-ink-3)]">
          <TaskTypeIcon type={type} size={16} />
        </span>
        <PriorityPill priority={action.priority} />
      </div>
      <TransitionLink
        href={brandPath(`tasks/${action.action_id}`)}
        className="line-clamp-2 text-[13px] leading-snug font-semibold text-[var(--cat-ink)] group-hover:underline after:absolute after:inset-0"
      >
        {action.title}
      </TransitionLink>
      <div className="relative mt-auto flex items-center justify-between gap-2 pt-1">
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
    <section className="col-span-full rounded-2xl border border-[rgba(224,74,61,0.16)] bg-[rgba(224,74,61,0.04)] p-3.5">
      <PanelHeader
        count={count}
        tasksHref={brandPath('tasks')}
        open={open}
        onToggle={() => setOpen(o => !o)}
      />
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="-mx-3 min-h-0 overflow-hidden px-3 pb-1">
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(action => (
              <SuggestionCard key={action.action_id} action={action} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
