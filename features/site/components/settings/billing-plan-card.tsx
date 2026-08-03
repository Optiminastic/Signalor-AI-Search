'use client'

import Link from 'next/link'

import { ArrowRight, CreditCard } from '@/features/site/components/icons'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/site/components/ui/card'
import type { SubscriptionStatus } from '@/features/site/lib/api/payments'
import { cn } from '@/features/site/lib/utils'
import { formatDate } from '@/lib/format'

interface BillingPlanCardProps {
  sub: SubscriptionStatus | null
  accountType?: 'individual' | 'agency'
  loading: boolean
}

function statusTone(status: string): string {
  if (status === 'active' || status === 'trialing') return 'bg-success/10 text-success'
  if (status === 'past_due') return 'bg-warning/10 text-warning'
  return 'bg-muted text-muted-foreground'
}

export function BillingPlanCard({ sub, accountType, loading }: BillingPlanCardProps): JSX.Element {
  const renewal = sub?.current_period_end ? formatDate(sub.current_period_end) : null

  return (
    <Card className="glass-card border-border/70">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="text-primary h-4 w-4" />
          <CardTitle>Subscription</CardTitle>
        </div>
        <CardDescription>Your current plan and renewal.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading plan…</p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-foreground text-lg font-semibold">{sub?.plan_label || 'Free'}</p>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
                    statusTone(sub?.status ?? 'none'),
                  )}
                >
                  {sub?.status ? sub.status.replace('_', ' ') : 'no subscription'}
                </span>
                {accountType === 'agency' && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    Agency
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {sub?.is_active && renewal
                  ? `Renews on ${renewal}`
                  : 'No active subscription — upgrade to unlock the full platform.'}
              </p>
            </div>
            <Link
              href="/pricing"
              className="bg-primary inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
            >
              {sub?.is_active ? 'Manage plan' : 'See plans'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
