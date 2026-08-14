'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { ApiError } from '@/lib/api/client'
import {
  disconnectGA,
  disconnectGsc,
  disconnectShopify,
  getGAAuthUrl,
  getGscAuthUrl,
} from '@/lib/api/integrations'
import { useSession } from '@/lib/auth-client'

/** Pull the backend's `{error: "..."}` message out of a failed request. */
function backendMessage(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === 'object') {
    const body = err.data as { error?: unknown; detail?: unknown }
    const msg = body.error ?? body.detail
    if (typeof msg === 'string' && msg) return msg
  }
  return ''
}

/**
 * Catalog slugs that can be connected from this page.
 *
 * Google Analytics and Search Console connect via OAuth here; Shopify connect
 * opens its own token modal in the view, and disconnect flows through this
 * hook. The rest connect through their own install flows (the WordPress
 * plugin, an SDK snippet), so their switches render inert.
 */
const CONNECTABLE = new Set(['google-analytics', 'search-console', 'shopify'])

export function isConnectable(slug: string): boolean {
  return CONNECTABLE.has(slug)
}

interface UseIntegrationConnectResult {
  toggle: (slug: string, next: boolean) => Promise<void>
  /** Slug currently mid-request, or '' — drives the per-card spinner. */
  busySlug: string
  error: string
}

export function useIntegrationConnect(): UseIntegrationConnectResult {
  const { data: session } = useSession()
  const email = session?.user?.email
  // Connect and disconnect must target the brand on screen, not the account's
  // first brand — otherwise connecting GA on brand B writes the token to brand A.
  const { activeOrg } = useActiveProject()
  const orgId = activeOrg?.id
  const brandPath = useBrandPath()
  // Where the Google OAuth round-trips come back to. Brand-scoped, so the user
  // returns to the same brand's Integrations page they left from.
  const integrationsPath = brandPath('integrations')
  const queryClient = useQueryClient()
  const [busySlug, setBusySlug] = useState('')
  const [error, setError] = useState('')

  const toggle = async (slug: string, next: boolean): Promise<void> => {
    if (!email || !isConnectable(slug)) return
    setBusySlug(slug)
    setError('')
    try {
      if (next) {
        // Shopify connect is handled by the view's token modal; the Google OAuth
        // hand-offs run here (their callbacks finish and return to the app).
        if (slug === 'shopify') return
        if (slug === 'search-console') {
          // GSC's callback is server-side, so it needs somewhere to land. Return
          // to THIS page rather than the old standalone property route: the
          // backend appends `?gsc=connected`, which opens the picker over the
          // Integrations grid instead of on a bare page outside the shell.
          window.location.href = await getGscAuthUrl(email, integrationsPath, orgId)
          return
        }
        window.location.href = await getGAAuthUrl(email, orgId)
        return
      }
      if (slug === 'shopify') await disconnectShopify(email)
      else if (slug === 'search-console') await disconnectGsc(email, orgId)
      else await disconnectGA(email, orgId)
      await queryClient.invalidateQueries({ queryKey: ['catalyst', 'integrations'] })
      await queryClient.invalidateQueries({ queryKey: ['catalyst', 'ga-world-presence'] })
    } catch (err) {
      // Surface the backend's real reason (e.g. "Shopify OAuth env is not
      // configured.") so a config gap doesn't read as a mystery failure.
      const detail = backendMessage(err)
      const fallback = next
        ? 'Could not start the connect flow.'
        : 'Could not disconnect. Please try again.'
      setError(detail || fallback)
    } finally {
      setBusySlug('')
    }
  }

  return { toggle, busySlug, error }
}
