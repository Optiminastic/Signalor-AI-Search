import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSatelliteRanks } from './agent-mode-satellite'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('satellite ranks API', () => {
  it('reads each article with Google’s view of it', async () => {
    const body = {
      search_console: true,
      articles: [
        {
          task_id: 4,
          topic: 'ahrefs vs semrush',
          url: 'https://betterversus.com/ahrefs-vs-semrush',
          published_at: '2026-11-01T09:00:00Z',
          checked_at: '2026-11-10T09:00:00Z',
          check: {
            property_found: true,
            indexed: true,
            position: 7.4,
            clicks: 12,
            impressions: 300,
          },
          flag: '',
        },
      ],
    }
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const ranks = await getSatelliteRanks('brand')
    expect(ranks.searchConsole).toBe(true)
    expect(ranks.articles[0].check).toMatchObject({ indexed: true, position: 7.4, clicks: 12 })
    const [url] = fetchMock.mock.calls[0] as unknown as [string]
    expect(url).toBe('/api/agent-mode/programs/brand/indexing/satellite')
  })
})
