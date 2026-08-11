import { z } from 'zod'

import { apiGet } from './client'

/**
 * GET /api/payments/usage/ — the account's plan caps and what it has consumed.
 *
 * This schema previously parsed three of the eleven numbers the endpoint sends,
 * so the profile page could only ever show projects / prompts / runs. Everything
 * that answers "am I about to hit a wall?" — the AI spend allowance, the
 * analysis and auto-fix caps, and the server's own at-limit flags — arrived on
 * the wire and was dropped here. All of it is parsed now.
 *
 * A cap of 0 means UNLIMITED, not "none": the backend reports an uncapped plan
 * as zero. Callers must treat 0 as "no denominator", never as a full meter.
 */
const usageSchema = z.object({
  plan: z.string(),
  account_type: z.string().optional().default(''),
  /** Rolling window the usage counts cover (days). */
  window_days: z.number().optional().default(30),
  limits: z.object({
    max_projects: z.number(),
    max_prompts: z.number(),
    engines: z.array(z.string()),
    max_analyses_per_month: z.number().optional().default(0),
    max_autofixes_per_month: z.number().optional().default(0),
    max_autofixes_per_day: z.number().optional().default(0),
    max_autofix_regens: z.number().optional().default(0),
  }),
  usage: z.object({
    projects: z.number(),
    prompts: z.number(),
    runs_this_month: z.number(),
    analyses_30d: z.number().optional().default(0),
    autofixes_30d: z.number().optional().default(0),
    autofixes_today: z.number().optional().default(0),
  }),
  /** LLM spend against the plan's monthly allowance. */
  ai_allowance: z
    .object({
      uncapped: z.boolean().optional().default(false),
      used_pct: z.number().optional().default(0),
    })
    .optional()
    .default({ uncapped: false, used_pct: 0 }),
  /** The server's own verdict — authoritative, not re-derived on the client. */
  at_limit: z
    .object({
      projects: z.boolean().optional().default(false),
      prompts: z.boolean().optional().default(false),
    })
    .optional()
    .default({ projects: false, prompts: false }),
})

export type Usage = z.infer<typeof usageSchema>

const subscriptionSchema = z.object({
  is_active: z.boolean(),
  status: z.string(),
  current_period_end: z.string().nullable(),
  currency: z.string(),
  plan: z.string(),
  plan_label: z.string(),
  limits: z.object({
    label: z.string(),
    price_gbp: z.number(),
    max_projects: z.number(),
    max_prompts: z.number(),
    engines: z.array(z.string()),
  }),
  account_type: z.enum(['individual', 'agency']).optional(),
})

export type Subscription = z.infer<typeof subscriptionSchema>

const invoiceSchema = z.object({
  payment_id: z.string(),
  created_at: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  status: z.string().nullable(),
})

const invoiceListSchema = z.object({
  items: z.array(invoiceSchema),
})

export type Invoice = z.infer<typeof invoiceSchema>

/** GET /api/payments/usage/?email= — usage against plan limits. */
export async function getUsage(email: string): Promise<Usage> {
  return usageSchema.parse(await apiGet<unknown>('/api/payments/usage/', { params: { email } }))
}

/** GET /api/payments/status/?email= — subscription status + plan. */
export async function getSubscriptionStatus(email: string): Promise<Subscription> {
  return subscriptionSchema.parse(
    await apiGet<unknown>('/api/payments/status/', { params: { email } }),
  )
}

/** GET /api/payments/invoices/?email= — past invoices. */
export async function listInvoices(email: string): Promise<Invoice[]> {
  const data = await apiGet<unknown>('/api/payments/invoices/', { params: { email } })
  return invoiceListSchema.parse(data).items
}
