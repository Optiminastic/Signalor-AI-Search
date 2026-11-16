'use client'

import { useEffect } from 'react'

import {
  clearBufferReturn,
  readBufferReturn,
  type BufferReturn,
} from '@/features/catalyst/components/agent-page/social/buffer-return'

/**
 * Back from Buffer's sign-in page: hand the outcome to ``onReturn`` once.
 * ``clear`` also removes it from the address bar (only the component that
 * shows the notice should, so others can still read it first).
 */
export function useBufferReturn(onReturn: (outcome: BufferReturn) => void, clear = false): void {
  useEffect(() => {
    const outcome = readBufferReturn(window.location.search)
    if (!outcome) return
    onReturn(outcome)
    if (clear) clearBufferReturn()
  }, [onReturn, clear])
}
