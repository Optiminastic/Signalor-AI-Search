import type { TaskDetail } from '@/hooks/useTaskDetail'

/** Strip a leading repeat of `lead` so the body never opens with the same
 *  sentence the masthead quote already shows. */
function withoutLead(description: string, lead: string): string {
  if (!lead || !description.startsWith(lead)) return description
  return description.slice(lead.length).replace(/^[\s.:-]+/, '')
}

/** "Why this matters" content (rendered inside a TaskSection accordion).
 *  The one-line `why` is NOT repeated here — the masthead already quotes it
 *  behind the severity bar, and showing it twice made the page read stuttery. */
export function TaskDescriptionBody({ task }: { task: TaskDetail }): JSX.Element {
  const description = withoutLead(task.description, task.why)
  return (
    <p className="text-[13px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
      {description || task.why || 'No description was generated for this action.'}
    </p>
  )
}
