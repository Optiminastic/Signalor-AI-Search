'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { AnalysisToast } from '@/features/catalyst/components/analysis/AnalysisToast'
import { useActiveProject } from '@/hooks/useActiveProject'
import { getRunStatus } from '@/lib/api/analyzer'
import { useAnalysisWatchStore } from '@/stores/useAnalysisWatchStore'

const TOAST_ID = 'new-analysis'
const POLL_MS = 2500
const TERMINAL = new Set(['complete', 'failed'])

/** Show the toast for a status. Returns true once the run is finished with. */
function announce(status: string, progress: number, onDone: () => void): boolean {
  if (status === 'complete') {
    toast.success(<AnalysisToast status="complete" progress={100} />, {
      id: TOAST_ID,
      duration: 4000,
    })
    onDone()
    return true
  }
  if (status === 'failed') {
    toast.error('Analysis failed. Please try again.', { id: TOAST_ID })
    return true
  }
  toast.loading(<AnalysisToast status={status} progress={progress} />, { id: TOAST_ID })
  return false
}

/**
 * Drives the live analysis progress toast for the whole dashboard.
 *
 * Mounted by the dashboard layout rather than by a page, because it has to
 * outlive navigation: the poll and the toast used to belong to the Overview
 * page's `useNewAnalysis`, so opening Profile unmounted them and returning to
 * Overview showed nothing while the run carried on server-side.
 *
 * Renders no markup — it exists for the effect.
 */
export function AnalysisWatcher(): null {
  const queryClient = useQueryClient()
  const { latestRun } = useActiveProject()
  const runId = useAnalysisWatchStore(s => s.runId)
  const watch = useAnalysisWatchStore(s => s.watch)
  const stop = useAnalysisWatchStore(s => s.stop)

  // Runs already seen through to a terminal status. The runs list stays stale
  // for a moment after one finishes, so without this the watcher would re-adopt
  // the run it just released and announce the same completion again.
  const settled = useRef<Set<number>>(new Set())

  // Adopt a run the server still reports as in-flight. Covers a page reload, a
  // second tab, and a run started before this component mounted — the toast
  // follows the brand's actual state rather than only runs this tab started.
  const inFlightId = latestRun && !TERMINAL.has(latestRun.status) ? latestRun.id : undefined
  useEffect(() => {
    if (inFlightId === undefined || runId !== undefined) return
    if (settled.current.has(inFlightId)) return
    watch(inFlightId)
  }, [inFlightId, runId, watch])

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
    const finished = announce(status, progress, () =>
      queryClient.invalidateQueries({ queryKey: ['catalyst'] }),
    )
    if (finished) {
      settled.current.add(runId)
      stop()
    }
  }, [runId, status, progress, queryClient, stop])

  return null
}
