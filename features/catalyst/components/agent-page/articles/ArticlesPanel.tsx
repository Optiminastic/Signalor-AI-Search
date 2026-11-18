'use client'

import { useState } from 'react'

import { ActionReview } from '@/features/catalyst/components/agent-page/approvals/ActionReview'
import { SatelliteTopicList } from '@/features/catalyst/components/agent-page/approvals/SatelliteTopicList'
import { ArticleDrafts } from '@/features/catalyst/components/agent-page/articles/ArticleDrafts'
import { SatelliteArticlesCard } from '@/features/catalyst/components/agent-page/indexing/SatelliteArticlesCard'
import { isSatelliteDraft } from '@/features/catalyst/satellite-topics'
import type { AgentApprovals } from '@/hooks/useAgentApprovals'
import { useSatelliteTopics } from '@/hooks/useSatelliteTopics'

interface ArticlesPanelProps {
  orgSlug: string
  approvals: AgentApprovals
}

const INTRO =
  'Articles about your topics on signalor.ai’s own sites, each mentioning you with a sponsored link. ' +
  'Nothing is published until you approve the draft.'

function PlannedTopics({ orgSlug }: { orgSlug: string }): JSX.Element {
  const satellite = useSatelliteTopics(orgSlug)
  return (
    <>
      <SatelliteTopicList
        topics={satellite.topics}
        busyTaskId={satellite.busyTaskId}
        onChange={satellite.setStatus}
      />
      {satellite.error && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {satellite.error}
        </p>
      )}
    </>
  )
}

/** The Articles tab: drafts to review, the month's planned topics, and published articles. */
export function ArticlesPanel({ orgSlug, approvals }: ArticlesPanelProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)
  if (openId) {
    const back = (): void => {
      setOpenId(null)
      approvals.refresh()
    }
    return <ActionReview key={openId} orgSlug={orgSlug} actionId={openId} onBack={back} />
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-[12.5px] text-[var(--cat-ink-2)]">{INTRO}</p>
      <ArticleDrafts drafts={approvals.pending.filter(isSatelliteDraft)} onOpen={setOpenId} />
      <PlannedTopics orgSlug={orgSlug} />
      <SatelliteArticlesCard orgSlug={orgSlug} />
    </div>
  )
}
