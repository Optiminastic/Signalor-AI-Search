import { formatDate, formatMoney } from '@/lib/format'
import { ArrowUpRight, CreditCard } from '@/lib/icons'
import type { AccountOverview } from '@/services/account.service'

import { SectionCard } from './section-card'
import { SectionUnavailable } from './section-state'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-[#047857]/10 text-[#047857]',
  trialing: 'bg-primary/10 text-primary',
  past_due: 'bg-[#b45309]/10 text-[#b45309]',
  canceled: 'bg-[var(--cat-hover)] text-[var(--cat-ink-2)]',
}

/** Current plan, price, status and billing actions. */
export function PlanBilling({
  plan,
  unavailable = false,
}: {
  plan: AccountOverview['plan']
  unavailable?: boolean
}): JSX.Element {
  // Never render plan numbers we could not confirm — an invented price and
  // renewal date are indistinguishable from real ones once they are on screen.
  if (unavailable) {
    return (
      <SectionCard
        title="Plan & billing"
        description="Manage your subscription and payment method."
      >
        <SectionUnavailable what="plan and billing details" />
      </SectionCard>
    )
  }
  return (
    <SectionCard title="Plan & billing" description="Manage your subscription and payment method.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-[var(--cat-ink)]">
              {plan.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[plan.status] ?? STATUS_STYLES.canceled}`}
            >
              {plan.status.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[var(--cat-ink-2)]">
            {formatMoney(plan.price, plan.currency)}
            <span className="text-[var(--cat-ink-3)]">/{plan.interval}</span>
            {plan.renewsOn && <> · renews {formatDate(plan.renewsOn)}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3.5 text-[13px] font-medium text-[var(--cat-ink)] transition hover:bg-[var(--cat-hover)]"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Manage billing
          </button>
          <button
            type="button"
            className="auth-cta-btn inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-medium text-white"
          >
            Upgrade
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </SectionCard>
  )
}
