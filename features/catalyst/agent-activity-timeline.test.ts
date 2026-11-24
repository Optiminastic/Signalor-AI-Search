import { describe, expect, it } from 'vitest'

import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

import { buildTimeline, dayLabel, targetFor } from './agent-activity-timeline'

function entry(overrides: Partial<ActivityEntry>): ActivityEntry {
  return {
    id: 1,
    channel: 'satellite_content',
    action: 'satellite_topics_planned',
    outcome: 'succeeded',
    taskTitle: '',
    detail: { count: 8 },
    category: 'articles',
    createdAt: '2026-11-24T14:01:00',
    ...overrides,
  }
}

const NOW = new Date('2026-11-24T18:00:00')

describe('buildTimeline', () => {
  it('folds back-to-back identical entries into one row with a count', () => {
    const days = buildTimeline(
      [
        entry({ id: 2, createdAt: '2026-11-24T14:01:30' }),
        entry({ id: 1, createdAt: '2026-11-24T14:01:00' }),
      ],
      NOW,
    )
    expect(days).toHaveLength(1)
    expect(days[0].rows).toHaveLength(1)
    expect(days[0].rows[0].count).toBe(2)
    expect(days[0].rows[0].firstAt).toBe('2026-11-24T14:01:00')
  })

  it('keeps entries that differ, and starts a new group per day', () => {
    const days = buildTimeline(
      [
        entry({ id: 3, detail: { count: 4 } }),
        entry({ id: 2 }),
        entry({ id: 1, createdAt: '2026-11-23T09:00:00' }),
      ],
      NOW,
    )
    expect(days.map(d => d.label)).toEqual(['Today', 'Yesterday'])
    expect(days[0].rows).toHaveLength(2)
  })

  it('does not fold repeats across days', () => {
    const days = buildTimeline(
      [entry({ id: 2 }), entry({ id: 1, createdAt: '2026-11-23T14:01:00' })],
      NOW,
    )
    expect(days.flatMap(d => d.rows).map(r => r.count)).toEqual([1, 1])
  })
})

describe('dayLabel', () => {
  it('shows a short date for older days, with the year only when it differs', () => {
    expect(dayLabel('2026-11-20T10:00:00', NOW)).toBe('Fri, Nov 20')
    expect(dayLabel('2025-11-20T10:00:00', NOW)).toBe('Thu, Nov 20, 2025')
  })
})

describe('targetFor', () => {
  it('points lines at the tab that holds the thing they talk about', () => {
    expect(targetFor('satellite_topics_planned')).toBe('approvals')
    expect(targetFor('indexing_checked')).toBe('indexing')
    expect(targetFor('site_checked')).toBeNull()
  })

  it('offers no button for a tab that is off the board', () => {
    for (const action of ['keywords_refreshed', 'golden_keywords_found', 'social_checked']) {
      expect(targetFor(action)).toBeNull()
    }
  })
})
