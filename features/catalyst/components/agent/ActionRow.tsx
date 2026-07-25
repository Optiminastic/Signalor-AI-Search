'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { ActionCtaButton } from '@/features/catalyst/components/agent/ActionCtaButton'
import { PriorityPill } from '@/features/catalyst/components/agent/PriorityPill'
import { TaskTypeIcon } from '@/features/catalyst/components/agent/TaskTypeIcon'
import { formatEffort, TASK_TYPE_LABEL, taskTypeOf } from '@/features/catalyst/tasks-data'
import { useBrandPath } from '@/hooks/useBrandPath'
import type { AgentAction } from '@/lib/api/agent'

/** One plan task. The whole row links to the task's detail page (stretched
 * title link); the CTA sits above the overlay and keeps its own click. */
export function ActionRow({ action }: { action: AgentAction }): JSX.Element {
  const type = taskTypeOf(action)
  const brandPath = useBrandPath()
  return (
    <div className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--cat-hover)]">
      <span
        title={TASK_TYPE_LABEL[type]}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)] group-hover:bg-[var(--cat-card)]"
      >
        <TaskTypeIcon type={type} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--cat-ink)]">
          {action.is_top_fix && <span className="mr-1.5 text-[#e04a3d]">★</span>}
          <TransitionLink
            href={brandPath(`tasks/${action.action_id}`)}
            className="decoration-[var(--cat-ink-3)] underline-offset-2 group-hover:underline after:absolute after:inset-0"
          >
            {action.title}
          </TransitionLink>
        </p>
        {action.description && (
          <p className="mt-0.5 truncate text-[11px] text-[var(--cat-ink-3)]">
            {action.description}
          </p>
        )}
      </div>
      <div className="flex w-[68px] shrink-0 justify-end">
        <PriorityPill priority={action.priority} />
      </div>
      <span className="hidden w-[56px] shrink-0 text-right text-[11px] text-[var(--cat-ink-3)] lg:block">
        {formatEffort(action.effort)}
      </span>
      <div className="relative flex w-[104px] shrink-0 items-center justify-end">
        <ActionCtaButton action={action} />
      </div>
    </div>
  )
}
