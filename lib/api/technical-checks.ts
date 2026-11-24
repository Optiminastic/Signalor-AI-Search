import { z } from 'zod'

import { apiGet } from './client'

/**
 * The brand's latest technical checks: robots.txt lets GPTBot, PerplexityBot and
 * ClaudeBot in; the sitemap exists, has no broken or redirecting URLs, and is up
 * to date. Failed checks are On-site actions; passed ones are listed under
 * "Passed" so the owner can see the checks ran. Backed by
 * `GET /runs/s/<slug>/technical-checks/`.
 */
const checkSchema = z
  .object({
    code: z.string(),
    label: z.string(),
    status: z.enum(['passed', 'failed', 'unknown']).catch('unknown'),
    detail: z.string().catch(''),
    checked_at: z.string(),
  })
  .transform(c => ({
    code: c.code,
    label: c.label,
    status: c.status,
    detail: c.detail,
    checkedAt: c.checked_at,
  }))

export type TechnicalCheck = z.infer<typeof checkSchema>

const reportSchema = z
  .object({
    checked_at: z.string().nullable(),
    checks: z.array(checkSchema).catch([]),
    passed: z.number().catch(0),
    failed: z.number().catch(0),
    unknown: z.number().catch(0),
  })
  .transform(r => ({
    checkedAt: r.checked_at,
    checks: r.checks,
    passed: r.passed,
    failed: r.failed,
    unknown: r.unknown,
  }))

export type TechnicalChecksReport = z.infer<typeof reportSchema>

export async function getTechnicalChecks(
  slug: string,
  email: string,
): Promise<TechnicalChecksReport> {
  const data = await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/technical-checks/`, {
    params: { email: email.toLowerCase().trim() },
  })
  return reportSchema.parse(data)
}
