import 'server-only'

import { createHmac } from 'node:crypto'

/**
 * Signs a request to ranking-be's Growth Agent API (`/api/growth/`).
 * Must match `apps/growth_agent/auth.py::sign_request` in ranking-be:
 *   hex HMAC-SHA256(secret, "<ts>.<email>.<METHOD>.<path>")
 */
export function signAgentModeRequest(
  secret: string,
  email: string,
  request: { method: string; path: string },
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const message = `${timestamp}.${email}.${request.method.toUpperCase()}.${request.path}`
  return {
    'X-Growth-Email': email,
    'X-Growth-Timestamp': timestamp,
    'X-Growth-Signature': createHmac('sha256', secret).update(message).digest('hex'),
  }
}
