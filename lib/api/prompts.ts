import { z } from 'zod'

import { apiDelete, apiGet, apiPatch, apiPost } from './client'

/**
 * Prompt Tracker API — tracked prompts and their per-engine answers.
 * Backed by `runs/s/<slug>/prompts/` (list, create, recheck, soft-delete).
 */

/** A source the engine cited in its answer. `is_brand` marks the tracked brand's
 *  own domain — the real "was the brand cited?" signal (vs merely name-mentioned). */
export const promptCitationSchema = z
  .object({
    id: z.number().optional(),
    url: z.string().optional().default(''),
    domain: z.string().optional().default(''),
    title: z.string().nullable().optional(),
    is_brand: z.boolean().optional().default(false),
    is_competitor: z.boolean().optional().default(false),
  })
  .passthrough()
export type PromptCitation = z.infer<typeof promptCitationSchema>

/** One engine's answer to a tracked prompt. In the LIST payload `response_text`
 *  is capped to 500 chars server-side; the per-result detail endpoint returns it
 *  in full (see `getPromptResult`). */
export const promptResultSchema = z
  .object({
    id: z.number(),
    engine: z.string().optional().default(''),
    response_text: z.string().nullable().optional(),
    brand_mentioned: z.boolean().nullable().optional(),
    sentiment: z.string().nullable().optional(),
    rank_position: z.number().nullable().optional(),
    checked_at: z.string().nullable().optional(),
    citations: z.array(promptCitationSchema).optional().default([]),
  })
  .passthrough()
export type PromptResult = z.infer<typeof promptResultSchema>

export const promptTrackSchema = z.object({
  id: z.number(),
  prompt_text: z.string(),
  is_custom: z.boolean().optional().default(false),
  intent: z.string().nullable().optional(),
  prompt_type: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  visibility_pct: z.number().nullable().optional(),
  avg_position: z.number().nullable().optional(),
  ranking_label: z.string().nullable().optional(),
  sentiment_label: z.string().nullable().optional(),
  total_runs: z.number().nullable().optional(),
  mentions: z.number().nullable().optional(),
  results: z.array(promptResultSchema).optional().default([]),
})
export type PromptTrack = z.infer<typeof promptTrackSchema>

/** GET runs/s/<slug>/prompts/ → tracked prompts with per-engine results. */
export async function getPrompts(slug: string): Promise<PromptTrack[]> {
  return z
    .array(promptTrackSchema)
    .parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/prompts/`))
}

/** POST runs/s/<slug>/prompts/ → track a new prompt; engines answer it in the
 *  background, so its results arrive on a later refetch. */
export async function addPrompt(slug: string, promptText: string): Promise<PromptTrack> {
  return promptTrackSchema.parse(
    await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/prompts/`, { prompt_text: promptText }),
  )
}

/** GET runs/s/<slug>/prompts/<trackId>/results/<resultId>/ → one engine result with
 *  the FULL (uncapped) response text. Used to show the complete answer in the dialog. */
export async function getPromptResult(
  slug: string,
  trackId: number,
  resultId: number,
): Promise<PromptResult> {
  return promptResultSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/results/${resultId}/`),
  )
}

/** POST runs/s/<slug>/prompts/<id>/recheck/ → re-fire one prompt across engines. */
export async function recheckPrompt(slug: string, trackId: number): Promise<void> {
  await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/recheck/`)
}

/** DELETE runs/s/<slug>/prompts/<id>/ → stop tracking a prompt (soft delete). */
export async function deletePrompt(slug: string, trackId: number): Promise<void> {
  await apiDelete<unknown>(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/`)
}

export const answerGapFaqSchema = z.object({
  items: z.array(z.object({ question: z.string(), answer: z.string() })),
  jsonld: z.string(),
})
export type AnswerGapFaq = z.infer<typeof answerGapFaqSchema>

/** POST runs/s/<slug>/answer-gap-faq/ → FAQ content generated from the run's
 *  weakest tracked prompts (LLM generation, allow up to two minutes). */
export async function generateAnswerGapFaq(slug: string): Promise<AnswerGapFaq> {
  return answerGapFaqSchema.parse(
    await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/answer-gap-faq/`, undefined, {
      signal: AbortSignal.timeout(120_000),
    }),
  )
}

