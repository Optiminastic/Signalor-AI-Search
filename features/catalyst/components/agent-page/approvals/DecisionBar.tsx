'use client'

import { useId, useState } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import type { DecisionVerb } from '@/lib/api/agent-mode-approvals'
import { Check, X } from '@/lib/icons'

interface DecisionBarProps {
  allowed: { approve: boolean; reject: boolean; version: number | null }
  /** True while a decision is saving, a refresh is loading, or a notice is open. */
  disabled: boolean
  onDecide: (verb: DecisionVerb, reason?: string) => void
}

const REASON_MAX = 500

const FIELD =
  'w-full rounded-md border border-[var(--cat-control-border)] bg-[var(--cat-card)] p-2 text-[12.5px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] focus:ring-2 focus:ring-[#e04a3d]'

interface RejectFormProps {
  disabled: boolean
  onCancel: () => void
  onReject: (reason: string) => void
}

function RejectForm({ disabled, onCancel, onReject }: RejectFormProps): JSX.Element {
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
          <X size={14} aria-hidden="true" /> Reject this draft
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          Cancel
        </button>
      </div>
    </div>
  )
}

/**
 * Approve or reject the exact version on screen, one action at a time.
 * There is no bulk control and no resend: neither exists on purpose.
 */
export function DecisionBar({ allowed, disabled, onDecide }: DecisionBarProps): JSX.Element | null {
  const [rejecting, setRejecting] = useState(false)
  if (!allowed.approve && !allowed.reject) return null
  if (rejecting) {
    return (
      <RejectForm
        disabled={disabled}
        onCancel={() => setRejecting(false)}
        onReject={reason => onDecide('reject', reason || undefined)}
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
        <button
          type="button"
          disabled={disabled}
          onClick={() => setRejecting(true)}
          className={SECONDARY_BUTTON}
        >
          <X size={14} aria-hidden="true" />
          {allowed.approve ? 'Reject' : 'Withdraw approval (reject)'}
        </button>
      )}
    </div>
  )
}
