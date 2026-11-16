import { afterEach, describe, expect, it, vi } from 'vitest'

import { disconnectGmail, getGmail, startGmailSignIn } from '@/lib/api/agent-mode-gmail'

function reply(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('Gmail connection API', () => {
  it('reads whether Gmail is connected and which mailbox', async () => {
    reply({ connected: true, mailbox: 'hello@brand.com' })
    expect(await getGmail('brand')).toEqual({ connected: true, mailbox: 'hello@brand.com' })
  })

  it('asks for Google’s page with this page as the way back', async () => {
    reply({ auth_url: 'https://accounts.google.com/o/oauth2/auth?x=1' })
    const url = await startGmailSignIn('brand', 'http://localhost:3002/dashboard/brand/agent-mode')
    expect(url).toContain('accounts.google.com')
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(init.body))).toEqual({
      return_url: 'http://localhost:3002/dashboard/brand/agent-mode',
    })
  })

  it('disconnects with a POST the proxy forwards', async () => {
    reply({ connected: false, mailbox: '' })
    expect((await disconnectGmail('brand')).connected).toBe(false)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toBe('/api/agent-mode/programs/brand/connections/gmail/disconnect')
    expect((init as RequestInit).method).toBe('POST')
  })
})
