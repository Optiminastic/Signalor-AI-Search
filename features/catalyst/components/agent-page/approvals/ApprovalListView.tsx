import {
  splitResults,
  type ActionResult,
  type NeedsContactItem,
} from '@/features/catalyst/agent-approvals'
import {
  MUTED_TEXT,
  SECONDARY_BUTTON,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { ApprovalRow } from '@/features/catalyst/components/agent-page/approvals/ApprovalRow'
import { NeedsContactRow } from '@/features/catalyst/components/agent-page/approvals/NeedsContactRow'
import type { ContactChoice } from '@/lib/api/agent-mode-activity'
import type { AgentAction } from '@/lib/api/agent-mode-approvals'
import { Loader2 } from '@/lib/icons'

interface ApprovalListViewProps {
  data: {
    pending: AgentAction[]
    results: ActionResult[]
    isLoading: boolean
    error: string | null
    resultsError: string | null
    needsContact?: NeedsContactItem[]
  }
  onOpen: (actionId: string) => void
  onReload: () => void
  /** Answers for tasks waiting on a contact email; omitted where not wired. */
  contact?: {
    orgSlug: string
    busyTaskId: number | null
    onAnswer: (taskId: number, choice: ContactChoice) => void
  }
}

function NeedsInputSection({
  items,
  contact,
}: {
  items: NeedsContactItem[]
  contact: NonNullable<ApprovalListViewProps['contact']>
}): JSX.Element {
  return (
    <section aria-label="Needs your input">
      <h3 className={SECTION_TITLE}>Needs your input</h3>
      <p className={`mt-1 ${MUTED_TEXT}`}>
        The agent couldn&apos;t find a public contact for these sites. It won&apos;t guess one.
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map(item => (
          <NeedsContactRow
            key={item.taskId}
            orgSlug={contact.orgSlug}
            item={item}
            busy={contact.busyTaskId === item.taskId}
            onAnswer={contact.onAnswer}
          />
        ))}
      </ul>
    </section>
  )
}

function pendingNote(action: AgentAction): string {
  const content = action.content
  if (content?.type === 'email') return `To a contact at ${content.recipientDomain}`
  if (content?.type === 'article') return content.destination ? `On ${content.destination}` : ''
  return 'Draft could not be shown'
}

function LoadError({ message, onReload }: { message: string; onReload: () => void }): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-start gap-3">
      <p className="text-[13px] font-medium text-[var(--cat-ink)]">Couldn&apos;t load approvals</p>
      <p className={MUTED_TEXT}>{message}</p>
      <button type="button" onClick={onReload} className={SECONDARY_BUTTON}>
        Try again
      </button>
    </div>
  )
}

function PendingSection({
  pending,
  onOpen,
}: Pick<ApprovalListViewProps['data'], 'pending'> & {
  onOpen: (id: string) => void
}): JSX.Element {
  return (
    <section aria-label="Waiting for you">
      <h3 className={SECTION_TITLE}>Waiting for you</h3>
      {pending.length === 0 ? (
        <p className={`mt-2 ${MUTED_TEXT}`}>Nothing is waiting for your approval.</p>
      ) : (
        <ul className="-mx-2 mt-1">
          {pending.map(action => (
            <ApprovalRow
              key={action.id}
              row={{ ...action, title: action.task.title, note: pendingNote(action) }}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

interface ResultsSectionProps {
  title: string
  hint?: string
  results: ActionResult[]
  onOpen: (id: string) => void
}

function ResultsSection({ title, hint, results, onOpen }: ResultsSectionProps): JSX.Element {
  return (
    <section aria-label={title}>
      <h3 className={SECTION_TITLE}>{title}</h3>
      {hint && <p className={`mt-1 ${MUTED_TEXT}`}>{hint}</p>}
      <ul className="-mx-2 mt-1">
        {results.map(result => (
          <ApprovalRow
            key={result.actionId}
            row={{
              id: result.actionId,
              kind: result.kind,
              state: result.state,
              title: result.taskTitle,
              note: result.failure,
            }}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </section>
  )
}

function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13px] font-medium text-[var(--cat-ink)]">Nothing to approve yet</p>
      <p className={MUTED_TEXT}>
        When the agent drafts an outreach email or an article, it appears here first. Nothing is
        sent or published until you approve that exact draft.
      </p>
    </div>
  )
}

function isEmpty(data: ApprovalListViewProps['data']): boolean {
  const nothing = data.pending.length === 0 && data.results.length === 0
  return nothing && (data.needsContact ?? []).length === 0 && !data.resultsError
}

/** The list's sections, in order: owner input, unknown outcomes, pending drafts, results. */
function ListSections({ data, onOpen, contact }: ApprovalListViewProps): JSX.Element {
  const needsContact = data.needsContact ?? []
  const { attention, settled } = splitResults(data.results)
  return (
    <div className="flex flex-col gap-6">
      {needsContact.length > 0 && contact && (
        <NeedsInputSection items={needsContact} contact={contact} />
      )}
      {attention.length > 0 && (
        <ResultsSection
          title="Needs your attention"
          hint="We don't know whether these went out. Check, then record what you found."
          results={attention}
          onOpen={onOpen}
        />
      )}
      <PendingSection pending={data.pending} onOpen={onOpen} />
      {settled.length > 0 && <ResultsSection title="Results" results={settled} onOpen={onOpen} />}
      {data.resultsError && (
        <p role="alert" className={MUTED_TEXT}>
          Results couldn&apos;t load: {data.resultsError}
        </p>
      )}
    </div>
  )
}

/** The Approvals tab's list: owner input first, then unknown outcomes, drafts, results. */
export function ApprovalListView(props: ApprovalListViewProps): JSX.Element {
  const { data, onReload } = props
  if (data.isLoading) {
    return (
      <p role="status" className="flex items-center gap-2 text-[13px] text-[var(--cat-ink-3)]">
        <Loader2 size={14} className="cat-agent-spin" aria-hidden="true" /> Loading approvals…
      </p>
    )
  }
  if (data.error) return <LoadError message={data.error} onReload={onReload} />
  if (isEmpty(data)) return <EmptyState />
  return <ListSections {...props} />
}
