import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { BRAND, BRAND_SOFT } from '@/features/catalyst/constants'
import { Layers, Play } from '@/lib/icons'

export function SitemapUrlBar({ url }: { url: string }): JSX.Element {
  return (
    <div className="cat-rise flex items-center gap-3 rounded-md border border-[var(--cat-border)] bg-[var(--cat-hover)] p-4">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-md"
        style={{ background: BRAND_SOFT }}
      >
        <Layers size={18} style={{ color: BRAND }} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
          Sitemap
        </div>
        <div className="truncate text-[15px] font-semibold text-[var(--cat-ink)]">{url || '—'}</div>
      </div>
      <PrimaryButton icon={Play} wrapperClassName="ml-auto">
        Re-run audit
      </PrimaryButton>
    </div>
  )
}
