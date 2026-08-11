'use client'

import { useParams } from 'next/navigation'

import { TransitionLink } from '@/components/TransitionLink'
import { ActionCtaButton } from '@/features/catalyst/components/agent/ActionCtaButton'
import { DataState } from '@/features/catalyst/components/DataState'
import { TaskAutoFixPanel } from '@/features/catalyst/components/tasks/detail/TaskAutoFixPanel'
import { TaskDescriptionBody } from '@/features/catalyst/components/tasks/detail/TaskDescriptionCard'
import { TaskDetailInfo } from '@/features/catalyst/components/tasks/detail/TaskDetailInfo'
import { TaskDetailStats } from '@/features/catalyst/components/tasks/detail/TaskDetailStats'
import { TaskFixGuideBody } from '@/features/catalyst/components/tasks/detail/TaskFixGuide'
import { TaskSection } from '@/features/catalyst/components/tasks/detail/TaskSection'
import { TaskShareMenu } from '@/features/catalyst/components/tasks/detail/TaskShareMenu'
import { TaskSourceCard } from '@/features/catalyst/components/tasks/detail/TaskSourceCard'
import { TaskStepsBody } from '@/features/catalyst/components/tasks/detail/TaskStepsCard'
import { TaskGlyph } from '@/features/catalyst/components/tasks/TaskGlyph'
import { LOGO_SIZE } from '@/features/catalyst/constants'
import { formatStatus } from '@/features/catalyst/tasks-data'
import { useAgentMutations } from '@/hooks/useAgentPlan'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useTaskAutoFix, type TaskAutoFix } from '@/hooks/useTaskAutoFix'
import { useTaskDetail, type TaskDetail } from '@/hooks/useTaskDetail'
import { useTaskVerify } from '@/hooks/useTaskVerify'
import { BadgeCheck, Check, ChevronLeft, Loader2 } from '@/lib/icons'

function BackLink(): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <TransitionLink
      href={brandPath('tasks')}
      className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
    >
      <ChevronLeft size={14} />
      All actions
    </TransitionLink>
  )
}

const STATUS_PILL: Record<string, string> = {
  completed: 'bg-[#E7F7EF] text-[#1e8a5c]',
  verified: 'bg-[#E7F7EF] text-[#1e8a5c]',
  in_progress: 'bg-[rgba(246,185,59,0.15)] text-[#a06f0a]',
}

function StatusPill({ status }: { status: string }): JSX.Element {
  const tone = STATUS_PILL[status] ?? 'bg-[var(--cat-hover)] text-[var(--cat-ink-2)]'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}
    >
      {formatStatus(status)}
    </span>
  )
}

function VerifyButton({ task }: { task: TaskDetail }): JSX.Element | null {
  const { verify, verifying } = useTaskVerify(task.id)
  if (task.status === 'verified') return null
  return (
    <button
      type="button"
      disabled={verifying}
      onClick={verify}
      title="Re-crawl your live site and confirm this fix is actually done"
      className="bg-background-primary-default hover:bg-background-secondary-default inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors disabled:opacity-60"
    >
      {verifying ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
      {verifying ? 'Verifying…' : 'Verify'}
    </button>
  )
}

function CompleteButton({ task }: { task: TaskDetail }): JSX.Element | null {
  const { setStatus, busyActionId } = useAgentMutations()
  if (task.status === 'completed' || task.status === 'verified') return null
  const busy = busyActionId === task.id
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => setStatus(task.id, 'completed')}
      className="bg-background-primary-default hover:bg-background-secondary-default inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors disabled:opacity-60"
    >
      <Check size={13} />
      Mark complete
    </button>
  )
}

function DetailHeader({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <BackLink />
        <h1 className="mt-1 flex items-center gap-2.5 text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
          <TaskGlyph title={task.title} description={task.description} size={LOGO_SIZE.header} />
          {task.isTopFix && <span className="shrink-0 text-[#e04a3d]">★</span>}
          <span className="truncate">{task.title}</span>
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusPill status={task.status} />
        <TaskShareMenu task={task} />
        {task.planAction && <ActionCtaButton action={task.planAction} />}
        <VerifyButton task={task} />
        <CompleteButton task={task} />
      </div>
    </div>
  )
}

/** Sentry-issue body: collapsible detail on the left, the auto-fix panel (Seer
 *  position) and rich metadata on the right sidebar. */
function TaskBody({ task, fix }: { task: TaskDetail; fix: TaskAutoFix }): JSX.Element {
  return (
    <div className="cat-stagger flex flex-col gap-2">
      <TaskDetailStats task={task} />
      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-3">
        <div className="flex flex-col gap-2 xl:col-span-2">
          {/* Provenance first: the measurement is what makes the instruction credible. */}
          <TaskSourceCard task={task} />
          <TaskSection title="Why this matters">
            <TaskDescriptionBody task={task} />
          </TaskSection>
          {(task.steps.length > 0 || task.actionGuide) && (
            <TaskSection title="How to fix it">
              {task.steps.length > 0 ? (
                <TaskStepsBody taskId={task.id} steps={task.steps} />
              ) : (
                <TaskFixGuideBody guide={task.actionGuide} />
              )}
            </TaskSection>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <TaskAutoFixPanel fix={fix} />
          <TaskDetailInfo task={task} />
        </div>
      </div>
    </div>
  )
}

/** Full-page view of a single task, routed at /dashboard/[slug]/tasks/[taskId]. */
export function TaskDetailView(): JSX.Element {
  const params = useParams()
  const taskId = Number(typeof params?.taskId === 'string' ? params.taskId : NaN)
  const { task, isLoading, isError, notFound } = useTaskDetail(taskId)
  const fix = useTaskAutoFix(task)

  return (
    <>
      {/* z-20: the cat-rise transform creates a stacking context, so without an
          explicit z-index the header's dropdowns paint under the body cards. */}
      <div className="cat-rise relative z-20 shrink-0 border-b border-[var(--cat-border)] pb-4">
        {task ? <DetailHeader task={task} /> : <BackLink />}
      </div>
      <div className="-mx-3 mt-3 min-h-0 flex-1 overflow-y-auto px-3">
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
