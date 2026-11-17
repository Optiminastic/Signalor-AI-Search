import { z } from 'zod'

import { agentModeRequest, programPath } from '@/lib/api/agent-mode-request'

/**
 * Weekly SEO / GEO / AIO tracking for the brand and its top competitors
 * (ranking-be `services/rank_tracking`): Google positions, share of AI answers,
 * and Google AI Overview citations, for the last 8 weeks.
 */
const playerSchema = z
  .object({ name: z.string().catch(''), domain: z.string(), is_brand: z.boolean().catch(false) })
  .transform(p => ({ name: p.name || p.domain, domain: p.domain, isBrand: p.is_brand }))

const keywordSchema = z.object({
  id: z.number(),
  keyword: z.string(),
  source: z.enum(['auto', 'owner']).catch('auto'),
})

const geoWeekSchema = z.object({
  week: z.string(),
  brand: z.number().catch(0),
  rivals: z.record(z.number()).catch({}),
})

const seoDomainSchema = z.object({
  top10: z.number().catch(0),
  ranked: z.number().catch(0),
  average: z.number().nullable().catch(null),
})

/** This week's value and last week's, per keyword and domain. */
const positionCell = z.object({
  now: z.number().nullable().catch(null),
  before: z.number().nullable().catch(null),
})
const citedCell = z.object({
  now: z.boolean().nullable().catch(null),
  before: z.boolean().nullable().catch(null),
})

const seoSchema = z.object({
  weeks: z
    .array(
      z.object({
        week: z.string(),
        keywords: z.number().catch(0),
        domains: z.record(seoDomainSchema).catch({}),
      }),
    )
    .catch([]),
  latest: z
    .array(z.object({ keyword: z.string(), domains: z.record(positionCell).catch({}) }))
    .catch([]),
})

const aioSchema = z.object({
  weeks: z
    .array(
      z.object({
        week: z.string(),
        keywords: z.number().catch(0),
        domains: z.record(z.number()).catch({}),
      }),
    )
    .catch([]),
  latest: z
    .array(z.object({ keyword: z.string(), domains: z.record(citedCell).catch({}) }))
    .catch([]),
})

const reportSchema = z
  .object({
    players: z.array(playerSchema).catch([]),
    keywords: z.array(keywordSchema).catch([]),
    geo: z.array(geoWeekSchema).catch([]),
    seo: seoSchema.catch({ weeks: [], latest: [] }),
    aio: aioSchema.catch({ weeks: [], latest: [] }),
    checking: z.boolean().catch(false),
    last_check_at: z.string().nullable().catch(null),
    aio_note: z.string().catch(''),
  })
  .transform(r => ({
    players: r.players,
    keywords: r.keywords,
    geo: r.geo,
    seo: r.seo,
    aio: r.aio,
    checking: r.checking,
    lastCheckAt: r.last_check_at,
    aioNote: r.aio_note,
  }))

export type TrackingPlayer = z.infer<typeof playerSchema>
export type TrackedKeyword = z.infer<typeof keywordSchema>
export type RankTracking = z.infer<typeof reportSchema>

export async function getRankTracking(orgSlug: string): Promise<RankTracking> {
  return agentModeRequest(programPath(orgSlug, 'rank-tracking'), reportSchema)
}

/** Check positions now (ranking-be allows one check a day). */
export async function checkRanksNow(orgSlug: string): Promise<RankTracking> {
  return agentModeRequest(programPath(orgSlug, 'rank-tracking', 'check'), reportSchema, {
    method: 'POST',
    body: {},
  })
}

export async function addTrackedKeyword(orgSlug: string, keyword: string): Promise<RankTracking> {
  return agentModeRequest(programPath(orgSlug, 'rank-tracking', 'keywords'), reportSchema, {
    method: 'POST',
    body: { keyword },
  })
}

export async function removeTrackedKeyword(orgSlug: string, id: number): Promise<RankTracking> {
  return agentModeRequest(
    programPath(orgSlug, 'rank-tracking', 'keywords', String(id), 'remove'),
    reportSchema,
    { method: 'POST', body: {} },
  )
}
