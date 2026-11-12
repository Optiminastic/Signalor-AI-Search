'use client'

import { useState } from 'react'

import { canApprove, canEdit, canReject } from '@/features/catalyst/agent-approvals'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { ArticleEditForm } from '@/features/catalyst/components/agent-page/approvals/ArticleEditForm'
import { DecisionBar } from '@/features/catalyst/components/agent-page/approvals/DecisionBar'
import { EmailEditForm } from '@/features/catalyst/components/agent-page/approvals/EmailEditForm'
import type { AgentActionDetail, DecisionVerb } from '@/lib/api/agent-mode-approvals'
import { FileText } from '@/lib/icons'

interface DraftControlsProps {
  action: AgentActionDetail
  /** True while a change is saving, a refresh is loading, or a notice is open. */
  disabled: boolean
  editError: string | null
  handlers: {
    onDecide: (verb: DecisionVerb, reason?: string) => void
    onEdit: (fields: Record<string, string>) => void
  }
}

interface EditorProps {
  action: AgentActionDetail
  disabled: boolean
  error: string | null
  onSave: (fields: Record<string, string>) => void
  onCancel: () => void
}

function Editor({ action, disabled, error, onSave, onCancel }: EditorProps): JSX.Element {
  const [fields, setFields] = useState<Record<string, string> | null>(null)
  const content = action.content
  return (
    <section aria-label="Edit draft" className="flex flex-col gap-3">
      <p className="text-[12.5px] text-[var(--cat-ink-2)]">
        Saving creates version {(action.version ?? 0) + 1}. It goes back to awaiting your approval,
        and any approval of this version stops counting.
      </p>
      {content?.type === 'email' && <EmailEditForm email={content} onFields={setFields} />}
      {content?.type === 'article' && <ArticleEditForm article={content} onFields={setFields} />}
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-[var(--cat-ink)]">
          Not saved: {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || fields === null}
          onClick={() => fields && onSave(fields)}
          className={SECONDARY_BUTTON}
        >
          Save as version {(action.version ?? 0) + 1}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          Cancel
        </button>
      </div>
    </section>
  )
}

/**
 * Approve, reject or edit the draft on screen. While editing, the decision
 * buttons are hidden, so nothing is approved from a half-edited view. The
 * editor closes by itself once a save creates a new version.
 */
export function DraftControls({
  action,
  disabled,
  editError,
  handlers,
}: DraftControlsProps): JSX.Element {
  const [editingVersion, setEditingVersion] = useState<number | null>(null)
  const editing = editingVersion !== null && editingVersion === action.version
  if (editing) {
    return (
      <Editor
        action={action}
        disabled={disabled}
        error={editError}
        onSave={handlers.onEdit}
        onCancel={() => setEditingVersion(null)}
      />
    )
  }
  const allowed = {
    approve: canApprove(action),
    reject: canReject(action),
    version: action.version,
  }
  return (
    <div className="flex flex-col gap-2">
      <DecisionBar allowed={allowed} disabled={disabled} onDecide={handlers.onDecide} />
      {canEdit(action) && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setEditingVersion(action.version)}
          className={`${SECONDARY_BUTTON} self-start`}
        >
          <FileText size={14} aria-hidden="true" /> Edit draft
        </button>
      )}
    </div>
  )
}
