import { create } from 'zustand'

/**
 * Which analysis run the dashboard is currently following.
 *
 * This lived in `useNewAnalysis`'s own `useState`, which meant it belonged to
 * the Overview page's component tree: navigating to Profile unmounted the hook,
 * threw the run id away and stopped the poll, so coming back showed no progress
 * toast even though the analysis was still running on the server. The id is
 * shared state that outlives any one page, so it belongs in a store (the
 * watcher that polls it is mounted by the dashboard layout).
 *
 * Deliberately not persisted: a reload does not need it, because the watcher
 * re-adopts whatever run the server still reports as in-flight, which is the
 * more honest source and also covers a run started in another tab.
 */
interface AnalysisWatchState {
  /** Run being followed, or undefined when nothing is in flight. */
  runId: number | undefined
  watch: (runId: number) => void
  stop: () => void
}

export const useAnalysisWatchStore = create<AnalysisWatchState>(set => ({
  runId: undefined,
  watch: runId => set({ runId }),
  stop: () => set({ runId: undefined }),
}))
