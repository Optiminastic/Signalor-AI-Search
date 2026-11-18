'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { disconnectBuffer, startBufferSignIn } from '@/lib/api/agent-mode-social'
import { queryKeys } from '@/lib/query-keys'

export interface BufferConnection {
  signIn: () => void
  disconnect: () => void
  busy: boolean
  error: string | null
}

/** This page without its query string: where Buffer sends the browser back. */
function currentPage(): string {
  return `${window.location.origin}${window.location.pathname}`
}

/** Sign in to Buffer on Buffer's own page, or forget the sign-in. */
export function useBufferConnection(orgSlug: string): BufferConnection {
  const queryClient = useQueryClient()
  const signIn = useMutation({
    mutationFn: () => startBufferSignIn(orgSlug, currentPage()),
    retry: false,
    onSuccess: url => window.location.assign(url),
  })
  const disconnect = useMutation({
    mutationFn: () => disconnectBuffer(orgSlug),
    retry: false,
    onSuccess: report => queryClient.setQueryData(queryKeys.agentMode.social(orgSlug), report),
  })
  const failed = signIn.error ?? disconnect.error
  return {
    signIn: () => signIn.mutate(),
    disconnect: () => disconnect.mutate(),
    busy: signIn.isPending || disconnect.isPending,
    error: failed ? loadErrorMessage(failed) : null,
  }
}
