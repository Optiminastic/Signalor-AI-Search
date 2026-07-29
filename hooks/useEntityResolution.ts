'use client'

import { useMutation } from '@tanstack/react-query'

import { probeEntityResolution, type EntityResolution } from '@/lib/api/prompts'

/**
 * Entity resolution probe.
 *
 * A mutation, not a query: it asks every engine live and costs one call each, so
 * it must never fire on render.
 */
export function useEntityResolution(slug: string | undefined): {
  report: EntityResolution | undefined
  probe: () => void
  isProbing: boolean
  isError: boolean
} {
  const mutation = useMutation({
    mutationFn: async (): Promise<EntityResolution> => probeEntityResolution(slug as string),
  })
  return {
    report: mutation.data,
    probe: () => {
      if (slug) mutation.mutate()
    },
    isProbing: mutation.isPending,
    isError: mutation.isError,
  }
}
