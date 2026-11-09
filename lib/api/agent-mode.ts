import { z } from 'zod'

import { agentModeRequest } from '@/lib/api/agent-mode-request'

/** Agent mode: the brand's autonomous growth program (created on first use). */

const programSchema = z
  .object({
    brand: z.object({ slug: z.string(), name: z.string(), url: z.string() }),
    status: z.enum(['onboarding', 'active', 'paused', 'stopped']),
    publishing_platform: z.enum(['wordpress', 'github']).nullable(),
    gmail_sender: z.string().nullable(),
    uplift_target_points: z.number(),
    kill_switch: z.boolean(),
  })
  .transform(p => ({
    brandName: p.brand.name,
    status: p.status,
    publishingPlatform: p.publishing_platform,
    gmailSender: p.gmail_sender,
    upliftTargetPoints: p.uplift_target_points,
    killSwitch: p.kill_switch,
  }))

export type AgentProgram = z.infer<typeof programSchema>

/** Creates the brand's program on first use (idempotent), returns it. */
export function ensureProgram(orgSlug: string): Promise<AgentProgram> {
  return agentModeRequest('programs', programSchema, {
    method: 'POST',
    body: { org_slug: orgSlug },
  })
}
