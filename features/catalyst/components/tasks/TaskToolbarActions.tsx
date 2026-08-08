import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { ChevronDown, Plus } from '@/lib/icons'

const DROP =
  'inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-background-primary-default px-3 text-[13px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-background-secondary-default'

export function TaskToolbarActions(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <button className={`${DROP} hidden sm:inline-flex`}>
        Priority
        <ChevronDown size={14} className="text-[var(--cat-ink-3)]" />
      </button>
      <PrimaryButton icon={Plus}>Create Task</PrimaryButton>
    </div>
  )
}
