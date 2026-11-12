import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  decideAction,
  getAction,
  listApprovals,
  editAction,
  listPlanTaskActions,
  resolveAction,
} from './agent-mode-approvals'
import fixtures from './agent-mode-approvals.fixtures.json'
import { AgentModeError } from './agent-mode-request'

/**
 * The fixtures are real responses from ranking-be's approval endpoints
 * (branch feat/growth-agent-main, commit 9e6c940), recorded by running the
 * backend's own views against its in-memory test database with the same fake
 * channels its approval tests use. They are not hand-written, so a drift in
 * the backend's response shape shows up here as a parse failure.
 */

type Recorded = { status: number; body: unknown }
const recorded = fixtures as Record<string, Recorded>

function serve(name: string): ReturnType<typeof vi.fn> {
  const { status, body } = recorded[name]
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function sentRequest(fetchMock: ReturnType<typeof vi.fn>): { url: string; init: RequestInit } {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  return { url, init }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const SLUG = 'pro-brand'

function hashOf(name: string): { id: string; version: number; payloadHash: string } {
  const body = recorded[name].body as {
    action: { id: string; version: number; payload_hash: string }
  }
  return { id: body.action.id, version: body.action.version, payloadHash: body.action.payload_hash }
}

describe('listApprovals', () => {
  it('parses pending drafts with their exact content', async () => {
    const fetchMock = serve('approvals_pending')
    const actions = await listApprovals(SLUG)
    expect(sentRequest(fetchMock).url).toBe(`/api/agent-mode/programs/${SLUG}/approvals`)
    expect(actions).toHaveLength(2)
    const email = actions.find(a => a.kind === 'send_outreach_email')
    expect(email?.content).toMatchObject({
      type: 'email',
      subject: 'A suggestion for your tools roundup',
      recipientDomain: 'roundup.example',
    })
    expect(email?.state).toBe('awaiting_approval')
    expect(email?.payloadHash).toHaveLength(64)
  })

  it('parses an empty list', async () => {
    serve('approvals_empty')
    expect(await listApprovals(SLUG)).toEqual([])
  })

  it('surfaces a missing program as the backend says it', async () => {
    serve('program_not_found')
    await expect(listApprovals(SLUG)).rejects.toMatchObject({
      status: 404,
      message: 'Program not found.',
    })
  })
})

describe('getAction', () => {
  it('parses an article draft and an empty decision history', async () => {
    serve('detail_article_awaiting')
    const action = await getAction(SLUG, 'abc')
    expect(action.content).toEqual({
      type: 'article',
      title: 'Draft page',
      metaDescription: 'About the draft.',
      slug: 'draft-page',
      markdown: '**A short answer.**\n',
      platform: 'wordpress',
      answer: 'A short answer.',
    })
    expect(action.decisions).toEqual([])
  })

  it('keeps the decision history in order', async () => {
    serve('reject_after_approve_ok')
    const action = await getAction(SLUG, 'abc')
    expect(action.state).toBe('rejected')
    expect(action.decisions.map(d => d.decision)).toEqual(['approved', 'rejected'])
    expect(action.decisions[1].reason).toBe('Changed my mind about this page.')
  })

  it('reads an outcome-unknown action as needs_reconciliation', async () => {
    serve('detail_outcome_unknown')
    const action = await getAction(SLUG, 'abc')
    expect(action.state).toBe('needs_reconciliation')
    expect(action.task.status).toBe('executing')
  })

  it('maps a state it does not know to unknown instead of failing', async () => {
    const { body } = recorded.detail_email_awaiting as { body: { action: object } }
    const changed = { action: { ...body.action, state: 'expired' } }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(changed))),
    )
    expect((await getAction(SLUG, 'abc')).state).toBe('unknown')
  })

  it('returns null content when the draft does not match its kind', async () => {
    const { body } = recorded.detail_email_awaiting as { body: { action: object } }
    const broken = { action: { ...body.action, content: { subject: 'only a subject' } } }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(broken))),
    )
    expect((await getAction(SLUG, 'abc')).content).toBeNull()
  })
})

