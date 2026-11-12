'use client'

import { useMutation } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import {
  findContacts,
  type ContactCandidate,
  type ContactChoice,
  type FoundContacts,
} from '@/lib/api/agent-mode-activity'

interface ContactCandidatesProps {
  orgSlug: string
  taskId: number
  busy: boolean
  onAnswer: (taskId: number, choice: ContactChoice) => void
}

interface PersonProps {
  person: ContactCandidate
  busy: boolean
  onPick: () => void
}

const NOTE = 'text-[12px] text-[var(--cat-ink-2)]'
const REVEAL_NOTE = 'email revealed when picked (1 Apollo credit)'

function Person({ person, busy, onPick }: PersonProps): JSX.Element {
  const detail = [person.title, person.email || REVEAL_NOTE, person.confidence]
    .filter(Boolean)
    .join(' · ')
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-[var(--cat-border)] px-2 py-1.5">
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-medium text-[var(--cat-ink)]">
          {person.name}{' '}
          <span className="font-normal text-[var(--cat-ink-3)]">via {person.label}</span>
        </span>
        <span className="block truncate text-[11.5px] text-[var(--cat-ink-3)]">{detail}</span>
      </span>
      <button type="button" disabled={busy} onClick={onPick} className={SECONDARY_BUTTON}>
        Pitch this person
      </button>
    </li>
  )
}

interface ResultsProps extends ContactCandidatesProps {
  found: FoundContacts
}

function Results({ found, taskId, busy, onAnswer }: ResultsProps): JSX.Element {
  if (found.providers.length === 0) {
    return <p className={NOTE}>Contact finders (Hunter, Apollo) aren&apos;t set up yet.</p>
  }
  if (found.candidates.length === 0) {
    return <p className={NOTE}>No suitable people found. Type an email yourself, or skip.</p>
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {found.candidates.map(person => (
        <Person
          key={`${person.provider}-${person.ref}`}
          person={person}
          busy={busy}
          onPick={() =>
            onAnswer(taskId, { candidate: { provider: person.provider, ref: person.ref } })
          }
        />
      ))}
    </ul>
  )
}

/** "Find contacts": ask Hunter and Apollo for people at the site, then pick one to pitch. */
export function ContactCandidates(props: ContactCandidatesProps): JSX.Element {
  const lookup = useMutation({
    mutationFn: () => findContacts(props.orgSlug, props.taskId),
    retry: false,
  })
  return (
    <div className="flex flex-col gap-2">
      {!lookup.data && (
        <button
          type="button"
          disabled={lookup.isPending || props.busy}
          onClick={() => lookup.mutate()}
          className={`${SECONDARY_BUTTON} self-start`}
        >
          {lookup.isPending ? 'Looking up…' : 'Find contacts with Hunter / Apollo'}
        </button>
      )}
      {lookup.error && <p className={NOTE}>{loadErrorMessage(lookup.error)}</p>}
      {lookup.data && <Results found={lookup.data} {...props} />}
    </div>
  )
}
