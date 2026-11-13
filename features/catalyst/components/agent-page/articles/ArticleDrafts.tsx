import {
  MUTED_TEXT,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { ApprovalRow } from '@/features/catalyst/components/agent-page/approvals/ApprovalRow'
import type { AgentAction } from '@/lib/api/agent-mode-approvals'

interface ArticleDraftsProps {
  drafts: AgentAction[]
  onOpen: (id: string) => void
}

function note(action: AgentAction): string {
  return action.content?.type === 'article' ? `On ${action.content.destination}` : ''
}

/** Written articles waiting for the owner: open one to read it in full, edit, approve or reject. */
export function ArticleDrafts({ drafts, onOpen }: ArticleDraftsProps): JSX.Element {
  return (
    <section aria-label="Drafts to review">
      <h3 className={SECTION_TITLE}>Drafts to review</h3>
      {drafts.length === 0 ? (
        <p className={`mt-2 ${MUTED_TEXT}`}>
          No article is waiting. Each planned topic is written on its date and appears here first.
        </p>
      ) : (
        <ul className="-mx-2 mt-1">
          {drafts.map(action => (
            <ApprovalRow
              key={action.id}
              row={{ ...action, title: action.task.title, note: note(action) }}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
