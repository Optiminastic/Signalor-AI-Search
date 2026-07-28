'use client'

import { useQuery } from '@tanstack/react-query'

import { useActiveProject } from '@/hooks/useActiveProject'
import { getIntegrationStatus } from '@/lib/api/integrations'

/** Backend provider id → the catalog card slug it connects. */
const PROVIDER_SLUG: Record<string, string> = {
  ga4: 'google-analytics',
  google_analytics: 'google-analytics',
  gsc: 'search-console',
  search_console: 'search-console',
  // The value the backend actually stores (Integration.Provider.GOOGLE_SEARCH_CONSOLE).
  // Without this the card never flips to connected after a successful OAuth.
  google_search_console: 'search-console',
  shopify: 'shopify',
  wordpress: 'wordpress',
  woocommerce: 'wordpress',
  slack: 'slack',
  zapier: 'zapier',
}

function slugFor(provider: string): string {
  return PROVIDER_SLUG[provider.toLowerCase()] ?? provider.toLowerCase()
}

interface UseIntegrationsResult {
  connected: Set<string>
  isLoading: boolean
  isError: boolean
}

/**
 * The set of catalog slugs connected for the CURRENTLY SELECTED brand.
 *
 * Both the request and the cache key are scoped by org id. Without it the
 * backend falls back to the account's first brand, so every brand showed the
 * same GA/GSC state and switching brands never refetched.
 */
export function useIntegrations(): UseIntegrationsResult {
  const { email, activeOrg } = useActiveProject()
  const orgId = activeOrg?.id

  const query = useQuery({
    queryKey: ['catalyst', 'integrations', email ?? '', orgId ?? 0],
    enabled: Boolean(email && orgId),
    queryFn: async (): Promise<string[]> => {
      const rows = await getIntegrationStatus(email as string, orgId)
      return rows.filter(r => r.is_active).map(r => slugFor(r.provider))
    },
  })

  return {
    connected: new Set(query.data ?? []),
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
