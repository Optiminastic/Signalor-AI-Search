'use client'

import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { applyAutoFix } from '@/lib/api/autofix'
import { ApiError } from '@/lib/api/client'
import {
  getGithubStatus,
  isJobAwaitingExternalChange,
  isJobInFlight,
  latestJobForFinding,
  requestGithubFix,
  type GithubJob,
} from '@/lib/api/github'
import { getIntegrationStatus } from '@/lib/api/integrations'

const POLL_MS = 4000
/** Waiting on a human to merge on GitHub — poll slowly. See useTaskAutoFix. */
const MERGE_POLL_MS = 30_000

/** Which write path applies for the run's platform. */
export type FixPlatform = 'nextjs' | 'wordpress' | 'shopify' | 'none'

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
  /** Present when a GitHub PR exists for the item — lets the control link to it. */
  prUrl?: string
  prNumber?: number | null
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
  /** Fix state for a recommendation. `findingCode` lets it read the persisted
   *  GitHub job (so the state + PR survive a refresh), falling back to the
   *  in-session optimistic state before the job appears. */
  stateFor: (recId: number, findingCode: string) => FixState
  runFix: (target: FixTarget) => Promise<void>
}

const IDLE: FixState = { outcome: 'idle', message: '' }

function errMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Auto-fix failed. Please try again.'
}

/** Persisted GitHub job → fix state (the source of truth after a refresh). */
function jobToState(job: GithubJob): FixState {
  if (job.status === 'pending' || job.status === 'running') {
    return { outcome: 'running', message: 'Fix in progress…' }
  }
  // Declined is a hand-off, not a failure: the agent refused to invent data it
  // does not have. Surface it as a manual task with the agent's reason.
  if (job.status === 'declined') {
    return { outcome: 'manual', message: job.error_message || 'This fix needs your input.' }
  }
  if (job.status === 'failed') {
    return { outcome: 'failed', message: job.error_message || 'Fix failed' }
  }
  // `closed` used to fall through to "PR opened" — a PR someone rejected read as
  // if it were still waiting to be merged.
  const PR_MESSAGE: Record<string, string> = {
    merged: 'PR merged',
    closed: 'PR closed without merging',
  }
  return {
    outcome: 'pr',
    message: PR_MESSAGE[job.status] ?? 'PR opened',
    prUrl: job.pr_url,
    prNumber: job.pr_number,
  }
}

/**
 * Resolves the active run's fix platform (WordPress/Shopify store, or Next.js via
 * GitHub) and exposes a per-recommendation `runFix` that routes to the correct
 * connector: CMS push (applyAutoFix) or a GitHub PR (requestGithubFix). When the
 * platform isn't connected — or has no write path (Webflow/Framer) — it surfaces
 * a `connect`/`manual` state instead of applying.
 */
export function useAutoFix({ slug, email, orgId }: UseAutoFixArgs): UseAutoFix {
  const githubQuery = useQuery({
    queryKey: ['github-run-status', slug],
    enabled: Boolean(slug),
    queryFn: () => getGithubStatus(slug as string),
    // Keep the fix jobs fresh while any is still being worked, so the table
    // updates live and reflects the PR the moment it opens — then keep checking
    // slowly while any PR is open, because merging happens on GitHub and the
    // status only changes when we ask. Stopping at "open" is what left merged
    // PRs reading "PR open" for ever.
    refetchOnWindowFocus: true,
    refetchInterval: q => {
      const jobs = q.state.data?.jobs ?? []
      if (jobs.some(isJobInFlight)) return POLL_MS
      if (jobs.some(isJobAwaitingExternalChange)) return MERGE_POLL_MS
      return false
    },
  })
  const integrationsQuery = useQuery({
    queryKey: ['integration-status', email, orgId],
    enabled: Boolean(email),
    queryFn: () => getIntegrationStatus(email as string, orgId),
  })
  const [states, setStates] = useState<Record<number, FixState>>({})

  const cms = (integrationsQuery.data ?? []).find(
    i => i.is_active && (i.provider === 'wordpress' || i.provider === 'shopify'),
  )
  const githubConnected = githubQuery.data?.connected ?? false
  const jobs = githubQuery.data?.jobs ?? []
  const platform: FixPlatform = cms
    ? (cms.provider as 'wordpress' | 'shopify')
    : githubConnected
      ? 'nextjs'
      : 'none'
  const connected = Boolean(cms) || githubConnected

  const setState = useCallback((recId: number, state: FixState): void => {
    setStates(prev => ({ ...prev, [recId]: state }))
  }, [])

  const runFix = useCallback(
    async (target: FixTarget): Promise<void> => {
      if (!slug || !email) return
      if (platform === 'wordpress' || platform === 'shopify') {
        await runCmsFix({ slug, email, orgId, target, setState })
        return
      }
      if (githubConnected) {
        await runGithubFix({ slug, target, setState, refetch: githubQuery.refetch })
        return
      }
      setState(target.id, {
        outcome: 'connect',
        message: 'Connect your site (WordPress, Shopify, or GitHub) to auto-fix.',
      })
    },
    [slug, email, orgId, platform, githubConnected, githubQuery.refetch, setState],
  )

  return {
    platform,
    connected,
    isLoading: githubQuery.isLoading || integrationsQuery.isLoading,
    // A persisted GitHub job (matched by finding code) is the truth and survives
    // refresh; the local optimistic state only fills the gap before it appears
    // (and carries CMS outcomes, which have no job).
    stateFor: (recId, findingCode) => {
      const job = latestJobForFinding(jobs, findingCode, recId)
      return job ? jobToState(job) : (states[recId] ?? IDLE)
    },
    runFix,
  }
}

interface RunCmsArgs {
  slug: string
  email: string
  orgId: number | undefined
  target: FixTarget
  setState: (recId: number, state: FixState) => void
}

async function runCmsFix({ slug, email, orgId, target, setState }: RunCmsArgs): Promise<void> {
  setState(target.id, { outcome: 'running', message: 'Applying fix…' })
  try {
    const [result] = await applyAutoFix({ slug, recommendationIds: [target.id], email, orgId })
    if (result?.status === 'success' || result?.status === 'verified') {
      setState(target.id, { outcome: 'applied', message: result.message || 'Fix applied' })
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
    await requestGithubFix(slug, [target.findingCode], target.id)
    // The job now exists; refetch so the derived (persisted) state takes over and
    // surfaces the PR — no need to hold an optimistic 'pr' with no url.
    refetch()
  } catch (error) {
    setState(target.id, { outcome: 'failed', message: errMessage(error) })
  }
}
