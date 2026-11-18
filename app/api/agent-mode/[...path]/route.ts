import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { signAgentModeRequest } from '@/lib/agent-mode-signature'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { createLogger } from '@/lib/logger'

/**
 * Agent mode proxy: the browser calls this route, never ranking-be's agent API
 * directly. It checks the Signalor session, then signs the request (HMAC) with
 * a secret only this server holds. ranking-be re-checks brand ownership and the
 * Pro/Max plan on every call.
 */
const log = createLogger('agent-mode-proxy')
const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,64}$/
const UPSTREAM_TIMEOUT_MS = 30_000

interface RouteContext {
  params: Promise<{ path: string[] }>
}

function upstreamPath(segments: string[]): string | null {
  if (segments.length === 0 || !segments.every(segment => SAFE_SEGMENT.test(segment))) {
    return null
  }
  return `/api/growth/${segments.join('/')}/`
}

async function callUpstream(
  request: NextRequest,
  path: string,
  email: string,
): Promise<Response | null> {
  const secret = env.GROWTH_AGENT_SIGNING_SECRET ?? ''
  const method = request.method
  return fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    body: method === 'GET' ? undefined : await request.text(),
    headers: {
      'Content-Type': 'application/json',
      ...signAgentModeRequest(secret, email, { method, path }),
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    cache: 'no-store',
  }).catch((error: unknown) => {
    log.warn({ err: error, path }, 'agent mode upstream unreachable')
    return null
  })
}

async function forward(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  if (!env.GROWTH_AGENT_SIGNING_SECRET) {
    return NextResponse.json({ detail: 'Agent mode is not configured.' }, { status: 503 })
  }
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) return NextResponse.json({ detail: 'Not signed in.' }, { status: 401 })
  const path = upstreamPath((await context.params).path)
  if (!path) return NextResponse.json({ detail: 'Not found.' }, { status: 404 })

  const upstream = await callUpstream(request, path, session.user.email.toLowerCase())
  if (!upstream)
    return NextResponse.json({ detail: 'Signalor backend is unreachable.' }, { status: 502 })
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  })
}

export const GET = forward
export const POST = forward
export const PATCH = forward
