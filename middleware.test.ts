import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { middleware } from '@/middleware'

/**
 * The auth gate, pinned against the failure that stranded every user whose
 * session expired.
 *
 * A cookie is not a session. When the middleware trusted mere cookie presence,
 * an expired cookie passed the /dashboard check, `get-session` then returned
 * null, and the page waited forever on data gated behind the missing email —
 * while /sign-in bounced straight back to /dashboard because a cookie existed.
 * There was no way back into the app. Both halves are asserted below.
 */

// `getSessionCookie` only reads the header; drive it with a real Cookie header
// rather than mocking, so these tests exercise the same parsing production does.
const STALE = 'better-auth.session_token=expired-value.signature'
const LIVE_BODY = JSON.stringify({ user: { email: 'a@b.com' }, session: { id: 's1' } })

function request(path: string, cookie?: string): NextRequest {
  return new NextRequest(`https://signalor.ai${path}`, {
    headers: cookie ? { cookie } : {},
  })
}

/** Stand in for `/api/auth/get-session`. */
function mockSession(body: string | null, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(body ?? 'null', { status: ok ? 200 : 500 })),
  )
}

function mockSessionUnreachable(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('auth service unreachable')
    }),
  )
}

const event = { waitUntil: (): void => undefined } as never

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('middleware auth gate', () => {
  it('sends a visitor with no cookie to sign-in', async () => {
    mockSession(null)
    const res = await middleware(request('/dashboard'), event)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/sign-in?callbackUrl=%2Fdashboard')
  })

  it('sends an EXPIRED cookie to sign-in instead of hanging the dashboard', async () => {
    mockSession('null')
    const res = await middleware(request('/dashboard', STALE), event)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/sign-in')
  })

  it('lets a LIVE session through to the dashboard', async () => {
    mockSession(LIVE_BODY)
    const res = await middleware(request('/dashboard', STALE), event)
    // No redirect: NextResponse.next() leaves the request to the page.
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('lets an EXPIRED cookie reach /sign-in rather than bouncing it away', async () => {
    mockSession('null')
    const res = await middleware(request('/sign-in', STALE), event)
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('still bounces a LIVE session away from /sign-in', async () => {
    mockSession(LIVE_BODY)
    const res = await middleware(request('/sign-in', STALE), event)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/dashboard')
  })

  it('fails OPEN when the auth service is unreachable', async () => {
    // An auth blip must not sign out every user in the middle of their work.
    mockSessionUnreachable()
    const res = await middleware(request('/dashboard', STALE), event)
    expect(res.status).toBe(200)
  })

  it('leaves public marketing routes alone', async () => {
    mockSession('null')
    const res = await middleware(request('/pricing'), event)
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})
