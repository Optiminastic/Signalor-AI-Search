import { z } from 'zod'

import { apiGet, apiPost } from './client'

/**
 * Analyzer API — the signalor backend's per-project (AnalysisRun) data. Every
 * rich dashboard endpoint is scoped by a run `slug` (`/api/analyzer/runs/s/<slug>/…`).
 * The active slug is resolved by `useActiveProject` (org → latest run).
 *
 * Schemas validate only the fields the UI consumes; unknown fields pass through.
 */

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/* ─────────────────────────────────────────────────────────── runs (projects) */

export const runSummarySchema = z.object({
  id: z.number(),
  slug: z.string(),
  url: z.string(),
  country: z.string().optional().default(''),
  run_type: z.string().optional().default(''),
  status: z.string(),
  progress: z.number().optional().default(0),
  composite_score: z.number().nullable().optional(),
  created_at: z.string(),
})

export type RunSummary = z.infer<typeof runSummarySchema>

/** GET /api/analyzer/runs/?email=&org_id= → the org's analysis runs (newest first). */
export async function getRuns(email: string, orgId?: number): Promise<RunSummary[]> {
  const data = await apiGet<unknown>('/api/analyzer/runs/', {
    params: { email: normalizeEmail(email), org_id: orgId ? String(orgId) : undefined },
  })
  return z.array(runSummarySchema).parse(data)
}

// Lightweight poll surface for a single in-flight run: status + 0-100 progress.
export const runStatusSchema = z.object({
  id: z.number(),
  status: z.string(), // pending | crawling | analyzing | scoring | complete | failed
  progress: z.number().optional().default(0),
  composite_score: z.number().nullable().optional(),
})
export type RunStatus = z.infer<typeof runStatusSchema>

/** GET /api/analyzer/runs/<id>/status/ → the run's live status + progress. */
export async function getRunStatus(runId: number): Promise<RunStatus> {
  return runStatusSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/${runId}/status/`))
}

export interface StartAnalysisInput {
  url: string
  email: string
  orgId?: number
  runType?: string
  brandName?: string
  prompts?: string[]
  verifyOrgWorkspace?: boolean
}

export const startAnalysisResultSchema = z
  .object({
    id: z.number().optional(),
    slug: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough()
export type StartAnalysisResult = z.infer<typeof startAnalysisResultSchema>

/** POST /api/analyzer/analyze/ → kick off a fresh analysis run for a brand URL. */
export async function startAnalysis(input: StartAnalysisInput): Promise<StartAnalysisResult> {
  const data = await apiPost<unknown>('/api/analyzer/analyze/', {
    url: input.url,
    email: normalizeEmail(input.email),
    org_id: input.orgId,
    run_type: input.runType ?? 'single_page',
    brand_name: input.brandName,
    prompts: input.prompts,
    verify_org_workspace: input.verifyOrgWorkspace,
  })
  return startAnalysisResultSchema.parse(data)
}

export interface GeneratePromptsInput {
  brandName: string
  brandUrl: string
}

const generatePromptsSchema = z.object({ prompts: z.array(z.string()) })

/** POST /api/analyzer/generate-prompts/ → AI-suggested tracking prompts for a brand. */
export async function generatePrompts(
  input: GeneratePromptsInput,
  onboardingToken?: string,
): Promise<string[]> {
  const data = await apiPost<unknown>(
    '/api/analyzer/generate-prompts/',
    { brand_name: input.brandName, brand_url: input.brandUrl },
    { headers: onboardingToken ? { 'X-Onboarding-Token': onboardingToken } : undefined },
  )
  return generatePromptsSchema.parse(data).prompts
}

/* ───────────────────────────────────────────────────────────────── visibility */

export const sovEngineSchema = z.object({
  engine: z.string(),
  total: z.number(),
  mentioned: z.number(),
  sov_pct: z.number(),
})
export type SovEngine = z.infer<typeof sovEngineSchema>

/** GET runs/s/<slug>/share-of-voice/ → per-engine share of voice. */
export async function getShareOfVoice(slug: string): Promise<SovEngine[]> {
  return z
    .array(sovEngineSchema)
    .parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/share-of-voice/`))
}

export const visibilitySeriesSchema = z.object({
  points: z.array(z.object({ date: z.string(), score: z.number() })),
  current: z.number(),
  previous: z.number(),
  delta_pct: z.number(),
  direction: z.enum(['up', 'down']).or(z.string()),
})
export type VisibilitySeries = z.infer<typeof visibilitySeriesSchema>

