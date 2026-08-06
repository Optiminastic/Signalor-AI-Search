import { z } from 'zod'

import { env } from '@/lib/env'
import { createLogger } from '@/lib/logger'

/**
 * Short-lived better-auth JWTs for calls to the Django backend.
 *
 * The backend identifies callers by a client-supplied `email` on nearly every
 * account endpoint, which means anyone can act as anyone. It already ships the
 * fix - a JWKS verifier (`core/auth/jwt.py`) plus an identity seam behind
 * `REQUIRE_VERIFIED_IDENTITY` - but the seam was inert because the frontend
 * never sent a token. This module produces one.
 *
 * The token is minted by better-auth's jwt plugin at `GET /api/auth/token`,
 * authorised by the session cookie, and lives 15 minutes. Fetching one per API
 * call would put a round trip in front of every request, so it is cached in
 * memory and refreshed shortly before it expires.
 */

const log = createLogger('auth-token')

const tokenResponseSchema = z.object({ token: z.string().min(1) })

/**
 * Re-fetch this long before the token's own expiry, so a request never travels
 * with a token that expires mid-flight.
 */
const REFRESH_MARGIN_MS = 60_000
/** Fallback lifetime when the JWT carries no readable `exp` claim. */
const FALLBACK_LIFETIME_MS = 5 * 60_000

interface CachedToken {
  token: string
  expiresAt: number
}

let cached: CachedToken | null = null
/** De-duplicates concurrent fetches: a page mount fires many requests at once. */
let inFlight: Promise<string | null> | null = null

/**
 * Read the `exp` claim without verifying the signature.
 *
 * Verification is the backend's job; here we only need to know when to refresh,
 * and an unparseable token simply falls back to a conservative lifetime.
 */
function readExpiry(token: string): number {
  const payload = token.split('.')[1]
  if (!payload) return Date.now() + FALLBACK_LIFETIME_MS
  try {
    const json: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const exp = (json as { exp?: unknown }).exp
    return typeof exp === 'number' ? exp * 1000 : Date.now() + FALLBACK_LIFETIME_MS
  } catch {
    return Date.now() + FALLBACK_LIFETIME_MS
  }
}

async function fetchToken(): Promise<string | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth/token`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    // 401 is the ordinary signed-out case, not an error worth logging.
    if (!res.ok) return null

    const parsed = tokenResponseSchema.safeParse(await res.json())
    if (!parsed.success) {
      log.warn('token endpoint returned an unexpected shape')
      return null
    }

    const { token } = parsed.data
    cached = { token, expiresAt: readExpiry(token) }
    return token
  } catch (err) {
    log.debug({ err }, 'could not mint an auth token; request will go unauthenticated')
    return null
  }
}

/**
 * A valid bearer token, or `null` when the visitor is signed out or better-auth
 * is unreachable. Callers must treat `null` as "send no Authorization header"
 * rather than as a failure: the backend still accepts anonymous requests until
 * `REQUIRE_VERIFIED_IDENTITY` is switched on.
 */
export async function getAuthToken(): Promise<string | null> {
  // The token is authorised by the session cookie, which only exists in the
  // browser. On the server there is nothing to send, so skip the round trip
  // rather than spending one per render to be handed a 401.
  if (typeof window === 'undefined') return null
  if (cached && Date.now() < cached.expiresAt - REFRESH_MARGIN_MS) return cached.token
  if (inFlight) return inFlight

  inFlight = fetchToken().finally(() => {
    inFlight = null
  })
  return inFlight
}

/** Drop the cached token. Call on sign-out so the next call re-authenticates. */
export function clearAuthToken(): void {
  cached = null
}
