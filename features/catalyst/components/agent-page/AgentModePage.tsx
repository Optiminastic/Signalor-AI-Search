'use client'

import { AgentIntro } from '@/features/catalyst/components/agent-page/AgentIntro'
import { AgentWorkspace } from '@/features/catalyst/components/agent-page/AgentWorkspace'
import { DataState } from '@/features/catalyst/components/DataState'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAgentIntroSeen } from '@/hooks/useAgentIntroSeen'

/**
 * Full-page SignalorAI Agent for the brand in the URL. The first visit in a
 * browser plays the intro; after that it opens straight on the chat.
 */
export function AgentModePage(): JSX.Element | null {
  const { orgSlug, activeOrg, isLoading } = useActiveProject()
  const { seen, markSeen, replay } = useAgentIntroSeen()
  const brandName = activeOrg?.name ?? 'your brand'

  if (seen === 'unknown') return null
  if (seen === 'unseen') return <AgentIntro brandName={brandName} onDone={markSeen} />

  return (
    <DataState
      isLoading={isLoading}
      isEmpty={!orgSlug}
      emptyTitle="Open a brand first"
      emptyHint="The agent works on one brand at a time."
    >
      {orgSlug && <AgentWorkspace orgSlug={orgSlug} brandName={brandName} onReplayIntro={replay} />}
    </DataState>
  )
}
