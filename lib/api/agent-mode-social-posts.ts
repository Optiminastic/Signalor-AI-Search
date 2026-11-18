import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/** A social post draft (LinkedIn, X, Instagram) as the owner reviews it. */
const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  instagram: 'Instagram',
}

export const socialSchema = z
  .object({
    platform: z.string(),
    text: z.string(),
    profile_url: z.string().catch(''),
    review_notes: z.array(z.string()).optional(),
  })
  .transform(c => ({
    type: 'social' as const,
    platform: c.platform,
    platformLabel: SOCIAL_LABELS[c.platform] ?? c.platform,
    text: c.text,
    profileUrl: c.profile_url,
    reviewNotes: c.review_notes ?? [],
  }))

export type SocialContent = z.infer<typeof socialSchema>

const postedEnvelope = z.object({ action: z.object({ id: z.string() }).passthrough() })

/** The owner posted this approved social post by hand; it's closed so it's never sent again. */
export async function markSocialPostPosted(orgSlug: string, actionId: string): Promise<void> {
  const path = programPath(orgSlug, 'actions', encodeURIComponent(actionId), 'posted')
  await agentModeRequest(path, postedEnvelope, { method: 'POST', body: {} })
}
