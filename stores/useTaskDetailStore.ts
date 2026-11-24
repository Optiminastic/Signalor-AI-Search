import { create } from 'zustand'

/** The task whose detail modal is open (identified by its linked recommendation). */
export interface OpenTask {
  recommendationId?: number
  name: string
  description: string
}

interface TaskDetailState {
  task: OpenTask | null
  open: (task: OpenTask) => void
  close: () => void
}

/** Drives the single task-detail modal rendered at the Tasks view level. */
export const useTaskDetailStore = create<TaskDetailState>(set => ({
  task: null,
  open: task => set({ task }),
  close: () => set({ task: null }),
}))
