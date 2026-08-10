'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AnalysisToast } from '@/features/catalyst/components/analysis/AnalysisToast'
import { useActiveProject } from '@/hooks/useActiveProject'
import { startAnalysis } from '@/lib/api/analyzer'
import { ApiError } from '@/lib/api/client'
import { useAnalysisWatchStore } from '@/stores/useAnalysisWatchStore'

const TOAST_ID = 'new-analysis'

interface UseNewAnalysisResult {
  trigger: () => void
  isRunning: boolean
}

/**
 * Starts a new analysis run.
 *
 * Only the *starting* lives here. Polling and the live progress toast belong to
 * `AnalysisWatcher`, which the dashboard layout mounts: keeping them in this
 * hook tied them to whichever page called it, so navigating away killed the
 * poll and the toast never came back. This hook now records the run id in the
 * shared store and lets the watcher follow it.
 */
export function useNewAnalysis(): UseNewAnalysisResult {
  const { email, activeOrg } = useActiveProject()
  const runId = useAnalysisWatchStore(s => s.runId)
  const watch = useAnalysisWatchStore(s => s.watch)

  const mutation = useMutation({
    mutationFn: (vars: { url: string; email: string; orgId: number }) => startAnalysis(vars),
    onMutate: () => {
      toast.loading(<AnalysisToast status="pending" progress={0} />, { id: TOAST_ID })
    },
    onSuccess: res => {
      if (res.id) watch(res.id)
      else toast.error('Could not start analysis - no run id returned.', { id: TOAST_ID })
    },
    onError: (err: unknown) => {
      // Surface the backend's real reason (24h cooldown, plan limits) rather than
      // a generic failure — these carry an actionable message the user needs.
      const message =
        err instanceof ApiError && err.message
          ? err.message
          : 'Could not start analysis. Please try again.'
      toast.error(message, { id: TOAST_ID })
    },
  })

  function trigger(): void {
    if (!email || !activeOrg || mutation.isPending || runId !== undefined) return
    mutation.mutate({ url: activeOrg.url, email, orgId: activeOrg.id })
  }

  return { trigger, isRunning: mutation.isPending || runId !== undefined }
}
