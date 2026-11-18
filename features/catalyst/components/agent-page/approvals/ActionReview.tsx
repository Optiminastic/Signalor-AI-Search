'use client'

import { ActionReviewView } from '@/features/catalyst/components/agent-page/approvals/ActionReviewView'
import { useAgentAction } from '@/hooks/useAgentAction'

interface ActionReviewProps {
  orgSlug: string
  actionId: string
  onBack: () => void
}

/** One draft opened for review: its exact content, edit, approve, reject or withdraw. */
export function ActionReview({ orgSlug, actionId, onBack }: ActionReviewProps): JSX.Element {
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