/* Derived from the tracked prompts' results + citations. */

export const visibilityMatrixSchema = z.object({
  engines: z.array(z.string()).default([]),
  rows: z
    .array(
      z.object({
        name: z.string(),
        domain: z.string().optional().default(''),
        is_brand: z.boolean().optional().default(false),
        cells: z.record(z.string(), z.number()).default({}),
      }),
    )
    .default([]),
})
export type VisibilityMatrix = z.infer<typeof visibilityMatrixSchema>

/** GET runs/s/<slug>/competitor-visibility-matrix/ → brand + competitors × engines. */
export async function getVisibilityMatrix(slug: string): Promise<VisibilityMatrix> {
  return visibilityMatrixSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/competitor-visibility-matrix/`),
  )
}

/**
 * Prompt coverage — for each tracked prompt, does a page on the site actually
 * answer it? Settled before any on-page or off-page work, because a prompt with
 * no answering content cannot be fixed by improving a page that does not exist.
 */

export const COVERAGE_STATUSES = ['covered', 'weak', 'uncovered', 'unknown'] as const
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number]

export const promptCoverageRowSchema = z.object({
  prompt_id: z.number(),
  prompt_text: z.string(),
  intent: z.string().default(''),
  status: z.enum(COVERAGE_STATUSES),
  best_url: z.string().default(''),
  best_score: z.number().default(0),
  best_heading: z.string().default(''),
  supporting_urls: z.array(z.string()).default([]),
  guidance: z.string().default(''),
})
export type PromptCoverageRow = z.infer<typeof promptCoverageRowSchema>

export const promptCoverageSummarySchema = z.object({
  total_prompts: z.number().default(0),
  covered: z.number().default(0),
  weak: z.number().default(0),
  uncovered: z.number().default(0),
  unknown: z.number().default(0),
  measurable: z.number().default(0),
  /** null when nothing is measurable — deliberately not the same as 0%. */
  coverage_pct: z.number().nullable().default(null),
  needs_page: z.array(z.string()).default([]),
  needs_section: z.array(z.object({ prompt: z.string(), url: z.string() })).default([]),
})

export const promptCoverageSchema = z.object({
  rows: z.array(promptCoverageRowSchema).default([]),
  summary: promptCoverageSummarySchema,
})
export type PromptCoverage = z.infer<typeof promptCoverageSchema>

/** GET runs/s/<slug>/prompt-coverage/ → per-prompt coverage + summary. */
export async function getPromptCoverage(slug: string): Promise<PromptCoverage> {
  return promptCoverageSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/prompt-coverage/`),
  )
}

/**
 * Answer block — the paste-ready passage that makes a page answer one prompt.
 * Drafted on demand because every call costs money.
 */

export const answerBlockSchema = z.object({
  prompt: z.string().default(''),
  heading: z.string().default(''),
  answer: z.string().default(''),
  supporting_points: z.array(z.string()).default([]),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  placement: z.string().default(''),
  target_url: z.string().default(''),
  /** "add_section" when a page already exists, else "new_page". */
  mode: z.string().default('new_page'),
  faq_jsonld: z.string().default(''),
  html_snippet: z.string().default(''),
})
export type AnswerBlock = z.infer<typeof answerBlockSchema>

