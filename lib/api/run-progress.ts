import { z } from 'zod'

import { apiGet } from './client'

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/** The newest run's progress, and nothing else. */
export const latestProgressSchema = z.object({
  found: z.boolean(),
  slug: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().optional().default(0),
  /** What the pipeline is doing right now, e.g. "Asking AI engines (3/10)". */
  phase: z.string().optional().default(''),
})

export type LatestProgress = z.infer<typeof latestProgressSchema>

/**
 * GET /api/analyzer/runs/progress/?email= — the analysing screen's poll.
 *
 * Deliberately not `getRuns`: that returns a page of up to 20 fully serialized
 * runs, each healed through the stale-run guard, to read one integer off the
 * first. At a 3.5s cadence that was the heaviest query in the product.
 */
export async function getLatestProgress(email: string): Promise<LatestProgress> {
  const data = await apiGet<unknown>('/api/analyzer/runs/progress/', {
    params: { email: normalizeEmail(email) },
  })
  return latestProgressSchema.parse(data)
}
