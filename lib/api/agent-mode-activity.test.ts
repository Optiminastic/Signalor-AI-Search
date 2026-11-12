import { afterEach, describe, expect, it, vi } from 'vitest'

import { answerContact, findContacts, listActivity } from './agent-mode-activity'

afterEach(() => {
  vi.unstubAllGlobals()
})

function serve(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('agent activity API', () => {
  it('reads the log in the backend serializer shape', async () => {
    serve({
      activity: [
        {
          id: 3,
          channel: 'outreach_email',
          action: 'contact_not_found',
          outcome: 'blocked',
          task_title: 'Pitch hubspot.com',
          detail: {
            domain: 'hubspot.com',
            reason: 'No published contact email found on hubspot.com.',
          },
          created_at: '2026-11-12T09:53:54Z',
        },
      ],
    })
    const [entry] = await listActivity('brand')
    expect(entry).toMatchObject({ action: 'contact_not_found', taskTitle: 'Pitch hubspot.com' })
    expect(entry.detail.domain).toBe('hubspot.com')
  })

  it('sends the owner email, or a skip, to the task contact endpoint', async () => {
    const fetchMock = serve({ task: { id: 7, status: 'planned' } }, 202)
    expect(
      await answerContact({ orgSlug: 'brand', taskId: 7, choice: { email: 'ed@hubspot.com' } }),
    ).toBe('planned')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/agent-mode/programs/brand/tasks/7/contact')
    expect(JSON.parse(init.body as string)).toEqual({ email: 'ed@hubspot.com' })
  })
})

describe('contact finders', () => {
  it('reads the people found and sends a picked person back by provider and ref', async () => {
    serve({
      candidates: [
        {
          provider: 'apollo',
          ref: 'p1',
          name: 'Sam Ro***s',
          title: 'Head of Content',
          email: '',
          confidence: '',
        },
      ],
      providers: ['hunter', 'apollo'],
      errors: ['hunter'],
    })
    const found = await findContacts('brand', 7)
    expect(found.candidates[0]).toMatchObject({ label: 'Apollo', ref: 'p1', email: '' })
    expect(found.errors).toEqual(['hunter'])
    const fetchMock = serve({ task: { id: 7, status: 'planned' } }, 202)
    await answerContact({
      orgSlug: 'brand',
      taskId: 7,
      choice: { candidate: { provider: 'apollo', ref: 'p1' } },
    })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/agent-mode/programs/brand/tasks/7/contact')
    expect(JSON.parse(init.body as string)).toEqual({
      candidate: { provider: 'apollo', ref: 'p1' },
    })
  })
})
