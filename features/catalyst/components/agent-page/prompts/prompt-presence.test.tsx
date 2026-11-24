import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PromptCard } from '@/features/catalyst/components/agent-page/prompts/PromptCard'
import { getPromptPresence, type PromptPresence } from '@/lib/api/agent-mode-prompt-presence'

const presence: PromptPresence = {
  prompt: 'best 3d printer for beginners',
  results: {
    reddit: [
      {
        url: 'https://www.reddit.com/r/3dprinter/comments/1/best/',
        title: 'What did you buy first?',
        snippet: '',
        community: 'r/3dprinter',
        position: 1,
        mentionsBrand: false,
      },
    ],
    linkedin: [],
    x: [
      {
        url: 'https://x.com/maker/status/1',
        title: 'Starter printers thread',
        snippet: '',
        community: '',
        position: 1,
        mentionsBrand: true,
      },
    ],
    google: [
      {
        url: 'https://www.tomshardware.com/best',
        title: '',
        snippet: '',
        community: '',
        position: 1,
        mentionsBrand: false,
      },
    ],
  },
  subreddits: [{ name: 'r/3dprinter', threads: 2 }],
  brandPresentOn: ['x'],
}

const api = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/lib/api/agent-mode-request', async importOriginal => ({
  ...(await importOriginal<object>()),
  agentModeRequest: api.request,
}))

afterEach(() => vi.clearAllMocks())

describe('PromptCard', () => {
  it('shows subreddits, threads, posts and links per platform', () => {
    const html = renderToStaticMarkup(<PromptCard presence={presence} open />)
    expect(html).toContain('best 3d printer for beginners')
    expect(html).toContain('r/3dprinter · 2')
    expect(html).toContain('Reddit threads')
    expect(html).toContain('X posts')
    expect(html).toContain('tomshardware.com') // a title-less link shows its site
    expect(html).not.toContain('LinkedIn posts') // empty platforms are left out
  })

  it('marks where the brand already appears', () => {
    const html = renderToStaticMarkup(<PromptCard presence={presence} open />)
    expect(html).toContain('You appear on X')
    expect(html).toContain('mentions you')
  })

  it('says when the brand is not in any result', () => {
    const html = renderToStaticMarkup(
      <PromptCard presence={{ ...presence, brandPresentOn: [] }} open />,
    )
    expect(html).toContain('Not mentioned yet')
  })
})

describe('getPromptPresence', () => {
  it('reads the report through the signed proxy and parses it', async () => {
    api.request.mockImplementation(
      async (_path: string, schema: { parse: (v: unknown) => unknown }) =>
        schema.parse({
          checked_at: null,
          checking: false,
          tracked_prompts: 3,
          prompts: [{ prompt: 'p', reddit: [], subreddits: [], brand_present_on: ['google'] }],
        }),
    )
    const report = await getPromptPresence('brand')
    expect(api.request.mock.calls[0]?.[0]).toBe('programs/brand/prompt-presence')
    expect(report.trackedPrompts).toBe(3)
    expect(report.prompts[0]?.results.google).toEqual([])
    expect(report.prompts[0]?.brandPresentOn).toEqual(['google'])
  })
})
