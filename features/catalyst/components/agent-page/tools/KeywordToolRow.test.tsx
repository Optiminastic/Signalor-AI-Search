import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { KeywordToolRow } from '@/features/catalyst/components/agent-page/tools/KeywordToolRow'
import type { KeywordTool } from '@/lib/api/agent-mode-keyword-tools'

vi.mock('next/image', () => ({ default: () => null }))

function tool(overrides: Partial<KeywordTool>): KeywordTool {
  return {
    provider: 'semrush',
    label: 'Semrush',
    kind: 'api_key',
    connected: false,
    inUse: false,
    keyHint: '',
    ...overrides,
  }
}

function render(t: KeywordTool): string {
  return renderToStaticMarkup(
    <KeywordToolRow
      orgSlug="brand"
      tool={t}
      busy={false}
      error={null}
      onConnect={vi.fn()}
      onDisconnect={vi.fn()}
    />,
  )
}

describe('KeywordToolRow', () => {
  it('built-in data shows as included and in use', () => {
    const html = render(
      tool({
        provider: 'signalor',
        label: 'Signalor keyword data',
        kind: 'built_in',
        connected: true,
        inUse: true,
      }),
    )
    expect(html).toContain('Included')
    expect(html).toContain('In use')
  })

  it('a key tool that is not connected offers to add a key', () => {
    expect(render(tool({}))).toContain('Add API key')
  })

  it('a connected key tool shows only the last four characters and can disconnect', () => {
    const html = render(tool({ connected: true, inUse: true, keyHint: '1234' }))
    expect(html).toContain('••1234')
    expect(html).toContain('Disconnect')
  })

  it('Search Console links to the integrations page when not connected', () => {
    const html = render(
      tool({ provider: 'search_console', label: 'Google Search Console', kind: 'elsewhere' }),
    )
    expect(html).toContain('/dashboard/brand/integrations')
  })
})
