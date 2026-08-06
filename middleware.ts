import { getSessionCookie } from 'better-auth/cookies'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { env } from '@/lib/env'

// User-agent needles for the AI crawlers the backend stores. Kept identical to
// AI_CRAWLERS in the backend's crawler_bots.py: the ingest endpoint re-derives
// the bot from the user agent and silently discards anything it doesn't
// recognise, so a needle that differs here only buys us wasted requests.
// Note the deliberate omissions — plain `applebot` is not tracked, only
// `applebot-extended` (the AI-training crawler).
const AI_BOT_NEEDLES = [
  'gptbot',
  'oai-searchbot',
  'chatgpt-user',
  'claudebot',
  'claude-user',
  'claude-searchbot',
  'anthropic-ai',
  'perplexitybot',
  'perplexity-user',
  'google-extended',
  'googleother',
  'bytespider',
  'ccbot',
  'meta-externalagent',
  'amazonbot',
  'applebot-extended',
  'mistralai',
  'deepseekbot',
  'grokbot',
] as const

const AI_BOT_PATTERN = new RegExp(AI_BOT_NEEDLES.join('|'))

const CRAWLER_INGEST_PATH = '/api/analyzer/crawler/ingest/'

/**
 * Report an AI-crawler visit to the backend's Crawler Logs, best-effort.
 *
 * Handed to `event.waitUntil` rather than left as a floating promise: the Edge
 * runtime may tear the invocation down as soon as the response is returned, so
 * an un-awaited fetch is not guaranteed to be sent. Never awaited by the caller
 * and never allowed to throw — a logging failure must not cost a page view.
 */
function reportCrawlerHit(request: NextRequest, event: NextFetchEvent): void {
  const token = env.SIGNALOR_CRAWLER_INGEST_TOKEN
  if (!token) return

  const userAgent = request.headers.get('user-agent') ?? ''
  if (!AI_BOT_PATTERN.test(userAgent.toLowerCase())) return

  event.waitUntil(
    fetch(`${env.NEXT_PUBLIC_API_URL}${CRAWLER_INGEST_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token,
        hits: [
          {
            path: request.nextUrl.pathname,
            user_agent: userAgent,
            // Explicitly UTC: the backend discards naive timestamps and stamps
            // its own server time in their place.
            ts: new Date().toISOString(),
          },
        ],
      }),
    }).catch(() => undefined),
  )
}

// Every authenticated app route, so an unauthenticated user is bounced before
// the page loads. This is defense-in-depth UX only — a session cookie's mere
// presence is checked here, NOT its signature; real access control is enforced
// by the backend on every data request.
const protectedRoutes = [
  '/dashboard',
  '/creator-dashboard',
  '/onboarding',
  '/loading',
  '/payments',
  '/profile',
  '/settings',
]
// /sign-in and /sign-up are deliberately NOT gated, and a visitor who already
// holds a session cookie is deliberately NOT redirected away from them.
//
// `getSessionCookie` proves a cookie was sent, never that it is still valid.
// Bouncing on presence alone locked out every user whose session had expired:
// the dead cookie sent them from /sign-in to /dashboard, where the page waits
// on data gated behind a session that no longer exists — so it span forever,
// and returning to /sign-in bounced them straight back. There was no way to
// sign in again at all, short of hand-clearing an httpOnly cookie.
//
// Signing in while already signed in is harmless (better-auth just issues a
// fresh session), so a login page that is always reachable is worth far more
// than the convenience redirect. Validating the session here instead was tried
// and reverted: a server-to-server call to get-session carries cookies without
// a matching Origin, which fails better-auth's CSRF check (see lib/auth.ts),
// so every genuine fresh login came back as "expired".

export async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
): Promise<NextResponse> {
  // Before any redirect: a bot that gets bounced from /dashboard still visited
  // the site, and that visit is exactly what Crawler Logs is measuring.
  reportCrawlerHit(request, event)

  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
