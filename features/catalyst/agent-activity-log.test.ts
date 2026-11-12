import { describe, expect, it } from 'vitest'

import type { ActivityEntry } from '@/lib/api/agent-mode-activity'

import { describeActivity } from './agent-activity-log'

function entry(over: Partial<ActivityEntry>): ActivityEntry {
  return {
    id: 1,
    channel: 'outreach_email',
    action: 'prepared',
    outcome: 'succeeded',
    taskTitle: 'Pitch ahrefs.com for a mention',
    detail: {},
    createdAt: '2026-11-12T10:00:00Z',
    ...over,
  }
}

describe('describeActivity', () => {
  it('says plainly when no contact was found, and that it waits for the owner', () => {
    const line = describeActivity(
      entry({ action: 'contact_not_found', detail: { domain: 'hubspot.com' } }),
    )
    expect(line.title).toBe('No public contact email on hubspot.com')
    expect(line.detail).toMatch(/add an email.*or skip/)
    expect(line.tone).toBe('attention')
  })

  it('shows fact-check concerns as concerns, not as a refusal', () => {
    const line = describeActivity(
      entry({ action: 'drafted_with_concerns', detail: { concerns: ['Claims 40% growth.'] } }),
    )
    expect(line.title).toMatch(/^Drafted with fact-check concerns/)
    expect(line.detail).toBe('Claims 40% growth.')
  })

  it('names drafts, decisions and sends', () => {
    expect(describeActivity(entry({})).title).toBe('Drafted: Pitch ahrefs.com for a mention')
    expect(describeActivity(entry({ action: 'approved' })).title).toMatch(/^You approved/)
    expect(describeActivity(entry({ action: 'publish' })).title).toMatch(/^Sent/)
    expect(describeActivity(entry({ action: 'publish', outcome: 'failed' })).tone).toBe('danger')
  })

  it('still reads sensibly for an action it does not know', () => {
    expect(describeActivity(entry({ action: 'something_new' })).title).toBe(
      'Something new: Pitch ahrefs.com for a mention',
    )
  })
})
