'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getCitationGaps,
  getIndexNowSetup,
  probeEntityResolution,
  setCitationGapStatus,
  submitToIndexNow,
  type CitationGaps,
  type CitationGapStatus,
  type EntityResolution,
  type IndexNowResult,
  type IndexNowSetup,
} from '@/lib/api/prompts'

/** Ranked citation-gap outreach list. */
export function useCitationGaps(
  slug: string | undefined,
  verify = true,
): {
  data: CitationGaps | undefined
  isLoading: boolean
  isError: boolean
} {
  const query = useQuery({
    queryKey: ['catalyst', 'citation-gaps', slug ?? '', verify],
    enabled: Boolean(slug),
    queryFn: async (): Promise<CitationGaps> => getCitationGaps(slug as string, verify),
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}

/** Record outreach state for one domain, then refresh the list. */
export function useSetGapStatus(slug: string | undefined): {
  setStatus: (domain: string, status: Exclude<CitationGapStatus, 'live'>) => void
  isSaving: boolean
} {
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (vars: {
      domain: string
      status: Exclude<CitationGapStatus, 'live'>
    }): Promise<unknown> => setCitationGapStatus(slug as string, vars),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['catalyst', 'citation-gaps'] })
    },
  })
  return {
    setStatus: (domain, status) => {
      if (slug) mutation.mutate({ domain, status })
    },
    isSaving: mutation.isPending,
  }
}

/** IndexNow key, where to host it, and whether it is currently reachable. */
export function useIndexNow(slug: string | undefined): {
  setup: IndexNowSetup | undefined
  isLoading: boolean
  submit: () => void
  result: IndexNowResult | undefined
  isSubmitting: boolean
} {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['catalyst', 'indexnow', slug ?? ''],
    enabled: Boolean(slug),
    queryFn: async (): Promise<IndexNowSetup> => getIndexNowSetup(slug as string),
  })
  const mutation = useMutation({
    mutationFn: async (): Promise<IndexNowResult> => submitToIndexNow(slug as string),
    // Submitting proves the key file resolves, so re-read the setup state.
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['catalyst', 'indexnow', slug ?? ''] })
    },
  })
  return {
    setup: query.data,
    isLoading: query.isLoading,
    submit: () => {
      if (slug) mutation.mutate()
    },
    result: mutation.data,
    isSubmitting: mutation.isPending,
  }
}

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
