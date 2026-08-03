'use client'

import { AppSidebar } from '@/features/site/components/navigation/app-sidebar'
import { BillingInvoicesCard } from '@/features/site/components/settings/billing-invoices-card'
import { BillingPlanCard } from '@/features/site/components/settings/billing-plan-card'
import { BillingUsageCard } from '@/features/site/components/settings/billing-usage-card'
import { SettingsNav } from '@/features/site/components/settings/settings-nav'
import { useBillingData } from '@/features/site/hooks/useBillingData'

export default function BillingSettingsPage() {
  const { sub, usage, invoices, loading } = useBillingData()

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="border-border/60 bg-background/30 flex h-full w-full overflow-hidden border">
        <AppSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <SettingsNav />
            <div>
              <h1 className="text-2xl font-bold">Billing</h1>
              <p className="text-muted-foreground mt-1">
                Your plan, usage against limits, and payment history.
              </p>
            </div>
            <BillingPlanCard
              sub={sub}
              accountType={usage?.account_type ?? sub?.account_type}
              loading={loading}
            />
            <BillingUsageCard usage={usage} loading={loading} />
            <BillingInvoicesCard invoices={invoices} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  )
}
