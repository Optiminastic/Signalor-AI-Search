'use client'

import { awaitingCount, unknownCount } from '@/features/catalyst/agent-approvals'
import { AgentActivityFeed } from '@/features/catalyst/components/agent-page/AgentActivityFeed'
import { AgentLog } from '@/features/catalyst/components/agent-page/AgentLog'
import { AgentApprovalsPanel } from '@/features/catalyst/components/agent-page/approvals/AgentApprovalsPanel'
import { ArticlesPanel } from '@/features/catalyst/components/agent-page/articles/ArticlesPanel'
import { useBoardTab } from '@/features/catalyst/components/agent-page/BoardTabContext'
import {
  BoardTabs,
  boardPanelId,
  type BoardBadges,
  type BoardTab,
} from '@/features/catalyst/components/agent-page/BoardTabs'
import { GuestPostsPanel } from '@/features/catalyst/components/agent-page/guest-posts/GuestPostsPanel'
import { IndexingPanel } from '@/features/catalyst/components/agent-page/indexing/IndexingPanel'
import { SocialPanel } from '@/features/catalyst/components/agent-page/social/SocialPanel'
import { isSatelliteDraft } from '@/features/catalyst/satellite-topics'
import { useAgentApprovals, type AgentApprovals } from '@/hooks/useAgentApprovals'
import { useGuestPosts } from '@/hooks/useGuestPosts'
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
  if (tab === 'guest') return 'Guest posts'
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

function boardBadges(approvals: AgentApprovals, guestToPitch: number): BoardBadges {
  const waitingSocial = approvals.pending.filter(
    a => a.kind === 'publish_social_post' && a.state === 'awaiting_approval',
  )
  return {
    awaiting: awaitingCount(approvals.pending),
    outcomeUnknown: unknownCount(approvals.results) > 0,
    articles: approvals.pending.filter(isSatelliteDraft).length,
    social: waitingSocial.length,
    guest: guestToPitch,
  }
}

/**
 * The whiter board beside the chat: a live view of what the agent is doing,
 * and the drafts waiting for the owner's approval.
 */
export function AgentCanvas({ orgSlug, thinking, lastTools }: AgentCanvasProps): JSX.Element {
  const { tab, setTab } = useBoardTab()
  const approvals = useAgentApprovals(orgSlug)
  const guest = useGuestPosts(orgSlug)
  const toPitch = guest.report?.sites.filter(s => s.stage === 'to_pitch').length ?? 0
  const badges = boardBadges(approvals, toPitch)
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
        {tab === 'activity' && (
          <>
            <AgentActivityFeed thinking={thinking} lastTools={lastTools} />
            <AgentLog orgSlug={orgSlug} />
          </>
        )}
        {tab === 'articles' && <ArticlesPanel orgSlug={orgSlug} approvals={approvals} />}
        {tab === 'guest' && <GuestPostsPanel orgSlug={orgSlug} />}
        {tab === 'social' && <SocialPanel orgSlug={orgSlug} approvals={approvals} />}
        {tab === 'approvals' && <AgentApprovalsPanel orgSlug={orgSlug} approvals={approvals} />}
        {tab === 'indexing' && <IndexingPanel orgSlug={orgSlug} />}
      </div>
    </section>
  )
}