describe('listPlanTaskActions', () => {
  it('passes task status through unchanged and attaches each action', async () => {
    serve('plan_mixed')
    const tasks = await listPlanTaskActions(SLUG)
    expect(tasks.map(t => t.taskStatus)).toEqual([
      'done',
      'executing',
      'failed',
      'skipped',
      'awaiting_approval',
      'awaiting_approval',
      'planned',
    ])
    expect(tasks.map(t => t.action?.state ?? null)).toEqual([
      'succeeded',
      'needs_reconciliation',
      'failed',
      'rejected',
      'approved',
      'awaiting_approval',
      null,
    ])
    expect(tasks[2].failure).toBe('Connect Gmail first.')
  })

  it('returns no tasks when there is no plan', async () => {
    serve('plan_none')
    expect(await listPlanTaskActions(SLUG)).toEqual([])
  })
})

describe('decideAction', () => {
  it('sends the reviewed version and hash to the approve endpoint', async () => {
    const fetchMock = serve('approve_ok')
    const { id, version, payloadHash } = hashOf('approve_ok')
    const result = await decideAction({
      orgSlug: SLUG,
      actionId: id,
      verb: 'approve',
      version,
      payloadHash,
    })
    const { url, init } = sentRequest(fetchMock)
    expect(url).toBe(`/api/agent-mode/programs/${SLUG}/actions/${id}/approve`)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ version, payload_hash: payloadHash })
    expect(result.state).toBe('approved')
    expect(result.decisions).toHaveLength(1)
  })

  it('sends a reject reason when one is given', async () => {
    const fetchMock = serve('reject_after_approve_ok')
    const { id, version, payloadHash } = hashOf('reject_after_approve_ok')
    await decideAction({
      orgSlug: SLUG,
      actionId: id,
      verb: 'reject',
      version,
      payloadHash,
      reason: 'No.',
    })
    const { url, init } = sentRequest(fetchMock)
    expect(url.endsWith(`/actions/${id}/reject`)).toBe(true)
    expect(JSON.parse(init.body as string)).toMatchObject({ reason: 'No.' })
  })

  it('reports a stale draft with its code', async () => {
    serve('decision_stale')
    const { id, version, payloadHash } = hashOf('approve_ok')
    const call = decideAction({
      orgSlug: SLUG,
      actionId: id,
      verb: 'approve',
      version,
      payloadHash,
    })
    await expect(call).rejects.toBeInstanceOf(AgentModeError)
    await expect(call).rejects.toMatchObject({ status: 409, code: 'stale' })
  })

  it('reports an action that can no longer change', async () => {
    serve('decision_illegal_state')
    const { id, version, payloadHash } = hashOf('approve_ok')
    await expect(
      decideAction({ orgSlug: SLUG, actionId: id, verb: 'approve', version, payloadHash }),
    ).rejects.toMatchObject({ status: 409, code: 'illegal_state' })
  })

  it('refuses locally, without a request, when the draft is not identified', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const base = { orgSlug: SLUG, actionId: 'abc', verb: 'approve' as const }
    await expect(decideAction({ ...base, version: 1, payloadHash: 'short' })).rejects.toThrow()
    await expect(
      decideAction({ ...base, version: 0, payloadHash: 'a'.repeat(64) }),
    ).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('lets a network failure through as a non-API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    )
    const { id, version, payloadHash } = hashOf('approve_ok')
    const call = decideAction({
      orgSlug: SLUG,
      actionId: id,
      verb: 'approve',
      version,
      payloadHash,
    })
    await expect(call).rejects.toBeInstanceOf(TypeError)
  })
})

