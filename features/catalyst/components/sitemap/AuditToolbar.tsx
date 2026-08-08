import { ArrowDown, ChevronDown, Search } from '@/lib/icons'

const DROP =
  'inline-flex h-[38px] items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-background-primary-default px-3 text-[13px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-background-secondary-default'

export function AuditToolbar(): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--cat-ink-3)]"
        />
        <input
          placeholder="Search URLs..."
          className="h-[38px] w-full rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] pr-3 pl-9 text-[13px] text-[var(--cat-ink)] placeholder:text-[var(--cat-ink-3)] focus:border-[#e04a3d] focus:outline-none"
        />
      </div>
      <button className={DROP}>
        All severities
        <ChevronDown size={14} className="text-[var(--cat-ink-3)]" />
      </button>
      <button className={DROP}>
        AI score
        <ArrowDown size={14} className="text-[var(--cat-ink-3)]" />
      </button>
    </div>
  )
}
