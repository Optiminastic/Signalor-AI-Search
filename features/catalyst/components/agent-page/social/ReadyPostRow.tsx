'use client'

import { useState } from 'react'

import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { AgentAction } from '@/lib/api/agent-mode-approvals'
import type { SocialContent } from '@/lib/api/agent-mode-social-posts'

interface ReadyPostRowProps {
  action: AgentAction
  post: SocialContent
  busy: boolean
  onPosted: (actionId: string) => void
}

const COPIED_MS = 2000

/** An approved post waiting for Buffer: copy it, post it yourself, then mark it posted. */
export function ReadyPostRow({ action, post, busy, onPosted }: ReadyPostRowProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const copy = (): void => {
    void navigator.clipboard.writeText(post.text).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    })
  }
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] p-3">
      <span className="text-[12px] font-medium text-[var(--cat-ink)]">{post.platformLabel}</span>
      <p className="line-clamp-4 text-[12.5px] whitespace-pre-line text-[var(--cat-ink-2)]">
        {post.text}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={copy} className={SECONDARY_BUTTON}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        {post.profileUrl && (
          <a
            href={post.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={SECONDARY_BUTTON}
          >
            Open {post.platformLabel}
          </a>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onPosted(action.id)}
          className={SECONDARY_BUTTON}
        >
          {busy ? 'Saving…' : 'I posted it'}
        </button>
      </div>
    </li>
  )
}
