'use client'

import { useState } from 'react'

import { EditField } from '@/features/catalyst/components/agent-page/approvals/EditField'
import type { SocialContent } from '@/lib/api/agent-mode-social-posts'

/** The longest platform limit (Instagram); the backend flags posts too long for shorter ones. */
const TEXT_MAX = 2200
const PLATFORM_LIMITS: Record<string, number> = { x: 280, linkedin: 1300, instagram: 2200 }

interface SocialEditFormProps {
  post: SocialContent
  /** Called whenever the text changes, with the full set of edited fields. */
  onFields: (fields: Record<string, string>) => void
}

/** The post text is the only thing to edit; the platform and profile are fixed. */
export function SocialEditForm({ post, onFields }: SocialEditFormProps): JSX.Element {
  const [text, setText] = useState(post.text)
  const limit = PLATFORM_LIMITS[post.platform] ?? TEXT_MAX
  return (
    <div className="flex flex-col gap-1">
      <EditField
        label={`Post on ${post.platformLabel}`}
        value={text}
        rows={8}
        maxLength={TEXT_MAX}
        onChange={value => {
          setText(value)
          onFields({ text: value })
        }}
      />
      <p
        className={`text-[11.5px] ${text.length > limit ? 'text-primary-ink' : 'text-[var(--cat-ink-3)]'}`}
      >
        {text.length} / {limit} characters
      </p>
    </div>
  )
}
