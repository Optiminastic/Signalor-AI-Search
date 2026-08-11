'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useActiveProject } from '@/hooks/useActiveProject'
import { useAutoFix, type FixPlatform } from '@/hooks/useAutoFix'
import type { TaskDetail } from '@/hooks/useTaskDetail'
import { applyAutoFix, type AutoFixResult } from '@/lib/api/autofix'
import { ApiError } from '@/lib/api/client'
import {
  getGithubJobs,
  isJobInFlight,
  latestJobForFinding,
  requestGithubFix,
  type GithubJob,
} from '@/lib/api/github'

export type FixPhase = 'idle' | 'working' | 'done' | 'manual' | 'failed'

/** What a fix run produces — everything the proof panel needs to render. */
export interface AutoFixProofState {
  platform: FixPlatform
  phase: FixPhase
  /** GitHub fix job (Next.js path) — carries the PR number/url and diff. */
  job: GithubJob | null
  /** CMS fix result (WordPress/Shopify path). */
  result: AutoFixResult | null
  siteUrl: string
}

/** One fixable thing, from any surface (a task, a recommendation row, …). */
export interface AutoFixTarget {
  /** Stable identity for toasts + active-row highlighting (e.g. "task-12"). */
  key: string
  recommendationId: number | null
  findingCode: string
}

export interface AutoFixFlow extends AutoFixProofState {
  connected: boolean
  /** Key of the target currently being fixed (or last fixed), if any. */
  activeKey: string | null
  start: (target: AutoFixTarget) => void
}

export interface TaskAutoFix extends AutoFixProofState {
  /** The task is auto-fixable at all (recommendation flags). */
  visible: boolean
  connected: boolean
  run: () => void
}

const POLL_MS = 4000

function errText(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message
  return 'Auto-fix failed. Please try again.'
}

function jobPhase(job: GithubJob | null, requested: boolean): FixPhase {
  if (!job) return requested ? 'working' : 'idle'
  if (job.status === 'pending' || job.status === 'running') return 'working'
  // A decline is a hand-off to the user, not a failure — same phase as a CMS
  // fix that has to be applied by hand.
  if (job.status === 'declined') return 'manual'
  if (job.status === 'failed') return 'failed'
  return 'done'
}

/** Toast a job's latest state transition (PR opened / merged / failed / closed). */
function announceJob(job: GithubJob, toastId: string): void {
  const prLabel = job.pr_number ? `#${job.pr_number}` : ''
  const viewPr = job.pr_url
    ? { label: 'View PR', onClick: (): void => void window.open(job.pr_url, '_blank') }
    : undefined
  if (job.status === 'open') {
    toast.success(`Pull request ${prLabel} opened with the fix.`, { id: toastId, action: viewPr })
  } else if (job.status === 'merged') {
    toast.success(`Pull request ${prLabel} merged.`, { id: toastId, action: viewPr })
  } else if (job.status === 'declined') {
    // Not an error toast: the agent did its job and correctly handed back.
    toast('This one needs your input - see the action for what to add.', { id: toastId })
  } else if (job.status === 'failed') {
    toast.error(job.error_message || 'The fix job failed. Try again.', { id: toastId })
  } else if (job.status === 'closed') {
    toast(`Pull request ${prLabel} was closed without merging.`, { id: toastId })
  }
}

/** Resolve a task's job: the one just started this session (by id), else the
 *  newest job for its finding code — the latter is what makes it resume on refresh. */
function selectJob(
  jobs: GithubJob[] | undefined,
  jobId: number | null,
  findingCode: string,
): GithubJob | null {
  if (!jobs) return null
  if (jobId !== null) {
    const byId = jobs.find(j => j.id === jobId)
    if (byId) return byId
  }
  return latestJobForFinding(jobs, findingCode)
}

interface UseGithubJobArgs {
  slug: string | undefined
  jobId: number | null
  findingCode: string
  toastId: string
  /** A fix was just requested this session; poll until its job row appears. */
  requested: boolean
}

/** The run's fix job for this target, hydrated from the backend on mount (so it
 *  survives refresh), polled while in flight, and announcing transitions. */
function useGithubJob({
  slug,
  jobId,
  findingCode,
  toastId,
  requested,
}: UseGithubJobArgs): GithubJob | null {
  const jobsQuery = useQuery({
    // Enabled on slug alone (not a session jobId) so an already-running/open job
    // re-hydrates after a refresh.
    queryKey: ['catalyst', 'github-fix-jobs', slug ?? ''],
    enabled: Boolean(slug),
    queryFn: () => getGithubJobs(slug as string),
    refetchInterval: q => {
      const job = selectJob(q.state.data as GithubJob[] | undefined, jobId, findingCode)
      if (isJobInFlight(job)) return POLL_MS
      // Just requested a fix but its job row isn't in the cached list yet — keep
      // polling so the result (or failure) shows without a manual refresh.
      if (requested && !job) return POLL_MS
      return false
    },
  })
  const job = selectJob(jobsQuery.data, jobId, findingCode)

  const announcedRef = useRef('')
  useEffect(() => {
    if (!job) return
    const key = `${job.id}:${job.status}`
    // Seed on the first observation (a refresh-hydrated job) without a toast; only
    // announce genuine transitions that happen during this session.
    if (announcedRef.current === '') {
      announcedRef.current = key
      return
    }
    if (key === announcedRef.current) return
    announcedRef.current = key
    announceJob(job, toastId)
  }, [job, toastId])

  return job
}

interface StartGithubArgs {
  slug: string
  findingCode: string
  toastId: string
  setJobId: (id: number) => void
  setRequested: (on: boolean) => void
  /** Force an immediate refetch of the jobs list so the new job appears at once. */
  refetchJobs: () => void
}

