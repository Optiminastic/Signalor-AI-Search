import { z } from 'zod'

import { apiGet, apiPost } from './client'

/* ------------------------------------------------------------------ schemas */

/** One auto-generated satellite-network blog post carrying a brand backlink. */
const autoBacklinkSchema = z.object({
  // Backend serializes id as a string; older payloads used a number.
  id: z.union([z.string(), z.number()]).transform(String).default(''),
  site: z.string(),
  category: z.string().default(''),
  slug: z.string().default(''),
  title: z.string().default(''),
  url: z.string().default(''),
  brand_url: z.string().default(''),
  status: z.string().default(''),
  published_at: z.string().nullish(),
})

export type AutoBacklink = z.infer<typeof autoBacklinkSchema>

const ourBacklinksSchema = z.object({
  rows: z.array(autoBacklinkSchema).default([]),
  can_add_today: z.boolean().default(true),
})

export interface OurBacklinks {
  rows: AutoBacklink[]
  canAddToday: boolean
}

const backlinkScheduleSchema = z.object({
  is_active: z.boolean(),
  next_run_at: z.string().nullish(),
  last_run_at: z.string().nullish(),
  last_batch_count: z.number().default(0),
  /** The daily batch is switched off: the Agent's satellite articles replace it. */
  replaced_by_agent: z.boolean().default(false),
})

export type BacklinkSchedule = z.infer<typeof backlinkScheduleSchema>

const autoPublishAllSchema = z.object({
  created: z.array(autoBacklinkSchema).default([]),
  errors: z.array(z.string()).default([]),
  can_add_today: z.boolean().default(false),
})

export type AutoPublishAllResult = z.infer<typeof autoPublishAllSchema>

/* ---------------------------------------------------------------- endpoints */

function runPath(slug: string, suffix: string): string {
  return `/api/analyzer/runs/s/${encodeURIComponent(slug)}/${suffix}`
}

/** GET .../backlinks/our/ → the auto-backlinks already published for this run. */
export async function getOurBacklinks(slug: string): Promise<OurBacklinks> {
  const data = await apiGet<unknown>(runPath(slug, 'backlinks/our/'))
  const parsed = ourBacklinksSchema.parse(data)
  return { rows: parsed.rows, canAddToday: parsed.can_add_today }
}

/** GET .../backlinks/schedule/ → the daily auto-backlinks schedule state. */
export async function getBacklinkSchedule(slug: string): Promise<BacklinkSchedule> {
  const data = await apiGet<unknown>(runPath(slug, 'backlinks/schedule/'))
  return backlinkScheduleSchema.parse(data)
}

/** POST .../backlinks/schedule/ → toggle the daily auto-backlinks schedule. */
export async function setBacklinkSchedule(
  slug: string,
  isActive: boolean,
): Promise<BacklinkSchedule> {
  const data = await apiPost<unknown>(runPath(slug, 'backlinks/schedule/'), { is_active: isActive })
  return backlinkScheduleSchema.parse(data)
}

/**
 * POST .../blog/auto-publish-all/ → generate + publish one blog to each of the
 * five satellite sites. Server-side generation is slow, so we allow up to 5 min.
 */
export async function autoPublishAll(slug: string): Promise<AutoPublishAllResult> {
  const data = await apiPost<unknown>(runPath(slug, 'blog/auto-publish-all/'), undefined, {
    signal: AbortSignal.timeout(300_000),
  })
  return autoPublishAllSchema.parse(data)
}
