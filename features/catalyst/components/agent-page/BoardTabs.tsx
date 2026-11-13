import { YELLOW } from '@/features/catalyst/constants'

export type BoardTab = 'activity' | 'articles' | 'social' | 'approvals' | 'indexing'

interface BoardTabsProps {
  value: BoardTab
  onChange: (tab: BoardTab) => void
  /** Drafts awaiting the owner, whether any send has an unknown outcome, and article drafts waiting. */
  badges: { awaiting: number; outcomeUnknown: boolean; articles: number }
}

const TABS: { id: BoardTab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'articles', label: 'Articles' },
  { id: 'social', label: 'Social' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'indexing', label: 'Indexing' },
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
          className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-[5px] text-xs font-medium transition-colors ${
            tab.id === value
              ? 'bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-sm'
              : 'text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
          }`}
        >
          {tab.label}
          {tab.id === 'approvals' && <TabBadges badges={badges} />}
          {tab.id === 'articles' && (
            <CountBadge count={badges.articles} label="article drafts to review" />
          )}
        </button>
      ))}
    </div>
  )
}
