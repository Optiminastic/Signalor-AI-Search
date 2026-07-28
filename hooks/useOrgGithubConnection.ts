'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  disconnectOrgGithub,
  getOrgGithubInstallUrl,
  getOrgGithubStatus,
  selectOrgGithubRepo,
} from '@/lib/api/github'

// How often to check whether the user closed the GitHub popup themselves.
const POPUP_POLL_MS = 700

/** Open the GitHub install flow centred over the current window. */
function openCenteredPopup(url: string): Window | null {
  const w = 1000
  const h = 720
  const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2)
  const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2)
  return window.open(
    url,
    'signalor-github',
    `popup=yes,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)}`,
  )
}

interface UseOrgGithubConnectionOptions {
  email: string
  /** The selected brand. Omitted during onboarding, where no brand is chosen yet. */
  orgId?: number
  /** Fired when the connection state resolves (connect → true, unlink → false). */
  onConnectedChange?: (connected: boolean) => void
}

export interface OrgGithubConnection {
  loading: boolean
  connected: boolean
  repo: string
  /** Every repo the install granted — lets the user pick which one fixes target. */
  repositories: string[]
  /** The install granted several repos and none matched this brand's domain, so
   *  no PR can be opened until the user picks one. */
  needsRepoChoice: boolean
  /** Why the current repo was chosen (domain match, manual pick, only repo). */
  repoReason: string
  /** Switch which granted repo auto-fix PRs open against. */
  selectRepo: (repoFullName: string) => void
  selectingRepo: boolean
  /** The server has no GitHub App configured — the flow can't run here. */
  notConfigured: boolean
  connecting: boolean
  error: boolean
  connect: () => void
  cancel: () => void
  unlink: () => void
  unlinking: boolean
}

/**
 * The org-scoped GitHub App connection: polls status, opens the install in a
 * popup and auto-closes it the moment the backend links the installation (or the
 * user closes it), and unlinks. One GitHub connection powers auto-fix PRs for any
 * repo/framework, so this is shared by onboarding and the Integrations page.
 */
export function useOrgGithubConnection({
  email,
  orgId,
  onConnectedChange,
}: UseOrgGithubConnectionOptions): OrgGithubConnection {
  const [connecting, setConnecting] = useState(false)
  const popupRef = useRef<Window | null>(null)
  const watchRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keyed by brand: one account can own several brands with different repos, and
  // an unkeyed cache showed the first brand's connection state on all of them.
  const status = useQuery({
    queryKey: ['org-github', email, orgId ?? 0],
    queryFn: () => getOrgGithubStatus(email, orgId),
    enabled: Boolean(email),
    refetchInterval: q => (q.state.data?.connected ? false : connecting ? 2000 : 5000),
  })
  const connected = status.data?.connected ?? false

  const stopWatch = useCallback(() => {
    if (watchRef.current) clearInterval(watchRef.current)
    watchRef.current = null
  }, [])

  const cancel = useCallback(() => {
    popupRef.current?.close()
    popupRef.current = null
    stopWatch()
    setConnecting(false)
  }, [stopWatch])

  // Already connected (incl. "already installed" on load) → close the popup and
  // report done; never prompt to install again.
  useEffect(() => {
    if (!connected) return
    onConnectedChange?.(true)
    setConnecting(false)
    stopWatch()
    popupRef.current?.close()
    popupRef.current = null
  }, [connected, onConnectedChange, stopWatch])

  useEffect(() => stopWatch, [stopWatch])

  const mutation = useMutation({
    mutationFn: () => getOrgGithubInstallUrl(email, orgId),
    onMutate: () => setConnecting(true),
    onSuccess: (url: string) => {
      const popup = openCenteredPopup(url)
      if (!popup) {
        window.location.href = url // popup blocked → fall back to a full redirect
        return
      }
      popupRef.current = popup
      stopWatch()
      watchRef.current = setInterval(() => {
        if (!popup.closed) return
        stopWatch()
        setConnecting(false)
        void status.refetch()
      }, POPUP_POLL_MS)
    },
    onError: () => setConnecting(false),
  })

  const unlinkMutation = useMutation({
    mutationFn: () => disconnectOrgGithub(email, orgId),
    onSuccess: () => {
      onConnectedChange?.(false)
      void status.refetch()
    },
  })

  const selectRepoMutation = useMutation({
    mutationFn: (repo: string) => selectOrgGithubRepo(email, repo, orgId),
    onSuccess: () => void status.refetch(),
  })

  return {
    loading: status.isLoading,
    connected,
    repo: status.data?.repo_full_name ?? '',
    repositories: status.data?.repositories ?? [],
    needsRepoChoice: status.data?.needs_repo_choice ?? false,
    repoReason: status.data?.repo_reason ?? '',
    selectRepo: (repo: string) => selectRepoMutation.mutate(repo),
    selectingRepo: selectRepoMutation.isPending,
    notConfigured: Boolean(status.data && !status.data.configured),
    connecting: connecting || mutation.isPending,
    error: mutation.isError,
    connect: () => mutation.mutate(),
    cancel,
    unlink: () => unlinkMutation.mutate(),
    unlinking: unlinkMutation.isPending,
  }
}
