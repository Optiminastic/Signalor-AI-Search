import { afterEach, describe, expect, it, vi } from 'vitest'

import { checkIndexingNow, getIndexing } from './agent-mode-indexing'

afterEach(() => {
  vi.unstubAllGlobals()
})

function serve(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const READY = {
  status: 'ready',
  property: 'sc-domain:brand.com',
  checked_at: '2026-11-13T09:00:00Z',
  checked: 3,
  indexed: 1,
  not_indexed: 2,
  reasons: [
    {
      key: 'noindex',
      label: 'Blocked by a noindex tag',
      explanation: 'Remove it.',
      fixable: true,
      count: 2,
      urls: ['https://brand.com/a'],
    },
  ],
  indexed_change: 1,
  newly_indexed: ['https://brand.com/b'],
  dropped: [],
  to_request: [
    {
      url: 'https://brand.com/c',
      reason: 'Found, not crawled yet',
      inspect_url: 'https://search.google.com/search-console/inspect?resource_id=x&id=c',
    },
  ],
  requested: [],
}

describe('indexing API', () => {
  it('reads the report in the backend shape', async () => {
    const fetchMock = serve(READY)
    const report = await getIndexing('brand')
    expect(report).toMatchObject({ status: 'ready', indexed: 1, notIndexed: 2, indexedChange: 1 })
    expect(report.reasons[0].fixable).toBe(true)
    expect(report.toRequest[0]).toMatchObject({ url: 'https://brand.com/c', requestedAt: null })
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('/api/agent-mode/programs/brand/indexing')
  })

  it('asks for a check with a POST and passes on why one was refused', async () => {
    const fetchMock = serve({ ...READY, status: 'checking' }, 202)
    expect((await checkIndexingNow('brand')).status).toBe('checking')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/agent-mode/programs/brand/indexing/check')
    expect(init.method).toBe('POST')
    serve({ detail: 'A check ran recently.', code: 'check_not_started' }, 409)
    await expect(checkIndexingNow('brand')).rejects.toThrow('A check ran recently.')
  })
})
