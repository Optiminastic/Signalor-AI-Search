'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { applyAutoFix } from '@/lib/api/autofix'
import { ApiError } from '@/lib/api/client'
import { getGithubStatus, requestGithubFix } from '@/lib/api/github'
import { getIntegrationStatus } from '@/lib/api/integrations'

/** Which write path applies for the run's platform. */
export type FixPlatform = 'nextjs' | 'wordpress' | 'shopify' | 'webflow' | 'none'

/** Store providers the backend auto-fix endpoint can write back to. */
const WRITABLE_STORE_PROVIDERS = ['wordpress', 'shopify', 'webflow'] as const

/** Per-recommendation fix outcome shown inline on the button. */
export type FixOutcome =
  | 'idle'
  | 'running'
  | 'pr' // GitHub PR opening
  | 'applied' // CMS push succeeded
  | 'manual' // needs manual application (walkthrough)
  | 'connect' // platform not connected yet
  | 'failed'

export interface FixState {
  outcome: FixOutcome
  message: string
}

export interface FixTarget {
  id: number
  findingCode: string
}

export interface UseAutoFixArgs {
  slug: string | undefined
  email: string | undefined
  orgId: number | undefined
}

export interface UseAutoFix {
  platform: FixPlatform
  connected: boolean
  isLoading: boolean
  stateFor: (recId: number) => FixState
  runFix: (target: FixTarget) => Promise<void>
}

const IDLE: FixState = { outcome: 'idle', message: '' }

function errMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Auto-fix failed. Please try again.'
}

/**
 * Resolves the active run's fix platform (a connected store — Webflow, WordPress,
 * or Shopify — or Next.js via GitHub) and exposes a per-recommendation `runFix`
 * that routes to the correct connector: a store push (applyAutoFix, which the
 * backend writes to the live site via the provider's API) or a GitHub PR
 * (requestGithubFix). When nothing is connected it surfaces a `connect` state.
 * A successful store push flips the linked task to Done, so the Tasks board is
 * refreshed to show the new "Done" tag.
 */
export function useAutoFix({ slug, email, orgId }: UseAutoFixArgs): UseAutoFix {
  const queryClient = useQueryClient()
  const githubQuery = useQuery({
    queryKey: ['github-run-status', slug],
    enabled: Boolean(slug),
    queryFn: () => getGithubStatus(slug as string),
  })
  const integrationsQuery = useQuery({
    queryKey: ['integration-status', email, orgId],
    enabled: Boolean(email),
    queryFn: () => getIntegrationStatus(email as string, orgId),
  })
  const [states, setStates] = useState<Record<number, FixState>>({})

  const store = (integrationsQuery.data ?? []).find(
    i => i.is_active && (WRITABLE_STORE_PROVIDERS as readonly string[]).includes(i.provider),
  )
  const githubConnected = githubQuery.data?.connected ?? false
  const platform: FixPlatform = store
    ? (store.provider as 'wordpress' | 'shopify' | 'webflow')
    : githubConnected
      ? 'nextjs'
      : 'none'
  const connected = Boolean(store) || githubConnected

  const setState = useCallback((recId: number, state: FixState): void => {
    setStates(prev => ({ ...prev, [recId]: state }))
  }, [])

  // The backend marks the linked UserAction completed on a successful write;
  // refetch the board so the row shows its "Done" tag.
  const onApplied = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: ['catalyst', 'tasks'] })
  }, [queryClient])

  const isStore = platform === 'webflow' || platform === 'wordpress' || platform === 'shopify'

  const runFix = useCallback(
    async (target: FixTarget): Promise<void> => {
      if (!slug || !email) return
      if (isStore) {
        await runCmsFix({ slug, email, orgId, target, setState, onApplied })
        return
      }
      if (githubConnected) {
        await runGithubFix({ slug, target, setState, refetch: githubQuery.refetch })
        return
      }
      setState(target.id, {
        outcome: 'connect',
        message: 'Connect your site (Webflow, WordPress, Shopify, or GitHub) to auto-fix.',
      })
    },
    [slug, email, orgId, isStore, githubConnected, githubQuery.refetch, setState, onApplied],
  )

  return {
    platform,
    connected,
    isLoading: githubQuery.isLoading || integrationsQuery.isLoading,
    stateFor: recId => states[recId] ?? IDLE,
    runFix,
  }
}

interface RunCmsArgs {
  slug: string
  email: string
  orgId: number | undefined
  target: FixTarget
  setState: (recId: number, state: FixState) => void
  onApplied: () => void
}

async function runCmsFix({
  slug,
  email,
  orgId,
  target,
  setState,
  onApplied,
}: RunCmsArgs): Promise<void> {
  setState(target.id, { outcome: 'running', message: 'Applying fix…' })
  try {
    const [result] = await applyAutoFix({ slug, recommendationIds: [target.id], email, orgId })
    if (result?.status === 'success' || result?.status === 'verified') {
      setState(target.id, { outcome: 'applied', message: result.message || 'Fix applied' })
      onApplied()
    } else if (result?.status === 'manual') {
      setState(target.id, {
        outcome: 'manual',
        message: result.message || 'Apply this fix manually',
      })
    } else {
      setState(target.id, { outcome: 'failed', message: result?.message || 'Fix failed' })
    }
  } catch (error) {
    setState(target.id, { outcome: 'failed', message: errMessage(error) })
  }
}

interface RunGithubArgs {
  slug: string
  target: FixTarget
  setState: (recId: number, state: FixState) => void
  refetch: () => unknown
}

async function runGithubFix({ slug, target, setState, refetch }: RunGithubArgs): Promise<void> {
  if (!target.findingCode) {
    setState(target.id, { outcome: 'failed', message: 'This item has no auto-fixable code.' })
    return
  }
  setState(target.id, { outcome: 'running', message: 'Opening PR…' })
  try {
    await requestGithubFix(slug, [target.findingCode])
    setState(target.id, { outcome: 'pr', message: 'PR opening — check GitHub' })
    refetch()
  } catch (error) {
    setState(target.id, { outcome: 'failed', message: errMessage(error) })
  }
}
