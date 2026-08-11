'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { ActionCtaButton } from '@/features/catalyst/components/agent/ActionCtaButton'
import { TaskShareMenu } from '@/features/catalyst/components/tasks/detail/TaskShareMenu'
import { TaskGlyph } from '@/features/catalyst/components/tasks/TaskGlyph'
import { formatEffort, formatStatus } from '@/features/catalyst/tasks-data'
import { useAgentMutations } from '@/hooks/useAgentPlan'
import { useBrandPath } from '@/hooks/useBrandPath'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { useTaskVerify } from '@/hooks/useTaskVerify'
import { BadgeCheck, Check, Loader2 } from '@/lib/icons'

const SEVERITY: Record<string, string> = {
  critical: '#E5484D',
  high: '#E5484D',
  medium: '#F6B93B',
  low: '#2FBE7E',
}

/* Where the action stands, as a dot tone: open work is neutral, work in
   flight is amber, done states are green. Mirrors how an issue tracker
   colours "New" so the state reads before the word does. */
const STATUS_DOT: Record<string, string> = {
  pending: 'var(--cat-ink-3)',
  open: 'var(--cat-ink-3)',
  in_progress: '#F6B93B',
  completed: '#2FBE7E',
  verified: '#1e8a5c',
  dismissed: 'var(--cat-ink-3)',
}

const SECONDARY =
  'inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[12.5px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-[var(--cat-hover)] disabled:opacity-60'

function capitalize(word: string): string {
  return word ? word[0].toUpperCase() + word.slice(1) : word
}

/** Breadcrumb: where this sits, and its short id. */
function Breadcrumb({ task }: { task: TaskDetail }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <nav className="flex items-center gap-2 text-[13px] text-[var(--cat-ink-2)]">
      <TransitionLink href={brandPath('actions')} className="hover:text-[var(--cat-ink)]">
        Actions
      </TransitionLink>
      <span className="text-[var(--cat-ink-3)]">/</span>
      <span className="flex items-center gap-1.5">
        <TaskGlyph title={task.title} description={task.description} size={14} />
        <span className="font-medium text-[var(--cat-ink)]">
          {task.findingCode || `ACTION-${task.id}`}
        </span>
      </span>
    </nav>
  )
}

/** The two numbers you weigh before starting: how urgent, how much work. */
function HeaderStats({ task }: { task: TaskDetail }): JSX.Element | null {
  const effort = formatEffort(task.effort)
  const stats = [
    { label: 'Priority', value: capitalize(task.priority) },
    // formatEffort falls back to a dash placeholder. A dash presented as a
    // headline number reads as broken data, so an unknown effort is not shown.
    { label: 'Effort', value: effort === '—' ? '' : capitalize(effort) },
  ].filter(stat => stat.value)
  if (stats.length === 0) return null
  return (
    <div className="flex shrink-0 items-start gap-7">
      {stats.map(stat => (
        <div key={stat.label} className="text-right">
          <div className="text-[12.5px] text-[var(--cat-ink-2)] underline decoration-[var(--cat-border)] decoration-dotted underline-offset-4">
            {stat.label}
          </div>
          <div className="mt-1.5 text-[20px] leading-none font-semibold text-[var(--cat-ink)]">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
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
      className={SECONDARY}
    >
      {verifying ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
      {verifying ? 'Verifying…' : 'Verify'}
    </button>
  )
}

function CompleteButton({ task }: { task: TaskDetail }): JSX.Element | null {
  const { setStatus, busyActionId } = useAgentMutations()
  if (task.status === 'completed' || task.status === 'verified') return null
  return (
    <button
      type="button"
      disabled={busyActionId === task.id}
      onClick={() => setStatus(task.id, 'completed')}
      className={SECONDARY}
    >
      <Check size={13} />
      Mark complete
    </button>
  )
}

/** Title, the one-line reason behind a severity bar, then status and location. */
function Headline({ task }: { task: TaskDetail }): JSX.Element {
  const page = task.affectedPages[0]
  return (
    <div className="min-w-0 flex-1">
      <h1 className="text-[22px] leading-tight font-bold tracking-tight text-balance text-[var(--cat-ink)]">
        {task.isTopFix && (
          <span className="mr-1.5 text-[#e04a3d]" title="Top fix for today">
            ★
          </span>
        )}
        {task.title}
      </h1>
      {task.why && (
        <p
          className="mt-1.5 border-l-2 pl-2.5 text-[13.5px] leading-snug text-[var(--cat-ink-2)]"
          style={{ borderColor: SEVERITY[task.priority] ?? 'var(--cat-border)' }}
        >
          {task.why}
        </p>
      )}
      <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--cat-ink-3)]">
        <span className="flex items-center gap-1.5 font-medium text-[var(--cat-ink-2)]">
          <span
            aria-hidden
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: STATUS_DOT[task.status] ?? 'var(--cat-ink-3)' }}
          />
          {formatStatus(task.status)}
        </span>
        {page && (
          <>
            <span>|</span>
            <span className="truncate font-mono">{page.replace(/^https?:\/\//, '')}</span>
          </>
        )}
      </p>
    </div>
  )
}

/**
 * The masthead, in the issue-page idiom.
 *
 * Reads top-down as identity → what happened → what you can do: breadcrumb and
 * short id, the finding as the headline, the detail beneath it behind a
 * severity bar, then a status/where line, then the controls on their own row.
 *
 * The severity bar is the only place colour encodes urgency, so the brand red
 * stays reserved for the one action worth taking. The title wraps rather than
 * truncating — an action is identified by its whole sentence.
 */
export function TaskDetailHeader({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      <Breadcrumb task={task} />

      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <Headline task={task} />
        <HeaderStats task={task} />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {task.planAction && <ActionCtaButton action={task.planAction} />}
        <VerifyButton task={task} />
        <CompleteButton task={task} />
        <TaskShareMenu task={task} />
        <span className="ml-auto flex items-center gap-2 text-[12.5px] text-[var(--cat-ink-3)]">
          Assignee
          <span className="rounded-md border border-[var(--cat-border)] px-2 py-1 text-[var(--cat-ink-2)]">
            {task.assigneeEmail || 'Unassigned'}
          </span>
        </span>
      </div>
    </div>
  )
}
