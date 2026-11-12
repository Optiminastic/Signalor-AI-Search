'use client'

import { useState } from 'react'

import { ActionReviewView } from '@/features/catalyst/components/agent-page/approvals/ActionReviewView'
import { ApprovalListView } from '@/features/catalyst/components/agent-page/approvals/ApprovalListView'
import { useAgentAction } from '@/hooks/useAgentAction'
import { useTaskContact } from '@/hooks/useAgentActivity'
import type { AgentApprovals } from '@/hooks/useAgentApprovals'

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
    <ApprovalListView
      data={approvals}
      onOpen={setOpenId}
      onReload={approvals.refresh}
      contact={{ orgSlug, busyTaskId: contact.pendingTaskId, onAnswer: contact.answer }}
    />
  )
}
