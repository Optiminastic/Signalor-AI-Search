'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getEntityResolution,
  probeEntityResolution,
  type EntityResolution,
  type EntityResolutionState,
} from '@/lib/api/prompts'
import { queryKeys } from '@/lib/query-keys'

/**
 * Entity resolution.
 *
 * The stored report is a plain query, so the card shows the last verdict as soon
 * as the page loads instead of sitting blank until someone clicks. Re-probing
 * stays a mutation: it asks every engine live and costs one call each, so it
 * must never fire on render.
 */
export function useEntityResolution(slug: string | undefined): {
  report: EntityResolution | null
  /** False while the backend's per-run cooldown is still in effect. */
  mayProbe: boolean
  isLoading: boolean
  probe: () => void
  isProbing: boolean
  isError: boolean
} {
  const queryClient = useQueryClient()
  const key = queryKeys.catalyst.entityResolution(slug)

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<EntityResolutionState> => getEntityResolution(slug as string),
    enabled: Boolean(slug),
  })

  const mutation = useMutation({
    mutationFn: async (): Promise<EntityResolutionState> => probeEntityResolution(slug as string),
    // Seed the cache directly — the POST already returns the fresh report, so
    // refetching would be a second round trip for data we are already holding.
    onSuccess: next => queryClient.setQueryData(key, next),
  })

  return {
    report: query.data?.report ?? null,
    mayProbe: query.data?.may_probe ?? true,
    isLoading: query.isLoading,
    probe: () => {
      if (slug) mutation.mutate()
    },
    isProbing: mutation.isPending,
    isError: mutation.isError,
  }
}
