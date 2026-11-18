'use client'

import { useEffect, useState } from 'react'

/** Target duration for typing out a whole reply, whatever its length. */
const TYPE_DURATION_MS = 1800
const MIN_CHARS_PER_FRAME = 2
const FRAMES_PER_SECOND = 60

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Reveals `text` progressively, like a reply being written. Returns the visible
 * part and whether typing is still going. When `enabled` is false (e.g. history
 * loaded from the server) or the viewer prefers reduced motion, the full text
 * shows at once.
 */
export function useTypewriter(
  text: string,
  enabled: boolean,
): { visible: string; typing: boolean } {
  const [shown, setShown] = useState(enabled ? 0 : text.length)

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setShown(text.length)
      return
    }
    const frames = (TYPE_DURATION_MS / 1000) * FRAMES_PER_SECOND
    const step = Math.max(MIN_CHARS_PER_FRAME, Math.ceil(text.length / frames))
    let count = 0
    let frame = 0
    const tick = (): void => {
      count = Math.min(text.length, count + step)
      setShown(count)
      if (count < text.length) frame = requestAnimationFrame(tick)
    }
    setShown(0)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, enabled])

  return { visible: text.slice(0, shown), typing: shown < text.length }
}
