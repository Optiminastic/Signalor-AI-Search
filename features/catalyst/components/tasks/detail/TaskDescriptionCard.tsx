import type { TaskDetail } from '@/hooks/useTaskDetail'

/** "Why this matters" content (rendered inside a TaskSection accordion): the
 *  recommendation's one-line reason as the lead, then the full description. */
export function TaskDescriptionBody({ task }: { task: TaskDetail }): JSX.Element {
  // Skip the lead when the description already opens with it verbatim —
  // some findings duplicate `why` into the description's first sentence.
  const lead = task.why && !task.description.startsWith(task.why) ? task.why : ''
  return (
    <div className="flex flex-col gap-1.5">
      {lead && (
        <p className="text-[13px] leading-relaxed font-medium text-[var(--cat-ink)]">{lead}</p>
      )}
      <p className="text-[13px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
        {task.description || 'No description was generated for this task.'}
      </p>
    </div>
  )
}
