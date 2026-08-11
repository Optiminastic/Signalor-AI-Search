'use client'

import { useParams } from 'next/navigation'

import { TransitionLink } from '@/components/TransitionLink'
import { DataState } from '@/features/catalyst/components/DataState'
import { TaskDescriptionBody } from '@/features/catalyst/components/tasks/detail/TaskDescriptionCard'
import { TaskDetailHeader } from '@/features/catalyst/components/tasks/detail/TaskDetailHeader'
import { TaskFixGuideBody } from '@/features/catalyst/components/tasks/detail/TaskFixGuide'
import { TaskHighlights } from '@/features/catalyst/components/tasks/detail/TaskHighlights'
import { TaskSection } from '@/features/catalyst/components/tasks/detail/TaskSection'
import { TaskSidebar } from '@/features/catalyst/components/tasks/detail/TaskSidebar'
import { TaskStepsBody } from '@/features/catalyst/components/tasks/detail/TaskStepsCard'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useTaskAutoFix, type TaskAutoFix } from '@/hooks/useTaskAutoFix'
import { useTaskDetail, type TaskDetail } from '@/hooks/useTaskDetail'
import { ChevronLeft } from '@/lib/icons'

/** Back link for the states where there is no action to head. */
function BackToActions(): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <TransitionLink
      href={brandPath('actions')}
      className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
    >
      <ChevronLeft size={14} />
      All actions
    </TransitionLink>
  )
}

/** In-page nav. Earns its place because the sections are collapsible and long —
 *  it is a table of contents, not decoration. */
function JumpTo({ targets }: { targets: { id: string; label: string }[] }): JSX.Element {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--cat-ink-3)]">
      <span>Jump to:</span>
      {targets.map(t => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className="text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]"
        >
          {t.label}
        </a>
      ))}
    </p>
  )
}

/**
 * The body: evidence on the left, the agent and state on the right.
 *
 * Structured as an issue page because that is what an action is — one finding,
 * its evidence, and what to do about it. Facts first as a key/value grid you
 * look things up in, then the prose, then the steps. Nothing is boxed inside a
 * box: sections are separated by rules, so the page has one visual weight for
 * content and another for chrome instead of five nested card borders.
 */
function TaskBody({ task, fix }: { task: TaskDetail; fix: TaskAutoFix }): JSX.Element {
  const hasSteps = task.steps.length > 0 || Boolean(task.actionGuide)
  const targets = [
    { id: 'highlights', label: 'Highlights' },
    { id: 'why', label: 'Why this matters' },
    ...(hasSteps ? [{ id: 'fix', label: 'How to fix it' }] : []),
  ]

  return (
    <div className="cat-stagger grid grid-cols-1 items-start gap-x-8 gap-y-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-4">
        <JumpTo targets={targets} />
        <TaskSection id="highlights" title="Highlights">
          <TaskHighlights task={task} />
        </TaskSection>
        <TaskSection id="why" title="Why this matters">
          <TaskDescriptionBody task={task} />
        </TaskSection>
        {hasSteps && (
          <TaskSection id="fix" title={task.canAutoFix ? 'Or fix it yourself' : 'How to fix it'}>
            {task.steps.length > 0 ? (
              <TaskStepsBody taskId={task.id} steps={task.steps} />
            ) : (
              <TaskFixGuideBody guide={task.actionGuide} />
            )}
          </TaskSection>
        )}
      </div>
      <TaskSidebar task={task} fix={fix} />
    </div>
  )
}

/** Full-page view of one action, routed at /dashboard/[slug]/tasks/[taskId]. */
export function TaskDetailView(): JSX.Element {
  const params = useParams()
  const taskId = Number(typeof params?.taskId === 'string' ? params.taskId : NaN)
  const { task, isLoading, isError, notFound } = useTaskDetail(taskId)
  const fix = useTaskAutoFix(task)

  return (
    <>
      {/* z-20: the cat-rise transform creates a stacking context, so without an
          explicit z-index the header's dropdowns paint under the body cards. */}
      <div className="cat-rise relative z-20 shrink-0 border-b border-[var(--cat-border)] pb-3.5">
        {task ? <TaskDetailHeader task={task} /> : <BackToActions />}
      </div>
      <div className="-mx-3 mt-4 min-h-0 flex-1 overflow-y-auto px-3">
        <DataState
          isLoading={isLoading}
          isError={isError}
          isEmpty={notFound || !task}
          emptyTitle="Action not found"
          emptyHint="This action does not exist for your account. It may have been removed when the plan was refreshed."
        >
          {task && <TaskBody task={task} fix={fix} />}
        </DataState>
      </div>
    </>
  )
}
