'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useActiveProject } from '@/hooks/useActiveProject'
import { ApiError } from '@/lib/api/client'
import { getIntegrationStatus } from '@/lib/api/integrations'
import {
  disconnectSlack,
  getSlackAuthUrl,
  getSlackChannels,
  selectSlackChannel,
  type SlackChannel,
} from '@/lib/api/slack'

// While the authorize popup is open, poll for the backend to record the
// connection — same approach as the GitHub App flow.
const CONNECTING_POLL_MS = 2000
const POPUP_POLL_MS = 700

const GENERIC_AUTH_ERROR = "Couldn't start the Slack connection. Try again in a moment."

/** Prefer the backend's explanation; fall back only when there isn't one. */
function authErrorMessage(error: unknown): string {
  const message = error instanceof ApiError ? error.message.trim() : ''
  return message || GENERIC_AUTH_ERROR
}

/** Open Slack's authorize screen centred over the current window. */
function openCenteredPopup(url: string): Window | null {
  const w = 720
  const h = 780
  const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2)
  const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2)
  return window.open(
    url,
    'signalor-slack',
    `popup=yes,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)}`,
  )
}

export interface SlackConnection {
  loading: boolean
  connected: boolean
  /** Connected but no channel chosen yet — nothing is delivered until there is. */
  needsChannel: boolean
  channelName: string
  channels: SlackChannel[]
  channelsLoading: boolean
  connecting: boolean
  /** Why the authorize step failed, ready to show, or null when it hasn't. */
  error: string | null
  connect: () => void
  cancel: () => void
  selectChannel: (channel: SlackChannel) => void
  selectingChannel: boolean
  disconnect: () => void
  disconnecting: boolean
}

/**
 * The org-scoped Slack connection: opens the authorize popup, polls until the
 * backend records it, then exposes the channel picker.
 *
 * Connected is not the finish line — a workspace with no channel selected sends
 * nothing, so the card must keep prompting until `needsChannel` clears.
 */
export function useSlackConnection(): SlackConnection {
  const { email, activeOrg } = useActiveProject()
  const orgId = activeOrg?.id
  const queryClient = useQueryClient()
  const [connecting, setConnecting] = useState(false)
  const popupRef = useRef<Window | null>(null)

  const statusKey = ['catalyst', 'slack-status', email ?? '', orgId ?? 0]

  const status = useQuery({
    queryKey: statusKey,
    enabled: Boolean(email && orgId),
    // Poll only while the popup is open; a settled connection needs no polling.
    refetchInterval: connecting ? CONNECTING_POLL_MS : false,
    queryFn: async () => {
      const rows = await getIntegrationStatus(email as string, orgId)
      const row = rows.find(r => r.provider === 'slack' && r.is_active)
      const meta = (row?.metadata ?? {}) as Record<string, string>
      return {
        connected: Boolean(row),
        channelId: meta.channel_id ?? '',
        channelName: meta.channel_name ?? '',
      }
    },
  })

  const connected = status.data?.connected ?? false
  const channelId = status.data?.channelId ?? ''

  // Close the popup as soon as the backend confirms the workspace is linked.
  useEffect(() => {
    if (!connecting || !connected) return
    popupRef.current?.close()
    popupRef.current = null
    setConnecting(false)
  }, [connecting, connected])

  // The user may close the popup themselves without finishing.
  useEffect(() => {
    if (!connecting) return
    const timer = window.setInterval(() => {
      if (popupRef.current?.closed) {
        popupRef.current = null
        setConnecting(false)
        void status.refetch()
      }
    }, POPUP_POLL_MS)
    return () => window.clearInterval(timer)
  }, [connecting, status])

  const authMutation = useMutation({
    mutationFn: () => getSlackAuthUrl(email as string, orgId),
    onSuccess: url => {
      popupRef.current = openCenteredPopup(url)
      setConnecting(true)
    },
  })

  // Only fetched once connected — listing channels needs the workspace token.
  const channelsQuery = useQuery({
    queryKey: ['catalyst', 'slack-channels', email ?? '', orgId ?? 0],
    enabled: Boolean(email && orgId && connected),
    staleTime: 5 * 60 * 1000,
    queryFn: () => getSlackChannels(email as string, orgId),
  })

  const selectMutation = useMutation({
    mutationFn: (channel: SlackChannel) =>
      selectSlackChannel({ email: email as string, channel, orgId }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: statusKey }),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectSlack(email as string, orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statusKey })
      void queryClient.invalidateQueries({ queryKey: ['catalyst', 'integrations'] })
    },
  })

  const cancel = useCallback(() => {
    popupRef.current?.close()
    popupRef.current = null
    setConnecting(false)
  }, [])

  return {
    loading: status.isLoading,
    connected,
    needsChannel: connected && !channelId,
    channelName: status.data?.channelName ?? '',
    channels: channelsQuery.data ?? [],
    channelsLoading: channelsQuery.isLoading,
    connecting: connecting || authMutation.isPending,
    // The backend's own message ("Slack is not configured on this server.")
    // is the useful one — a generic retry prompt hides a permanent
    // misconfiguration behind advice that will never work.
    error: authMutation.isError ? authErrorMessage(authMutation.error) : null,
    connect: () => {
      if (email && orgId) authMutation.mutate()
    },
    cancel,
    selectChannel: (channel: SlackChannel) => selectMutation.mutate(channel),
    selectingChannel: selectMutation.isPending,
    disconnect: () => disconnectMutation.mutate(),
    disconnecting: disconnectMutation.isPending,
  }
}
