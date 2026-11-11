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
    expect(html).toContain('No decision has been recorded yet.')
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
        badges={{ awaiting: 2, outcomeUnknown: true }}
      />,
    )
    expect(html).toContain('role="tablist"')
    expect(html).toMatch(/aria-selected="true"[^>]*>Approvals/)
    expect(html).toContain('2 awaiting approval')
    expect(html).toContain('A send has an unknown outcome')
  })
})
