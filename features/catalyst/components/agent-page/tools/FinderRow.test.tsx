import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { readFinderReturn } from '@/features/catalyst/components/agent-page/tools/finder-return'
import { FinderRow } from '@/features/catalyst/components/agent-page/tools/FinderRow'
import type { ContactFinder } from '@/lib/api/agent-mode-finders'

const noop = (): void => {}

function render(finder: ContactFinder, error: string | null = null): string {
  return renderToStaticMarkup(
    <FinderRow
      finder={finder}
      busy={false}
      error={error}
      onSignIn={noop}
      onConnect={noop}
      onDisconnect={noop}
    />,
  )
}

const BASE: ContactFinder = {
  provider: 'hunter',
  label: 'Hunter',
  connected: false,
  method: '',
  keyHint: '',
  source: 'none',
}

describe('FinderRow', () => {
  it('offers sign-in first, with an API key only on request', () => {
    const html = render(BASE)
    expect(html).toContain('Sign in with Hunter')
    expect(html).toContain('Use an API key instead')
    expect(html).not.toContain('type="password"')
    expect(html).not.toContain('<form')
  })

  it('says a signed-in account is connected, without any key', () => {
    const html = render({ ...BASE, connected: true, method: 'oauth', source: 'account' })
    expect(html).toContain('Connected · signed in')
    expect(html).not.toContain('••••')
    expect(html).toContain('Disconnect')
  })

  it('shows only the last four characters of a pasted key', () => {
    const html = render({ ...BASE, connected: true, method: 'api_key', keyHint: 'abcd' })
    expect(html).toContain('••••abcd')
  })

  it("says when Signalor's shared account is in use", () => {
    expect(render({ ...BASE, source: 'signalor' })).toContain('Signalor&#x27;s shared account')
  })

  it('shows why something failed', () => {
    expect(render(BASE, 'Hunter sign-in is unavailable right now.')).toContain('role="alert"')
  })
})

describe('readFinderReturn', () => {
  it('reads a successful sign-in and a failed one from the query string', () => {
    expect(readFinderReturn('?finder_connected=apollo')).toEqual({
      ok: true,
      message: 'Apollo is connected.',
    })
    expect(readFinderReturn('?finder_error=denied')?.ok).toBe(false)
    expect(readFinderReturn('?finder_error=something_new')?.message).toContain('try again')
  })

  it('ignores pages that are not a sign-in return', () => {
    expect(readFinderReturn('?tab=activity')).toBeNull()
    expect(readFinderReturn('')).toBeNull()
  })
})
