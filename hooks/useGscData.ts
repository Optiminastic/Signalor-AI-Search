'use client'

import { useQuery } from '@tanstack/react-query'

import { useIntegrations } from '@/hooks/useIntegrations'
import { getGscData, type GscData } from '@/lib/api/integrations'
import { useSession } from '@/lib/auth-client'

const SYNC_POLL_MS = 15000

interface UseGscDataResult {
  data: GscData | null
  isLoading: boolean
  /** Connected + synced, but the property has zero impressions in the window. */
  isEmpty: boolean
  /** The Search Console integration is connected for this account. */
  connected: boolean
  /** Connected, but a sync hasn't landed data yet. */
  syncing: boolean
}

function isSettled(data: GscData | null | undefined): boolean {
  return Boolean(data && data.sync_status !== 'pending' && data.sync_status !== 'syncing')
}

/** Search Console data for the signed-in account's property. `days` omitted →
 *  cached snapshot; set → a live fetch for that window. */
export function useGscData(days?: number): UseGscDataResult {
  const { data: session } = useSession()
  const email = session?.user?.email ?? undefined
  const { connected } = useIntegrations()
  const gscConnected = connected.has('search-console')

  const query = useQuery({
    queryKey: ['catalyst', 'gsc-data', email ?? '', days ?? 0],
    enabled: Boolean(email),
    queryFn: () => getGscData(email as string, days),
    // Poll while the first sync runs in the background so the tab fills in.
    refetchInterval: q =>
      gscConnected && !isSettled(q.state.data as GscData | null | undefined) ? SYNC_POLL_MS : false,
  })

  const data = query.data ?? null
  return {
    data,
    isLoading: query.isLoading,
    isEmpty: data !== null && isSettled(data) && data.impressions === 0,
    connected: gscConnected,
    syncing: gscConnected && !query.isLoading && !isSettled(data),
  }
}
