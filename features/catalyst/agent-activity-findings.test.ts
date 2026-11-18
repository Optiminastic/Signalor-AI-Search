import { describe, expect, it } from 'vitest'

import { describeActivity } from '@/features/catalyst/agent-activity-log'
import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

function entry(overrides: Partial<ActivityEntry>): ActivityEntry {
  return {
    id: 1,
    channel: '',
    action: 'publish',
    outcome: 'succeeded',
    taskTitle: 'A task',
    detail: {},
    category: 'other',
    createdAt: '2026-11-17T10:00:00Z',
    ...overrides,
  }
}

describe('what was sent reads by channel', () => {
  it.each([
    [
      { channel: 'satellite_content', detail: { url: 'https://www.brightsfindings.com/a' } },
      'Published your article on brightsfindings.com',
    ],
    [
      { channel: 'guest_outreach', detail: { domain: 'geo-weekly.com' } },
      'Sent a guest-post pitch to geo-weekly.com',
    ],
    [
      { channel: 'outreach_email', detail: { domain: 'hubspot.com', sequence: 2 } },
      'Sent follow-up 2 to hubspot.com',
    ],
    [
      { channel: 'owned_social', detail: { platform: 'linkedin' } },
      'Added your LinkedIn post to Buffer',
    ],
  ])('%o', (overrides, title) => {
    expect(describeActivity(entry(overrides)).title).toBe(title)
  })
})

describe('keyword findings', () => {
  it('names a golden keyword with demand and who ranks', () => {
    const line = describeActivity(
      entry({
        action: 'golden_keywords_found',
        detail: {
          keywords: [{ keyword: 'geo audit', search_volume: 2400, rival: 'acme.io', position: 2 }],
        },
      }),
    )
    expect(line.title).toBe('Golden keyword: geo audit')
    expect(line.detail).toContain('acme.io is #2')
  })

  it('flags ranking drops for attention', () => {
    const line = describeActivity(
      entry({
        action: 'keyword_rank_changes',
        detail: { left: [{ keyword: 'ai seo', from: 8, to: 14 }], up: [], down: [], entered: [] },
      }),
    )
    expect(line.detail).toBe('Out of the top 10: ai seo #8→#14')
    expect(line.tone).toBe('attention')
  })
})

describe('site watch', () => {
  it('a site that goes down is a danger line', () => {
    const line = describeActivity(
      entry({ action: 'site_anomaly', detail: { kind: 'site_down', status: 503 } }),
    )
    expect(line.title).toBe('Your site is down')
    expect(line.tone).toBe('danger')
  })

  it('an AI bot blocked in robots.txt explains the cost', () => {
    const line = describeActivity(
      entry({
        action: 'site_anomaly',
        detail: { kind: 'robots_blocked', bots: ['GPTBot'], severity: 'attention' },
      }),
    )
    expect(line.title).toBe('robots.txt now blocks GPTBot')
    expect(line.detail).toContain('AI engines')
  })

  it('a clean daily check is a quiet line', () => {
    const line = describeActivity(entry({ action: 'site_checked', detail: { anomalies: 0 } }))
    expect(line.title).toBe('Checked your site: all looks fine')
  })
})