/** POST runs/s/<slug>/prompts/<id>/answer-block/ → draft the passage. */
export async function draftAnswerBlock(slug: string, trackId: number): Promise<AnswerBlock> {
  return answerBlockSchema.parse(
    await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/answer-block/`, {}),
  )
}

/**
 * Citation gaps — the domains engines cited when they answered a tracked prompt
 * and did not mention the brand. Observed, not inferred: these are the exact
 * sources that won each answer.
 */

export const CITATION_GAP_STATUSES = ['identified', 'pitched', 'dismissed', 'live'] as const
export type CitationGapStatus = (typeof CITATION_GAP_STATUSES)[number]

export const citationGapSchema = z.object({
  domain: z.string(),
  prompts_won: z.number().default(0),
  citations: z.number().default(0),
  example_prompts: z.array(z.string()).default([]),
  example_url: z.string().default(''),
  status: z.enum(CITATION_GAP_STATUSES).default('identified'),
  brand_present: z.boolean().nullable().default(null),
  note: z.string().default(''),
})
export type CitationGap = z.infer<typeof citationGapSchema>

export const citationGapsSchema = z.object({
  targets: z.array(citationGapSchema).default([]),
  summary: z
    .object({
      total: z.number().default(0),
      prompts_lost: z.number().default(0),
      live: z.number().default(0),
      pitched: z.number().default(0),
    })
    .default({ total: 0, prompts_lost: 0, live: 0, pitched: 0 }),
})
export type CitationGaps = z.infer<typeof citationGapsSchema>

/** GET runs/s/<slug>/citation-gaps/ → ranked outreach list. */
export async function getCitationGaps(slug: string, verify = true): Promise<CitationGaps> {
  return citationGapsSchema.parse(
    await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/citation-gaps/?verify=${verify ? 1 : 0}`),
  )
}

/** PATCH the outreach state for one domain. "live" is verified, never set. */
export async function setCitationGapStatus(
  slug: string,
  body: { domain: string; status: Exclude<CitationGapStatus, 'live'>; note?: string },
): Promise<{ domain: string; status: string; note: string }> {
  return apiPatch(`/api/analyzer/runs/s/${slug}/citation-gaps/`, body)
}

/** IndexNow — push pages into Bing's index, which ChatGPT search reads. */

export const indexNowSetupSchema = z.object({
  configured: z.boolean().default(false),
  key: z.string().default(''),
  key_file_url: z.string().default(''),
  key_file_contents: z.string().default(''),
  verified: z.boolean().default(false),
  message: z.string().default(''),
  why: z.string().default(''),
  detail: z.string().default(''),
})
export type IndexNowSetup = z.infer<typeof indexNowSetupSchema>

export const indexNowResultSchema = z.object({
  submitted: z.number().default(0),
  status_code: z.number().nullable().default(null),
  ok: z.boolean().default(false),
  message: z.string().default(''),
  urls: z.array(z.string()).default([]),
})
export type IndexNowResult = z.infer<typeof indexNowResultSchema>

export async function getIndexNowSetup(slug: string): Promise<IndexNowSetup> {
  return indexNowSetupSchema.parse(await apiGet<unknown>(`/api/analyzer/runs/s/${slug}/indexnow/`))
}

export async function submitToIndexNow(slug: string): Promise<IndexNowResult> {
  return indexNowResultSchema.parse(
    await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/indexnow/`, {}),
  )
}

/** Entity resolution — can engines resolve the brand name at all? */

export const entityResolutionSchema = z.object({
  brand: z.string().default(''),
  responses: z.number().default(0),
  confused: z.number().default(0),
  confusion_rate: z.number().default(0),
  is_blocking: z.boolean().default(false),
  by_engine: z
    .record(z.string(), z.object({ responses: z.number(), confused: z.number(), rate: z.number() }))
    .default({}),
  top_alternatives: z.array(z.object({ name: z.string(), count: z.number() })).default([]),
  signals: z
    .array(
      z.object({
        engine: z.string(),
        prompt: z.string().default(''),
        kind: z.string().default(''),
        suggested: z.string().default(''),
        excerpt: z.string().default(''),
      }),
    )
    .default([]),
})
export type EntityResolution = z.infer<typeof entityResolutionSchema>

/** POST because it probes every engine live and costs one call each. */
export async function probeEntityResolution(slug: string): Promise<EntityResolution> {
  return entityResolutionSchema.parse(
    await apiPost<unknown>(`/api/analyzer/runs/s/${slug}/entity-resolution/`, {}),
  )
}
