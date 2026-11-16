import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ActionContentView } from '@/features/catalyst/components/agent-page/approvals/ActionContentView'
import { ReadyPostRow } from '@/features/catalyst/components/agent-page/social/ReadyPostRow'
import { isSocialPost } from '@/features/catalyst/components/agent-page/social/SocialPosts'
import type { AgentAction } from '@/lib/api/agent-mode-approvals'
import type { SocialContent } from '@/lib/api/agent-mode-social-posts'

const noop = (): void => {}

const POST: SocialContent = {
  type: 'social',
  platform: 'linkedin',
  platformLabel: 'LinkedIn',
  text: 'AI answers cite clear pages.',
  profileUrl: 'https://www.linkedin.com/company/brand/',
  reviewNotes: [],
}

describe('social posts', () => {
  it('shows a post draft exactly as it will be published', () => {
    const html = renderToStaticMarkup(<ActionContentView content={POST} />)
    expect(html).toContain('LinkedIn')
    expect(html).toContain('AI answers cite clear pages.')
    expect(html).toContain('28 characters')
  })

  it('offers Copy, the profile link and I posted it for an approved post', () => {
    const action = { id: 'a1', kind: 'publish_social_post', state: 'approved' } as AgentAction
    const html = renderToStaticMarkup(
      <ReadyPostRow action={action} post={POST} busy={false} onPosted={noop} />,
    )
    expect(html).toContain('Copy')
    expect(html).toContain('href="https://www.linkedin.com/company/brand/"')
    expect(html).toContain('I posted it')
    expect(isSocialPost(action)).toBe(true)
  })
})
