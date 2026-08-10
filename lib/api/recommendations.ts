import { z } from 'zod'

/** One numbered step of a task's "how to do it" guide (from the backend
 *  STEP_META / GEO task playbooks). */
export const recommendationStepSchema = z.object({
  n: z.number().optional().default(0),
  title: z.string().optional().default(''),
  detail: z.string().optional().default(''),
  xp: z.number().optional().default(0),
})

export const recommendationSchema = z.object({
  id: z.number(),
  pillar: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  title: z.string(),
  description: z.string().optional().default(''),
  action: z.string().optional().default(''),
  category: z.string().optional().default(''),
  steps: z.array(recommendationStepSchema).optional().default([]),
  // Analyzer finding code (e.g. "no_llms_txt", "no_jsonld") — needed to trigger
  // the GitHub PR auto-fix, which keys off finding codes.
  finding_code: z.string().optional().default(''),
  can_auto_fix: z.boolean().optional().default(false),
  code_fixable: z.boolean().optional().default(false),
  difficulty: z.string().nullable().optional(),
  estimated_minutes: z.number().nullable().optional(),
  // Provenance ("analyzer" | "ai_insight" | "geo_signal"), the per-page
  // evidence backing the finding, and the URLs it was detected on — what lets
  // the task detail page present a task as a measurement, not an instruction.
  source: z.string().optional().default(''),
  why: z.string().optional().default(''),
  evidence: z.record(z.string(), z.unknown()).optional().default({}),
  affected_pages: z.array(z.string()).optional().default([]),
})
export type Recommendation = z.infer<typeof recommendationSchema>
