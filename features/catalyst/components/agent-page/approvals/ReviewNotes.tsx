import { YELLOW } from '@/features/catalyst/constants'
import { AlertTriangle } from '@/lib/icons'

interface ReviewNotesProps {
  notes: string[]
}

/**
 * The fact-check's concerns about a draft. The agent doesn't refuse on its
 * own: it shows the concerns and the owner decides (edit, approve or reject).
 */
export function ReviewNotes({ notes }: ReviewNotesProps): JSX.Element | null {
  if (notes.length === 0) return null
  return (
    <section
      role="note"
      aria-label="Fact-check concerns"
      className="flex flex-col gap-1.5 rounded-md border bg-[var(--cat-card)] p-3"
      style={{ borderColor: YELLOW }}
    >
      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--cat-ink)]">
        <AlertTriangle size={13} style={{ color: YELLOW }} aria-hidden="true" /> Fact-check
        concerns, for you to decide
      </p>
      <ul className="list-disc pl-5 text-[12.5px] text-[var(--cat-ink-2)]">
        {notes.map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <p className="text-[11.5px] text-[var(--cat-ink-3)]">
        Edit the draft to fix them, approve it as it is, or reject it.
      </p>
    </section>
  )
}
