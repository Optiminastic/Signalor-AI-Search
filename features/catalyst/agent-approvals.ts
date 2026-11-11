import {
  PAYLOAD_HASH_LENGTH,
  type ActionState,
  type AgentAction,
  type PlanTaskAction,
} from '@/lib/api/agent-mode-approvals'
import { AgentModeError } from '@/lib/api/agent-mode-request'

/**
 * Pure rules behind the Approvals tab: how each action state reads, which
 * decisions a draft allows, and how a failed request becomes a notice.
 * The backend enforces every rule again; this only keeps the screen honest.
 */

/** `unknown` is its own tone so "outcome unknown" never looks like pending or failed. */
export type StateTone = 'waiting' | 'progress' | 'success' | 'danger' | 'closed' | 'unknown'

export interface StateMeta {
  label: string
  tone: StateTone
  summary: string
}

const ARTICLE = 'publish_article'

function isArticle(kind: string): boolean {
  return kind === ARTICLE
}

/** Where a send's result would show, for the outcome-unknown advice. */
function checkWhere(kind: string): string {
  return isArticle(kind)
    ? 'Check your site for the post before doing anything else.'
    : 'Check the Sent folder of the connected mailbox before doing anything else.'
}

const STATE_META: Record<Exclude<ActionState, 'needs_reconciliation'>, StateMeta> = {
  awaiting_approval: {
    label: 'Awaiting your approval',
    tone: 'waiting',
    summary: 'Nothing has been sent. Review the draft below, then approve or reject it.',
  },
  approved: {
    label: 'Approved, not sent yet',
    tone: 'progress',
    summary:
      'You approved this exact version. It has not been sent yet, and you can still reject it until sending starts.',
  },
  dispatching: {
    label: 'Sending',
    tone: 'progress',
    summary: 'Sending has started. The result will show here.',
  },
  succeeded: { label: 'Done', tone: 'success', summary: 'The agent confirmed this went out.' },
  failed: {
    label: 'Failed, not sent',
    tone: 'danger',
    summary: 'This failed before anything went out. Nothing was sent.',
  },
  rejected: { label: 'Rejected', tone: 'closed', summary: 'Rejected. It will not be sent.' },
  unknown: {
    label: 'Unrecognised state',
    tone: 'closed',
    summary: 'This screen does not recognise the state of this action, so it offers no decisions.',
  },
}

export function stateMeta(state: ActionState, kind: string): StateMeta {
  if (state === 'needs_reconciliation') {
    return {
      label: 'Outcome unknown',
      tone: 'unknown',
      summary:
        'The send was attempted, but its result could not be confirmed, so this may or may not have gone out. ' +
        `It will not be sent again automatically, so it cannot go out twice. ${checkWhere(kind)}`,
    }
  }
  return STATE_META[state]
}

export function kindLabel(kind: string): string {
  if (isArticle(kind)) return 'Article'
  if (kind === 'send_outreach_email') return 'Outreach email'
  return 'Action'
}

/** A draft can be decided only if it is fully shown and fully identified. */
export function isReviewable(action: AgentAction): boolean {
  return (
    action.content !== null &&
    action.version !== null &&
    action.payloadHash.length === PAYLOAD_HASH_LENGTH
  )
}

export function canApprove(action: AgentAction): boolean {
  return action.state === 'awaiting_approval' && isReviewable(action)
}

/** Rejecting also withdraws an approval, as long as sending hasn't started. */
export function canReject(action: AgentAction): boolean {
  return (
    (action.state === 'awaiting_approval' || action.state === 'approved') && isReviewable(action)
  )
}

export type NoticeKind = 'stale' | 'closed' | 'gone' | 'unconfirmed' | 'error'

export interface DecisionNotice {
  kind: NoticeKind
  message: string
}

const NOTICE_TEXT: Record<Exclude<NoticeKind, 'closed' | 'error'>, string> = {
  stale:
    'This draft changed since you opened it, so your decision was not recorded. Refresh to review the latest version.',
  gone: 'This action no longer exists. Refresh to see what is waiting.',
  unconfirmed:
    'We could not confirm whether your decision was saved. Refresh to see where this action stands before doing anything else.',
}

/** Server errors on a write may hide a decision that was saved, so they are unconfirmed. */
const UNCONFIRMED_FROM_STATUS = 500

/**
 * Turns a failed decision into what the owner is told. Every notice blocks
 * further decisions until the owner refreshes, so nothing is decided on a
 * draft they can no longer see as it is.
 */
export function noticeFor(error: unknown): DecisionNotice {
  if (!(error instanceof AgentModeError)) {
    return { kind: 'unconfirmed', message: NOTICE_TEXT.unconfirmed }
  }
  if (error.status === 409 && error.code === 'stale') {
    return { kind: 'stale', message: NOTICE_TEXT.stale }
  }
  if (error.status === 409) return { kind: 'closed', message: error.message }
  if (error.status === 404) return { kind: 'gone', message: NOTICE_TEXT.gone }
  if (error.status >= UNCONFIRMED_FROM_STATUS) {
    return { kind: 'unconfirmed', message: NOTICE_TEXT.unconfirmed }
  }
  return { kind: 'error', message: error.message }
}

/** Load errors: the backend's own wording, or a plain network message. */
export function loadErrorMessage(error: unknown): string {
  if (error instanceof AgentModeError) return error.message
  return 'Could not reach Signalor. Check your connection and try again.'
}

/** Results worth showing, most urgent first. Pending drafts come from the approvals list. */
const RESULT_ORDER: ActionState[] = [
  'needs_reconciliation',
  'dispatching',
  'failed',
  'rejected',
  'succeeded',
]

export interface ActionResult {
  actionId: string
  kind: string
  state: ActionState
  taskTitle: string
  failure: string
}

export function actionResults(tasks: PlanTaskAction[]): ActionResult[] {
  const results: ActionResult[] = []
  for (const task of tasks) {
    const action = task.action
    if (!action || !RESULT_ORDER.includes(action.state)) continue
    results.push({
      actionId: action.id,
      kind: action.kind,
      state: action.state,
      taskTitle: task.taskTitle,
      failure: action.state === 'failed' ? task.failure : '',
    })
  }
  return results.sort((a, b) => RESULT_ORDER.indexOf(a.state) - RESULT_ORDER.indexOf(b.state))
}

export function awaitingCount(actions: AgentAction[]): number {
  return actions.filter(a => a.state === 'awaiting_approval').length
}

export function unknownCount(results: ActionResult[]): number {
  return results.filter(r => r.state === 'needs_reconciliation').length
}

/** e.g. "Nov 11, 2026, 5:58 AM". Fixed locale so tests and renders agree. */
export function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function decisionLabel(decision: string): string {
  if (decision === 'approved') return 'Approved'
  if (decision === 'rejected') return 'Rejected'
  return decision
}
