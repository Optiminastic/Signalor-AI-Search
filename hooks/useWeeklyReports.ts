'use client'

import { useQuery } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { getWeeklyReports, type WeeklyReports } from '@/lib/api/agent-mode-weekly-reports'
import { queryKeys } from '@/lib/query-keys'

export interface WeeklyReportsState {
  data: WeeklyReports | null
  isLoading: boolean
  loadError: string | null
}

/** The brand's weekly reports, loaded only when the report panel is open. */
export function useWeeklyReports(orgSlug: string, enabled: boolean): WeeklyReportsState {
  const query = useQuery({
    queryKey: queryKeys.agentMode.weeklyReports(orgSlug),
    queryFn: () => getWeeklyReports(orgSlug),
    enabled: Boolean(orgSlug) && enabled,
  })
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
  }
}
