import { describe, expect, it } from 'vitest'

import { engineFromHost } from './engine-domains'

describe('engineFromHost', () => {
  it('resolves the obvious engines', () => {
    expect(engineFromHost('chatgpt.com')).toBe('chatgpt')
    expect(engineFromHost('perplexity.ai')).toBe('perplexity')
    expect(engineFromHost('claude.ai')).toBe('claude')
  })

  it('prefers the most specific domain', () => {
    // The whole reason the list is sorted by length: matching google.com first
    // would file every Gemini referral under plain search.
    expect(engineFromHost('gemini.google.com')).toBe('gemini')
    expect(engineFromHost('google.com')).toBe('google')
  })

  it('normalises scheme, www and trailing path', () => {
    expect(engineFromHost('https://www.perplexity.ai/search?q=x')).toBe('perplexity')
    expect(engineFromHost('  ChatGPT.com  ')).toBe('chatgpt')
  })

  it('matches subdomains but not lookalikes', () => {
    expect(engineFromHost('chat.chatgpt.com')).toBe('chatgpt')
    expect(engineFromHost('notchatgpt.com')).toBeNull()
  })

  it('returns null for anything else', () => {
    expect(engineFromHost('example.com')).toBeNull()
    expect(engineFromHost('')).toBeNull()
  })
})
