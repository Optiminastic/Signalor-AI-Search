import { z } from 'zod'

import { apiGet } from './client'

/**
 * Projection API — the backend's conservative 30-day forecast for a brand's AI
 * search visibility. Run-slug-scoped like the rest of the analyzer overview
 * data (`/api/analyzer/runs/s/<slug>/…`); the active slug comes from
 * `useActiveProject`. Split out of `analyzer.ts` to keep that file under its
 * line cap, mirroring how the prompt-tracker API lives in its own module.
 */

/** current → target pair (whole percentage points) with its delta. */
const projectionMetricSchema = z.object({
  current: z.number(),
  target: z.number(),
  delta: z.number(),
})

export const projectionSchema = z.object({
  window_days: z.number(),
  generated_at: z.string(),
  visibility: projectionMetricSchema,
  recommendation: projectionMetricSchema,
  competitors: z.object({
    to_pass: z.number(),
    names: z.array(z.string()),
    total_ahead: z.number(),
  }),
  prompts: z.object({ to_improve: z.number(), total: z.number() }),
})
export type Projection = z.infer<typeof projectionSchema>
export type ProjectionMetric = z.infer<typeof projectionMetricSchema>

/** GET runs/s/<slug>/projection/ → conservative 30-day visibility forecast. */
export async function getProjection(slug: string): Promise<Projection> {
  return projectionSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/projection/`))
}
