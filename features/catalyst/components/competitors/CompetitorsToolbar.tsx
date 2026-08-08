import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { ChevronDown, Plus, Search } from '@/lib/icons'

const DROP =
  'inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-background-primary-default px-3 text-[13px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-background-secondary-default'

export function CompetitorsToolbar(): JSX.Element {
  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px]">
        <Search
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--cat-ink-3)]"
        />
        <input
          placeholder="Search competitors..."
          className="h-[34px] w-full rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] pr-3 pl-9 text-[13px] text-[var(--cat-ink)] placeholder:text-[var(--cat-ink-3)] focus:border-[#e04a3d] focus:outline-none"
        />
      </div>
      <button className={DROP}>
        All confidence
        <ChevronDown size={14} className="text-[var(--cat-ink-3)]" />
      </button>
      <button className={DROP}>
        All scores
        <ChevronDown size={14} className="text-[var(--cat-ink-3)]" />
      </button>
      <PrimaryButton icon={Plus} iconOnly aria-label="Add competitor" />
    </div>
  )
}
