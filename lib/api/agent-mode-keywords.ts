import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * Keyword data for the brand, read weekly by the agent from DataForSEO
 * (ranking-be `services/keywords`): what the brand ranks for, and keywords its
 * top competitors rank for that the brand is missing.
 */
const keywordSchema = z
  .object({
    keyword: z.string(),
    position: z.number().catch(0),
    search_volume: z.number().catch(0),
    url: z.string().catch(''),
  })
  .transform(k => ({
    keyword: k.keyword,
    position: k.position,
    searchVolume: k.search_volume,
    url: k.url,
  }))

const rivalSchema = z.object({
  name: z.string().catch(''),
  domain: z.string(),
  position: z.number().catch(0),
})

const gapSchema = z
  .object({
    keyword: z.string(),
    search_volume: z.number().catch(0),
    rivals: z.array(rivalSchema).catch([]),
    new: z.boolean().catch(false),
  })
  .transform(g => ({
    keyword: g.keyword,
    searchVolume: g.search_volume,
    rivals: g.rivals,
    isNew: g.new,
  }))

const reportSchema = z
  .object({
    keywords: z.array(keywordSchema).catch([]),
    gaps: z.array(gapSchema).catch([]),
    new_gaps: z.number().catch(0),
    competitors: z.array(z.object({ name: z.string().catch(''), domain: z.string() })).catch([]),
    fetched_at: z.string().nullable().catch(null),
    refreshing: z.boolean().catch(false),
    notes: z.array(z.string()).catch([]),
  })
  .transform(r => ({
    keywords: r.keywords,
    gaps: r.gaps,
    newGaps: r.new_gaps,
    competitors: r.competitors,
    fetchedAt: r.fetched_at,
    refreshing: r.refreshing,
    notes: r.notes,
  }))

export type BrandKeyword = z.infer<typeof keywordSchema>
export type KeywordGap = z.infer<typeof gapSchema>
export type KeywordsReport = z.infer<typeof reportSchema>

export async function getKeywords(orgSlug: string): Promise<KeywordsReport> {
  return agentModeRequest(programPath(orgSlug, 'keywords'), reportSchema)
}

/** Read keywords again now (ranking-be allows one read a day; each is paid). */
export async function refreshKeywordsNow(orgSlug: string): Promise<KeywordsReport> {
  return agentModeRequest(programPath(orgSlug, 'keywords', 'refresh'), reportSchema, {
    method: 'POST',
    body: {},
  })
}
