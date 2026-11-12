'use client'

import { useId, useState } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import type { DecisionVerb } from '@/lib/api/agent-mode-approvals'
import { Check, X } from '@/lib/icons'

interface DecisionBarProps {
  allowed: { approve: boolean; reject: boolean; revoke: boolean; version: number | null }
  /** True while a decision is saving, a refresh is loading, or a notice is open. */
  disabled: boolean
  onDecide: (verb: DecisionVerb, reason?: string) => void
}

const REASON_MAX = 500

const FIELD =
  'w-full rounded-md border border-[var(--cat-control-border)] bg-[var(--cat-card)] p-2 text-[12.5px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] focus:ring-2 focus:ring-[#e04a3d]'

interface RejectFormProps {
  disabled: boolean
  /** The confirm button's label: rejecting the draft, or withdrawing an approval. */
  confirmLabel: string
  onCancel: () => void
  onReject: (reason: string) => void
}

function RejectForm({ disabled, confirmLabel, onCancel, onReject }: RejectFormProps): JSX.Element {
  const [reason, setReason] = useState('')
  const fieldId = useId()
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] text-[var(--cat-ink-2)]" htmlFor={fieldId}>
        Reason (optional)
      </label>
      <textarea
        id={fieldId}
        rows={2}
        maxLength={REASON_MAX}
        value={reason}
        onChange={event => setReason(event.target.value)}
        className={FIELD}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onReject(reason.trim())}
          className={SECONDARY_BUTTON}
        >
          <X size={14} aria-hidden="true" /> {confirmLabel}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          Cancel
        </button>
      </div>
    </div>
  )
}

interface SecondaryProps {
  label: string
  disabled: boolean
  onClick: () => void
}

function SecondaryAction({ label, disabled, onClick }: SecondaryProps): JSX.Element {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={SECONDARY_BUTTON}>
      <X size={14} aria-hidden="true" /> {label}
    </button>
  )
}

/**
 * Approve, reject or withdraw an approval for the exact version on screen,
 * one action at a time.
 * There is no bulk control and no resend: neither exists on purpose.
 */
export function DecisionBar({ allowed, disabled, onDecide }: DecisionBarProps): JSX.Element | null {
  const [pending, setPending] = useState<'reject' | 'revoke' | null>(null)
  if (!allowed.approve && !allowed.reject && !allowed.revoke) return null
  if (pending) {
    return (
      <RejectForm
        disabled={disabled}
        confirmLabel={pending === 'revoke' ? 'Withdraw my approval' : 'Reject this draft'}
        onCancel={() => setPending(null)}
        onReject={reason => onDecide(pending, reason || undefined)}
      />
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowed.approve && (
        <PrimaryButton icon={Check} disabled={disabled} onClick={() => onDecide('approve')}>
          Approve version {allowed.version}
        </PrimaryButton>
      )}
      {allowed.reject && (
        <SecondaryAction label="Reject" disabled={disabled} onClick={() => setPending('reject')} />
      )}
      {allowed.revoke && (
        <SecondaryAction
          label="Withdraw approval"
          disabled={disabled}
          onClick={() => setPending('revoke')}
        />
      )}
    </div>
  )
}
