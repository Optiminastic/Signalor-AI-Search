import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { IndexingSetup } from '@/features/catalyst/components/agent-page/indexing/IndexingSetup'
import { IndexingSummary } from '@/features/catalyst/components/agent-page/indexing/IndexingSummary'
import { ReasonList } from '@/features/catalyst/components/agent-page/indexing/ReasonList'
import { RequestIndexingList } from '@/features/catalyst/components/agent-page/indexing/RequestIndexingList'
import type { IndexingReport } from '@/lib/api/agent-mode-indexing'

const noop = (): void => {}

const REPORT: IndexingReport = {
  status: 'ready',
  property: 'sc-domain:brand.com',
  checkedAt: '2026-11-13T09:00:00Z',
  checked: 52,
  indexed: 41,
  notIndexed: 11,
  reasons: [],
  indexedChange: 3,
  newlyIndexed: [],
  dropped: [],
  toRequest: [],
  requested: [],
}

describe('indexing tab', () => {
  it('links to Integrations until Search Console is connected', () => {
    const html = renderToStaticMarkup(<IndexingSetup orgSlug="brand" status="not_connected" />)
    expect(html).toContain('Connect Search Console')
    expect(html).toContain('href="/dashboard/brand/integrations"')
  })

  it('shows how many pages are on Google, the weekly change, and Check now', () => {
    const html = renderToStaticMarkup(
      <IndexingSummary report={REPORT} checking={false} onCheckNow={noop} />,
    )
    expect(html).toContain('41')
    expect(html).toContain('of 52')
    expect(html).toContain('+3 since last week')
    expect(html).toContain('79%')
    expect(html).toContain('Check now')
  })

  it('disables Check now while a check is running', () => {
    const html = renderToStaticMarkup(
      <IndexingSummary
        report={{ ...REPORT, status: 'checking' }}
        checking={false}
        onCheckNow={noop}
      />,
    )
    expect(html).toContain('Checking every page now')
    expect(html).toMatch(/<button[^>]*disabled/)
  })

  it('says who can act on each reason, with sample pages', () => {
    const html = renderToStaticMarkup(
      <ReasonList
        reasons={[
          {
            key: 'noindex',
            label: 'Blocked by a noindex tag',
            explanation: 'Remove the noindex tag.',
            fixable: true,
            count: 7,
            urls: ['https://brand.com/a'],
          },
          {
            key: 'crawled_not_indexed',
            label: 'Crawled, not indexed yet',
            explanation: 'Google chose not to index it yet.',
            fixable: false,
            count: 4,
            urls: [],
          },
        ]}
      />,
    )
    expect(html).toContain('Fixable on your site')
    expect(html).toContain('Google decides')
    expect(html).toContain('and 6 more')
  })

  it('links each page to Search Console in a new tab and lists what was requested', () => {
    const html = renderToStaticMarkup(
      <RequestIndexingList
        toRequest={[
          {
            url: 'https://brand.com/found',
            reason: 'Found, not crawled yet',
            inspectUrl: 'https://search.google.com/search-console/inspect?resource_id=x&id=y',
            requestedAt: null,
          },
        ]}
        requested={[
          {
            url: 'https://brand.com/old',
            reason: 'Crawled, not indexed yet',
            inspectUrl: 'https://search.google.com/search-console/inspect?resource_id=x&id=z',
            requestedAt: '2026-11-12T09:00:00Z',
          },
        ]}
        onOpened={noop}
      />,
    )
    expect(html).toContain(
      'href="https://search.google.com/search-console/inspect?resource_id=x&amp;id=y"',
    )
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('Request indexing')
    expect(html).toContain('https://brand.com/old')
  })
})
