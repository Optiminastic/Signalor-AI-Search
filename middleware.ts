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

/**
 * Does the cookie we were sent still resolve to a live session?
 *
 * `getSessionCookie` only proves a cookie was *sent*, never that it is still
 * valid. A cookie that outlived its session therefore used to sail straight
 * through to /dashboard, where `get-session` returns null, `email` is undefined,
 * and every data query is gated on that email — so the page span forever with
 * no way out: /sign-in bounced back to /dashboard because a cookie existed.
 *
 * `/api/*` is excluded by this file's matcher, so calling the auth route here
 * cannot re-enter the middleware.
 */
async function hasLiveSession(request: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(new URL('/api/auth/get-session', request.nextUrl.origin), {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      cache: 'no-store',
    })
    if (!res.ok) return true // Treated as "unknown" — see the catch below.
    const body = (await res.text()).trim()
    return body !== '' && body !== 'null'
  } catch {
    // Fail OPEN. If the auth service blips, letting a real user through to a
    // page that handles its own empty state is recoverable; bouncing every
    // signed-in user to /sign-in is not.
    return true
  }
}

/** Send the user to sign in, remembering where they were headed. */
function redirectToSignIn(request: NextRequest, pathname: string): NextResponse {
  const signInUrl = new URL('/sign-in', request.url)
  signInUrl.searchParams.set('callbackUrl', pathname)
  const response = NextResponse.redirect(signInUrl)
  // Drop the dead cookie so the next request skips the validation round-trip.
  // Deleting a name that isn't set is a no-op, so covering both the plain and
  // the __Secure- prefixed form is safe.
  response.cookies.delete('better-auth.session_token')
  response.cookies.delete('__Secure-better-auth.session_token')
  return response
}

// Every authenticated app route, so an unauthenticated user is bounced before
// the page loads. This is defense-in-depth UX only — real access control is
// enforced by the backend on every data request.
const protectedRoutes = [
  '/dashboard',
  '/creator-dashboard',
  '/onboarding',
  '/loading',
  '/payments',
  '/profile',
  '/settings',
]
const authRoutes = ['/sign-in', '/sign-up']

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
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    if (!sessionCookie) return redirectToSignIn(request, pathname)
    // A cookie is not a session. Verifying here is what stops an expired one
    // from stranding the user on a dashboard that can never finish loading.
    if (!(await hasLiveSession(request))) return redirectToSignIn(request, pathname)
  }

  // Only bounce a genuinely signed-in user away from the auth pages. Bouncing
  // on cookie presence alone was the other half of the trap: a stale cookie
  // could not reach /sign-in, so there was no way back into the app at all.
  if (isAuthRoute && sessionCookie && (await hasLiveSession(request))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
