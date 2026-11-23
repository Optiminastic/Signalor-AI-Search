import { YELLOW } from '@/features/catalyst/constants'

export type BoardTab =
  | 'activity'
  | 'articles'
  | 'guest'
  | 'keywords'
  | 'social'
  | 'business'
  | 'approvals'
  | 'indexing'
  | 'tracking'

export interface BoardBadges {
  awaiting: number
  outcomeUnknown: boolean
  articles: number
  social: number
  /** Guest posts waiting for the owner: a pitch to review, a contact to add, or a reply. */
  guest: number
  /** New keywords competitors win since last week. */
  keywords: number
  /** 1 while the brand has no Google Business Profile, so the owner sees there's one to create. */
  business: number
}

interface BoardTabsProps {
  value: BoardTab
  onChange: (tab: BoardTab) => void
  /** Drafts awaiting the owner, whether any send has an unknown outcome, and article drafts waiting. */
  badges: BoardBadges
}

const TABS: { id: BoardTab; label: string; className?: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'articles', label: 'Articles' },
  { id: 'guest', label: 'Guest posts' },
  { id: 'keywords', label: 'Keywords' },
  { id: 'social', label: 'Social' },
  { id: 'business', label: 'Google Business' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'indexing', label: 'Indexing' },
  // Wide screens show tracking in its own column on the right instead.
  { id: 'tracking', label: 'Tracking', className: 'min-[1440px]:hidden' },
]

export function boardPanelId(tab: BoardTab): string {
  return `agent-board-panel-${tab}`
}

function CountBadge({ count, label }: { count: number; label: string }): JSX.Element | null {
  if (count <= 0) return null
  return (
    <span
      className="rounded-sm bg-[#e04a3d] px-1.5 text-[10.5px] leading-[16px] font-semibold text-white tabular-nums"
      aria-label={`${count} ${label}`}
    >
      {count}
    </span>
  )
}

function TabBadges({ badges }: Pick<BoardTabsProps, 'badges'>): JSX.Element {
  return (
    <>
      {badges.awaiting > 0 && (
        <span
          className="rounded-sm bg-[#e04a3d] px-1.5 text-[10.5px] leading-[16px] font-semibold text-white tabular-nums"
          aria-label={`${badges.awaiting} awaiting approval`}
        >
          {badges.awaiting}
        </span>
      )}
      {badges.outcomeUnknown && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: YELLOW }}
          role="img"
          aria-label="A send has an unknown outcome"
        />
      )}
    </>
  )
}

const COUNT_LABELS: Partial<Record<BoardTab, string>> = {
  articles: 'article drafts to review',
  guest: 'guest posts waiting for you',
  keywords: 'new keyword gaps',
  social: 'post drafts to review',
  business: 'business listing to create',
}

/** The badge one tab carries, if any. */
function TabBadge({ tab, badges }: { tab: BoardTab; badges: BoardBadges }): JSX.Element | null {
  if (tab === 'approvals') return <TabBadges badges={badges} />
  const label = COUNT_LABELS[tab]
  if (!label) return null
  const count = badges[tab as keyof BoardBadges]
  return typeof count === 'number' ? <CountBadge count={count} label={label} /> : null
}

/** Segmented tabs over the board, in the dashboard's RangeTabs style. */
export function BoardTabs({ value, onChange, badges }: BoardTabsProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="Agent board"
      className="inline-flex gap-0.5 self-start rounded-md bg-[var(--cat-track)] p-[3px]"
    >
      {TABS.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`agent-board-tab-${tab.id}`}
          aria-selected={tab.id === value}
          aria-controls={boardPanelId(tab.id)}
          onClick={() => onChange(tab.id)}
          className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-[5px] text-xs font-medium transition-colors ${tab.className ?? ''} ${
            tab.id === value
              ? 'bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-sm'
              : 'text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
          }`}
        >
          {tab.label}
          <TabBadge tab={tab.id} badges={badges} />
        </button>
      ))}
    </div>
  )
}
