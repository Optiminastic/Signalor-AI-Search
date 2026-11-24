import { describe, expect, it } from 'vitest'

import { replyActions } from '@/features/catalyst/components/agent-page/reply-actions'

describe('replyActions', () => {
  it('opens the tab for the tools the reply used', () => {
    expect(replyActions(['get_approvals'], 'Three drafts wait.', []).tabs).toEqual(['approvals'])
    expect(replyActions(['find_guest_sites'], 'Search started.', []).tabs).toEqual(['guest'])
  })

  it('adds tabs the reply names, at most two, without repeats', () => {
    const { tabs } = replyActions(
      ['get_approvals'],
      'Approve them in Approvals, then check Guest posts and Indexing.',
      [],
    )
    expect(tabs).toEqual(['approvals', 'guest'])
  })

  it('suggests follow-ups for the tools used, then general ones, at most three', () => {
    const { followUps } = replyActions(['get_indexing'], '12 pages indexed.', [])
    expect(followUps).toHaveLength(3)
    expect(followUps[0]).toBe('Which pages are not indexed yet?')
  })

  it('never offers a chip for a tab hidden from the board (Social and Keywords, for now)', () => {
    const { tabs } = replyActions(
      ['get_social', 'get_keywords'],
      'Your social score is 40 and you rank for 3 keywords.',
      [],
    )
    expect(tabs).not.toContain('social')
    expect(tabs).not.toContain('keywords')
  })

  it('never suggests a question the owner already asked', () => {
    const { followUps } = replyActions(['get_overview'], 'Status.', ['what should i do next? '])
    expect(followUps).not.toContain('What should I do next?')
  })

  it('falls back to general follow-ups for unknown tools and no tabs', () => {
    const actions = replyActions(['mystery_tool'], 'Hello.', [])
    expect(actions.tabs).toEqual([])
    expect(actions.followUps).toHaveLength(3)
  })
})

describe('replyActions connect', () => {
  it('offers to connect the tool the reply says is missing, Gmail first', () => {
    const text = 'Gmail is not connected yet, and Hunter would help too. Connect them from the +.'
    expect(replyActions([], text, []).connect).toBe('gmail')
  })

  it('offers nothing when no tool needs connecting', () => {
    expect(replyActions([], 'Your emails went out from Gmail.', []).connect).toBeNull()
    expect(replyActions([], 'Connect with editors in your niche.', []).connect).toBeNull()
  })
})
