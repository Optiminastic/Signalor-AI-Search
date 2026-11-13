import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSocial } from './agent-mode-social'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('social API', () => {
  it('reads the score per platform and the notes', async () => {
    const body = {
      status: 'ready',
      checked_at: '2026-11-13T09:00:00Z',
      change: 6,
      labels: { youtube: 'YouTube' },
      overall: { score: 18.4, partial: true },
      platforms: {
        youtube: {
          score: 62,
          parts: { presence: 12, audience: 20, activity: 30 },
          not_measured: ['engagement'],
          found: true,
          profile: { url: 'https://www.youtube.com/@Brand', source: 'serper', followers: 84 },
        },
      },
      reddit: null,
      notes: ['Reddit mentions need a Reddit API app on the server.'],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
    )
    const report = await getSocial('brand')
    expect(report.overall).toEqual({ score: 18.4, partial: true })
    expect(report.platforms.youtube).toMatchObject({ score: 62, notMeasured: ['engagement'] })
    expect(report.notes).toHaveLength(1)
  })

  it('reads a brand that was never checked', async () => {
    const body = { status: 'never_checked', checked_at: null }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
    )
    const report = await getSocial('brand')
    expect(report.status).toBe('never_checked')
    expect(report.overall).toBeNull()
  })
})
