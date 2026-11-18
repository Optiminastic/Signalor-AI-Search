'use client'

import { useMutation } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  MUTED_TEXT,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import { ApprovalRow } from '@/features/catalyst/components/agent-page/approvals/ApprovalRow'
import { ReadyPostRow } from '@/features/catalyst/components/agent-page/social/ReadyPostRow'
import type { AgentApprovals } from '@/hooks/useAgentApprovals'
import type { AgentAction } from '@/lib/api/agent-mode-approvals'
import { markSocialPostPosted } from '@/lib/api/agent-mode-social-posts'

interface SocialPostsProps {
  orgSlug: string
  approvals: AgentApprovals
  onOpen: (actionId: string) => void
}

export function isSocialPost(action: AgentAction): boolean {
  return action.kind === 'publish_social_post'
}

function Drafts({
  drafts,
  onOpen,
}: {
  drafts: AgentAction[]
  onOpen: (id: string) => void
}): JSX.Element {
  return (
    <section aria-label="Post drafts to review">
      <h3 className={SECTION_TITLE}>Post drafts to review</h3>
      {drafts.length === 0 ? (
        <p className={`mt-2 ${MUTED_TEXT}`}>
          No post is waiting. Each week the agent drafts one post per platform you&apos;re on.
        </p>
      ) : (
        <ul className="-mx-2 mt-1">
          {drafts.map(action => (
            <ApprovalRow
              key={action.id}
              row={{ ...action, title: action.task.title, note: 'Open to read, edit or approve' }}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

interface ReadySectionProps {
  ready: AgentAction[]
  busyId: string | null
  onPosted: (actionId: string) => void
}

function ReadySection({ ready, busyId, onPosted }: ReadySectionProps): JSX.Element | null {
  if (ready.length === 0) return null
  return (
    <section aria-label="Approved, ready to post" className="flex flex-col gap-2">
      <h3 className={SECTION_TITLE}>Approved, ready to post</h3>
      <p className={MUTED_TEXT}>
        Without Buffer, copy each post, publish it yourself, then mark it posted. With Buffer
        connected (the + next to the chat box), approved posts go to your Buffer queue
        automatically.
      </p>
      <ul className="flex flex-col gap-2">
        {ready.map(action =>
          action.content?.type === 'social' ? (
            <ReadyPostRow
              key={action.id}
              action={action}
              post={action.content}
              busy={busyId === action.id}
              onPosted={onPosted}
            />
          ) : null,
        )}
      </ul>
    </section>
  )
}

/** Weekly post drafts to review, and approved posts ready to publish by hand until Buffer is connected. */
export function SocialPosts({ orgSlug, approvals, onOpen }: SocialPostsProps): JSX.Element {
  const posted = useMutation({
    mutationFn: (actionId: string) => markSocialPostPosted(orgSlug, actionId),
    retry: false,
    onSettled: () => approvals.refresh(),
  })
  const social = approvals.pending.filter(isSocialPost)
  const ready = social.filter(a => a.state === 'approved')
  return (
    <div className="flex flex-col gap-4">
      <Drafts drafts={social.filter(a => a.state === 'awaiting_approval')} onOpen={onOpen} />
      <ReadySection
        ready={ready}
        busyId={posted.isPending ? (posted.variables ?? null) : null}
        onPosted={id => posted.mutate(id)}
      />
      {posted.error && (
        <p role="alert" className="text-[12px] text-[#e04a3d]">
          {loadErrorMessage(posted.error)}
        </p>
      )}
    </div>
  )
}
