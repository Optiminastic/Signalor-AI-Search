import type { KeyboardEvent } from 'react'

import { YELLOW } from '@/features/catalyst/constants'

export type BoardTab =
  | 'activity'
  | 'articles'
  | 'guest'
  | 'keywords'
  | 'social'
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
  { id: 'approvals', label: 'Approvals' },
  { id: 'indexing', label: 'Indexing' },
  // Wide screens show tracking in its own column on the right instead.
  { id: 'tracking', label: 'Tracking', className: 'min-[1440px]:hidden' },
]

/**
 * Tabs taken off the board for now (their panels stay in the code):
 * - Social: numbers aren't complete yet (YouTube, Reddit and follower counts need API keys).
 * - Keywords: waiting for search volumes (DataForSEO credit).
 * Put a tab back by removing it here and re-adding it to TABS.
 */
export const HIDDEN_TABS: ReadonlySet<BoardTab> = new Set<BoardTab>(['social', 'keywords'])

export function boardPanelId(tab: BoardTab): string {
  return `agent-board-panel-${tab}`
}

function CountBadge({ count, label }: { count: number; label: string }): JSX.Element | null {
  if (count <= 0) return null
  return (
    <span
      className="bg-primary-strong rounded-sm px-1.5 text-[10.5px] leading-[16px] font-semibold text-white tabular-nums"
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
          className="bg-primary-strong rounded-sm px-1.5 text-[10.5px] leading-[16px] font-semibold text-white tabular-nums"
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

/** Tab buttons that are actually on screen (Tracking is hidden on wide screens). */
function visibleTabs(list: HTMLElement): HTMLButtonElement[] {
  return Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter(
    tab => tab.offsetParent !== null,
  )
}

const KEY_STEP: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_i, n) => n - 1,
}

/** WAI-ARIA tabs keyboard pattern: arrows move between tabs, Home/End jump to the ends. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>, onChange: (tab: BoardTab) => void): void {
  const step = KEY_STEP[event.key]
  if (!step) return
  const tabs = visibleTabs(event.currentTarget)
  const index = tabs.findIndex(tab => tab === document.activeElement)
  if (index < 0) return
  event.preventDefault()
  const next = tabs[step(index, tabs.length)]
  next.focus()
  onChange(next.dataset.tab as BoardTab)
}

interface TabButtonProps {
  tab: (typeof TABS)[number]
  selected: boolean
  badges: BoardBadges
  onChange: (tab: BoardTab) => void
}

function TabButton({ tab, selected, badges, onChange }: TabButtonProps): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      id={`agent-board-tab-${tab.id}`}
      data-tab={tab.id}
      aria-selected={selected}
      aria-controls={boardPanelId(tab.id)}
      // Roving tabindex: only the selected tab is a Tab stop; arrows move within.
      tabIndex={selected ? 0 : -1}
      onClick={() => onChange(tab.id)}
      className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-[5px] text-xs font-medium transition-colors ${tab.className ?? ''} ${
        selected
          ? 'bg-[var(--cat-card)] font-semibold text-[var(--cat-ink)] shadow-sm'
          : 'text-[var(--cat-ink-2)] hover:text-[var(--cat-ink)]'
      }`}
    >
      {tab.label}
      {tab.id === 'approvals' && <TabBadges badges={badges} />}
      {tab.id === 'articles' && (
        <CountBadge count={badges.articles} label="article drafts to review" />
      )}
      {tab.id === 'guest' && (
        <CountBadge count={badges.guest} label="guest posts waiting for you" />
      )}
      {tab.id === 'keywords' && <CountBadge count={badges.keywords} label="new keyword gaps" />}
      {tab.id === 'social' && <CountBadge count={badges.social} label="post drafts to review" />}
    </button>
  )
}

/** Segmented tabs over the board, in the dashboard's RangeTabs style. */
export function BoardTabs({ value, onChange, badges }: BoardTabsProps): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="Agent board"
      onKeyDown={event => moveFocus(event, onChange)}
      className="inline-flex gap-0.5 self-start rounded-md bg-[var(--cat-track)] p-[3px]"
    >
      {TABS.map(tab => (
        <TabButton
          key={tab.id}
          tab={tab}
          selected={tab.id === value}
          badges={badges}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
