interface AssigneeStackProps {
  /** Assigned teammate's email, or '' when unassigned. */
  email: string
}

export function AssigneeStack({ email }: AssigneeStackProps): JSX.Element {
  if (!email) {
    return <span className="text-[12px] text-[var(--cat-ink-3)]">Unassigned</span>
  }
  return (
    <span className="flex items-center gap-2" title={email}>
      <span className="text-primary-ink grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[rgba(224,74,61,0.12)] text-[10px] font-semibold uppercase">
        {email[0]}
      </span>
      <span className="max-w-[130px] truncate text-[12px] text-[var(--cat-ink-2)]">{email}</span>
    </span>
  )
}
