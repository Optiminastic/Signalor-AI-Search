import { afterEach, describe, expect, it, vi } from 'vitest'

import { findGuestSitesNow, getGuestPosts } from '@/lib/api/agent-mode-guest-posts'

const SITE = {
  task_id: 7,
  domain: 'geo-weekly.com',
  guidelines_url: 'https://geo-weekly.com/write-for-us',
  source: 'cited',
  topic: 'AI citations',
  reason: 'AI answers already cite this site, and it invites guest articles.',
  scheduled_for: '2026-11-16',
  stage: 'to_pitch',
}

function reply(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('guest posts API', () => {
  it('reads the sites and where each stands', async () => {
    reply({
      sites: [SITE],
      monthly_cap: 8,
      notes: [],
      searching: false,
      last_search_at: null,
      last_found: null,
    })
    const report = await getGuestPosts('brand')
    expect(report.sites[0]).toMatchObject({
      taskId: 7,
      domain: 'geo-weekly.com',
      source: 'cited',
      stage: 'to_pitch',
    })
    expect(report.monthlyCap).toBe(8)
  })

  it('treats an unknown stage as to pitch instead of failing', async () => {
    reply({ sites: [{ ...SITE, stage: 'something_new' }] })
    expect((await getGuestPosts('brand')).sites[0].stage).toBe('to_pitch')
  })

  it('reads a sent pitch and its follow-ups', async () => {
    const pitch = {
      sent_on: '2026-11-16',
      followups_sent: 1,
      next_follow_up_on: '2026-11-25',
      replied_at: null,
    }
    reply({ sites: [{ ...SITE, stage: 'pitched', pitch }] })
    const site = (await getGuestPosts('brand')).sites[0]
    expect(site.stage).toBe('pitched')
    expect(site.pitch).toEqual({
      sentOn: '2026-11-16',
      followupsSent: 1,
      nextFollowUpOn: '2026-11-25',
      repliedAt: null,
    })
  })

  it('posts to the find endpoint', async () => {
    reply({ sites: [], searching: true })
    expect((await findGuestSitesNow('brand')).searching).toBe(true)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toBe('/api/agent-mode/programs/brand/guest-posts/find')
  })
})
