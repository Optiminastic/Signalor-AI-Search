import { describe, expect, it } from 'vitest'

import { readBufferReturn } from '@/features/catalyst/components/agent-page/social/buffer-return'
import { channelsText } from '@/features/catalyst/components/agent-page/tools/BufferRow'
import type { BufferStatus } from '@/lib/api/agent-mode-social'

describe('Connect Buffer', () => {
  it('names the connected channels once, in plain words', () => {
    const buffer: BufferStatus = {
      connected: true,
      channels: [
        { service: 'linkedin', name: 'Brand' },
        { service: 'twitter', name: '@brand' },
        { service: 'twitter', name: '@brand2' },
      ],
    }
    expect(channelsText(buffer)).toBe('LinkedIn, X')
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
