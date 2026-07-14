'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AnalysisToast } from '@/features/catalyst/components/analysis/AnalysisToast'
import { useActiveProject } from '@/hooks/useActiveProject'
import { getRunStatus, startAnalysis } from '@/lib/api/analyzer'

const TOAST_ID = 'new-analysis'
const POLL_MS = 2500
const TERMINAL = new Set(['complete', 'failed'])

interface UseNewAnalysisResult {
  trigger: () => void
  isRunning: boolean
}

/**
 * Starts a new analysis run and drives a single live Sonner toast (stage +
 * percentage) by polling the run's status. On completion it refetches the
 * dashboard queries so the GEO score updates; on failure it surfaces an error.
 */
export function useNewAnalysis(): UseNewAnalysisResult {
  const { email, activeOrg } = useActiveProject()
  const queryClient = useQueryClient()
  const [runId, setRunId] = useState<number | undefined>(undefined)

  const mutation = useMutation({
    mutationFn: (vars: { url: string; email: string; orgId: number }) => startAnalysis(vars),
    onMutate: () => {
      toast.loading(<AnalysisToast status="pending" progress={0} />, { id: TOAST_ID })
    },
    onSuccess: res => {
      if (res.id) setRunId(res.id)
      else toast.error('Could not start analysis - no run id returned.', { id: TOAST_ID })
    },
    onError: () => toast.error('Could not start analysis. Please try again.', { id: TOAST_ID }),
  })

  const statusQuery = useQuery({
    queryKey: ['catalyst', 'run-status', runId ?? 0],
    enabled: runId !== undefined,
    queryFn: () => getRunStatus(runId as number),
    refetchInterval: query => (TERMINAL.has(query.state.data?.status ?? '') ? false : POLL_MS),
  })

  const status = statusQuery.data?.status
  const progress = statusQuery.data?.progress ?? 0
  useEffect(() => {
    if (runId === undefined || !status) return
    if (status === 'complete') {
      toast.success(<AnalysisToast status="complete" progress={100} />, {
        id: TOAST_ID,
        duration: 4000,
      })
      queryClient.invalidateQueries({ queryKey: ['catalyst'] })
      setRunId(undefined)
    } else if (status === 'failed') {
      toast.error('Analysis failed. Please try again.', { id: TOAST_ID })
      setRunId(undefined)
    } else {
      toast.loading(<AnalysisToast status={status} progress={progress} />, { id: TOAST_ID })
    }
  }, [runId, status, progress, queryClient])

  function trigger(): void {
    if (!email || !activeOrg || mutation.isPending || runId !== undefined) return
    mutation.mutate({ url: activeOrg.url, email, orgId: activeOrg.id })
  }

  return { trigger, isRunning: mutation.isPending || runId !== undefined }
}
