import {
  canResolve,
  formatWhen,
  kindLabel,
  stateMeta,
  type DecisionNotice,
} from '@/features/catalyst/agent-approvals'
import { ActionContentView } from '@/features/catalyst/components/agent-page/approvals/ActionContentView'
import { ActionNotice } from '@/features/catalyst/components/agent-page/approvals/ActionNotice'
import { ActionStateBadge } from '@/features/catalyst/components/agent-page/approvals/ActionStateBadge'
import { MUTED_TEXT } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { DecisionHistory } from '@/features/catalyst/components/agent-page/approvals/DecisionHistory'
import { DraftControls } from '@/features/catalyst/components/agent-page/approvals/DraftControls'
import { ResolveBar } from '@/features/catalyst/components/agent-page/approvals/ResolveBar'
import { YELLOW } from '@/features/catalyst/constants'
import type { AgentActionDetail, DecisionVerb, Resolution } from '@/lib/api/agent-mode-approvals'
import { ArrowLeft, Loader2 } from '@/lib/icons'

export interface ActionReviewViewProps {
  review: {
    action: AgentActionDetail | null
    isLoading: boolean
    loadError: string | null
    notice: DecisionNotice | null
    deciding: boolean
    refreshing: boolean
    /** Why the last edit was refused, shown in the editor. */
    editError?: string | null
  }
  onBack: () => void
  onDecide: (verb: DecisionVerb, reason?: string) => void
  onResolve: (resolution: Resolution, reason?: string) => void
  onEdit: (fields: Record<string, string>) => void
  onRefresh: () => void
}

function BackLink({ onBack }: { onBack: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]"
    >
      <ArrowLeft size={14} aria-hidden="true" /> All approvals
    </button>
  )
}

/** Where the action stands, in words. Outcome unknown gets an amber edge and is announced. */
function StateSummary({ action }: { action: AgentActionDetail }): JSX.Element {
  const meta = stateMeta(action.state, action.kind)
  const unknown = meta.tone === 'unknown'
  return (
    <div
      role={unknown ? 'status' : undefined}
      className="flex flex-col gap-2 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3"
      style={unknown ? { borderColor: YELLOW } : undefined}
    >
      <ActionStateBadge state={action.state} kind={action.kind} />
      <p className="text-[12.5px] text-[var(--cat-ink-2)]">{meta.summary}</p>
      {action.approvalExpiresAt && (
        <p className="text-[12px] text-[var(--cat-ink-3)]">
          Approval valid until {formatWhen(action.approvalExpiresAt)}. After that it expires and is
          not sent.
        </p>
      )}
    </div>
  )
}

/** What the owner can do now: decide on or edit a draft, or close an unknown outcome. */
function Controls({ props }: { props: ActionReviewViewProps }): JSX.Element {
  const { review, onDecide, onResolve, onEdit } = props
  const action = review.action as AgentActionDetail
  const blocked = Boolean(review.notice) || review.deciding || review.refreshing
  if (canResolve(action)) return <ResolveBar disabled={blocked} onResolve={onResolve} />
  return (
    <DraftControls
      action={action}
      disabled={blocked}
      editError={review.editError ?? null}
      handlers={{ onDecide, onEdit }}
    />
  )
}

function ReviewBody({ props }: { props: ActionReviewViewProps }): JSX.Element {
  const { review, onRefresh } = props
  const action = review.action as AgentActionDetail
  const resolving = canResolve(action)
  return (
    <>
      <header>
        <p className="text-[11.5px] text-[var(--cat-ink-3)]">
          {kindLabel(action.kind)} · version {action.version ?? '?'} · drafted{' '}
          {formatWhen(action.createdAt)}
        </p>
        <h3 className="mt-1 text-[15px] font-semibold text-[var(--cat-ink)]">
          {action.task.title}
        </h3>
      </header>
      <StateSummary action={action} />
      {review.notice && (
        <ActionNotice notice={review.notice} refreshing={review.refreshing} onRefresh={onRefresh} />
      )}
      {resolving && <Controls props={props} />}
      <ActionContentView content={action.content} />
      {!resolving && <Controls props={props} />}
      <DecisionHistory decisions={action.decisions} />
    </>
  )
}

/** One action: its state, the exact draft, the decision controls and the history. */
export function ActionReviewView(props: ActionReviewViewProps): JSX.Element {
  const { review, onBack, onRefresh } = props
  return (
    <div className="flex flex-col gap-4">
      <BackLink onBack={onBack} />
      {review.isLoading && (
        <p role="status" className="flex items-center gap-2 text-[13px] text-[var(--cat-ink-3)]">
          <Loader2 size={14} className="cat-agent-spin" aria-hidden="true" /> Loading draft…
        </p>
      )}
      {review.loadError && (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="text-[13px] font-medium text-[var(--cat-ink)]">
            Couldn&apos;t load this action
          </p>
          <p className={MUTED_TEXT}>{review.loadError}</p>
          <button type="button" onClick={onRefresh} className="text-[12.5px] font-medium underline">
            Try again
          </button>
        </div>
      )}
      {review.action && !review.loadError && <ReviewBody props={props} />}
    </div>
  )
}
