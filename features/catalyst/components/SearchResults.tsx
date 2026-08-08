import type { SearchItem } from '@/features/catalyst/search-data'

interface ResultRowProps {
  item: SearchItem
  index: number
  activeRow: boolean
  onPick: (href: string) => void
  onHover: (index: number) => void
}

function ResultRow({ item, index, activeRow, onPick, onHover }: ResultRowProps): JSX.Element {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(index)}
      onMouseDown={e => {
        e.preventDefault()
        onPick(item.href)
      }}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors ${
        activeRow ? 'bg-background-secondary-default' : ''
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)]">
        <item.icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[var(--cat-ink)]">
          {item.label}
        </span>
        {item.sublabel && (
          <span className="block truncate text-[11px] text-[var(--cat-ink-3)]">
            {item.sublabel}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium tracking-wide text-[var(--cat-ink-3)] uppercase">
        {item.type}
      </span>
    </button>
  )
}

interface SearchResultsProps {
  results: SearchItem[]
  active: number
  onPick: (href: string) => void
  onHover: (index: number) => void
}

export function SearchResults({
  results,
  active,
  onPick,
  onHover,
}: SearchResultsProps): JSX.Element {
  return (
    <div className="bg-background-primary-default absolute top-[calc(100%+6px)] left-0 z-50 w-[360px] max-w-[80vw] overflow-hidden rounded-2xl border border-[var(--cat-border-soft)] p-1 shadow-xl">
      {results.map((item, i) => (
        <ResultRow
          key={`${item.type}-${item.label}`}
          item={item}
          index={i}
          activeRow={i === active}
          onPick={onPick}
          onHover={onHover}
        />
      ))}
    </div>
  )
}
