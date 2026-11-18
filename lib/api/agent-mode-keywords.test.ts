import { afterEach, describe, expect, it, vi } from 'vitest'

import { getKeywords, refreshKeywordsNow } from '@/lib/api/agent-mode-keywords'

function reply(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('keywords API', () => {
  it('reads the brand keywords and the gaps', async () => {
    reply({
      keywords: [{ keyword: 'ai visibility', position: 4, search_volume: 880, url: 'https://x/a' }],
      gaps: [
        {
          keyword: 'geo audit',
          search_volume: 1300,
          rivals: [{ name: 'Acme', domain: 'acme.io', position: 2 }],
          new: true,
        },
      ],
      new_gaps: 1,
      competitors: [{ name: 'Acme', domain: 'acme.io' }],
      fetched_at: '2026-11-16T10:00:00Z',
      refreshing: false,
      notes: [],
    })
    const report = await getKeywords('brand')
    expect(report.keywords[0]).toEqual({
      keyword: 'ai visibility',
      position: 4,
      searchVolume: 880,
      url: 'https://x/a',
    })
    expect(report.gaps[0]).toMatchObject({ keyword: 'geo audit', searchVolume: 1300, isNew: true })
    expect(report.newGaps).toBe(1)
  })

  it('treats a missing report as empty instead of failing', async () => {
    reply({})
    const report = await getKeywords('brand')
    expect(report.gaps).toEqual([])
    expect(report.fetchedAt).toBeNull()
  })

  it('posts to the refresh endpoint', async () => {
    reply({ refreshing: true })
    expect((await refreshKeywordsNow('brand')).refreshing).toBe(true)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toBe('/api/agent-mode/programs/brand/keywords/refresh')
  })
})
