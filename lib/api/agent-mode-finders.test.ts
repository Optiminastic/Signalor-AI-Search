import { afterEach, describe, expect, it, vi } from 'vitest'

import { connectFinder, disconnectFinder, listFinders } from './agent-mode-finders'

afterEach(() => {
  vi.unstubAllGlobals()
})

function serve(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const LISTING = {
  finders: [
    { provider: 'hunter', label: 'Hunter', connected: true, key_hint: 'abcd', source: 'account' },
    { provider: 'apollo', label: 'Apollo', connected: false, key_hint: '', source: 'none' },
  ],
}

describe('contact finder accounts API', () => {
  it('reads which finders are connected, with only the key hint', async () => {
    serve(LISTING)
    const finders = await listFinders('brand')
    expect(finders[0]).toEqual({
      provider: 'hunter',
      label: 'Hunter',
      connected: true,
      keyHint: 'abcd',
      source: 'account',
    })
    expect(finders[1].connected).toBe(false)
  })

  it('sends the key to the connect route as api_key', async () => {
    const fetchMock = serve(LISTING)
    await connectFinder({ orgSlug: 'brand', provider: 'hunter', apiKey: 'secret-key' })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/agent-mode/programs/brand/finders/hunter/connect')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ api_key: 'secret-key' })
  })

  it('disconnects with a POST, since the proxy has no DELETE', async () => {
    const fetchMock = serve(LISTING)
    await disconnectFinder('brand', 'apollo')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/agent-mode/programs/brand/finders/apollo/disconnect')
    expect(init.method).toBe('POST')
  })

  it("surfaces the backend's reason when a key is refused", async () => {
    serve({ detail: "Hunter didn't accept this API key.", code: 'key_rejected' }, 400)
    await expect(
      connectFinder({ orgSlug: 'brand', provider: 'hunter', apiKey: 'bad' }),
    ).rejects.toThrow("Hunter didn't accept this API key.")
  })
})
