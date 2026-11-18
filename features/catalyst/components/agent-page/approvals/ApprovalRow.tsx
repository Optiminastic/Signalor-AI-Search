import { kindLabel } from '@/features/catalyst/agent-approvals'
import { ActionStateBadge } from '@/features/catalyst/components/agent-page/approvals/ActionStateBadge'
import type { ActionState } from '@/lib/api/agent-mode-approvals'
import { ChevronRight } from '@/lib/icons'

interface ApprovalRowProps {
  row: {
    id: string
    kind: string
    state: ActionState
    title: string
    /** One extra line, e.g. who an email goes to or why a send failed. */
    note: string
  }
  onOpen: (actionId: string) => void
}

/** One action in the list: what it is, where it stands, opens its details. */
export function ApprovalRow({ row, onOpen }: ApprovalRowProps): JSX.Element {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(row.id)}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-[var(--cat-hover)] focus-visible:ring-2 focus-visible:ring-[#e04a3d] focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-[var(--cat-ink)]">
            {row.title}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-[var(--cat-ink-3)]">
            {kindLabel(row.kind)}
            {row.note ? ` · ${row.note}` : ''}
          </span>
        </span>
        <ActionStateBadge state={row.state} kind={row.kind} />
        <ChevronRight size={14} className="shrink-0 text-[var(--cat-ink-3)]" aria-hidden="true" />
      </button>
    </li>
  )
}
