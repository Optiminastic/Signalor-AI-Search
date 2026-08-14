import { describe, expect, it } from 'vitest'

import type { TrendSeries } from '@/hooks/useInsights'

import { latestOf, sliceRecent, trendState } from './trend-series'

const OK = { isLoading: false, isError: false }

function series(points: number[], key = 'chatgpt'): TrendSeries {
  return { key, label: key, color: '#000', points }
}

describe('trendState', () => {
  it('reports loading and error ahead of any data check', () => {
    expect(trendState({ isLoading: true, isError: false }, 0, 0)).toBe('loading')
    expect(trendState({ isLoading: false, isError: true }, 3, 8)).toBe('error')
  })

  it('treats a week of zero mentions as real data, not as missing data', () => {
    expect(trendState(OK, 2, 4)).toBe('ready')
  })

  it('is empty only when nothing was measured at all', () => {
    expect(trendState(OK, 0, 4)).toBe('empty')
    expect(trendState(OK, 3, 0)).toBe('empty')
  })

  // The regression this file exists for: one week used to be duplicated into a
  // second, unlabelled point so a polyline would draw, which reported a flat
  // trend across a span nothing was measured over.
  it('refuses to call a single week a trend', () => {
    expect(trendState(OK, 5, 1)).toBe('single')
  })
})

describe('sliceRecent', () => {
  it('keeps weeks and every series aligned when windowing', () => {
    const windowed = sliceRecent(
      {
        weeks: ['Jul 6', 'Jul 13', 'Jul 20', 'Jul 27'],
        series: [series([1, 2, 3, 4]), series([5, 6, 7, 8], 'claude')],
      },
      2,
    )
    expect(windowed.weeks).toEqual(['Jul 20', 'Jul 27'])
    expect(windowed.series.map(s => s.points)).toEqual([
      [3, 4],
      [7, 8],
    ])
  })

  it('passes the history through when the window is wider than the data', () => {
    const full = { weeks: ['Jul 27'], series: [series([9])] }
    expect(sliceRecent(full, 12)).toEqual(full)
    expect(sliceRecent(full, 0)).toEqual(full)
  })
})

describe('latestOf', () => {
  it('reads the most recent point, and 0 when a series has none', () => {
    expect(latestOf(series([4, 11]))).toBe(11)
    expect(latestOf(series([]))).toBe(0)
  })
})
