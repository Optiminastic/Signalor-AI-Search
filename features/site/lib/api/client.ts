import axios, { type AxiosInstance } from 'axios'

import { config } from '@/features/site/lib/config'
import { getAuthToken } from '@/lib/auth-token'

/**
 * Attach the caller's better-auth JWT so the backend can verify who is asking.
 *
 * Without this every request is anonymous and the backend has to fall back to
 * the `email` in the query string or body - a value the client picks, so one
 * user can read or modify another's account. The backend verifies this token
 * against better-auth's JWKS and pins the request to the address inside it.
 *
 * Signed-out visitors (marketing pages, the public analyzer) get no token and
 * are sent unauthenticated, exactly as before. That stays true until
 * REQUIRE_VERIFIED_IDENTITY is switched on in the backend environment.
 */
function withAuthToken(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use(async request => {
    const token = await getAuthToken()
    if (token) request.headers.Authorization = `Bearer ${token}`
    return request
  })
  return instance
}

export const apiClient = withAuthToken(
  axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  }),
)

/**
 * Use for endpoints that aggregate cross-region data (DB hosted in a different
 * AWS region from the user). The default 30s axios timeout is too tight when
 * a single page fires 4-6 such GETs in parallel and per-query latencies stack.
 */
export const apiClientLong = withAuthToken(
  axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60_000,
  }),
)
