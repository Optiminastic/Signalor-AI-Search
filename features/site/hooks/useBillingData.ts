'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getInvoiceList,
  getSubscriptionStatus,
  getUsage,
  type InvoiceItem,
  type SubscriptionStatus,
  type UsageData,
} from '@/features/site/lib/api/payments'
import { useSession } from '@/features/site/lib/auth-client'

interface BillingData {
  sub: SubscriptionStatus | null
  usage: UsageData | undefined
  invoices: InvoiceItem[] | undefined
  loading: boolean
}

/** Plan, usage-vs-limits, and invoice data for the billing settings page. */
export function useBillingData(): BillingData {
  const { data: session, isPending } = useSession()
  const email = session?.user?.email ?? ''

  const subQuery = useQuery({
    queryKey: ['settings', 'subscription', email],
    enabled: Boolean(email),
    // Accounts without a subscription row error out — that is the "Free"
    // state, not a failure.
    queryFn: () => getSubscriptionStatus(email).catch(() => null),
  })

  const usageQuery = useQuery({
    queryKey: ['settings', 'usage', email],
    enabled: Boolean(email),
    queryFn: () => getUsage(email),
  })

  const invoicesQuery = useQuery({
    queryKey: ['settings', 'invoices', email],
    enabled: Boolean(email),
    queryFn: async (): Promise<InvoiceItem[]> => {
      const res = await getInvoiceList(email).catch(() => null)
      return res?.items ?? []
    },
  })

  return {
    sub: subQuery.data ?? null,
    usage: usageQuery.data,
    invoices: invoicesQuery.data,
    loading:
      isPending ||
      !email ||
      subQuery.isLoading ||
      usageQuery.isLoading ||
      invoicesQuery.isLoading,
  }
}