async function startGithubFix(args: StartGithubArgs): Promise<void> {
  const { slug, findingCode, toastId, setJobId, setRequested, refetchJobs } = args
  if (!findingCode) {
    toast.error('This task has no auto-fixable finding code.', { id: toastId })
    return
  }
  setRequested(true)
  toast.loading('Opening a fix pull request on your repo…', { id: toastId })
  try {
    const stubs = await requestGithubFix(slug, [findingCode])
    const id = stubs[0]?.job_id
    if (id) {
      setJobId(id)
      // The job row exists backend-side now; pull it in immediately rather than
      // waiting for the next poll, so the panel updates in real time.
      refetchJobs()
      toast.loading('Fix in progress. The agent is writing the change…', { id: toastId })
    } else {
      setRequested(false)
      toast.error('Could not start the fix job. Please try again.', { id: toastId })
    }
  } catch (error) {
    setRequested(false)
    toast.error(errText(error), { id: toastId })
  }
}

interface StartCmsArgs {
  slug: string
  email: string
  orgId: number | undefined
  recommendationId: number
  siteUrl: string
  toastId: string
  setPhase: (phase: FixPhase) => void
  setResult: (result: AutoFixResult | null) => void
}

async function startCmsFix(args: StartCmsArgs): Promise<void> {
  const { slug, email, orgId, recommendationId, siteUrl, toastId, setPhase, setResult } = args
  setPhase('working')
  toast.loading('Generating the fix and applying it to your site…', { id: toastId })
  try {
    const [res] = await applyAutoFix({ slug, recommendationIds: [recommendationId], email, orgId })
    setResult(res ?? null)
    if (res?.status === 'success' || res?.status === 'verified') {
      setPhase('done')
      const viewChange = siteUrl
        ? { label: 'View change', onClick: (): void => void window.open(siteUrl, '_blank') }
        : undefined
      toast.success(res.message || 'Fix applied to your site.', { id: toastId, action: viewChange })
    } else if (res?.status === 'manual') {
      setPhase('manual')
      toast(res.message || 'This fix needs a manual step — details below.', { id: toastId })
    } else {
      setPhase('failed')
      toast.error(res?.message || 'Auto-fix failed. Please try again.', { id: toastId })
    }
  } catch (error) {
    setPhase('failed')
    toast.error(errText(error), { id: toastId })
  }
}

/**
 * Target-agnostic auto-fix orchestration, shared by the task detail page and
 * the Content page's Quick Fixes rail. Routes to the connected integration
 * (GitHub PR for Next.js repos, direct push for WordPress/Shopify), narrates
 * progress through sonner toasts, and exposes the integration's proof —
 * the PR number/url and diff, or the CMS apply result. One fix at a time.
 */
export function useAutoFixFlow(hydrateFindingCode = ''): AutoFixFlow {
  const { slug, email, activeOrg } = useActiveProject()
  const { platform, connected } = useAutoFix({ slug, email, orgId: activeOrg?.id })
  const queryClient = useQueryClient()
  const [active, setActive] = useState<AutoFixTarget | null>(null)
  const [jobId, setJobId] = useState<number | null>(null)
  const [requested, setRequested] = useState(false)
  const [cmsPhase, setCmsPhase] = useState<FixPhase>('idle')
  const [result, setResult] = useState<AutoFixResult | null>(null)
  // `hydrateFindingCode` (the fixed target's code, e.g. a task) lets an in-flight
  // or completed job re-hydrate on refresh even before `start` runs this session.
  const job = useGithubJob({
    slug,
    jobId,
    findingCode: active?.findingCode || hydrateFindingCode,
    toastId: `autofix-${active?.key ?? 'none'}`,
    requested,
  })
  const siteUrl = activeOrg?.url ?? ''
  const orgId = activeOrg?.id

  const start = useCallback(
    (target: AutoFixTarget): void => {
      if (!slug || !email) return
      const toastId = `autofix-${target.key}`
      if (!connected) {
        toast.error('Connect WordPress, Shopify or GitHub in Integrations to auto-fix.', {
          id: toastId,
        })
        return
      }
      setActive(target)
      setJobId(null)
      setRequested(false)
      setCmsPhase('idle')
      setResult(null)
      if (platform === 'nextjs') {
        void startGithubFix({
          slug,
          findingCode: target.findingCode,
          toastId,
          setJobId,
          setRequested,
          refetchJobs: () =>
            void queryClient.invalidateQueries({
              queryKey: ['catalyst', 'github-fix-jobs', slug],
            }),
        })
      } else if (target.recommendationId) {
        void startCmsFix({
          slug,
          email,
          orgId,
          recommendationId: target.recommendationId,
          siteUrl,
          toastId,
          setPhase: setCmsPhase,
          setResult,
        })
      }
    },
    [slug, email, connected, platform, orgId, siteUrl, queryClient],
  )

  return {
    connected,
    platform,
    phase: platform === 'nextjs' ? jobPhase(job, requested) : cmsPhase,
    job,
    result,
    siteUrl,
    activeKey: active?.key ?? null,
    start,
  }
}

/** Task-page adapter over the shared flow — one fixed target, the task itself. */
export function useTaskAutoFix(task: TaskDetail | undefined): TaskAutoFix {
  // Pass the task's finding code so the fix state + PR resume after a refresh.
  const flow = useAutoFixFlow(task?.findingCode ?? '')
  return {
    connected: flow.connected,
    platform: flow.platform,
    phase: flow.phase,
    job: flow.job,
    result: flow.result,
    siteUrl: flow.siteUrl,
    visible: Boolean(task?.canAutoFix),
    run: () => {
      if (!task) return
      flow.start({
        key: `task-${task.id}`,
        recommendationId: task.recommendationId,
        findingCode: task.findingCode,
      })
    },
  }
}
