'use client'

import { useState } from 'react'

import { EditField } from '@/features/catalyst/components/agent-page/approvals/EditField'
import type { EmailContent } from '@/lib/api/agent-mode-approvals'

/** Limits match the backend's edit rules. */
const SUBJECT_MAX = 200
const MESSAGE_MAX = 5000

interface EmailEditFormProps {
  email: EmailContent
  /** Called whenever a field changes, with the full set of edited fields. */
  onFields: (fields: Record<string, string>) => void
}

/** Subject and message are editable; the footer with the opt-out is fixed. */
export function EmailEditForm({ email, onFields }: EmailEditFormProps): JSX.Element {
  const [subject, setSubject] = useState(email.subject)
  const [message, setMessage] = useState(email.message ?? '')
  const update = (next: { subject?: string; message?: string }): void => {
    const fields = { subject: next.subject ?? subject, message: next.message ?? message }
    setSubject(fields.subject)
    setMessage(fields.message)
    onFields(fields)
  }
  return (
    <div className="flex flex-col gap-3">
      <EditField
        label="Subject"
        value={subject}
        maxLength={SUBJECT_MAX}
        onChange={value => update({ subject: value })}
      />
      <EditField
        label="Message"
        value={message}
        rows={8}
        maxLength={MESSAGE_MAX}
        onChange={value => update({ message: value })}
      />
      <div>
        <p className="text-[12px] font-medium text-[var(--cat-ink-2)]">
          Added automatically, can&apos;t be edited
        </p>
        <pre className="mt-1 rounded-md border border-[var(--cat-border)] bg-[var(--cat-content)] p-2 font-mono text-[11.5px] break-words whitespace-pre-wrap text-[var(--cat-ink-2)]">
          {`--\n${email.footer ?? ''}`}
        </pre>
      </div>
    </div>
  )
}
