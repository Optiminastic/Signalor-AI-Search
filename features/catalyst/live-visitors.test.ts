import { describe, expect, it } from 'vitest'

import { liveVisitorsSchema } from '@/lib/api/live-visitors'

import {
  botRows,
  classifySources,
  engineForBot,
  relativeTime,
  shortBotLabel,
} from './live-visitors'

describe('classifySources', () => {
  it('separates AI answer engines from ordinary traffic', () => {
    const { ai, other } = classifySources([
      { source: 'chatgpt.com', channel: 'Referral', sessions: 34 },
      { source: 'google', channel: 'Organic Search', sessions: 61 },
      { source: 'perplexity.ai', channel: 'Referral', sessions: 8 },
    ])
    expect(ai.map(r => r.engine)).toEqual(['chatgpt', 'perplexity'])
    expect(other.map(r => r.source)).toEqual(['google'])
  })

  it('does not count search engines as AI referrals', () => {
    // Google and Bing are in the domain map for favicons; counting them here
    // would drown the AI cut in ordinary search traffic.
    const { ai } = classifySources([
      { source: 'google.com', channel: 'Organic Search', sessions: 90 },
      { source: 'bing.com', channel: 'Organic Search', sessions: 4 },
    ])
    expect(ai).toEqual([])
  })

  it('tolerates GA placeholder sources', () => {
    const { ai, other } = classifySources([
      { source: '(direct)', channel: 'Direct', sessions: 12 },
      { source: '(not set)', channel: '', sessions: 1 },
    ])
    expect(ai).toEqual([])
    expect(other).toHaveLength(2)
    expect(other.every(r => r.engine === null)).toBe(true)
  })
})

describe('engineForBot', () => {
  it('maps every OpenAI crawler onto one logo', () => {
    expect(engineForBot('gptbot')).toBe('chatgpt')
    expect(engineForBot('oai-searchbot')).toBe('chatgpt')
    expect(engineForBot('chatgpt-user')).toBe('chatgpt')
  })

  it('maps the Anthropic family', () => {
    expect(engineForBot('claudebot')).toBe('claude')
    expect(engineForBot('anthropic-ai')).toBe('claude')
  })

  it('returns null for an unknown bot rather than guessing', () => {
    expect(engineForBot('somenewbot')).toBeNull()
  })
})

describe('relativeTime', () => {
  const now = Date.parse('2026-08-06T12:00:00Z')

  it('reads naturally at the short end', () => {
    expect(relativeTime('2026-08-06T12:00:00Z', now)).toBe('just now')
    expect(relativeTime('2026-08-06T11:59:00Z', now)).toBe('1m ago')
    expect(relativeTime('2026-08-06T11:42:00Z', now)).toBe('18m ago')
  })

  it('degrades to empty on an unparseable timestamp', () => {
    expect(relativeTime('not-a-date', now)).toBe('')
  })
})

describe('botRows', () => {
  it('decorates each hit with an engine and a relative time', () => {
    const rows = botRows(
      [
        {
          bot: 'gptbot',
          label: 'GPT Bot (OpenAI)',
          path: '/pricing',
          hits: 5,
          last_seen: '2026-08-06T11:58:00Z',
        },
      ],
      Date.parse('2026-08-06T12:00:00Z'),
    )
    expect(rows[0].engine).toBe('chatgpt')
    expect(rows[0].when).toBe('2m ago')
  })
})

describe('liveVisitorsSchema', () => {
  it('parses a fully degraded payload instead of throwing', () => {
    // The backend answers 200 with a partial body when GA is down; a schema
    // that threw here would take the whole top bar with it.
    const parsed = liveVisitorsSchema.parse({})
    expect(parsed.live_total).toBe(0)
    expect(parsed.humans.available).toBe(false)
    expect(parsed.bots.rows).toEqual([])
  })

  it('keeps an unknown reason usable', () => {
    const parsed = liveVisitorsSchema.parse({ humans: { reason: 'something_new' } })
    expect(parsed.humans.reason).toBe('api_error')
  })
})

describe('shortBotLabel', () => {
  it('drops the vendor parenthetical the logo already shows', () => {
    expect(shortBotLabel('GPT Bot (OpenAI)')).toBe('GPT Bot')
    expect(shortBotLabel('Claude Bot (Anthropic)')).toBe('Claude Bot')
  })

  it('leaves a label without one alone', () => {
    expect(shortBotLabel('Amazonbot')).toBe('Amazonbot')
  })

  it('never returns empty', () => {
    expect(shortBotLabel('(OpenAI)')).toBe('(OpenAI)')
  })
})
