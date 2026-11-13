'use client'

import { useState } from 'react'

import { ActionReviewView } from '@/features/catalyst/components/agent-page/approvals/ActionReviewView'
import { ApprovalListView } from '@/features/catalyst/components/agent-page/approvals/ApprovalListView'
import { SatelliteTopicList } from '@/features/catalyst/components/agent-page/approvals/SatelliteTopicList'
import { useAgentAction } from '@/hooks/useAgentAction'
import { useTaskContact } from '@/hooks/useAgentActivity'
import type { AgentApprovals } from '@/hooks/useAgentApprovals'
import { useSatelliteTopics } from '@/hooks/useSatelliteTopics'

interface AgentApprovalsPanelProps {
  orgSlug: string
  approvals: AgentApprovals
}

interface ActionReviewProps {
  orgSlug: string
  actionId: string
  onBack: () => void
}

function ActionReview({ orgSlug, actionId, onBack }: ActionReviewProps): JSX.Element {
  const review = useAgentAction(orgSlug, actionId)
  return (
    <ActionReviewView
      review={review}
      onBack={onBack}
      onDecide={(verb, reason) => review.submit({ type: 'decide', verb }, reason)}
      onResolve={(resolution, reason) => review.submit({ type: 'resolve', resolution }, reason)}
      onEdit={fields => review.submit({ type: 'edit', fields })}
      onRefresh={review.refresh}
    />
  )
}

function SatelliteTopics({ orgSlug }: { orgSlug: string }): JSX.Element {
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

/** The Approvals tab: the list, or one action opened from it. */
export function AgentApprovalsPanel({ orgSlug, approvals }: AgentApprovalsPanelProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)
  const contact = useTaskContact(orgSlug)
  if (openId) {
    return (
      <ActionReview
        key={openId}
        orgSlug={orgSlug}
        actionId={openId}
        onBack={() => {
          setOpenId(null)
          approvals.refresh()
        }}
      />
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <ApprovalListView
        data={approvals}
        onOpen={setOpenId}
        onReload={approvals.refresh}
        contact={{ orgSlug, busyTaskId: contact.pendingTaskId, onAnswer: contact.answer }}
      />
      <SatelliteTopics orgSlug={orgSlug} />
    </div>
  )
}
