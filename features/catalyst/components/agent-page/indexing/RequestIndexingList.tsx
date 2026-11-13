import { SECTION_TITLE } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { RequestIndexingItem } from '@/lib/api/agent-mode-indexing'

interface RequestIndexingListProps {
  toRequest: RequestIndexingItem[]
  requested: RequestIndexingItem[]
  onOpened: (url: string) => void
}

const LINK_BUTTON =
  'inline-flex h-[30px] shrink-0 items-center rounded-md border border-[var(--cat-border)] px-2.5 text-[12px] font-medium text-[var(--cat-ink)] hover:bg-[var(--cat-hover)]'

function requestedLabel(item: RequestIndexingItem): string {
  if (!item.requestedAt) return 'Requested'
  const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(item.requestedAt),
  )
  return `Requested ${when}`
}

function PageRow({
  item,
  onOpened,
}: {
  item: RequestIndexingItem
  onOpened: (url: string) => void
}): JSX.Element {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-[var(--cat-border)] px-3 py-2">
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] text-[var(--cat-ink)]">{item.url}</span>
        <span className="block text-[11.5px] text-[var(--cat-ink-3)]">{item.reason}</span>
      </span>
      <a
        href={item.inspectUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onOpened(item.url)}
        className={LINK_BUTTON}
      >
        Open in Search Console
      </a>
    </li>
  )
}

/**
 * This week's "Request indexing" links. Google has no API for that button, so
 * each link opens the page in Search Console and the owner presses it there.
 */
export function RequestIndexingList({
  toRequest,
  requested,
  onOpened,
}: RequestIndexingListProps): JSX.Element | null {
  if (toRequest.length === 0 && requested.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Ask Google to index (this week)</h3>
      <p className="text-[12px] text-[var(--cat-ink-2)]">
        Each link opens the page in Search Console. Press <strong>Request indexing</strong> there.
        Google limits how many requests you can make per day, so the agent picks up to 10 a week.
      </p>
      <ul className="flex flex-col gap-1.5">
        {toRequest.map(item => (
          <PageRow key={item.url} item={item} onOpened={onOpened} />
        ))}
      </ul>
      {requested.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-[11.5px] text-[var(--cat-ink-3)]">
          {requested.map(item => (
            <li key={item.url} className="truncate">
              ✓ {requestedLabel(item)}: {item.url}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
