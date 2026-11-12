import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FinderRow } from '@/features/catalyst/components/agent-page/tools/FinderRow'
import type { ContactFinder } from '@/lib/api/agent-mode-finders'

const noop = (): void => {}

function render(finder: ContactFinder, error: string | null = null): string {
  return renderToStaticMarkup(
    <FinderRow finder={finder} busy={false} error={error} onConnect={noop} onDisconnect={noop} />,
  )
}

const BASE: ContactFinder = {
  provider: 'hunter',
  label: 'Hunter',
  connected: false,
  keyHint: '',
  source: 'none',
}

describe('FinderRow', () => {
  it('asks for a key, in a password field, when not connected', () => {
    const html = render(BASE)
    expect(html).toContain('type="password"')
    expect(html).toContain('Connect')
    expect(html).not.toContain('<form')
  })

  it('shows only the last four characters once connected', () => {
    const html = render({ ...BASE, connected: true, keyHint: 'abcd', source: 'account' })
    expect(html).toContain('••••abcd')
    expect(html).toContain('Disconnect')
    expect(html).not.toContain('type="password"')
  })

  it("says when Signalor's shared key is in use", () => {
    expect(render({ ...BASE, source: 'signalor' })).toContain('Signalor&#x27;s shared key')
  })

  it('shows why a key was refused', () => {
    expect(render(BASE, "Hunter didn't accept this API key.")).toContain('role="alert"')
  })
})
