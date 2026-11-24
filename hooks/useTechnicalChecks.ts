'use client'

import { useQuery } from '@tanstack/react-query'

import { useActiveProject } from '@/hooks/useActiveProject'
import { getTechnicalChecks, type TechnicalChecksReport } from '@/lib/api/technical-checks'
import { queryKeys } from '@/lib/query-keys'

interface UseTechnicalChecksResult {
  report: TechnicalChecksReport | undefined
  isLoading: boolean
  isError: boolean
}

/** The active brand's latest robots.txt and sitemap checks (passed, failed, unknown). */
export function useTechnicalChecks(): UseTechnicalChecksResult {
  const { email, slug } = useActiveProject()
  const query = useQuery({
    queryKey: queryKeys.catalyst.technicalChecks(slug ?? ''),
    enabled: Boolean(email && slug),
    queryFn: () => getTechnicalChecks(slug as string, email as string),
  })
  return { report: query.data, isLoading: query.isLoading, isError: query.isError }
}
