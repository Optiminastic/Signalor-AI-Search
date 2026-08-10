import { useViewTransitionNavigate } from '@/components/providers/view-transition-provider'
import { TransitionLink } from '@/components/TransitionLink'
import { useTaskFix } from '@/features/catalyst/components/autofix/AutoFixContext'
import { AutoFixControl } from '@/features/catalyst/components/autofix/AutoFixControl'
import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import { PriorityTag } from '@/features/catalyst/components/tasks/PriorityTag'
import { SignalTag } from '@/features/catalyst/components/tasks/SignalTag'
import { TaskGlyph } from '@/features/catalyst/components/tasks/TaskGlyph'
import { PROMPT_PARAM } from '@/features/catalyst/constants'
import { sourceOf } from '@/features/catalyst/task-source'
import type { TaskItem } from '@/features/catalyst/tasks-data'
import { useBrandPath } from '@/hooks/useBrandPath'
import { MessageSquare } from '@/lib/icons'

export interface TaskRowProps {
  row: TaskItem
  onToggleDone: (taskId: number, done: boolean) => void
  busy: boolean
}

/** Tiny provenance mark: which system measured this task into existence. */
function SourceMark({ source }: { source: string }): JSX.Element | null {
  const meta = sourceOf(source)
  if (!meta) return null
  return (
    <span
      title={`Source: ${meta.label}`}
      className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--cat-ink-3)]"
    >
      <BrandFavicon domain={meta.domain} name={meta.label} color="#e04a3d" size={12} />
      {meta.label}
    </span>
  )
}

/**
 * Task name with the attribution sentence beneath it — the row now answers
 * "what does completing this do?" instead of repeating the raw finding text.
 */
function TaskNameCell({ row }: Pick<TaskRowProps, 'row'>): JSX.Element {
  return (
    <span className="flex min-w-0 items-start gap-2.5" style={{ paddingLeft: row.child ? 22 : 0 }}>
      <span className="mt-0.5 shrink-0">
        <TaskGlyph title={row.name} description={row.description} signal={row.signal} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          title={row.name}
          className={`truncate ${row.child ? 'text-[var(--cat-ink)]' : 'font-semibold text-[var(--cat-ink)]'}`}
        >
          {row.name}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            title={row.effect || row.description}
            className="truncate text-[12px] text-[var(--cat-ink-3)]"
          >
            {row.effect || row.description}
          </span>
          {row.source && (
            <>
              <span className="shrink-0 text-[var(--cat-border)]">·</span>
              <SourceMark source={row.source} />
            </>
          )}
        </span>
      </span>
    </span>
  )
}

/** Auto-fix when the agent can do it, otherwise say plainly that it is manual. */
function ActionCell({
  recommendationId,
  findingCode,
}: {
  recommendationId?: number
  findingCode?: string
}): JSX.Element {
  const fix = useTaskFix(recommendationId, findingCode)
  if (!fix) {
    return (
      <span className="inline-flex items-center rounded-md border border-[var(--cat-border)] px-2 py-1 text-[12px] font-medium text-[var(--cat-ink-2)]">
        Manual
      </span>
    )
  }
  return <AutoFixControl state={fix.state} onFix={fix.onFix} />
}

/** Jump straight to the tracked prompt a task targets.
 *
 * Only rendered for prompt-derived tasks — every other row would point nowhere.
 * Stops propagation so it opens the prompt rather than the task detail page. */
function PromptLink({ promptTrackId }: { promptTrackId: number }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <TransitionLink
      href={`${brandPath('prompt-tracker')}?${PROMPT_PARAM}=${promptTrackId}`}
      onClick={e => e.stopPropagation()}
      className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--cat-ink-2)] underline-offset-2 hover:text-[var(--cat-ink)] hover:underline"
    >
      <MessageSquare size={12} />
      View prompt
    </TransitionLink>
  )
}

/** One task row. Clicking anywhere opens the task's detail page; the inline
 * auto-fix control stops the click from navigating. */
export function TaskRow({ row }: TaskRowProps): JSX.Element {
  const brandPath = useBrandPath()
  const navigate = useViewTransitionNavigate()
  return (
    <tr
      onClick={() => navigate(brandPath(`tasks/${row.taskId}`))}
      className="cursor-pointer border-t border-[var(--cat-border-soft)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      <td className="px-3 py-2.5">
        <TaskNameCell row={row} />
      </td>
      <td className="px-3 py-2.5">
        <SignalTag signal={row.signal} effect={row.effect} />
        {row.promptTrackId !== undefined && <PromptLink promptTrackId={row.promptTrackId} />}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <PriorityTag priority={row.priority} />
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
        <ActionCell recommendationId={row.recommendationId} findingCode={row.findingCode} />
      </td>
    </tr>
  )
}
