'use client'

import { useId, useState } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { Resolution } from '@/lib/api/agent-mode-approvals'
import { Check, X } from '@/lib/icons'

interface ResolveBarProps {
  /** True while a change is saving, a refresh is loading, or a notice is open. */
  disabled: boolean
  onResolve: (resolution: Resolution, reason?: string) => void
}

const REASON_MAX = 500

const FIELD =
  'w-full rounded-md border border-[var(--cat-control-border)] bg-[var(--cat-card)] p-2 text-[12.5px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] focus:ring-2 focus:ring-[#e04a3d]'

const CHOICES: Record<Resolution, { label: string; confirm: string; explain: string }> = {
  confirmed_sent: {
    label: 'I found it: it was sent',
    confirm: 'Record that it was sent',
    explain: 'This records that it went out and counts it as done. Nothing is sent.',
  },
  cancel: {
    label: 'Close it, outcome unknown',
    confirm: 'Close with the outcome unknown',
    explain:
      'This records that you closed it without knowing whether it went out. It will not be sent.',
  },
}

interface ConfirmFormProps {
  choice: Resolution
  disabled: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

function ConfirmForm({ choice, disabled, onCancel, onConfirm }: ConfirmFormProps): JSX.Element {
  const [reason, setReason] = useState('')
  const fieldId = useId()
  const copy = CHOICES[choice]
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] text-[var(--cat-ink-2)]">{copy.explain}</p>
      <label className="text-[12px] text-[var(--cat-ink-2)]" htmlFor={fieldId}>
        What did you find? (optional)
      </label>
      <textarea
        id={fieldId}
        rows={2}
        maxLength={REASON_MAX}
        value={reason}
        onChange={event => setReason(event.target.value)}
        className={FIELD}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onConfirm(reason.trim())}
          className={SECONDARY_BUTTON}
        >
          <Check size={14} aria-hidden="true" /> {copy.confirm}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          Back
        </button>
      </div>
    </div>
  )
}

/**
 * Closing an action whose send outcome is unknown. Two ways only, each with a
 * confirmation step. Sending it again is deliberately not one of them.
 */
export function ResolveBar({ disabled, onResolve }: ResolveBarProps): JSX.Element {
  const [choice, setChoice] = useState<Resolution | null>(null)
  if (choice) {
    return (
      <ConfirmForm
        choice={choice}
        disabled={disabled}
        onCancel={() => setChoice(null)}
        onConfirm={reason => onResolve(choice, reason || undefined)}
      />
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Close this action">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setChoice('confirmed_sent')}
        className={SECONDARY_BUTTON}
      >
        <Check size={14} aria-hidden="true" /> {CHOICES.confirmed_sent.label}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setChoice('cancel')}
        className={SECONDARY_BUTTON}
      >
        <X size={14} aria-hidden="true" /> {CHOICES.cancel.label}
      </button>
    </div>
  )
}
