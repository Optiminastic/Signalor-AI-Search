import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The brand's social presence score (LinkedIn, X, YouTube, Instagram, Reddit),
 * checked weekly by ranking-be. Parts that can't be measured are listed, never
 * guessed.
 */
const platformSchema = z
  .object({
    score: z.number(),
    parts: z.record(z.number()).catch({}),
    not_measured: z.array(z.string()).catch([]),
    found: z.boolean(),
    profile: z
      .object({ url: z.string().catch(''), source: z.string().catch('none') })
      .passthrough()
      .nullable()
      .catch(null),
  })
  .transform(p => ({
    score: p.score,
    parts: p.parts,
    notMeasured: p.not_measured,
    found: p.found,
    url: p.profile?.url ?? '',
    source: p.profile?.source ?? 'none',
  }))

export type SocialPlatform = z.infer<typeof platformSchema>

const redditSchema = z
  .object({
    mentions_90d: z.number(),
    community_count: z.number(),
    communities: z.array(z.object({ name: z.string(), mentions: z.number() })).catch([]),
  })
  .transform(r => ({
    mentions: r.mentions_90d,
    communityCount: r.community_count,
    communities: r.communities,
  }))

const bufferSchema = z
  .object({
    connected: z.boolean(),
    channels: z.array(z.object({ service: z.string(), name: z.string() })).catch([]),
  })
  .catch({ connected: false, channels: [] })

export type BufferStatus = z.infer<typeof bufferSchema>

const reportSchema = z
  .object({
    buffer: bufferSchema.optional(),
    status: z.enum(['never_checked', 'checking', 'ready']).catch('never_checked'),
    checked_at: z.string().nullable(),
    change: z.number().nullable().optional(),
    labels: z.record(z.string()).optional(),
    overall: z.object({ score: z.number(), partial: z.boolean() }).optional(),
    platforms: z.record(platformSchema).optional(),
    reddit: redditSchema.nullable().optional(),
    notes: z.array(z.string()).optional(),
  })
  .transform(r => ({
    buffer: r.buffer ?? { connected: false, channels: [] },
    status: r.status,
    checkedAt: r.checked_at,
    change: r.change ?? null,
    labels: r.labels ?? {},
    overall: r.overall ?? null,
    platforms: r.platforms ?? {},
    reddit: r.reddit ?? null,
    notes: r.notes ?? [],
  }))

export type SocialReport = z.infer<typeof reportSchema>

export async function getSocial(orgSlug: string): Promise<SocialReport> {
  return agentModeRequest(programPath(orgSlug, 'social'), reportSchema)
}

/** Measure now (ranking-be allows one check every 6 hours). */
export async function checkSocialNow(orgSlug: string): Promise<SocialReport> {
  return agentModeRequest(programPath(orgSlug, 'social', 'check'), reportSchema, {
    method: 'POST',
    body: {},
  })
}

const signInSchema = z.object({ authorize_url: z.string().url() })

/** Buffer's own login page, to connect the brand's Buffer account. */
export async function startBufferSignIn(orgSlug: string, returnUrl: string): Promise<string> {
  const path = programPath(orgSlug, 'social', 'buffer', 'sign-in')
  const body = { return_url: returnUrl }
  return (await agentModeRequest(path, signInSchema, { method: 'POST', body })).authorize_url
}

export async function disconnectBuffer(orgSlug: string): Promise<SocialReport> {
  const path = programPath(orgSlug, 'social', 'buffer', 'disconnect')
  return agentModeRequest(path, reportSchema, { method: 'POST', body: {} })
}
