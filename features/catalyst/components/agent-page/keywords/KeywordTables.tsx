import type { BrandKeyword, KeywordGap } from '@/lib/api/agent-mode-keywords'

const ROW =
  'flex items-center gap-3 border-b border-[var(--cat-border)] py-2 text-[12.5px] last:border-0'
const NUMBER = 'w-16 shrink-0 text-right text-[var(--cat-ink-2)] tabular-nums'
const NEW_CHIP =
  'rounded-sm bg-[rgba(224,74,61,0.1)] px-1.5 text-[10.5px] font-semibold text-[#e04a3d]'
const HEAD = 'flex items-center gap-3 pb-1 text-[11px] text-[var(--cat-ink-3)]'

const volume = new Intl.NumberFormat(undefined, { notation: 'compact' })

function searches(value: number): string {
  return value > 0 ? volume.format(value) : '-'
}

interface GapListProps {
  gaps: KeywordGap[]
}

/** Keywords competitors rank top 10 for and the brand doesn't, biggest search demand first. */
export function GapList({ gaps }: GapListProps): JSX.Element {
  return (
    <div>
      <p className={HEAD}>
        <span className="flex-1">Keyword</span>
        <span className="w-16 text-right">Searches/mo</span>
        <span className="w-40">Who ranks</span>
      </p>
      <ul>
        {gaps.map(gap => (
          <li key={gap.keyword} className={ROW}>
            <span className="flex min-w-0 flex-1 items-center gap-2 text-[var(--cat-ink)]">
              <span className="truncate">{gap.keyword}</span>
              {gap.isNew && <span className={NEW_CHIP}>New</span>}
            </span>
            <span className={NUMBER}>{searches(gap.searchVolume)}</span>
            <span className="w-40 truncate text-[var(--cat-ink-2)]">
              {gap.rivals.map(rival => `${rival.domain} #${rival.position}`).join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface BrandListProps {
  keywords: BrandKeyword[]
}

/** What the brand already ranks for on Google, by traffic. */
export function BrandList({ keywords }: BrandListProps): JSX.Element {
  return (
    <div>
      <p className={HEAD}>
        <span className="flex-1">Keyword</span>
        <span className="w-16 text-right">Position</span>
        <span className="w-16 text-right">Searches/mo</span>
      </p>
      <ul>
        {keywords.map(row => (
          <li key={row.keyword} className={ROW}>
            <span className="min-w-0 flex-1 truncate text-[var(--cat-ink)]" title={row.url}>
              {row.keyword}
            </span>
            <span className={NUMBER}>#{row.position}</span>
            <span className={NUMBER}>{searches(row.searchVolume)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
