import { describe, expect, it } from 'vitest'

import type { Projection } from '@/lib/api/projection'

import { buildStats } from './projection-stats'

function projection(over: Partial<Projection> = {}): Projection {
  return {
    window_days: 30,
    generated_at: '2026-08-07T00:00:00Z',
    visibility: { current: 20, target: 36, delta: 16 },
    recommendation: { current: 25, target: 40, delta: 15 },
    competitors: { to_pass: 1, names: ['NearCo'], total_ahead: 2 },
    prompts: { to_improve: 2, total: 4 },
    ...over,
  }
}

describe('buildStats', () => {
  it('maps a growing projection to four positive outcomes', () => {
    const stats = buildStats(projection())
    expect(stats).toHaveLength(4)
    const [vis, ahead, promptsStat, rec] = stats
    expect(vis.value).toBe('Reach 36%')
    expect(vis.sub).toBe('+16 points from 20%')
    expect(vis.positive).toBe(true)
    expect(ahead.value).toBe('Overtake 1')
    expect(ahead.sub).toBe('2 ahead today')
    expect(promptsStat.value).toBe('Strengthen 2')
    expect(promptsStat.sub).toBe('of 4 tracked')
    expect(rec.value).toBe('25% → 40%')
  })

  it('phrases the no-gain / already-winning cases without awkward plurals', () => {
    const stats = buildStats(
      projection({
        visibility: { current: 100, target: 100, delta: 0 },
        recommendation: { current: 100, target: 100, delta: 0 },
        competitors: { to_pass: 0, names: [], total_ahead: 0 },
        prompts: { to_improve: 0, total: 12 },
      }),
    )
    const [vis, ahead, promptsStat, rec] = stats
    expect(vis.value).toBe('Reach 100%')
    expect(vis.sub).toBe('Hold at 100%')
    expect(vis.positive).toBe(false)
    expect(ahead.value).toBe('Hold your lead')
    expect(ahead.sub).toBe('No one ahead')
    expect(promptsStat.value).toBe('All prompts strong')
    expect(promptsStat.sub).toBe('of 12 tracked')
    expect(rec.sub).toBe('Steady')
  })
})
