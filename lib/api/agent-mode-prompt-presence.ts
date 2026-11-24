import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * Prompt presence: for each prompt the brand tracks, where it's being discussed
 * (top Google links, Reddit threads and their subreddits, LinkedIn posts, X
 * posts), and on which of those the brand already appears. Checked weekly by
 * ranking-be, or on request at most once an hour.
 */
const resultSchema = z
  .object({
    url: z.string(),
    title: z.string().catch(''),
    snippet: z.string().catch(''),
    community: z.string().catch(''),
    position: z.number().catch(0),
    mentions_brand: z.boolean().catch(false),
  })
  .transform(r => ({
    url: r.url,
    title: r.title,
    snippet: r.snippet,
    community: r.community,
    position: r.position,
    mentionsBrand: r.mentions_brand,
  }))

export type PresenceResult = z.infer<typeof resultSchema>

export const PLATFORMS = ['reddit', 'linkedin', 'x', 'google'] as const
export type Platform = (typeof PLATFORMS)[number]

const promptSchema = z
  .object({
    prompt: z.string(),
    google: z.array(resultSchema).catch([]),
    reddit: z.array(resultSchema).catch([]),
    linkedin: z.array(resultSchema).catch([]),
    x: z.array(resultSchema).catch([]),
    subreddits: z.array(z.object({ name: z.string(), threads: z.number() })).catch([]),
    brand_present_on: z.array(z.string()).catch([]),
  })
  .transform(p => ({
    prompt: p.prompt,
    results: { google: p.google, reddit: p.reddit, linkedin: p.linkedin, x: p.x },
    subreddits: p.subreddits,
    brandPresentOn: p.brand_present_on,
  }))

export type PromptPresence = z.infer<typeof promptSchema>

const reportSchema = z
  .object({
    checked_at: z.string().nullable(),
    checking: z.boolean().catch(false),
    tracked_prompts: z.number().catch(0),
    prompts: z.array(promptSchema).catch([]),
  })
  .transform(r => ({
    checkedAt: r.checked_at,
    checking: r.checking,
    trackedPrompts: r.tracked_prompts,
    prompts: r.prompts,
  }))

export type PromptPresenceReport = z.infer<typeof reportSchema>

export async function getPromptPresence(orgSlug: string): Promise<PromptPresenceReport> {
  return agentModeRequest(programPath(orgSlug, 'prompt-presence'), reportSchema)
}

/** Search now (ranking-be allows one check an hour). */
export async function checkPromptPresenceNow(orgSlug: string): Promise<PromptPresenceReport> {
  return agentModeRequest(programPath(orgSlug, 'prompt-presence', 'check'), reportSchema, {
    method: 'POST',
    body: {},
  })
}