/** GET runs/s/<slug>/visibility-series/ → score over time + delta. */
export async function getVisibilitySeries(slug: string, days = 30): Promise<VisibilitySeries> {
  return visibilitySeriesSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/visibility-series/`, {
      params: { days: String(days) },
    }),
  )
}

export const aiRecSummarySchema = z.object({
  total: z.number(),
  mentioned: z.number(),
  recommended: z.number(),
  cited: z.number(),
  mention_pct: z.number(),
  recommendation_pct: z.number(),
  citation_pct: z.number(),
  per_engine: z.array(
    z.object({
      engine: z.string(),
      total: z.number(),
      mentioned: z.number(),
      recommended: z.number(),
      cited: z.number(),
      recommendation_pct: z.number(),
    }),
  ),
})
export type AiRecSummary = z.infer<typeof aiRecSummarySchema>

/** GET runs/s/<slug>/ai-recommendation-summary/ → mention/recommend/cite rollup. */
export async function getAiRecommendationSummary(slug: string): Promise<AiRecSummary> {
  return aiRecSummarySchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/ai-recommendation-summary/`),
  )
}

export const topSourcesSchema = z.object({
  sources: z.array(
    z.object({
      name: z.string(),
      engine: z.string(),
      mentions: z.number(),
      impact: z.string(),
      spark: z.array(z.number()),
      sentiment: z.number(),
    }),
  ),
})
export type TopSources = z.infer<typeof topSourcesSchema>

/** GET runs/s/<slug>/top-sources/ → per-engine mention sources + sparkline. */
export async function getTopSources(slug: string): Promise<TopSources> {
  return topSourcesSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/top-sources/`))
}

/* ────────────────────────────────────────────────────────────────── citations */

export const citationsSchema = z.object({
  total_citations: z.number(),
  brand_citations: z.number(),
  competitor_citations: z.number(),
  domains: z
    .array(
      z.object({
        domain: z.string(),
        total: z.number(),
        is_brand: z.boolean().optional().default(false),
        is_competitor: z.boolean().optional().default(false),
        sample_url: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),
})
export type Citations = z.infer<typeof citationsSchema>

/** GET runs/s/<slug>/citations/ → citation totals (brand vs competitor) + top domains. */
export async function getCitations(slug: string): Promise<Citations> {
  return citationsSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/citations/`))
}

/* ──────────────────────────────────────────────────────────────── competitors */

export const competitorSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string().optional().default(''),
  industry: z.string().optional().default(''),
  tier: z.string().optional().default(''),
  target_market: z.string().optional().default(''),
  geography: z.string().optional().default(''),
  positioning: z.string().optional().default(''),
  relevance_score: z.number().nullable().optional(),
  composite_score: z.number().nullable().optional(),
  scored: z.boolean().optional().default(false),
})
export type Competitor = z.infer<typeof competitorSchema>

/** GET runs/s/<slug>/competitors/ → discovered + scored competitors. */
export async function getCompetitors(slug: string): Promise<Competitor[]> {
  return z
    .array(competitorSchema)
    .parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/competitors/`))
}

/* ───────────────────────────────────────────────────────────── prompt tracker */

export const promptTrackSchema = z.object({
  id: z.number(),
  prompt_text: z.string(),
  intent: z.string().nullable().optional(),
  prompt_type: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  visibility_pct: z.number().nullable().optional(),
  avg_position: z.number().nullable().optional(),
  ranking_label: z.string().nullable().optional(),
  sentiment_label: z.string().nullable().optional(),
  total_runs: z.number().nullable().optional(),
  mentions: z.number().nullable().optional(),
  results: z
    .array(z.object({ engine: z.string().optional() }).passthrough())
    .optional()
    .default([]),
})
export type PromptTrack = z.infer<typeof promptTrackSchema>

/** GET runs/s/<slug>/prompts/ → tracked prompts with per-engine results. */
export async function getPrompts(slug: string): Promise<PromptTrack[]> {
  return z
    .array(promptTrackSchema)
    .parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/prompts/`))
}

/* ─────────────────────────────────────────────────────────── recommendations */

export const recommendationSchema = z.object({
  id: z.number(),
  pillar: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  title: z.string(),
  description: z.string().optional().default(''),
  action: z.string().optional().default(''),
  // Backend sends this as free text ("Could improve your score by ~10 points"),
  // but older runs may store a bare number — accept either.
  impact_estimate: z.union([z.number(), z.string()]).nullable().optional(),
  category: z.string().optional().default(''),
  // Analyzer finding code (e.g. "no_llms_txt", "no_jsonld") — needed to trigger
  // the GitHub PR auto-fix, which keys off finding codes.
  finding_code: z.string().optional().default(''),
  can_auto_fix: z.boolean().optional().default(false),
  code_fixable: z.boolean().optional().default(false),
  difficulty: z.string().nullable().optional(),
  estimated_minutes: z.number().nullable().optional(),
})
export type Recommendation = z.infer<typeof recommendationSchema>

/** Per-page pillar breakdown. The brand's root page mirrors the run composite. */
export const pageScoreSchema = z
  .object({
    url: z.string().optional().default(''),
    content_score: z.number().nullable().optional(),
    schema_score: z.number().nullable().optional(),
    eeat_score: z.number().nullable().optional(),
    technical_score: z.number().nullable().optional(),
    entity_score: z.number().nullable().optional(),
    ai_visibility_score: z.number().nullable().optional(),
    composite_score: z.number().nullable().optional(),
  })
  .passthrough()
