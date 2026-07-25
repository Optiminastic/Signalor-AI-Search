'use client'

import { useQuery } from '@tanstack/react-query'

import { getDomainAuthority, type DomainAuthority } from '@/lib/api/analyzer'

interface UseDomainAuthorityResult {
  data: DomainAuthority | undefined
  isLoading: boolean
  isError: boolean
}

/** Brand Domain Authority (DR + backlinks when Ahrefs is configured) for a run slug. */
export function useDomainAuthority(slug: string | undefined): UseDomainAuthorityResult {
  const query = useQuery({
    queryKey: ['catalyst', 'domain-authority', slug ?? ''],
    enabled: Boolean(slug),
    // Authority changes slowly and is cached server-side; don't refetch on focus.
    staleTime: 60 * 60 * 1000,
    queryFn: (): Promise<DomainAuthority> => getDomainAuthority(slug as string),
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}
