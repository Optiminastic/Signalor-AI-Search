'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useActiveProject } from '@/hooks/useActiveProject'
import { getLiveVisitors, type LiveVisitors } from '@/lib/api/live-visitors'

/**
 * Who is on the site right now, for the top-bar chip.
 *
 * The backend caches per org for 20s, so this interval is what the user sees
 * rather than what Google is charged for: ten open tabs still cost one GA call.
 * `refetchIntervalInBackground` is left at its default false so a tab left open
 * in another window stops polling entirely.
 */
const POLL_MS = 30_000

interface UseLiveVisitorsResult {
  data: LiveVisitors | undefined
  isLoading: boolean
  /** Humans + bot hits — what the chip shows. */
  total: number
}

export function useLiveVisitors(): UseLiveVisitorsResult {
  const { email, activeOrg } = useActiveProject()
  const orgId = activeOrg?.id

  const query = useQuery({
    queryKey: ['catalyst', 'live-visitors', email ?? '', orgId ?? 0],
    enabled: Boolean(email && orgId),
    queryFn: () => getLiveVisitors({ email: email as string, orgId: orgId as number }),
    refetchInterval: POLL_MS,
    staleTime: POLL_MS - 10_000,
    // Without this the count blanks to a skeleton on every poll, which reads as
    // a flicker in a element that is on screen permanently.
    placeholderData: keepPreviousData,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    total: query.data?.live_total ?? 0,
  }
}
