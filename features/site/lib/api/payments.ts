import { z } from 'zod'

import { apiClient } from './client'

/** Backend `dodo_mode` when checkout fails (no secrets). */
export type DodoMode = 'live' | 'test'

export class CheckoutSessionError extends Error {
  readonly dodoMode?: DodoMode

  constructor(message: string, dodoMode?: DodoMode) {
    super(message)
    this.name = 'CheckoutSessionError'
    this.dodoMode = dodoMode
  }
}

// ─── Schemas ────────────────────────────────────────────────────────────────

const planLimitsSchema = z.object({
  label: z.string(),
  price_gbp: z.number(),
  max_projects: z.number(),
  max_prompts: z.number(),
  engines: z.array(z.string()),
  features: z.array(z.string()).optional(),
})

const usageDataSchema = z.object({
  plan: z.string(),
  account_type: z.enum(['individual', 'agency']).optional(),
  /** Trailing window (days) the count quotas are measured over. */
  window_days: z.number().optional(),
  limits: z.object({
    max_projects: z.number(),
    max_prompts: z.number(),
    engines: z.array(z.string()),
    // Per-brand count quotas; 0 = unlimited. Optional so an older backend
    // (without the quota fields) still parses.
    max_analyses_per_month: z.number().optional(),
    max_autofixes_per_month: z.number().optional(),
    max_autofixes_per_day: z.number().optional(),
    max_autofix_regens: z.number().optional(),
  }),
  usage: z.object({
    projects: z.number(),
    prompts: z.number(),
    runs_this_month: z.number(),
    analyses_30d: z.number().optional(),
    autofixes_30d: z.number().optional(),
    autofixes_today: z.number().optional(),
  }),
  ai_allowance: z
    .object({
      uncapped: z.boolean(),
      used_pct: z.number(),
    })
    .optional(),
  at_limit: z.object({
    projects: z.boolean(),
    prompts: z.boolean(),
  }),
})

const subscriptionStatusSchema = z.object({
  is_active: z.boolean(),
  status: z.string(),
  current_period_end: z.string().nullable(),
  currency: z.string(),
  plan: z.string(),
  plan_label: z.string(),
  limits: planLimitsSchema,
  account_type: z.enum(['individual', 'agency']).optional(),
  invoice_available: z.boolean().optional(),
})

const invoiceItemSchema = z.object({
  payment_id: z.string(),
  created_at: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  status: z.string().nullable(),
})

const invoiceListResponseSchema = z.object({
  items: z.array(invoiceItemSchema),
  error: z.string().optional(),
})

const dodoPlanPriceSchema = z.object({
  currency: z.string(),
  amount_minor: z.number(),
  amount: z.number(),
  interval: z.string(),
  interval_count: z.number(),
  prices_by_currency: z.record(z.string(), z.number()).optional(),
})

const planPricesResponseSchema = z.object({
  starter: dodoPlanPriceSchema.nullable(),
  pro: dodoPlanPriceSchema.nullable(),
  business: dodoPlanPriceSchema.nullable(),
  source: z.enum(['dodo', 'fallback']),
})

const checkoutSessionResponseSchema = z.object({
  checkout_url: z.string(),
})

const terminateResponseSchema = z.object({
  message: z.string(),
  deactivated_at: z.string().optional(),
})

const simpleMessageSchema = z.object({
  message: z.string(),
})

const deleteAccountResponseSchema = z.object({
  message: z.string(),
  deleted: z.record(z.string(), z.number()),
})

// ─── Types ──────────────────────────────────────────────────────────────────

export type PlanLimits = z.infer<typeof planLimitsSchema>
export type UsageData = z.infer<typeof usageDataSchema>
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type InvoiceListResponse = z.infer<typeof invoiceListResponseSchema>
export type DodoPlanPrice = z.infer<typeof dodoPlanPriceSchema>
export type PlanPricesResponse = z.infer<typeof planPricesResponseSchema>

// ─── API calls ──────────────────────────────────────────────────────────────

export async function createCheckoutSession(
  email: string,
  plan: string = 'starter',
  opts: { country?: string; currency?: string; partnerCode?: string } = {},
): Promise<{ checkout_url: string }> {
  try {
    const { data } = await apiClient.post('/api/payments/create-checkout/', {
      email,
      plan,
      country: opts.country,
      currency: opts.currency,
      partner_code: opts.partnerCode,
    })
    return checkoutSessionResponseSchema.parse(data)
  } catch (err: unknown) {
    const ax = err as {
      response?: { data?: { error?: string; dodo_mode?: string } }
      message?: string
    }
    const msg =
      ax.response?.data?.error || ax.message || 'Failed to start checkout. Please try again.'
    const raw = ax.response?.data?.dodo_mode
    const dodoMode: DodoMode | undefined = raw === 'live' || raw === 'test' ? raw : undefined
    throw new CheckoutSessionError(msg, dodoMode)
  }
}

export async function getUsage(email: string): Promise<UsageData> {
  const { data } = await apiClient.get('/api/payments/usage/', { params: { email } })
  return usageDataSchema.parse(data)
}

export async function getInvoiceList(email: string): Promise<InvoiceListResponse> {
  const { data } = await apiClient.get('/api/payments/invoices/', { params: { email } })
  return invoiceListResponseSchema.parse(data)
}

export async function getSubscriptionStatus(email: string): Promise<SubscriptionStatus> {
  const { data } = await apiClient.get('/api/payments/status/', { params: { email } })
  return subscriptionStatusSchema.parse(data)
}

const verifyCheckoutSchema = z.object({
  is_active: z.boolean(),
  status: z.string(),
})

export type VerifyCheckoutResult = z.infer<typeof verifyCheckoutSchema>

/**
 * Webhook-independent payment confirmation. Given the subscription_id Dodo
 * appends to the return URL, the backend asks Dodo directly and activates the
 * subscription if Dodo says it is active — so /payments/success works even
 * when the webhook is delayed or unreachable (e.g. local dev).
 */
export async function verifyCheckout(
  email: string,
  subscriptionId?: string,
): Promise<VerifyCheckoutResult> {
  const { data } = await apiClient.post('/api/payments/verify-checkout/', {
    email,
    subscription_id: subscriptionId ?? '',
  })
  return verifyCheckoutSchema.parse(data)
}

export async function terminateAccount(
  email: string,
): Promise<{ message: string; deactivated_at?: string }> {
  const { data } = await apiClient.post('/api/account/terminate/', { email })
  return terminateResponseSchema.parse(data)
}

export async function cancelTermination(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/api/account/cancel-termination/', { email })
  return simpleMessageSchema.parse(data)
}

export async function getPlanPrices(): Promise<PlanPricesResponse> {
  const { data } = await apiClient.get('/api/payments/plan-prices/')
  return planPricesResponseSchema.parse(data)
}

export async function deleteAccount(
  email: string,
  confirm: string,
): Promise<{ message: string; deleted: Record<string, number> }> {
  const { data } = await apiClient.post('/api/account/delete/', { email, confirm })
  return deleteAccountResponseSchema.parse(data)
}
