import type { TaskDetail } from '@/hooks/useTaskDetail'

/** "Why this matters" content (rendered inside a TaskSection accordion): the
 *  task description. */
export function TaskDescriptionBody({ task }: { task: TaskDetail }): JSX.Element {
  return (
    <p className="text-[13px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
      {task.description || 'No description was generated for this task.'}
    </p>
  )
}
