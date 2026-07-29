import { z } from 'zod'

import { apiGet } from './client'

/**
 * Crawler Logs — AI-bot traffic against the brand's site, reported by the
 * site's edge/log integration through the org-scoped ingest endpoint.
 */

export const crawlerLogsSchema = z.object({
  ingest_token: z.string(),
  total_hits: z.number().default(0),
  days: z.array(z.object({ date: z.string(), bots: z.record(z.string(), z.number()) })).default([]),
  bots: z.array(z.object({ bot: z.string(), label: z.string(), hits: z.number() })).default([]),
  pages: z.array(z.object({ path: z.string(), hits: z.number() })).default([]),
})
export type CrawlerLogs = z.infer<typeof crawlerLogsSchema>

/** GET runs/s/<slug>/crawler-logs/ → daily per-bot activity + setup token. */
export async function getCrawlerLogs(slug: string): Promise<CrawlerLogs> {
  return crawlerLogsSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/crawler-logs/`),
  )
}

/**
 * Crawler Access — whether AI engines are *allowed* to crawl the site and
 * whether they actually do. Distinct from crawler logs, which report raw
 * activity: this reports the verdict per engine.
 */

export const CRAWLER_ACCESS_STATUSES = [
  'blocked',
  'allowed_never_crawled',
  'allowed_stale',
  'active',
  'unknown',
] as const
export type CrawlerAccessStatus = (typeof CRAWLER_ACCESS_STATUSES)[number]

export const crawlerAccessEngineSchema = z.object({
  bot: z.string(),
  engine: z.string(),
  role: z.string(),
  why: z.string().default(''),
  status: z.enum(CRAWLER_ACCESS_STATUSES),
  allowed: z.boolean().nullable().default(null),
  hits: z.number().default(0),
  distinct_paths: z.number().default(0),
  last_seen: z.string().default(''),
  days_since_last_seen: z.number().nullable().default(null),
  diagnosis: z.string().default(''),
})
export type CrawlerAccessEngine = z.infer<typeof crawlerAccessEngineSchema>

export const crawlerAccessSchema = z.object({
  has_telemetry: z.boolean().default(false),
  robots_found: z.boolean().default(false),
  window_days: z.number().default(30),
  engines: z.array(crawlerAccessEngineSchema).default([]),
  uncrawled_pages: z.array(z.string()).default([]),
  summary: z
    .object({
      counts: z.record(z.string(), z.number()).default({}),
      blocked_engines: z.array(z.string()).default([]),
      never_crawled_engines: z.array(z.string()).default([]),
      uncrawled_page_count: z.number().default(0),
    })
    .default({
      counts: {},
      blocked_engines: [],
      never_crawled_engines: [],
      uncrawled_page_count: 0,
    }),
})
export type CrawlerAccess = z.infer<typeof crawlerAccessSchema>

/** GET runs/s/<slug>/crawler-access/ → per-engine crawlability verdict. */
export async function getCrawlerAccess(slug: string): Promise<CrawlerAccess> {
  return crawlerAccessSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/crawler-access/`),
  )
}
