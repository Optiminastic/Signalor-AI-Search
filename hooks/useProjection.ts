'use client'

import { useQuery } from '@tanstack/react-query'

import { useActiveProject } from '@/hooks/useActiveProject'
import { getProjection, type Projection } from '@/lib/api/projection'
import { queryKeys } from '@/lib/query-keys'

interface UseProjectionResult {
  projection: Projection | undefined
  isLoading: boolean
  isError: boolean
  /** No completed analysis run yet for this brand. */
  noRun: boolean
}

/** The active brand's conservative 30-day AI-visibility projection. */
export function useProjection(): UseProjectionResult {
  const { slug, isLoading: projectLoading } = useActiveProject()

  const query = useQuery({
    queryKey: queryKeys.catalyst.projection(slug ?? ''),
    enabled: Boolean(slug),
    queryFn: () => getProjection(slug as string),
  })

  return {
    projection: query.data,
    isLoading: projectLoading || (Boolean(slug) && query.isLoading),
    isError: query.isError,
    // No run slug once loading settles ⇒ the brand has no analysis run yet.
    noRun: !projectLoading && !slug,
  }
}
