import { describe, expect, it } from 'vitest'

import {
  ACTION_STATES,
  type ActionState,
  type AgentAction,
  type PlanTaskAction,
} from '@/lib/api/agent-mode-approvals'
import { AgentModeError } from '@/lib/api/agent-mode-request'

import {
  actionResults,
  awaitingCount,
  canApprove,
  canReject,
  canEdit,
  canResolve,
  canRevoke,
  editErrorFor,
  kindLabel,
  decisionLabel,
  noticeFor,
  splitResults,
  stateMeta,
  unknownCount,
} from './agent-approvals'

const HASH = 'a'.repeat(64)

function action(over: Partial<AgentAction> = {}): AgentAction {
  return {
    id: 'act1',
    kind: 'send_outreach_email',
    connector: 'gmail',
    state: 'awaiting_approval',
    task: {
      id: 1,
      title: 'Pitch',
      channel: 'outreach_email',
      target: 'x',
      scheduledFor: '',
      status: 'awaiting_approval',
    },
    version: 1,
    payloadHash: HASH,
    content: {
      type: 'email',
      subject: 's',
      body: 'b\n\n--\nfooter',
      recipientDomain: 'x.example',
      sender: 'me',
      message: 'b',
      footer: 'footer',
      reviewNotes: [],
    },
    approvalExpiresAt: null,
    createdAt: '',
    updatedAt: '',
    ...over,
  }
}

function planTask(
  state: ActionState | null,
  title = state ?? 'none',
  failure = '',
): PlanTaskAction {
  return {
    taskId: 1,
    taskTitle: title,
    taskStatus: 'planned',
    action: state ? { id: `id-${title}`, kind: 'send_outreach_email', state, version: 1 } : null,
    failure,
    needsContact: null,
  }
}

describe('stateMeta', () => {
  it('gives outcome unknown its own tone, distinct from pending and failed', () => {
    const unknown = stateMeta('needs_reconciliation', 'send_outreach_email')
    expect(unknown.tone).toBe('unknown')
    expect(unknown.label).toBe('Outcome unknown')
    expect(stateMeta('failed', 'send_outreach_email').tone).toBe('danger')
    expect(stateMeta('awaiting_approval', 'send_outreach_email').tone).toBe('waiting')
    expect(stateMeta('approved', 'send_outreach_email').tone).toBe('progress')
  })

  it('says an unknown outcome will not be resent and where to check', () => {
    const email = stateMeta('needs_reconciliation', 'send_outreach_email').summary
    expect(email).toMatch(/will not be sent again automatically/)
    expect(email).toMatch(/Sent folder/)
    expect(stateMeta('needs_reconciliation', 'publish_article').summary).toMatch(/your site/)
  })

  it('never offers retry wording for any state', () => {
    for (const state of [...ACTION_STATES, 'unknown' as const]) {
      const { label, summary } = stateMeta(state, 'send_outreach_email')
      expect(`${label} ${summary}`).not.toMatch(/\bretry\b|\btry again\b|\bresend\b/i)
    }
  })
})

describe('which decisions a draft allows', () => {
  it('allows approve only while awaiting approval', () => {
    const allowed = ACTION_STATES.filter(state => canApprove(action({ state })))
    expect(allowed).toEqual(['awaiting_approval'])
  })

  it('allows reject while awaiting or approved but not yet sending', () => {
    const allowed = ACTION_STATES.filter(state => canReject(action({ state })))
    expect(allowed).toEqual(['awaiting_approval', 'approved'])
  })

  it('allows nothing for an outcome-unknown, failed or unrecognised action', () => {
    for (const state of ['needs_reconciliation', 'failed', 'unknown'] as const) {
      expect(canApprove(action({ state }))).toBe(false)
      expect(canReject(action({ state }))).toBe(false)
    }
  })

  it('allows nothing when the draft cannot be shown or identified', () => {
    for (const broken of [{ content: null }, { version: null }, { payloadHash: 'short' }]) {
      expect(canApprove(action(broken))).toBe(false)
      expect(canReject(action(broken))).toBe(false)
    }
  })
})

describe('noticeFor', () => {
  it('turns a stale refusal into a refresh-required notice', () => {
    expect(noticeFor(new AgentModeError('changed', 409, 'stale')).kind).toBe('stale')
  })

  it('keeps the backend wording for an action that can no longer change', () => {
    const notice = noticeFor(new AgentModeError('This action is rejected.', 409, 'illegal_state'))
    expect(notice).toEqual({ kind: 'closed', message: 'This action is rejected.' })
  })

  it('reads a missing action as gone', () => {
    expect(noticeFor(new AgentModeError('Action not found.', 404)).kind).toBe('gone')
  })

  it('treats network failures and server errors as unconfirmed, since the decision may be saved', () => {
    expect(noticeFor(new TypeError('Failed to fetch')).kind).toBe('unconfirmed')
    expect(noticeFor(new AgentModeError('Signalor backend is unreachable.', 502)).kind).toBe(
      'unconfirmed',
    )
    expect(noticeFor(new AgentModeError('Server error', 500)).kind).toBe('unconfirmed')
  })

  it('shows other refusals as they are', () => {
    expect(noticeFor(new AgentModeError('Not signed in.', 401))).toEqual({
      kind: 'error',
      message: 'Not signed in.',
    })
  })
})

