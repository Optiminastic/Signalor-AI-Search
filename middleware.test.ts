import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { middleware } from '@/middleware'

/**
 * The auth gate, pinned against the lockout it caused.
 *
 * `getSessionCookie` proves a cookie was sent, never that it is still valid.
 * While /sign-in redirected away on cookie presence alone, a user whose session
 * had expired was sent to /dashboard — which waits forever on data gated behind
 * the session they no longer have — and bounced again on the way back. The
 * login page has to stay reachable no matter what cookie is in the jar.
 *
 * No `fetch` is mocked here: the middleware does not make one. An earlier
 * version validated the session over HTTP and its tests passed against a mocked
 * fetch while the real call could never succeed, so these assertions
 * deliberately cover only behaviour that runs for real.
 */

const STALE = 'better-auth.session_token=expired-value.signature'

function run(path: string, cookie?: string): Promise<Response> {
  const request = new NextRequest(`https://signalor.ai${path}`, {
    headers: cookie ? { cookie } : {},
  })
  return Promise.resolve(
    middleware(request, { waitUntil: (): void => undefined } as never),
  ) as Promise<Response>
}

describe('middleware auth gate', () => {
  it.each(['/sign-in', '/sign-up'])('keeps %s reachable with a stale cookie', async path => {
    const res = await run(path, STALE)
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it.each(['/sign-in', '/sign-up'])('keeps %s reachable with no cookie', async path => {
    const res = await run(path)
    expect(res.status).toBe(200)
  })

  it('sends a visitor with no cookie away from a protected route', async () => {
    const res = await run('/dashboard')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/sign-in?callbackUrl=%2Fdashboard')
  })

  it('preserves the intended destination in callbackUrl', async () => {
    const res = await run('/settings')
    expect(res.headers.get('location')).toContain('callbackUrl=%2Fsettings')
  })

  it('lets a cookie-bearing request reach a protected route', async () => {
    // Validity is the page's and the backend's business, never the edge's.
    const res = await run('/dashboard', STALE)
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('leaves public marketing routes alone', async () => {
    const res = await run('/pricing')
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})
