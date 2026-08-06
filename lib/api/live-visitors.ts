import { z } from 'zod'

import { apiGet } from './client'

/**
 * Who is on the site right now — humans from GA4, AI crawlers from the site's
 * own ingest. See `be/apps/integrations/views/live.py`.
 *
 * Every field has a default. The backend deliberately returns 200 with a
 * partial body when GA is down, so a schema that threw on a missing branch
 * would turn a graceful degradation into a broken top bar.
 */

/** Why the GA half is unavailable. Mirrors the closed set in the view. */
export const liveReasonSchema = z
  .enum(['', 'not_connected', 'no_property', 'auth_expired', 'api_error'])
  .catch('api_error')
export type LiveReason = z.infer<typeof liveReasonSchema>

export const liveCountrySchema = z.object({
  code: z.string().default(''),
  name: z.string().default(''),
  users: z.number().default(0),
})

export const liveSourceSchema = z.object({
  source: z.string().default(''),
  channel: z.string().default(''),
  sessions: z.number().default(0),
})

export const liveBotSchema = z.object({
  bot: z.string().default(''),
  label: z.string().default(''),
  path: z.string().default('/'),
  hits: z.number().default(0),
  last_seen: z.string().default(''),
})

export const liveVisitorsSchema = z.object({
  generated_at: z.string().default(''),
  window_minutes: z.number().default(30),
  live_total: z.number().default(0),
  humans: z
    .object({
      available: z.boolean().default(false),
      reason: liveReasonSchema.default(''),
      active_users: z.number().default(0),
      countries: z.array(liveCountrySchema).default([]),
      sources: z
        .object({
          available: z.boolean().default(false),
          // "today", not "live" — GA4's realtime API has no source dimension.
          scope: z.string().default('today'),
          rows: z.array(liveSourceSchema).default([]),
        })
        .default({ available: false, scope: 'today', rows: [] }),
    })
    .default({
      available: false,
      reason: 'not_connected',
      active_users: 0,
      countries: [],
      sources: { available: false, scope: 'today', rows: [] },
    }),
  bots: z
    .object({
      available: z.boolean().default(false),
      /** False means the ingest snippet was never installed, not "quiet now". */
      ever_seen: z.boolean().default(false),
      total_hits: z.number().default(0),
      rows: z.array(liveBotSchema).default([]),
    })
    .default({ available: false, ever_seen: false, total_hits: 0, rows: [] }),
})

export type LiveVisitors = z.infer<typeof liveVisitorsSchema>

export interface LiveVisitorsInput {
  email: string
  orgId: number
}

export async function getLiveVisitors({ email, orgId }: LiveVisitorsInput): Promise<LiveVisitors> {
  const data = await apiGet<unknown>('/api/integrations/live-visitors/', {
    params: { email: email.toLowerCase().trim(), org_id: String(orgId) },
  })
  return liveVisitorsSchema.parse(data)
}

export type LiveCountry = z.infer<typeof liveCountrySchema>
export type LiveSource = z.infer<typeof liveSourceSchema>
export type LiveBot = z.infer<typeof liveBotSchema>
