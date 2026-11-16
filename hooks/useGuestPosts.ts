'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { setPlanTaskStatus, type PlanTaskChoice } from '@/lib/api/agent-mode-approvals'
import {
  findGuestSitesNow,
  getGuestPosts,
  type GuestPostsReport,
} from '@/lib/api/agent-mode-guest-posts'
import { queryKeys } from '@/lib/query-keys'

/** While a search runs, look again this often. */
const SEARCHING_REFRESH_MS = 15_000

export interface GuestPosts {
  report: GuestPostsReport | null
  isLoading: boolean
  loadError: string | null
  findNow: () => void
  finding: boolean
  actionError: string | null
  setStatus: (taskId: number, status: PlanTaskChoice) => void
}

export function useGuestPosts(orgSlug: string): GuestPosts {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.guestPosts(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getGuestPosts(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.searching ? SEARCHING_REFRESH_MS : false),
  })
  const find = useMutation({
    mutationFn: () => findGuestSitesNow(orgSlug),
    retry: false,
    onSuccess: report => queryClient.setQueryData(key, report),
  })
  const status = useMutation({
    mutationFn: (args: { taskId: number; status: PlanTaskChoice }) =>
      setPlanTaskStatus(orgSlug, args.taskId, args.status),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
  const error = find.error ?? status.error
  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    findNow: () => find.mutate(),
    finding: find.isPending,
    actionError: error ? loadErrorMessage(error) : null,
    setStatus: (taskId, next) => status.mutate({ taskId, status: next }),
  }
}
