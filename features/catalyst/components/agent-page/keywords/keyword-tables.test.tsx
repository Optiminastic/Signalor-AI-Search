import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  BrandList,
  GapList,
} from '@/features/catalyst/components/agent-page/keywords/KeywordTables'

describe('keyword tables', () => {
  it('shows each gap with its search demand, who ranks, and whether it is new', () => {
    const html = renderToStaticMarkup(
      <GapList
        gaps={[
          {
            keyword: 'geo audit',
            searchVolume: 1300,
            rivals: [{ name: 'Acme', domain: 'acme.io', position: 2 }],
            isNew: true,
          },
        ]}
      />,
    )
    expect(html).toContain('geo audit')
    expect(html).toContain('acme.io #2')
    expect(html).toContain('New')
  })

  it('shows the brand keywords with position', () => {
    const html = renderToStaticMarkup(
      <BrandList
        keywords={[{ keyword: 'ai visibility', position: 4, searchVolume: 0, url: '' }]}
      />,
    )
    expect(html).toContain('ai visibility')
    expect(html).toContain('#4')
  })
})
