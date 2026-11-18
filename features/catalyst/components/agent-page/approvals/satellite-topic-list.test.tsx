import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SatelliteTopicList } from '@/features/catalyst/components/agent-page/approvals/SatelliteTopicList'
import type { SatelliteTopic } from '@/features/catalyst/satellite-topics'

const noop = (): void => {}

const TOPIC: SatelliteTopic = {
  taskId: 1,
  topic: 'ahrefs vs semrush',
  scheduledFor: '2026-11-19',
  site: {
    value: 'comparison',
    label: 'Comparison',
    color: '#0a0',
    initial: 'C',
    domain: 'betterversus.com',
  },
  siteDomain: 'betterversus.com',
  skipped: false,
  editable: true,
}

describe('SatelliteTopicList', () => {
  it('lists each planned article with its site and a Skip button', () => {
    const html = renderToStaticMarkup(
      <SatelliteTopicList topics={[TOPIC]} busyTaskId={null} onChange={noop} />,
    )
    expect(html).toContain('Articles on signalor.ai sites this month')
    expect(html).toContain('ahrefs vs semrush')
    expect(html).toContain('betterversus.com')
    expect(html).toContain('Skip')
    expect(html).toContain('1 of 1 planned')
  })

  it('offers Restore for a skipped topic and no button once work has started', () => {
    const html = renderToStaticMarkup(
      <SatelliteTopicList
        topics={[
          { ...TOPIC, skipped: true },
          { ...TOPIC, taskId: 2, editable: false },
        ]}
        busyTaskId={null}
        onChange={noop}
      />,
    )
    expect(html).toContain('Restore')
    expect(html.match(/<button/g)?.length).toBe(1)
  })

  it('renders nothing when there are no satellite topics', () => {
    expect(
      renderToStaticMarkup(<SatelliteTopicList topics={[]} busyTaskId={null} onChange={noop} />),
    ).toBe('')
  })
})
