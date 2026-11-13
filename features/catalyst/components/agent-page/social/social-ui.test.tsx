import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PlatformRow } from '@/features/catalyst/components/agent-page/social/PlatformRow'

describe('Social tab', () => {
  it('shows a platform score, its profile, and which parts are not measured', () => {
    const html = renderToStaticMarkup(
      <PlatformRow
        label="LinkedIn"
        platform={{
          score: 20,
          parts: { presence: 20 },
          notMeasured: ['audience', 'activity', 'engagement'],
          found: true,
          url: 'https://www.linkedin.com/company/brand/',
          source: 'website',
        }}
      />,
    )
    expect(html).toContain('LinkedIn')
    expect(html).toContain('linkedin.com/company/brand/')
    expect(html).toContain('Presence 20/20')
    expect(html).toContain('Audience not measured')
    expect(html).toContain('20%')
  })

  it('says when no profile was found', () => {
    const html = renderToStaticMarkup(
      <PlatformRow
        label="Instagram"
        platform={{
          score: 0,
          parts: { presence: 0 },
          notMeasured: [],
          found: false,
          url: '',
          source: 'none',
        }}
      />,
    )
    expect(html).toContain('No profile found')
  })
})
