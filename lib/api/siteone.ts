import { z } from 'zod'

import { apiGet } from './client'

/**
 * SiteOne technical/SEO report - an optional data source the backend attaches to
 * a run's technical pillar under `technical_details.checks.siteone` (see
 * ranking-be `apps.analyzer.pipeline.siteone_crawl.to_check_payload`). It is
 * data-only: it never changes a pillar score, and it is absent when SiteOne is
 * not enabled for the run (then `getSiteOne` resolves to `null`).
 */

export const siteoneDeductionSchema = z.object({
  reason: z.string().optional().default(''),
  fix: z.string().optional().default(''),
  points: z.number().optional().default(0),
})
export type SiteOneDeduction = z.infer<typeof siteoneDeductionSchema>

export const siteoneCategorySchema = z.object({
  code: z.string().optional().default(''),
  name: z.string().optional().default(''),
  score: z.number().optional().default(0), // 0-10
  weight: z.number().optional().default(0),
  label: z.string().optional().default(''), // Excellent | Good | …
  deductions: z.array(siteoneDeductionSchema).optional().default([]),
})
export type SiteOneCategory = z.infer<typeof siteoneCategorySchema>

export const siteoneCountsSchema = z.object({
  broken_links: z.number().optional().default(0),
  redirects: z.number().optional().default(0),
  security_findings: z.number().optional().default(0),
  pages_crawled: z.number().optional().default(0),
})
export type SiteOneCounts = z.infer<typeof siteoneCountsSchema>

export const siteonePerformanceSchema = z.object({
  request_ms_avg: z.number().optional().default(0),
  request_ms_p90: z.number().optional().default(0),
})
export type SiteOnePerformance = z.infer<typeof siteonePerformanceSchema>

export const siteoneReportSchema = z.object({
  overall_score: z.number().nullable().optional(), // 0-10 when present
  categories: z.array(siteoneCategorySchema).optional().default([]),
  severity_counts: z.record(z.string(), z.number()).optional().default({}),
  counts: siteoneCountsSchema.optional().default({}),
  performance: siteonePerformanceSchema.optional().default({}),
})
export type SiteOneReport = z.infer<typeof siteoneReportSchema>

// The report rides inside the run detail on the technical pillar of each page;
// we only type the path we read and let everything else pass through.
const siteoneRunSchema = z
  .object({
    url: z.string().optional().default(''),
    page_scores: z
      .array(
        z
          .object({
            url: z.string().optional().default(''),
            technical_details: z
              .object({
                checks: z.object({ siteone: siteoneReportSchema.optional() }).partial().optional(),
              })
              .passthrough()
              .optional(),
          })
          .passthrough(),
      )
      .optional()
      .default([]),
  })
  .passthrough()

/**
 * GET runs/s/<slug>/ → the SiteOne report for the brand root page, or `null`
 * when SiteOne did not run for this project. The root page is the one whose
 * `url` matches the run's `url` (falling back to the first page score).
 */
export async function getSiteOne(slug: string): Promise<SiteOneReport | null> {
  const run = siteoneRunSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/`))
  const page = run.page_scores.find(p => p.url === run.url) ?? run.page_scores[0]
  return page?.technical_details?.checks?.siteone ?? null
}
