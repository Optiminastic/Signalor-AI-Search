'use client'

import { useState } from 'react'

import { ActionReview } from '@/features/catalyst/components/agent-page/approvals/ActionReview'
import { ApprovalListView } from '@/features/catalyst/components/agent-page/approvals/ApprovalListView'
import { useTaskContact } from '@/hooks/useAgentActivity'
import type { AgentApprovals } from '@/hooks/useAgentApprovals'

interface AgentApprovalsPanelProps {
  orgSlug: string
  approvals: AgentApprovals
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
