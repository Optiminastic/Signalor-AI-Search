'use client'

import { useQuery } from '@tanstack/react-query'

import { getSiteOne, type SiteOneReport } from '@/lib/api/siteone'

interface UseSiteOneResult {
  data: SiteOneReport | undefined
  isLoading: boolean
  isError: boolean
}

/** Fetches the SiteOne technical/SEO report for a run slug (or `undefined`). */
export function useSiteOne(slug: string | undefined): UseSiteOneResult {
  const query = useQuery({
    queryKey: queryKeysSiteOne(slug),
    enabled: Boolean(slug),
    queryFn: () => getSiteOne(slug as string),
  })
  return {
    data: query.data ?? undefined,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

function queryKeysSiteOne(slug: string | undefined): readonly unknown[] {
  return ['catalyst', 'siteone', slug ?? '']
}
