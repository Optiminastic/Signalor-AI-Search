import { describe, expect, it } from 'vitest'

import {
  latestFor,
  positionMove,
  positionText,
  seriesFor,
} from '@/features/catalyst/components/agent-page/tracking/tracking-data'
import type { RankTracking } from '@/lib/api/agent-mode-rank-tracking'

const REPORT: RankTracking = {
  players: [
    { name: 'Pro Brand', domain: 'pro.example', isBrand: true },
    { name: 'Acme', domain: 'acme.io', isBrand: false },
  ],
  keywords: [],
  geo: [
    { week: '2026-11-02', brand: 10, rivals: { Acme: 40 } },
    { week: '2026-11-09', brand: 14, rivals: { Acme: 38 } },
  ],
  seo: {
    weeks: [
      {
        week: '2026-11-02',
        keywords: 10,
        domains: {
          'pro.example': { top10: 2, ranked: 5, average: 20 },
          'acme.io': { top10: 6, ranked: 9, average: 8 },
        },
      },
      {
        week: '2026-11-09',
        keywords: 10,
        domains: {
          'pro.example': { top10: 3, ranked: 6, average: 18 },
          'acme.io': { top10: 6, ranked: 9, average: 8 },
        },
      },
    ],
    latest: [],
  },
  brand: {
    weeks: [
      {
        week: '2026-11-09',
        total: 20,
        domains: {
          'pro.example': { mentions: 5, positive: 2, negative: 1 },
          'acme.io': { mentions: 15, positive: 4, negative: 3 },
        },
      },
    ],
    latest: {},
  },
  checking: false,
  lastCheckAt: null,
}

describe('tracking data', () => {
  it('GEO lines are share of AI answers, brand from brand, rivals by name', () => {
    expect(seriesFor('geo', REPORT).map(s => s.points)).toEqual([
      [10, 14],
      [40, 38],
    ])
  })

  it('SEO is a share of tracked keywords, Brand a share of all mentions', () => {
    expect(seriesFor('seo', REPORT)[0].points).toEqual([20, 30])
    expect(seriesFor('brand', REPORT).map(s => s.points)).toEqual([[25], [75]])
  })

  it('latest values come with the change since last week', () => {
    const [brand, rival] = latestFor('seo', REPORT)
    expect(brand).toMatchObject({ now: 30, change: 10 })
    expect(rival.change).toBe(0)
    expect(latestFor('brand', REPORT)[0].change).toBeNull()
  })

  it('positions read as #n or 100+, and a smaller number is a move up', () => {
    expect(positionText(4)).toBe('#4')
    expect(positionText(null)).toBe('100+')
    expect(positionMove(4, 9)).toBe('up')
    expect(positionMove(12, 9)).toBe('down')
    expect(positionMove(4, null)).toBeNull()
  })
})
