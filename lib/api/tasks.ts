import { z } from 'zod'

import { userActionSchema, type UserAction } from './analyzer'
import { apiPost } from './client'

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

const syncActionsSchema = z.object({ created: z.number(), total: z.number() })
export type SyncActionsResult = z.infer<typeof syncActionsSchema>

/** POST /api/analyzer/actions/sync/ → materialize the brand's recommendations into tasks (idempotent). */
export async function syncActions(email: string, orgId: number): Promise<SyncActionsResult> {
  return syncActionsSchema.parse(
    await apiPost<unknown>('/api/analyzer/actions/sync/', {
      email: normalizeEmail(email),
      org_id: orgId,
    }),
  )
}

/** POST /api/analyzer/actions/<id>/assign/ → admin assigns a task to a teammate ('' = unassign). */
export async function assignAction(
  actionId: number,
  email: string,
  assigneeEmail: string,
): Promise<UserAction> {
  return userActionSchema.parse(
    await apiPost<unknown>(`/api/analyzer/actions/${actionId}/assign/`, {
      email: normalizeEmail(email),
      assignee_email: assigneeEmail ? normalizeEmail(assigneeEmail) : '',
    }),
  )
}

/**
 * POST /api/analyzer/actions/<id>/ — move an action between pending /
 * in_progress / completed. This is what Start and Mark complete call.
 *
 * ``email`` is required in practice, not optional. The endpoint resolves the
 * caller from a verified JWT first, but the API client never sends an
 * Authorization header, so that path can never succeed — leaving the body's
 * `email` as the only identity the server can use. Omitting it made every
 * status change fail with "Email is required", which is why the database held
 * 110 actions and not one had ever left `pending`.
 */
export async function updateActionStatus(
  actionId: number,
  status: string,
  email?: string,
): Promise<void> {
  await apiPost<unknown>(`/api/analyzer/actions/${actionId}/`, {
    status,
    email: (email ?? '').toLowerCase().trim() || undefined,
  })
}

const verifyActionSchema = z.object({
  verified: z.boolean(),
  message: z.string().optional().default(''),
  status: z.string().optional().default(''),
  verified_at: z.string().nullable().optional(),
})
export type VerifyActionResult = z.infer<typeof verifyActionSchema>

/**
 * POST /api/analyzer/actions/<id>/verify/ → re-crawl the live site and confirm
 * the task's finding is actually resolved. On a pass the backend flips the task
 * to `verified`; either way it returns the human-readable reason.
 *
 * ``email`` is sent for the same reason every other call in this module sends
 * it. The endpoint resolves the caller from a verified JWT first and falls back
 * to this field; posting an empty body made the whole feature depend on JWT
 * auth alone, so wherever that is unavailable (e.g. BETTER_AUTH_JWKS_URL unset)
 * the backend answered "Email is required" and the UI could only say "Could not
 * verify right now".
 */
export async function verifyAction(actionId: number, email?: string): Promise<VerifyActionResult> {
  return verifyActionSchema.parse(
    await apiPost<unknown>(`/api/analyzer/actions/${actionId}/verify/`, {
      email: (email ?? '').toLowerCase().trim() || undefined,
    }),
  )
}
