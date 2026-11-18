'use client'

import { useQuery } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { getSatelliteRanks, type SatelliteRanks } from '@/lib/api/agent-mode-satellite'
import { queryKeys } from '@/lib/query-keys'

export interface SatelliteRanksState {
  data: SatelliteRanks | null
  error: string | null
}

export function useSatelliteRanks(orgSlug: string): SatelliteRanksState {
  const query = useQuery({
    queryKey: queryKeys.agentMode.satelliteRanks(orgSlug),
    queryFn: () => getSatelliteRanks(orgSlug),
    enabled: Boolean(orgSlug),
  })
  return { data: query.data ?? null, error: query.error ? loadErrorMessage(query.error) : null }
}
