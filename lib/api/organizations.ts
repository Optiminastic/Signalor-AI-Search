import { z } from 'zod'

import { getAuthToken } from '@/lib/auth-token'

import { apiDelete, apiGet, apiPost } from './client'

const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  // Unguessable public slug used in the dashboard URL (/dashboard/<slug>).
  slug: z.string().optional().default(''),
  url: z.string(),
  owner_email: z.string(),
  created_at: z.string(),
})

export type Organization = z.infer<typeof organizationSchema>

const checkResponseSchema = z.object({ exists: z.boolean() })

export interface OnboardPayload {
  name: string
  url: string
  email: string
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/** GET /api/organizations/check/?email= → whether an org already exists. */
export async function checkOrganizationExists(email: string): Promise<boolean> {
  const data = await apiGet<unknown>('/api/organizations/check/', {
    params: { email: normalizeEmail(email) },
  })
  return checkResponseSchema.parse(data).exists
}

/** GET /api/organizations/?email= → the user's organizations/projects. */
export async function getOrganizations(email: string): Promise<Organization[]> {
  const data = await apiGet<unknown>('/api/organizations/', {
    params: { email: normalizeEmail(email) },
  })
  return z.array(organizationSchema).parse(data)
}

/**
 * DELETE /api/organizations/<id>/ → permanently delete a brand/project + its runs.
 *
 * Sends the caller's bearer token: the backend only deletes a brand for its
 * verified owner, so a request without one is refused.
 */
export async function deleteOrganization(id: number): Promise<void> {
  const token = await getAuthToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  await apiDelete<unknown>(`/api/organizations/${id}/`, undefined, { headers })
}

/** POST /api/organizations/onboard/ → create the org (single-use onboarding token). */
export async function createOrganization(
  payload: OnboardPayload,
  onboardingToken?: string,
): Promise<Organization> {
  const data = await apiPost<unknown>(
    '/api/organizations/onboard/',
    { ...payload, email: normalizeEmail(payload.email) },
    { headers: onboardingToken ? { 'X-Onboarding-Token': onboardingToken } : undefined },
  )
  return organizationSchema.parse(data)
}
