import { AlertTriangle } from '@/lib/icons'

/**
 * What a profile section shows when its backend call failed.
 *
 * The page used to substitute sample data here, so a billing outage rendered an
 * invented plan and invoices that looked exactly like the user's own. An empty
 * list and a failed request are different facts and must not look alike: this
 * says which one happened, and never implies the account is empty.
 */
export function SectionUnavailable({ what }: { what: string }): JSX.Element {
  return (
    <div className="flex items-start gap-2.5 rounded-md bg-[var(--cat-hover)] px-3.5 py-3">
      <AlertTriangle size={15} className="mt-px shrink-0 text-[#B4790C]" />
      <div>
        <p className="text-[13px] font-medium text-[var(--cat-ink)]">
          Couldn&apos;t load your {what}
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">
          This is a display problem, not a change to your account. Refresh to try again.
        </p>
      </div>
    </div>
  )
}

/** A section that loaded fine and is genuinely empty. */
export function SectionEmpty({ message }: { message: string }): JSX.Element {
  return <p className="text-[13px] text-[var(--cat-ink-3)]">{message}</p>
}
