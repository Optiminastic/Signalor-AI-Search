'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getIndexNowSetup,
  submitToIndexNow,
  type IndexNowResult,
  type IndexNowSetup,
} from '@/lib/api/prompts'

/** IndexNow key, where to host it, and whether it is currently reachable. */
export function useIndexNow(slug: string | undefined): {
  setup: IndexNowSetup | undefined
  isLoading: boolean
  isError: boolean
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
    // Without this the card had no failure branch: a failed fetch settles with
    // setup undefined and isLoading false, so it rendered its description and
    // nothing else, indistinguishable from "still thinking".
    isError: query.isError,
    submit: () => {
      if (slug) mutation.mutate()
    },
    result: mutation.data,
    isSubmitting: mutation.isPending,
  }
}
