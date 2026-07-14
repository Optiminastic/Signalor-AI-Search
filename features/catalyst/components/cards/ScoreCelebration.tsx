'use client'

import { useEffect, useRef } from 'react'

import { BLUE, BRAND, GREEN, PURPLE, YELLOW } from '@/features/catalyst/constants'

interface ScoreCelebrationProps {
  delta: number
}

const COLORS = [BRAND, GREEN, YELLOW, BLUE, PURPLE]
const PARTICLES = 16

/** Burst each particle outward on a fixed radial spoke, then shrink + fade. */
function burst(el: HTMLElement, index: number): void {
  const angle = (index / PARTICLES) * Math.PI * 2 + (index % 2 ? 0.35 : -0.25)
  const dist = 26 + (index % 4) * 9
  const x = Math.cos(angle)
  const y = Math.sin(angle)
  el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
      {
        transform: `translate(calc(-50% + ${x * dist}px), calc(-50% + ${y * dist}px)) scale(1)`,
        opacity: 1,
        offset: 0.7,
      },
      {
        transform: `translate(calc(-50% + ${x * (dist + 12)}px), calc(-50% + ${y * (dist + 12)}px)) scale(0.2)`,
        opacity: 0,
      },
    ],
    { duration: 1100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
  )
}

/**
 * A one-shot celebration when the score increases: a green glow pulse, a
 * multi-colour confetti burst and a floating "+N" badge. Driven by the Web
 * Animations API so it needs no global keyframes and cleans itself up.
 */
/** Fire the burst, glow-pulse and floating "+N" animations off the overlay root. */
function play(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-particle]').forEach((el, i) => burst(el, i))
  root.querySelector<HTMLElement>('[data-glow]')?.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.8 },
      { transform: 'translate(-50%, -50%) scale(2.2)', opacity: 0 },
    ],
    { duration: 900, easing: 'ease-out', fill: 'forwards' },
  )
  root.querySelector<HTMLElement>('[data-plus]')?.animate(
    [
      { transform: 'translate(-50%, 4px)', opacity: 0 },
      { transform: 'translate(-50%, -6px)', opacity: 1, offset: 0.3 },
      { transform: 'translate(-50%, -26px)', opacity: 0 },
    ],
    { duration: 1400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
  )
}

export function ScoreCelebration({ delta }: ScoreCelebrationProps): JSX.Element {
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (rootRef.current) play(rootRef.current)
  }, [])

  return (
    <span ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <span
        data-glow
        className="absolute top-1/2 left-1/2 h-9 w-9 rounded-full"
        style={{ background: `radial-gradient(circle, ${GREEN}88, transparent 70%)` }}
      />
      {Array.from({ length: PARTICLES }, (_, i) => (
        <span
          key={i}
          data-particle
          className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-[1px]"
          style={{ background: COLORS[i % COLORS.length] }}
        />
      ))}
      <span
        data-plus
        className="absolute top-0 left-1/2 text-[13px] font-bold"
        style={{ color: GREEN }}
      >
        +{delta}
      </span>
    </span>
  )
}
