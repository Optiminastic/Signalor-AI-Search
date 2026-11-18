'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  sendToBingNow,
  setBingEnabled,
  verifyBingKey,
  type BingKeyCheck,
  type IndexingReport,
} from '@/lib/api/agent-mode-indexing'
import { queryKeys } from '@/lib/query-keys'

export interface BingIndexing {
  setEnabled: (enabled: boolean) => void
  switching: boolean
  verify: () => void
  verifying: boolean
  keyCheck: BingKeyCheck | null
  sendNow: () => void
  sending: boolean
  error: string | null
}

/** Turn weekly Bing sending on or off, check the key file, or send now. */
export function useBingIndexing(orgSlug: string): BingIndexing {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.indexing(orgSlug)
  const refresh = (report: IndexingReport): void => {
    queryClient.setQueryData(key, report)
    void queryClient.invalidateQueries({ queryKey: queryKeys.agentMode.activity(orgSlug) })
  }
  const toggle = useMutation({
    mutationFn: (enabled: boolean) => setBingEnabled(orgSlug, enabled),
    retry: false,
    onSuccess: refresh,
  })
  const check = useMutation({ mutationFn: () => verifyBingKey(orgSlug), retry: false })
  const send = useMutation({
    mutationFn: () => sendToBingNow(orgSlug),
    retry: false,
    onSuccess: refresh,
  })
  const failed = toggle.error ?? check.error ?? send.error
  return {
    setEnabled: enabled => toggle.mutate(enabled),
    switching: toggle.isPending,
    verify: () => check.mutate(),
    verifying: check.isPending,
    keyCheck: check.data ?? null,
    sendNow: () => send.mutate(),
    sending: send.isPending,
    error: failed ? loadErrorMessage(failed) : null,
  }
}
