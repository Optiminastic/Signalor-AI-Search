'use client'

import { useEffect, useRef, useState } from 'react'

import { ScoreCelebration } from '@/features/catalyst/components/cards/ScoreCelebration'

interface AnimatedScoreProps {
  value: number | undefined
}

const TWEEN_MS = 800
const CELEBRATE_MS = 1800

/** Tween the displayed integer from its current value to `target` (easeOutCubic). */
function useCountUp(target: number): number {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    let raf = 0
    let startTs = 0
    const step = (ts: number): void => {
      if (!startTs) startTs = ts
      const t = Math.min(1, (ts - startTs) / TWEEN_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(step)
      else fromRef.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return display
}

/**
 * The GEO score number, animated: it counts up/down to each new value and, when
 * the score *increases*, plays a celebratory burst with a floating "+N".
 */
export function AnimatedScore({ value }: AnimatedScoreProps): JSX.Element {
  const display = useCountUp(value ?? 0)
  const [celebrateDelta, setCelebrateDelta] = useState(0)
  const prevRef = useRef<number | undefined>(undefined)
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (value === undefined) return
    const prev = prevRef.current
    prevRef.current = value
    if (prev === undefined || value <= prev) return
    setCelebrateDelta(value - prev)
    numRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }],
      { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
    const timer = window.setTimeout(() => setCelebrateDelta(0), CELEBRATE_MS)
    return () => window.clearTimeout(timer)
  }, [value])

  return (
    <span className="relative inline-flex">
      <span
        ref={numRef}
        className="inline-block origin-center text-[26px] font-bold tracking-tight text-[var(--cat-ink)]"
      >
        {value === undefined ? '-' : display}
      </span>
      {celebrateDelta > 0 && <ScoreCelebration delta={celebrateDelta} />}
    </span>
  )
}