describe('actionResults', () => {
  it('lists sent, failed, rejected and unknown outcomes, most urgent first', () => {
    const results = actionResults([
      planTask('succeeded'),
      planTask('awaiting_approval'),
      planTask('failed', 'failed', 'Connect Gmail first.'),
      planTask(null),
      planTask('needs_reconciliation'),
      planTask('approved'),
      planTask('rejected'),
    ])
    expect(results.map(r => r.state)).toEqual([
      'needs_reconciliation',
      'failed',
      'rejected',
      'succeeded',
    ])
    expect(results[1].failure).toBe('Connect Gmail first.')
    expect(unknownCount(results)).toBe(1)
  })

  it('counts only drafts awaiting approval as waiting', () => {
    expect(awaitingCount([action(), action({ state: 'approved' })])).toBe(1)
  })
})

describe('closing an unknown outcome', () => {
  it('is possible only for an unknown outcome', () => {
    const allowed = ACTION_STATES.filter(state => canResolve(action({ state })))
    expect(allowed).toEqual(['needs_reconciliation'])
  })

  it('is not possible when the action is not identified', () => {
    expect(canResolve(action({ state: 'needs_reconciliation', payloadHash: 'short' }))).toBe(false)
    expect(canResolve(action({ state: 'needs_reconciliation', version: null }))).toBe(false)
  })

  it('reads a closed action as closed, never as sent or failed', () => {
    const meta = stateMeta('cancelled', 'send_outreach_email')
    expect(meta.label).toBe('Closed, outcome unknown')
    expect(meta.tone).toBe('closed')
  })

  it('labels the resolutions in the history', () => {
    expect(decisionLabel('resolved_sent')).toBe('Confirmed sent')
    expect(decisionLabel('resolved_cancelled')).toBe('Closed with the outcome unknown')
  })

  it('splits unknown outcomes out as needing attention', () => {
    const results = actionResults([
      planTask('needs_reconciliation'),
      planTask('failed'),
      planTask('cancelled'),
    ])
    const { attention, settled } = splitResults(results)
    expect(attention.map(r => r.state)).toEqual(['needs_reconciliation'])
    expect(settled.map(r => r.state)).toEqual(['failed', 'cancelled'])
  })
})

describe('editing a draft', () => {
  it('is possible until sending starts', () => {
    const allowed = ACTION_STATES.filter(state => canEdit(action({ state })))
    expect(allowed).toEqual(['awaiting_approval', 'approved', 'rejected'])
  })

  it('is not possible when the editable parts are missing (older backend)', () => {
    const email = action().content
    if (email?.type !== 'email') throw new Error('fixture is an email')
    expect(canEdit(action({ content: { ...email, message: null } }))).toBe(false)
    expect(canEdit(action({ content: null }))).toBe(false)
  })

  it('treats a refused edit as fixable in the form, and nothing else', () => {
    expect(editErrorFor(new AgentModeError("Subject can't be empty.", 400, 'invalid_edit'))).toBe(
      "Subject can't be empty.",
    )
    expect(editErrorFor(new AgentModeError('changed', 409, 'stale'))).toBeNull()
    expect(editErrorFor(new TypeError('Failed to fetch'))).toBeNull()
  })
})

describe('withdrawing and expired approvals', () => {
  it('allows withdrawing only an approved action', () => {
    const allowed = ACTION_STATES.filter(state => canRevoke(action({ state })))
    expect(allowed).toEqual(['approved'])
  })

  it('reads expired and withdrawn as closed, never sent', () => {
    for (const state of ['expired', 'revoked'] as const) {
      expect(stateMeta(state, 'send_outreach_email').tone).toBe('closed')
      expect(stateMeta(state, 'send_outreach_email').summary).toMatch(/not (be )?sent/)
      expect(canApprove(action({ state }))).toBe(false)
      expect(canEdit(action({ state }))).toBe(false)
    }
  })

  it('labels them in the history', () => {
    expect(decisionLabel('revoked')).toBe('Approval withdrawn')
    expect(decisionLabel('expired')).toBe('Approval expired')
  })
})

describe('follow-up emails', () => {
  it('names a follow-up and reads a stopped one as closed, never sent', () => {
    expect(kindLabel('send_follow_up')).toBe('Follow-up email')
    const meta = stateMeta('stopped', 'send_follow_up')
    expect(meta.tone).toBe('closed')
    expect(meta.summary).toMatch(/not sent/)
    expect(decisionLabel('stopped')).toBe('Stopped, they replied')
  })
})
