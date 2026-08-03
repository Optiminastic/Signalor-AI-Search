import { getOrganizations, type Organization } from '@/lib/api/organizations'
import {
  getSubscriptionStatus,
  getUsage,
  listInvoices,
  type Invoice,
  type Subscription,
  type Usage,
} from '@/lib/api/payments'
import type { AccountType } from '@/stores/useOnboardingStore'

/**
 * Account overview for the profile page. `loadAccountOverview` composes the real
 * signalor endpoints server-side; each section independently falls back to
 * SAMPLE_ACCOUNT when its call fails (e.g. backend unreachable), so the page
 * always renders.
 */

export interface UsageMetric {
  used: number
  /** Undefined means unlimited — the API reports an uncapped limit as 0. */
  max?: number
}

export interface AccountProject {
  id: number
  name: string
  url: string
  createdAt: string
}

export interface AccountInvoice {
  id: string
  date: string
  amount: number
  currency: string
  status: string
}

type PlanStatus = 'active' | 'trialing' | 'past_due' | 'canceled'

export interface AccountOverview {
  user: { name: string; email: string; accountType: AccountType }
  plan: {
    key: string
    label: string
    price: number
    currency: string
    interval: string
    status: PlanStatus
    renewsOn: string | null
  }
  usage: { projects: UsageMetric; prompts: UsageMetric; runsThisMonth: number }
  engines: string[]
  projects: AccountProject[]
  invoices: AccountInvoice[]
}

export const SAMPLE_ACCOUNT: AccountOverview = {
  user: { name: 'Jane Doe', email: 'jane@example.com', accountType: 'agency' },
  plan: {
    key: 'pro',
    label: 'Pro',
    price: 79,
    currency: 'USD',
    interval: 'month',
    status: 'active',
    renewsOn: '2026-08-03',
  },
  usage: {
    projects: { used: 3, max: 10 },
    prompts: { used: 42, max: 150 },
    runsThisMonth: 18,
  },
  engines: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google', 'Bing'],
  projects: [
    { id: 1, name: 'Optiminastic', url: 'optiminastic.com', createdAt: '2026-05-12' },
    { id: 2, name: 'SignalorAI', url: 'signalor.ai', createdAt: '2026-06-01' },
    { id: 3, name: 'Tech5', url: 'tech5.io', createdAt: '2026-06-20' },
  ],
  invoices: [
    { id: 'in_0Kd93', date: '2026-07-03', amount: 79, currency: 'USD', status: 'paid' },
    { id: 'in_0Kc71', date: '2026-06-03', amount: 79, currency: 'USD', status: 'paid' },
    { id: 'in_0Kb42', date: '2026-05-03', amount: 79, currency: 'USD', status: 'paid' },
  ],
}

function mapPlanStatus(status: string, isActive: boolean): PlanStatus {
  if (status === 'trialing') return 'trialing'
  if (status === 'past_due') return 'past_due'
  if (isActive || status === 'active') return 'active'
  return 'canceled'
}

function planFrom(sub: Subscription): AccountOverview['plan'] {
  return {
    key: sub.plan,
    label: sub.plan_label,
    price: sub.limits.price_gbp,
    currency: sub.currency,
    interval: 'month',
    status: mapPlanStatus(sub.status, sub.is_active),
    renewsOn: sub.current_period_end,
  }
}

async function settled<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch {
    return null
  }
}

function usageFrom(usage: Usage | null): AccountOverview['usage'] {
  if (!usage) return SAMPLE_ACCOUNT.usage
  return {
    // The API sends 0 for "no cap"; drop it so the tile shows a bare count
    // instead of a denominator (and no progress bar) — see StatTile.
    projects: { used: usage.usage.projects, max: usage.limits.max_projects || undefined },
    prompts: { used: usage.usage.prompts, max: usage.limits.max_prompts || undefined },
    runsThisMonth: usage.usage.runs_this_month,
  }
}

function projectsFrom(orgs: Organization[] | null): AccountProject[] {
  if (!orgs) return SAMPLE_ACCOUNT.projects
  return orgs.map(o => ({ id: o.id, name: o.name, url: o.url, createdAt: o.created_at }))
}

function invoicesFrom(invoices: Invoice[] | null): AccountInvoice[] {
  if (!invoices) return SAMPLE_ACCOUNT.invoices
  return invoices.map(i => ({
    id: i.payment_id,
    date: i.created_at ?? '',
    amount: i.amount ?? 0,
    currency: i.currency ?? 'USD',
    status: i.status ?? 'unknown',
  }))
}

/**
 * Compose the profile overview from the real backend (server-side). Runs the
 * calls in parallel; any section that fails uses the SAMPLE_ACCOUNT value.
 */
export async function loadAccountOverview(email: string, name?: string): Promise<AccountOverview> {
  const [usage, sub, orgs, invoices] = await Promise.all([
    settled(getUsage(email)),
    settled(getSubscriptionStatus(email)),
    settled(getOrganizations(email)),
    settled(listInvoices(email)),
  ])

  const accountType = sub?.account_type ?? SAMPLE_ACCOUNT.user.accountType
  const engines = usage?.limits.engines ?? sub?.limits.engines ?? SAMPLE_ACCOUNT.engines

  return {
    user: { name: name?.trim() || SAMPLE_ACCOUNT.user.name, email, accountType },
    plan: sub ? planFrom(sub) : SAMPLE_ACCOUNT.plan,
    usage: usageFrom(usage),
    engines,
    projects: projectsFrom(orgs),
    invoices: invoicesFrom(invoices),
  }
}
