import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ArticleDrafts } from '@/features/catalyst/components/agent-page/articles/ArticleDrafts'
import { BoardTabs } from '@/features/catalyst/components/agent-page/BoardTabs'
import { isSatelliteDraft } from '@/features/catalyst/satellite-topics'

const noop = (): void => {}

describe('Articles tab', () => {
  it('picks out satellite drafts only', () => {
    expect(isSatelliteDraft({ connector: 'satellite' })).toBe(true)
    expect(isSatelliteDraft({ connector: 'gmail' })).toBe(false)
  })

  it('says what happens when no article is waiting yet', () => {
    const html = renderToStaticMarkup(<ArticleDrafts drafts={[]} onOpen={noop} />)
    expect(html).toContain('Drafts to review')
    expect(html).toContain('No article is waiting')
  })

  it('has its own tab, with a count while article drafts wait for review', () => {
    const badges = { awaiting: 3, outcomeUnknown: false, articles: 1 }
    const html = renderToStaticMarkup(
      <BoardTabs value="articles" onChange={noop} badges={badges} />,
    )
    expect(html).toMatch(/aria-selected="true"[^>]*>Articles/)
    expect(html).toContain('1 article drafts to review')
    const none = renderToStaticMarkup(
      <BoardTabs value="activity" onChange={noop} badges={{ ...badges, articles: 0 }} />,
    )
    expect(none).not.toContain('article drafts to review')
  })
})
