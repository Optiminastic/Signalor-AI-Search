import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { BarChart3, Search } from '@/lib/icons'

export function VisibilityHeader(): JSX.Element {
  return (
    <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
      <div className="min-w-0">
        <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
          Brand presence
        </h1>
        <p className="text-[13px] text-[var(--cat-ink-2)]">
          How AI engines and platforms surface your brand
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <PrimaryButton icon={BarChart3}>Connect Analytics</PrimaryButton>
        <button className="bg-background-primary-default hover:bg-background-secondary-default inline-flex h-[34px] items-center gap-2 rounded-md border border-[var(--cat-border)] px-3 text-[13px] font-medium text-[var(--cat-ink)] shadow-sm transition-colors">
          <Search size={15} className="text-[var(--cat-ink-2)]" /> Connect Search Console
        </button>
      </div>
    </div>
  )
}
