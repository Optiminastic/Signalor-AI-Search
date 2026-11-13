import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { actionResults, noticeFor, type DecisionNotice } from '@/features/catalyst/agent-approvals'
import {
  ActionReviewView,
  type ActionReviewViewProps,
} from '@/features/catalyst/components/agent-page/approvals/ActionReviewView'
import { ApprovalListView } from '@/features/catalyst/components/agent-page/approvals/ApprovalListView'
import { BoardTabs } from '@/features/catalyst/components/agent-page/BoardTabs'
import {
  getAction,
  listApprovals,
  listPlanTaskActions,
  type AgentActionDetail,
} from '@/lib/api/agent-mode-approvals'
import fixtures from '@/lib/api/agent-mode-approvals.fixtures.json'
import { AgentModeError } from '@/lib/api/agent-mode-request'

/**
 * Renders the Approvals tab in each state the owner can meet, from the real
 * backend responses recorded in agent-mode-approvals.fixtures.json. The data
 * goes through the same parsing the live screen uses.
 */

type Recorded = Record<string, { status: number; body: unknown }>

function serveFixture(name: string): void {
  const { status, body } = (fixtures as Recorded)[name]
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  )
}

async function detail(name: string): Promise<AgentActionDetail> {
  serveFixture(name)
  return getAction('pro-brand', 'abc')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const noop = (): void => undefined

function renderReview(
  action: AgentActionDetail | null,
  over: Partial<ActionReviewViewProps['review']> = {},
): string {
  const review = {
    action,
    isLoading: false,
    loadError: null,
    notice: null as DecisionNotice | null,
    deciding: false,
    refreshing: false,
    ...over,
  }
  return renderToStaticMarkup(
    <ActionReviewView
      review={review}
      onBack={noop}
      onDecide={noop}
      onResolve={noop}
      onEdit={noop}
      onRefresh={noop}
    />,
  )
}

/** The opening tag of the first button whose text contains `label`. */
function buttonTag(html: string, label: string): string | null {
  const match = html.match(new RegExp(`<button[^>]*>(?:(?!</button>).)*${label}`, 's'))
  return match ? match[0].slice(0, match[0].indexOf('>') + 1) : null
}

/**
 * Whether a button tag carries the real `disabled` attribute. Matching the word
 * alone is wrong: Tailwind's `disabled:` classes put it in every class list.
 * A missing button fails loudly instead of passing as "not disabled".
 */
function isDisabled(tag: string | null): boolean {
  if (tag === null) throw new Error('Button not found')
  return /\sdisabled=""/.test(tag)
}

const LIST_BASE = { pending: [], results: [], isLoading: false, error: null, resultsError: null }

describe('Approvals list', () => {
  it('shows a loading state', () => {
    const html = renderToStaticMarkup(
      <ApprovalListView data={{ ...LIST_BASE, isLoading: true }} onOpen={noop} onReload={noop} />,
    )
    expect(html).toContain('Loading approvals')
  })

  it('shows a load error with the reason and a way to reload the list', () => {
    const data = { ...LIST_BASE, error: 'Program not found.' }
    const html = renderToStaticMarkup(
      <ApprovalListView data={data} onOpen={noop} onReload={noop} />,
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('Program not found.')
    expect(html).toContain('Try again')
  })

  it('shows an empty state that says nothing is sent without approval', async () => {
    serveFixture('approvals_empty')
    const data = { ...LIST_BASE, pending: await listApprovals('pro-brand') }
    const html = renderToStaticMarkup(
      <ApprovalListView data={data} onOpen={noop} onReload={noop} />,
    )
    expect(html).toContain('Nothing to approve yet')
    expect(html).toContain('Nothing is')
  })

  it('lists pending drafts and results, outcome unknown first and marked as such', async () => {
    serveFixture('approvals_mixed')
    const pending = await listApprovals('pro-brand')
    serveFixture('plan_mixed')
    const results = actionResults(await listPlanTaskActions('pro-brand'))
    const html = renderToStaticMarkup(
      <ApprovalListView data={{ ...LIST_BASE, pending, results }} onOpen={noop} onReload={noop} />,
    )
    expect(html).toContain('Publish a pricing explainer')
    expect(html).toContain('Approved, not sent yet')
    const unknownAt = html.indexOf('Outcome unknown')
    expect(unknownAt).toBeGreaterThan(-1)
    expect(html.indexOf('Needs your attention')).toBeLessThan(html.indexOf('Waiting for you'))
    expect(unknownAt).toBeLessThan(html.indexOf('Waiting for you'))
    expect(html.indexOf('Waiting for you')).toBeLessThan(html.indexOf('Failed, not sent'))
    expect(html).toContain('Connect Gmail first.')
    expect(html).not.toMatch(/Retry|Send again|Resend/i)
  })
})

describe('Action review', () => {
  it('shows a loading state', () => {
    expect(renderReview(null, { isLoading: true })).toContain('Loading draft')
  })

  it('shows a load error', () => {
    const html = renderReview(null, { loadError: 'Action not found.' })
    expect(html).toContain('Action not found.')
  })

  it('shows the exact email and offers approve and reject for a pending draft', async () => {
    const html = renderReview(await detail('detail_email_awaiting'))
    expect(html).toContain('A suggestion for your tools roundup')
    expect(html).toContain('A published contact at roundup.example')
    expect(html).toContain('Reply STOP and we will not write again.')
    expect(isDisabled(buttonTag(html, 'Approve version 1'))).toBe(false)
    expect(buttonTag(html, 'Reject')).not.toBeNull()
    expect(html).toContain('Drafted by the agent')
    expect(html).not.toContain('Picked up for sending')
  })

  it('shows the exact article for an article draft', async () => {
    const html = renderReview(await detail('detail_article_awaiting'))
    expect(html).toContain('draft-page')
    expect(html).toContain('**A short answer.**')
  })

  it('blocks both decisions and requires a refresh when the draft is stale', async () => {
    const stale = noticeFor(new AgentModeError('changed', 409, 'stale'))
    const html = renderReview(await detail('detail_email_awaiting'), { notice: stale })
    expect(html).toContain('This draft has changed')
    expect(html).toContain('Refresh')
    expect(isDisabled(buttonTag(html, 'Approve version 1'))).toBe(true)
    expect(isDisabled(buttonTag(html, 'Reject<'))).toBe(true)
  })

  it('blocks decisions while a refresh is loading', async () => {
    const html = renderReview(await detail('detail_email_awaiting'), { refreshing: true })
    expect(isDisabled(buttonTag(html, 'Approve version 1'))).toBe(true)
  })

  it('says an unconfirmed decision may have been saved, and offers only a refresh', async () => {
    const unconfirmed = noticeFor(new TypeError('Failed to fetch'))
    const html = renderReview(await detail('detail_email_awaiting'), { notice: unconfirmed })
    expect(html).toContain('Decision not confirmed')
    expect(html).toContain('We could not confirm whether your decision was saved')
    expect(isDisabled(buttonTag(html, 'Approve version 1'))).toBe(true)
  })

  it('shows outcome unknown distinctly, with no decision and no retry', async () => {
    const html = renderReview(await detail('detail_outcome_unknown'))
    expect(html).toContain('Outcome unknown')
    expect(html).toContain('data-state="needs_reconciliation"')
    expect(html).toContain('role="status"')
    expect(html).toContain('will not be sent again automatically')
    expect(buttonTag(html, 'Approve')).toBeNull()
    expect(buttonTag(html, 'Reject')).toBeNull()
    expect(html).not.toMatch(/Retry|Try again|Send again|Resend/i)
    expect(html).toContain('Approved')
  })

  it('offers exactly two ways to close an unknown outcome, and neither sends', async () => {
    const html = renderReview(await detail('detail_outcome_unknown'))
    expect(isDisabled(buttonTag(html, 'I found it: it was sent'))).toBe(false)
    expect(isDisabled(buttonTag(html, 'Close it, outcome unknown'))).toBe(false)
    expect(html.match(/<button/g)?.length).toBe(3) // back link + the two choices
    expect(html.indexOf('I found it')).toBeLessThan(html.indexOf('Email body'))
  })

  it('locks the closing choices while a notice is open', async () => {
    const stale = noticeFor(new AgentModeError('changed', 409, 'stale'))
    const html = renderReview(await detail('detail_outcome_unknown'), { notice: stale })
    expect(isDisabled(buttonTag(html, 'I found it: it was sent'))).toBe(true)
    expect(isDisabled(buttonTag(html, 'Close it, outcome unknown'))).toBe(true)
  })

  it('shows an owner-confirmed send as done, with the resolution in the history', async () => {
    serveFixture('resolve_sent_ok')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('data-state="succeeded"')
    expect(html).toContain('Confirmed sent')
    expect(html).toContain('Reason: Found it in the Sent folder.')
    expect(buttonTag(html, 'I found it')).toBeNull()
  })

  it('shows a closed unknown outcome as closed, not as sent or failed', async () => {
    serveFixture('resolve_cancel_ok')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('data-state="cancelled"')
    expect(html).toContain('Closed with the outcome unknown')
    expect(html).not.toContain('Failed, not sent')
    expect(buttonTag(html, 'Close it')).toBeNull()
  })

  it('shows a failed send as failed and not sent, with no decision', async () => {
    const html = renderReview(await detail('detail_failed'))
    expect(html).toContain('Failed, not sent')
    expect(html).not.toContain('Outcome unknown')
    expect(buttonTag(html, 'Approve')).toBeNull()
  })

  it('offers only withdrawal for an approved draft that has not been sent', async () => {
    serveFixture('approve_ok')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('Approved, not sent yet')
    expect(buttonTag(html, 'Approve version')).toBeNull()
    expect(buttonTag(html, 'Withdraw approval')).not.toBeNull()
  })

  it('shows the decision history with versions and reasons', async () => {
    const html = renderReview(await detail('reject_after_approve_ok'))
    expect(html).toContain('version 1 by the brand owner')
    expect(html).toContain('Reason: Changed my mind about this page.')
    expect(html.indexOf('Approved')).toBeLessThan(html.lastIndexOf('Rejected'))
  })

  it('refuses to offer approval for a draft it cannot display', async () => {
    const action = { ...(await detail('detail_email_awaiting')), content: null }
    const html = renderReview(action)
    expect(html).toContain('can&#x27;t be approved from this screen')
    expect(buttonTag(html, 'Approve')).toBeNull()
  })
})

describe('Board tabs', () => {
  it('marks the selected tab and shows the waiting count and unknown-outcome flag', () => {
    const html = renderToStaticMarkup(
      <BoardTabs
        value="approvals"
        onChange={noop}
        badges={{ awaiting: 2, outcomeUnknown: true, articles: 0 }}
      />,
    )
    expect(html).toContain('role="tablist"')
    expect(html).toMatch(/aria-selected="true"[^>]*>Approvals/)
    expect(html).toContain('2 awaiting approval')
    expect(html).toContain('A send has an unknown outcome')
  })
})

describe('Draft editing', () => {
  it('offers Edit draft for a draft that can still change', async () => {
    const html = renderReview(await detail('detail_email_awaiting'))
    expect(isDisabled(buttonTag(html, 'Edit draft'))).toBe(false)
  })

  it('locks Edit draft while a notice is open', async () => {
    const stale = noticeFor(new AgentModeError('changed', 409, 'stale'))
    const html = renderReview(await detail('detail_email_awaiting'), { notice: stale })
    expect(isDisabled(buttonTag(html, 'Edit draft'))).toBe(true)
  })

  it('offers no editing once an action is sent, failed or unknown', async () => {
    for (const name of ['detail_succeeded', 'detail_failed', 'detail_outcome_unknown']) {
      expect(buttonTag(renderReview(await detail(name)), 'Edit draft')).toBeNull()
    }
  })

  it('shows an edited draft as a new version awaiting approval', async () => {
    serveFixture('edit_email_ok')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('version 2')
    expect(html).toContain('Awaiting your approval')
    expect(html).toContain('A short suggestion')
    expect(isDisabled(buttonTag(html, 'Approve version 2'))).toBe(false)
  })
})

describe('Revoke and expiry', () => {
  it('shows until when an approval counts, and offers withdrawal, not approval', async () => {
    serveFixture('detail_approved_with_expiry')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('Approval valid until')
    expect(isDisabled(buttonTag(html, 'Withdraw approval'))).toBe(false)
    expect(buttonTag(html, 'Approve version')).toBeNull()
    expect(buttonTag(html, 'Reject<')).toBeNull()
  })

  it('shows a withdrawn approval as closed, with no controls', async () => {
    serveFixture('revoke_ok')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('data-state="revoked"')
    expect(html).toContain('Reason: Not this week.')
    expect(html).not.toContain('Approval valid until')
    expect(buttonTag(html, 'Withdraw approval')).toBeNull()
    expect(buttonTag(html, 'Edit draft')).toBeNull()
  })

  it('shows an expired approval as recorded by Signalor, with no controls', async () => {
    serveFixture('detail_expired')
    const html = renderReview(await getAction('pro-brand', 'abc'))
    expect(html).toContain('data-state="expired"')
    expect(html).toContain('Signalor, automatically')
    expect(buttonTag(html, 'Approve')).toBeNull()
    expect(buttonTag(html, 'Edit draft')).toBeNull()
  })
})

describe('Follow-up emails', () => {
  it('shows a follow-up for approval like any email, editable, with its kind', async () => {
    const html = renderReview(await detail('detail_follow_up_awaiting'))
    expect(html).toContain('Follow-up email')
    expect(html).toContain('Re: A suggestion for your tools roundup')
    expect(isDisabled(buttonTag(html, 'Approve version 1'))).toBe(false)
    expect(isDisabled(buttonTag(html, 'Edit draft'))).toBe(false)
  })

  it('shows a follow-up approval running out within days', async () => {
    const html = renderReview(await detail('detail_follow_up_approved'))
    expect(html).toContain('Approval valid until')
    expect(isDisabled(buttonTag(html, 'Withdraw approval'))).toBe(false)
  })

  it('shows a stopped follow-up as closed because they replied, with no controls', async () => {
    const html = renderReview(await detail('detail_follow_up_stopped'))
    expect(html).toContain('data-state="stopped"')
    expect(html).toContain('Stopped, they replied')
    expect(buttonTag(html, 'Approve')).toBeNull()
    expect(buttonTag(html, 'Edit draft')).toBeNull()
  })
})

describe('What happened timeline', () => {
  it('shows every step of a sent action in order', async () => {
    const html = renderReview(await detail('detail_succeeded'))
    const steps = [
      'Drafted by the agent',
      'Approved',
      'Picked up for sending',
      'Final checks passed',
      'Published',
    ]
    const positions = steps.map(step => html.indexOf(step))
    expect(positions.every(p => p > -1)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    expect(html).toContain('handed to your site')
  })

  it('shows an unknown result as unknown, not as sent or failed', async () => {
    const html = renderReview(await detail('detail_outcome_unknown'))
    expect(html).toContain('handed to Gmail')
    expect(html).toContain('Result unknown')
    expect(html).not.toContain('Failed, nothing was sent')
  })

  it('says when sending is blocked after repeated failures', async () => {
    const action = await detail('detail_approved_with_expiry')
    const blocked = { ...action, sendAttempts: { failures: 10, blocked: true, retryAfter: null } }
    const html = renderReview(blocked)
    expect(html).toContain('Sending stopped after 10 failed tries')
    expect(html).toContain('role="alert"')
  })

  it('says when a failed send will be tried again', async () => {
    const action = await detail('detail_approved_with_expiry')
    const retrying = {
      ...action,
      sendAttempts: { failures: 1, blocked: false, retryAfter: '2026-11-12T10:00:00Z' },
    }
    const html = renderReview(retrying)
    expect(html).toContain('The last try to send this failed before anything went out.')
    expect(html).toContain('It will be tried again after')
  })

  it('falls back to the decisions when an older backend sends no timeline', async () => {
    const action = await detail('reject_after_approve_ok')
    const html = renderReview({ ...action, timeline: [] })
    expect(html).toContain('Changed my mind about this page.')
    expect(html).not.toContain('Drafted by the agent')
  })
})

describe('The owner decides', () => {
  it('shows fact-check concerns above the draft, with approval still possible', async () => {
    const action = await detail('detail_email_awaiting')
    if (action.content?.type !== 'email') throw new Error('expected an email')
    const flagged = {
      ...action,
      content: { ...action.content, reviewNotes: ['Claims 40% growth.'] },
    }
    const html = renderReview(flagged)
    expect(html).toContain('Fact-check concerns, for you to decide')
    expect(html).toContain('Claims 40% growth.')
    expect(html.indexOf('Fact-check concerns')).toBeLessThan(html.indexOf('Email body'))
    expect(isDisabled(buttonTag(html, 'Approve version 1'))).toBe(false)
  })

  it('asks the owner for a contact instead of failing the task', () => {
    const data = {
      ...LIST_BASE,
      needsContact: [{ taskId: 7, taskTitle: 'Pitch hubspot.com', domain: 'hubspot.com' }],
    }
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <ApprovalListView
          data={data}
          onOpen={noop}
          onReload={noop}
          contact={{ orgSlug: 'brand', busyTaskId: null, onAnswer: noop }}
        />
      </QueryClientProvider>,
    )
    expect(html).toContain('Needs your input')
    expect(html).toContain('No public contact email on hubspot.com')
    expect(html).toContain('placeholder="editor@hubspot.com"')
    expect(isDisabled(buttonTag(html, 'Draft with this email'))).toBe(true) // until an email is typed
    expect(isDisabled(buttonTag(html, 'Skip this site'))).toBe(false)
    expect(html).not.toContain('Nothing to approve yet')
    expect(html).toContain('Find contacts with Hunter / Apollo')
  })
})
