'use client'

import { awaitingCount, unknownCount } from '@/features/catalyst/agent-approvals'
import { AgentActivityFeed } from '@/features/catalyst/components/agent-page/AgentActivityFeed'
import { AgentLog } from '@/features/catalyst/components/agent-page/AgentLog'
import { useAgentUi } from '@/features/catalyst/components/agent-page/AgentUiContext'
import { AgentApprovalsPanel } from '@/features/catalyst/components/agent-page/approvals/AgentApprovalsPanel'
import { ArticlesPanel } from '@/features/catalyst/components/agent-page/articles/ArticlesPanel'
import {
  BoardTabs,
  boardPanelId,
  type BoardBadges,
  type BoardTab,
} from '@/features/catalyst/components/agent-page/BoardTabs'
import { BusinessProfilePanel } from '@/features/catalyst/components/agent-page/business/BusinessProfilePanel'
import { GuestPostsPanel } from '@/features/catalyst/components/agent-page/guest-posts/GuestPostsPanel'
import { IndexingPanel } from '@/features/catalyst/components/agent-page/indexing/IndexingPanel'
import { KeywordsPanel } from '@/features/catalyst/components/agent-page/keywords/KeywordsPanel'
import { SocialPanel } from '@/features/catalyst/components/agent-page/social/SocialPanel'
import { RankTrackingPanel } from '@/features/catalyst/components/agent-page/tracking/RankTrackingPanel'
import { isSatelliteDraft } from '@/features/catalyst/satellite-topics'
import { useAgentApprovals, type AgentApprovals } from '@/hooks/useAgentApprovals'
import { useBusinessProfile } from '@/hooks/useBusinessProfile'
import { useGuestPosts } from '@/hooks/useGuestPosts'
import { useKeywords } from '@/hooks/useKeywords'
import type { GuestStage } from '@/lib/api/agent-mode-guest-posts'
import { Sparkles } from '@/lib/icons'

interface AgentCanvasProps {
  orgSlug: string
  thinking: boolean
  lastTools: string[]
}

function heading(tab: BoardTab, thinking: boolean): string {
  if (tab === 'approvals') return 'Approvals'
  if (tab === 'indexing') return 'Indexing on Google'
  if (tab === 'articles') return 'Articles on signalor.ai sites'
  if (tab === 'social') return 'Social presence'
  if (tab === 'business') return 'Google Business Profile'
  if (tab === 'guest') return 'Guest posts'
  if (tab === 'keywords') return 'Keywords on Google'
  if (tab === 'tracking') return 'Tracking'
  return thinking ? 'Working on it' : 'What the agent did'
}

function BoardHeading({ tab, thinking }: { tab: BoardTab; thinking: boolean }): JSX.Element {
  return (
    <div className="mt-4 flex items-center justify-between">
      <h2 className="text-[17px] font-semibold text-[var(--cat-ink)]">{heading(tab, thinking)}</h2>
      {thinking && tab === 'activity' && (
        <span className="cat-agent-scan h-1 w-24 rounded-full" aria-hidden="true" />
      )}
    </div>
  )
}

/** Guest-post stages where the owner has something to do. */
const GUEST_NEEDS_YOU = new Set<GuestStage>(['pitch_waiting', 'needs_contact', 'replied'])

interface ExtraBadges {
  guestNeedsYou: number
  newKeywordGaps: number
  noBusinessListing: boolean
}

function boardBadges(approvals: AgentApprovals, extra: ExtraBadges): BoardBadges {
  const waitingSocial = approvals.pending.filter(
    a => a.kind === 'publish_social_post' && a.state === 'awaiting_approval',
  )
  return {
    awaiting: awaitingCount(approvals.pending),
    outcomeUnknown: unknownCount(approvals.results) > 0,
    articles: approvals.pending.filter(isSatelliteDraft).length,
    social: waitingSocial.length,
    guest: extra.guestNeedsYou,
    keywords: extra.newKeywordGaps,
    business: extra.noBusinessListing ? 1 : 0,
  }
}

/** Count badges for every tab, from the data each tab already loads. */
function useBoardBadges(orgSlug: string, approvals: AgentApprovals): BoardBadges {
  const guest = useGuestPosts(orgSlug)
  const keywords = useKeywords(orgSlug)
  const business = useBusinessProfile(orgSlug)
  return boardBadges(approvals, {
    guestNeedsYou: guest.report?.sites.filter(s => GUEST_NEEDS_YOU.has(s.stage)).length ?? 0,
    newKeywordGaps: keywords.report?.newGaps ?? 0,
    noBusinessListing: business.report?.status === 'not_found',
  })
}

interface BoardPanelProps extends AgentCanvasProps {
  tab: BoardTab
  approvals: AgentApprovals
}

/** The open tab's content. */
function BoardPanel({
  tab,
  orgSlug,
  approvals,
  thinking,
  lastTools,
}: BoardPanelProps): JSX.Element {
  if (tab === 'articles') return <ArticlesPanel orgSlug={orgSlug} approvals={approvals} />
  if (tab === 'guest') return <GuestPostsPanel orgSlug={orgSlug} />
  if (tab === 'keywords') return <KeywordsPanel orgSlug={orgSlug} />
  if (tab === 'social') return <SocialPanel orgSlug={orgSlug} approvals={approvals} />
  if (tab === 'business') return <BusinessProfilePanel orgSlug={orgSlug} />
  if (tab === 'approvals') return <AgentApprovalsPanel orgSlug={orgSlug} approvals={approvals} />
  if (tab === 'indexing') return <IndexingPanel orgSlug={orgSlug} />
  if (tab === 'tracking') return <RankTrackingPanel orgSlug={orgSlug} />
  return (
    <>
      <AgentActivityFeed thinking={thinking} lastTools={lastTools} />
      <AgentLog orgSlug={orgSlug} />
    </>
  )
}

/**
 * The whiter board beside the chat: a live view of what the agent is doing,
 * and the drafts waiting for the owner's approval.
 */
export function AgentCanvas({ orgSlug, thinking, lastTools }: AgentCanvasProps): JSX.Element {
  const { tab, setTab } = useAgentUi()
  const approvals = useAgentApprovals(orgSlug)
  const badges = useBoardBadges(orgSlug, approvals)
  return (
    <section
      aria-label="Agent board"
      className="cat-agent-canvas hidden min-h-0 flex-1 flex-col overflow-y-auto rounded-[22px] border border-white/80 bg-[var(--cat-content)]/90 px-8 py-6 shadow-[0_10px_40px_rgba(120,60,30,.08)] backdrop-blur-xl lg:flex dark:border-white/10"
    >
      <div className="flex items-center justify-between gap-3">
        <BoardTabs value={tab} onChange={setTab} badges={badges} />
        <p className="flex items-center gap-1.5 text-[11px] text-[var(--cat-ink-3)]">
          <Sparkles size={12} /> Updated automatically
        </p>
      </div>
      <BoardHeading tab={tab} thinking={thinking} />
      <div
        className="mt-4"
        role="tabpanel"
        id={boardPanelId(tab)}
        aria-labelledby={`agent-board-tab-${tab}`}
      >
        <BoardPanel {...{ tab, orgSlug, approvals, thinking, lastTools }} />
      </div>
    </section>
  )
}
