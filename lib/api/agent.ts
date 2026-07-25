import { z } from 'zod'

import { apiGet, apiPost } from './client'

/**
 * Growth Agent API — today's ranked task plan for a brand.
 *
 * A read model over the same UserActions the Tasks page shows, projected to
 * "what to do today". Backed by `GET /runs/s/<slug>/agent/plan/`.
 */

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export const agentActionSchema = z.object({
  action_id: z.number(),
  recommendation_id: z.number().nullable(),
  title: z.string(),
  description: z.string().default(''),
  pillar: z.string().default(''),
  group: z.string(),
  priority: z.string().default('medium'),
  rank: z.number().default(0),
  is_top_fix: z.boolean().default(false),
  /** Real measured GEO-score lift once the task is verified; null until then. */
  measured_lift: z.number().nullable().optional().default(null),
  effort: z.object({
    difficulty: z.string().default(''),
    minutes: z.number().default(0),
  }),
  status: z.string(),
  kind: z.enum(['auto', 'draft', 'open']).default('open'),
})
export type AgentAction = z.infer<typeof agentActionSchema>

export const agentPlanSchema = z.object({
  generated_for: z.string(),
  run_slug: z.string(),
  brief: z.object({
    website: z.string().default(''),
    brand_name: z.string().default(''),
    score: z.number().nullable(),
    last_analyzed_at: z.string().nullable(),
    next_analysis_at: z.string().nullable(),
  }),
  top_fix: agentActionSchema.nullable(),
  groups: z.array(z.object({ pillar: z.string(), actions: z.array(agentActionSchema) })),
  counts: z.object({ today: z.number(), backlog: z.number(), done: z.number() }),
  // Null ⇒ refresh allowed now; otherwise the ISO time it next becomes allowed.
  refresh_available_at: z.string().nullable().optional().default(null),
})
export type AgentPlan = z.infer<typeof agentPlanSchema>

/** GET /api/analyzer/runs/s/<slug>/agent/plan/?email= → today's ranked plan. */
export async function getAgentPlan(slug: string, email: string): Promise<AgentPlan> {
  const data = await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/agent/plan/`, {
    params: { email: normalizeEmail(email) },
  })
  return agentPlanSchema.parse(data)
}

/** POST /api/analyzer/runs/s/<slug>/agent/plan/refresh/ → re-materialize + re-rank. */
export async function refreshAgentPlan(slug: string, email: string): Promise<AgentPlan> {
  const data = await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/agent/plan/refresh/`, {
    email: normalizeEmail(email),
  })
  return agentPlanSchema.parse(data)
}
