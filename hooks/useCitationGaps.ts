'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getCitationGaps,
  setCitationGapStatus,
  type CitationGaps,
  type CitationGapStatus,
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
