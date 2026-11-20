import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CompetitorSocial } from '@/features/catalyst/components/agent-page/social/CompetitorSocial'
import type { SocialPlatform } from '@/lib/api/agent-mode-social'

function platform(url: string): SocialPlatform {
  return { score: 0, parts: {}, notMeasured: [], found: Boolean(url), url, source: 'search' }
}

const LABELS = { linkedin: 'LinkedIn', x: 'X', youtube: 'YouTube', instagram: 'Instagram' }

describe('CompetitorSocial', () => {
  it('shows the brand and each competitor, with a link where they have a profile', () => {
    const html = renderToStaticMarkup(
      <CompetitorSocial
        labels={LABELS}
        platforms={{ linkedin: platform('https://linkedin.com/company/brand') }}
        competitors={[
          { name: 'Rival Co', domain: 'rivalco.com', profiles: { x: 'https://x.com/rivalco' } },
        ]}
      />,
    )
    expect(html).toContain('You vs competitors on social')
    expect(html).toContain('>You<')
    expect(html).toContain('Rival Co')
    expect(html).toContain('href="https://linkedin.com/company/brand"')
    expect(html).toContain('href="https://x.com/rivalco"')
  })

  it('renders nothing before competitors are known', () => {
    const html = renderToStaticMarkup(
      <CompetitorSocial labels={LABELS} platforms={{}} competitors={[]} />,
    )
    expect(html).toBe('')
  })
})
