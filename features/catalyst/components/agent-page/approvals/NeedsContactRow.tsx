'use client'

import { useId, useState } from 'react'

import type { NeedsContactItem } from '@/features/catalyst/agent-approvals'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { ContactCandidates } from '@/features/catalyst/components/agent-page/approvals/ContactCandidates'
import type { ContactChoice } from '@/lib/api/agent-mode-activity'

interface NeedsContactRowProps {
  orgSlug: string
  item: NeedsContactItem
  busy: boolean
  onAnswer: (taskId: number, choice: ContactChoice) => void
}

const FIELD =
  'h-[34px] min-w-0 flex-1 rounded-md border border-[var(--cat-control-border)] bg-[var(--cat-card)] px-2 text-[12.5px] text-[var(--cat-ink)] outline-none placeholder:text-[var(--cat-ink-3)] focus:ring-2 focus:ring-[#e04a3d]'

/** A loose shape check; the backend validates the address properly. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ContactActionsProps {
  disabled: { draft: boolean; skip: boolean }
  onDraft: () => void
  onSkip: () => void
}

function ContactActions({ disabled, onDraft, onSkip }: ContactActionsProps): JSX.Element {
  return (
    <>
      <button
        type="button"
        disabled={disabled.draft}
        onClick={onDraft}
        className={SECONDARY_BUTTON}
      >
        Draft with this email
      </button>
      <button type="button" disabled={disabled.skip} onClick={onSkip} className={SECONDARY_BUTTON}>
        Skip this site
      </button>
    </>
  )
}

/**
 * The agent found no public contact email for this site. Instead of giving
 * up, it asks: give it an email to write to, or skip the site.
 */
export function NeedsContactRow({
  orgSlug,
  item,
  busy,
  onAnswer,
}: NeedsContactRowProps): JSX.Element {
  const [email, setEmail] = useState('')
  const fieldId = useId()
  const valid = LOOKS_LIKE_EMAIL.test(email.trim())
  return (
    <li className="flex flex-col gap-2 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3">
      <div>
        <p className="text-[13px] font-medium text-[var(--cat-ink)]">
          No public contact email on {item.domain}
        </p>
        <p className="text-[11.5px] text-[var(--cat-ink-3)]">{item.taskTitle}</p>
      </div>
      <ContactCandidates orgSlug={orgSlug} taskId={item.taskId} busy={busy} onAnswer={onAnswer} />
      <label htmlFor={fieldId} className="text-[12px] text-[var(--cat-ink-2)]">
        Or type an email you know. The agent will draft the pitch for them.
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={fieldId}
          type="email"
          value={email}
          placeholder={`editor@${item.domain}`}
          onChange={event => setEmail(event.target.value)}
          className={FIELD}
        />
        <ContactActions
          disabled={{ draft: busy || !valid, skip: busy }}
          onDraft={() => onAnswer(item.taskId, { email: email.trim() })}
          onSkip={() => onAnswer(item.taskId, { skip: true })}
        />
      </div>
    </li>
  )
}
