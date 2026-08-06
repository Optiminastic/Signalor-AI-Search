import { z } from 'zod'

import { apiGet, apiPost } from './client'

/** One buyer prompt and how each answer engine responded to it. */
export const outreachPromptSchema = z.object({
  prompt: z.string(),
  intent: z.string().default(''),
  prompt_type: z.string().default(''),
  engines: z
    .array(
      z.object({
        label: z.string(),
        mentioned: z.boolean(),
        answered: z.boolean(),
      }),
    )
    .default([]),
  mentions: z.number().default(0),
  /**
   * False when no engine returned an answer. Kept distinct from "not mentioned"
   * all the way to the UI: an engine failure presented as an absence would be a
   * fabricated finding in a document sent to a named prospect.
   */
  measured: z.boolean().default(false),
  cited_domains: z.array(z.string()).default([]),
})

export const outreachReportSchema = z.object({
  url: z.string().default(''),
  brand: z.string().default(''),
  industry: z.string().default(''),
  prompts: z.array(outreachPromptSchema).default([]),
  prompts_total: z.number().default(0),
  prompts_measured: z.number().default(0),
  prompts_lost: z.number().default(0),
  competitors: z.array(z.object({ domain: z.string(), prompts: z.number() })).default([]),
  opportunities: z.array(z.string()).default([]),
})

export const outreachRunSchema = z.object({
  slug: z.string(),
  url: z.string(),
  brand_name: z.string().default(''),
  status: z.string(),
  progress: z.number().default(0),
  phase: z.string().default(''),
  error_message: z.string().default(''),
  report: z.union([outreachReportSchema, z.object({}).strict()]).default({}),
})

export type OutreachPrompt = z.infer<typeof outreachPromptSchema>
export type OutreachReport = z.infer<typeof outreachReportSchema>
export type OutreachRun = z.infer<typeof outreachRunSchema>

const KEY_HEADER = 'X-Outreach-Key'

/** Start a benchmark. The key gates LLM spend — see backend views/outreach.py. */
export async function startOutreachBenchmark(url: string, key: string): Promise<OutreachRun> {
  return outreachRunSchema.parse(
    await apiPost<unknown>('/api/analyzer/outreach/', { url }, { headers: { [KEY_HEADER]: key } }),
  )
}

/** Poll a benchmark. Open by slug so a finished report can be shared by link. */
export async function getOutreachBenchmark(slug: string): Promise<OutreachRun> {
  return outreachRunSchema.parse(await apiGet<unknown>(`/api/analyzer/outreach/${slug}/`))
}

/** True once the report is populated enough to render. */
export function hasReport(run: OutreachRun | undefined): run is OutreachRun & {
  report: OutreachReport
} {
  return Boolean(
    run && 'prompts' in run.report && (run.report as OutreachReport).prompts.length > 0,
  )
}
