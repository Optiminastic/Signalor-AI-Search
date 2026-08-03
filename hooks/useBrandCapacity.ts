'use client'

import { useQuery } from '@tanstack/react-query'

import { getSubscriptionStatus, getUsage } from '@/lib/api/payments'
import { useSession } from '@/lib/auth-client'

export interface BrandCapacity {
  /** Brands this account already owns. */
  used: number
  /** Effective brand cap, after account type and internal status are applied. */
  max: number
  /** Plan label for the header, e.g. "Max (Internal)". Empty when unknown. */
  planLabel: string
  /** False when the account has no room for another brand. */
  canCreate: boolean
}

interface UseBrandCapacityResult {
  data: BrandCapacity | undefined
  isLoading: boolean
}

/**
 * Brand slots used vs available.
 *
 * `max_projects` from `/api/payments/usage/` is the *effective* cap
 * (`effective_max_projects` on the backend), so this is the same number the
 * create endpoint enforces — the button state cannot drift from the 403.
 */
export function useBrandCapacity(): UseBrandCapacityResult {
  const { data: session } = useSession()
  const email = session?.user?.email ?? undefined

  const query = useQuery({
    queryKey: ['catalyst', 'brand-capacity', email ?? ''],
    enabled: Boolean(email),
    queryFn: async (): Promise<BrandCapacity> => {
      const [usage, subscription] = await Promise.all([
        getUsage(email as string),
        // Accounts without a subscription row still have a usable cap, so a
        // missing plan label must not fail the whole query.
        getSubscriptionStatus(email as string).catch(() => null),
      ])
      return {
        used: usage.usage.projects,
        max: usage.limits.max_projects,
        planLabel: subscription?.plan_label ?? '',
        // 0 = unlimited. Comparing against it directly would read as "at
        // capacity" and disable brand creation for uncapped accounts.
        canCreate:
          usage.limits.max_projects === 0 || usage.usage.projects < usage.limits.max_projects,
      }
    },
  })

  return { data: query.data, isLoading: query.isLoading }
}
