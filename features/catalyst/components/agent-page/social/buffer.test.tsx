import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { readBufferReturn } from '@/features/catalyst/components/agent-page/social/buffer-return'
import { BufferCard } from '@/features/catalyst/components/agent-page/social/BufferCard'
import type { BufferStatus } from '@/lib/api/agent-mode-social'

function render(buffer: BufferStatus): string {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <BufferCard orgSlug="brand" buffer={buffer} />
    </QueryClientProvider>,
  )
}

describe('Connect Buffer', () => {
  it('offers to connect Buffer with its logo when not connected', () => {
    const html = render({ connected: false, channels: [] })
    expect(html).toContain('Connect Buffer')
    expect(html).toContain('%2Flogos%2Fbuffer.png')
  })

  it('shows the connected channels and Disconnect once connected', () => {
    const html = render({
      connected: true,
      channels: [
        { service: 'linkedin', name: 'Brand' },
        { service: 'twitter', name: '@brand' },
      ],
    })
    expect(html).toContain('Channels: LinkedIn, X')
    expect(html).toContain('Disconnect')
  })

  it('reads how the Buffer sign-in went from the return address', () => {
    expect(readBufferReturn('?buffer_connected=buffer')).toEqual({
      ok: true,
      message: 'Buffer is connected.',
    })
    expect(readBufferReturn('?buffer_error=denied')?.ok).toBe(false)
    expect(readBufferReturn('?finder_connected=hunter')).toBeNull()
  })
})
