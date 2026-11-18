'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  disconnectGmail,
  getGmail,
  startGmailSignIn,
  type GmailStatus,
} from '@/lib/api/agent-mode-gmail'
import { queryKeys } from '@/lib/query-keys'

export interface GmailConnection {
  status: GmailStatus
  signIn: () => void
  disconnect: () => void
  busy: boolean
  error: string | null
}

const NOT_CONNECTED: GmailStatus = { connected: false, mailbox: '' }

/** This page without its query string: where Google sends the browser back. */
function currentPage(): string {
  return `${window.location.origin}${window.location.pathname}`
}

/** Whether the brand's Gmail is connected; sign in on Google's page, or disconnect. */
export function useGmailConnection(orgSlug: string): GmailConnection {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.gmail(orgSlug)
  const query = useQuery({
    queryKey: key,
    queryFn: () => getGmail(orgSlug),
    enabled: Boolean(orgSlug),
  })
  const signIn = useMutation({
    mutationFn: () => startGmailSignIn(orgSlug, currentPage()),
    retry: false,
    onSuccess: url => window.location.assign(url),
  })
  const disconnect = useMutation({
    mutationFn: () => disconnectGmail(orgSlug),
    retry: false,
    onSuccess: status => queryClient.setQueryData(key, status),
  })
  const failed = signIn.error ?? disconnect.error
  return {
    status: query.data ?? NOT_CONNECTED,
    signIn: () => signIn.mutate(),
    disconnect: () => disconnect.mutate(),
    busy: signIn.isPending || disconnect.isPending,
    error: failed ? loadErrorMessage(failed) : null,
  }
}