export type PageScore = z.infer<typeof pageScoreSchema>

const runDetailSchema = z
  .object({
    slug: z.string(),
    url: z.string().optional().default(''),
    display_brand_name: z.string().nullable().optional(),
    composite_score: z.number().nullable().optional(),
    recommendations: z.array(recommendationSchema).optional().default([]),
    page_scores: z.array(pageScoreSchema).optional().default([]),
  })
  .passthrough()
export type RunDetail = z.infer<typeof runDetailSchema>

/** GET runs/s/<slug>/ → full project detail (recommendations, scores, …). */
export async function getRunDetail(slug: string): Promise<RunDetail> {
  return runDetailSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/`))
}

/* ─────────────────────────────────────────────────────────────────── sitemap */

export const sitemapAuditSchema = z
  .object({
    status: z.string().optional().default(''),
    sitemap_url: z.string().optional().default(''),
    crawl_limit: z.number().optional().default(0),
    total_urls: z.number().optional().default(0),
    indexed_count: z.number().optional().default(0),
    redirect_count: z.number().optional().default(0),
    queued_count: z.number().optional().default(0),
    failed_count: z.number().optional().default(0),
    avg_lcp_ms: z.number().nullable().optional(),
    avg_fcp_ms: z.number().nullable().optional(),
    avg_ttfb_ms: z.number().nullable().optional(),
    avg_ai_score: z.number().nullable().optional(),
  })
  .passthrough()
export type SitemapAudit = z.infer<typeof sitemapAuditSchema>

export const sitemapPageSchema = z
  .object({
    path: z.string().optional().default(''),
    title: z.string().optional().default(''),
    status_code: z.number().optional().default(0),
    word_count: z.number().optional().default(0),
    text_ratio: z.number().optional().default(0),
    lcp_ms: z.number().nullable().optional(),
    fcp_ms: z.number().nullable().optional(),
    ttfb_ms: z.number().nullable().optional(),
    resource_count: z.number().optional().default(0),
    resource_bytes: z.number().optional().default(0),
    link_count_total: z.number().optional().default(0),
    link_count_internal: z.number().optional().default(0),
    link_count_external: z.number().optional().default(0),
    ai_score: z.number().nullable().optional(),
    severity: z.string().optional().default(''),
    checked_at: z.string().nullable().optional(),
  })
  .passthrough()
export type SitemapPage = z.infer<typeof sitemapPageSchema>

export const sitemapResponseSchema = z.object({
  audit: sitemapAuditSchema.nullable().optional(),
  pages: z.array(sitemapPageSchema).optional().default([]),
})
export type SitemapResponse = z.infer<typeof sitemapResponseSchema>

/** GET runs/s/<slug>/sitemap/ → crawl audit + per-page vitals/AI scores. */
export async function getSitemap(slug: string): Promise<SitemapResponse> {
  return sitemapResponseSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/sitemap/`))
}

/* ────────────────────────────────────────────────────────────────── backlinks */

export const backlinkRowSchema = z.object({
  id: z.number().optional().default(0),
  name: z.string(),
  category: z.string().optional().default(''),
  priority: z.number().optional().default(3),
  rationale: z.string().optional().default(''),
  submit_url: z.string().optional().default(''),
  description: z.string().optional().default(''),
})
export type BacklinkRow = z.infer<typeof backlinkRowSchema>

export const backlinksFreeSchema = z.object({
  rows: z.array(backlinkRowSchema).optional().default([]),
  has_generated: z.boolean().optional().default(false),
})
export type BacklinksFree = z.infer<typeof backlinksFreeSchema>

/** GET runs/s/<slug>/backlinks/free/ → free citation/backlink opportunities. */
export async function getBacklinksFree(slug: string): Promise<BacklinksFree> {
  return backlinksFreeSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/backlinks/free/`),
  )
}

/* ─────────────────────────────────────────────────────────── actions (tasks) */

export const userActionSchema = z.object({
  id: z.number(),
  action_type: z.string().optional().default(''),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  points_value: z.number().nullable().optional(),
  status: z.string().optional().default(''),
  assignee_email: z.string().optional().default(''),
  score_improvement: z.number().nullable().optional(),
  created_at: z.string().optional().default(''),
  // FK to the Recommendation this task was materialised from — lets the Tasks
  // table trigger the same auto-fix (looked up by recommendation id).
  recommendation: z.number().nullable().optional(),
})
export type UserAction = z.infer<typeof userActionSchema>

/** GET /api/analyzer/actions/?email= → role-scoped GEO tasks (admin: all agency; member: assigned). */
export async function getActions(email: string): Promise<UserAction[]> {
  return z
    .array(userActionSchema)
    .parse(
      await apiGet<unknown>('/api/analyzer/actions/', { params: { email: normalizeEmail(email) } }),
    )
}
