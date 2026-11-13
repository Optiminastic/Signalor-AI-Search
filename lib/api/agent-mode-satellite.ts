import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * The client's articles on signalor.ai's satellite sites and Google's view of
 * each (indexed, position, clicks), checked weekly in signalor.ai's own
 * Search Console.
 */
const checkSchema = z
  .object({
    property_found: z.boolean().optional(),
    indexed: z.boolean().optional(),
    reason: z.string().optional(),
    position: z.number().optional(),
    clicks: z.number().optional(),
    impressions: z.number().optional(),
    error: z.string().optional(),
  })
  .transform(c => ({
    propertyFound: c.property_found ?? true,
    indexed: c.indexed ?? false,
    reason: c.reason ?? '',
    position: c.position ?? 0,
    clicks: c.clicks ?? 0,
    impressions: c.impressions ?? 0,
    error: c.error ?? '',
  }))

const articleSchema = z
  .object({
    task_id: z.number(),
    topic: z.string(),
    url: z.string(),
    published_at: z.string(),
    checked_at: z.string().nullable(),
    check: checkSchema.nullable().catch(null),
    flag: z.enum(['needs_links', 'needs_refresh', '']).catch(''),
    refresh_queued: z.boolean().catch(false),
  })
  .transform(a => ({
    taskId: a.task_id,
    topic: a.topic,
    url: a.url,
    publishedAt: a.published_at,
    checkedAt: a.checked_at,
    check: a.check,
    flag: a.flag,
    /** A refreshed version is drafted and waiting for the owner's approval. */
    refreshQueued: a.refresh_queued,
  }))

export type SatelliteArticle = z.infer<typeof articleSchema>

const envelope = z
  .object({ search_console: z.boolean(), articles: z.array(articleSchema) })
  .transform(e => ({ searchConsole: e.search_console, articles: e.articles }))

export type SatelliteRanks = z.infer<typeof envelope>

export async function getSatelliteRanks(orgSlug: string): Promise<SatelliteRanks> {
  return agentModeRequest(programPath(orgSlug, 'indexing', 'satellite'), envelope)
}