describe('resolveAction', () => {
  it('sends the resolution with the reviewed version and hash, and reads the result', async () => {
    const fetchMock = serve('resolve_sent_ok')
    const { id, version, payloadHash } = hashOf('resolve_sent_ok')
    const result = await resolveAction({
      orgSlug: SLUG,
      actionId: id,
      resolution: 'confirmed_sent',
      version,
      payloadHash,
      reason: 'Found it.',
    })
    const { url, init } = sentRequest(fetchMock)
    expect(url).toBe(`/api/agent-mode/programs/${SLUG}/actions/${id}/resolve`)
    expect(JSON.parse(init.body as string)).toEqual({
      resolution: 'confirmed_sent',
      version,
      payload_hash: payloadHash,
      reason: 'Found it.',
    })
    expect(result.state).toBe('succeeded')
    expect(result.decisions.map(d => d.decision)).toEqual(['approved', 'resolved_sent'])
  })

  it('reads a closed action as cancelled', async () => {
    serve('resolve_cancel_ok')
    const { id, version, payloadHash } = hashOf('resolve_cancel_ok')
    const input = {
      orgSlug: SLUG,
      actionId: id,
      resolution: 'cancel' as const,
      version,
      payloadHash,
    }
    expect((await resolveAction(input)).state).toBe('cancelled')
  })

  it('reports a stale action and an action that is already closed', async () => {
    const { id, version, payloadHash } = hashOf('resolve_sent_ok')
    const input = {
      orgSlug: SLUG,
      actionId: id,
      resolution: 'cancel' as const,
      version,
      payloadHash,
    }
    serve('resolve_stale')
    await expect(resolveAction(input)).rejects.toMatchObject({ status: 409, code: 'stale' })
    serve('resolve_illegal_state')
    await expect(resolveAction(input)).rejects.toMatchObject({ status: 409, code: 'illegal_state' })
  })

  it('refuses locally, without a request, when the action is not identified', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const input = { orgSlug: SLUG, actionId: 'abc', resolution: 'cancel' as const, version: 1 }
    await expect(resolveAction({ ...input, payloadHash: 'short' })).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('editAction', () => {
  it('sends the edited fields with the version and hash, and reads the new version', async () => {
    const fetchMock = serve('edit_email_ok')
    const fields = { subject: 'A short suggestion', message: 'Hi there' }
    const result = await editAction({
      orgSlug: SLUG,
      actionId: 'abc',
      version: 1,
      payloadHash: 'a'.repeat(64),
      fields,
    })
    const { url, init } = sentRequest(fetchMock)
    expect(url).toBe(`/api/agent-mode/programs/${SLUG}/actions/abc/edit`)
    expect(JSON.parse(init.body as string)).toEqual({
      version: 1,
      payload_hash: 'a'.repeat(64),
      fields,
    })
    expect(result.version).toBe(2)
    expect(result.state).toBe('awaiting_approval')
    expect(result.content).toMatchObject({
      type: 'email',
      subject: 'A short suggestion',
      message: 'Hi there,\n\nCould Pro Example join your roundup?',
    })
  })

  it('reports invalid content and fields that cannot be edited with the reason', async () => {
    const input = {
      orgSlug: SLUG,
      actionId: 'abc',
      version: 1,
      payloadHash: 'a'.repeat(64),
      fields: {},
    }
    serve('edit_invalid')
    await expect(editAction(input)).rejects.toMatchObject({
      status: 400,
      code: 'invalid_edit',
      message: "Subject can't be empty.",
    })
    serve('edit_not_editable')
    await expect(editAction(input)).rejects.toMatchObject({ status: 400, code: 'invalid_edit' })
  })

  it('reports an edit made on an outdated version as stale', async () => {
    serve('edit_stale')
    const input = {
      orgSlug: SLUG,
      actionId: 'abc',
      version: 1,
      payloadHash: 'a'.repeat(64),
      fields: {},
    }
    await expect(editAction(input)).rejects.toMatchObject({ status: 409, code: 'stale' })
  })
})
