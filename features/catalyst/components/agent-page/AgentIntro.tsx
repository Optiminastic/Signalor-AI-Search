'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'

import { SignalorMark } from '@/components/SignalorMark'
import { AgentIntroSteps } from '@/features/catalyst/components/agent-page/AgentIntroSteps'
import { playIntroSound, type IntroSound } from '@/lib/agent-intro-sound'

const HEADLINE = ['Meet', 'your', 'autonomous', 'GEO', 'agent']
const WORD_DELAYS = [
  '[animation-delay:1.3s]',
  '[animation-delay:1.42s]',
  '[animation-delay:1.54s]',
  '[animation-delay:1.66s]',
  '[animation-delay:1.78s]',
]
const FADE_OUT_AT_MS = 7400
const DONE_AT_MS = 7900
const GHOST_BUTTON =
  'inline-flex h-[34px] items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]'

interface AgentIntroProps {
  brandName: string
  onDone: () => void
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Plays the soundtrack and the timed sequence; ends early on Skip. */
function useIntroTimeline(
  onDone: () => void,
  reduced: boolean,
): { leaving: boolean; sound: RefObject<IntroSound | null> } {
  const [leaving, setLeaving] = useState(false)
  const sound = useRef<IntroSound | null>(null)
  useEffect(() => {
    if (reduced) return undefined
    sound.current = playIntroSound()
    const fade = setTimeout(() => setLeaving(true), FADE_OUT_AT_MS)
    const done = setTimeout(onDone, DONE_AT_MS)
    return () => {
      clearTimeout(fade)
      clearTimeout(done)
      sound.current?.stop()
    }
  }, [onDone, reduced])
  return { leaving, sound }
}

interface IntroControlsProps {
  reduced: boolean
  muted: boolean
  onToggleMute: () => void
  onSkip: () => void
}

function IntroControls({ reduced, muted, onToggleMute, onSkip }: IntroControlsProps): JSX.Element {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-1">
      {!reduced && (
        <button type="button" onClick={onToggleMute} className={GHOST_BUTTON} aria-pressed={muted}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          {muted ? 'Unmute' : 'Mute'}
        </button>
      )}
      <button type="button" onClick={onSkip} className={GHOST_BUTTON}>
        {reduced ? 'Continue' : 'Skip intro'}
      </button>
    </div>
  )
}

/** Logo reveal with expanding rings, the headline word by word, then the one-liner. */
function IntroHero({ brandName }: { brandName: string }): JSX.Element {
  return (
    <>
      <div className="relative grid h-24 w-24 place-items-center">
        <span className="cat-agent-ring absolute inset-0 rounded-full border border-[#e04a3d]/50 [animation-delay:0.5s]" />
        <span className="cat-agent-ring absolute inset-0 rounded-full border border-[#e04a3d]/40 [animation-delay:0.9s]" />
        <SignalorMark className="cat-agent-mark h-20 w-20 text-[#e04a3d] [animation-delay:0.15s]" />
      </div>
      <h1 className="mt-8 flex flex-wrap justify-center gap-x-3 text-center text-[34px] leading-tight font-semibold tracking-tight text-[var(--cat-ink)] sm:text-[44px]">
        {HEADLINE.map((word, i) => (
          <span
            key={word}
            className={`cat-agent-word ${WORD_DELAYS[i]} ${word === 'GEO' ? 'text-[#e04a3d]' : ''}`}
          >
            {word}
          </span>
        ))}
      </h1>
      <p className="cat-agent-word mt-4 max-w-xl text-center text-[15px] leading-relaxed text-[var(--cat-ink-2)] [animation-delay:2.3s]">
        It works on {brandName} every week, on its own: finding where AI engines ignore you, fixing
        it, and proving the lift.
      </p>
    </>
  )
}

/** First-visit introduction to the Signalor autonomous agent (~8s, with sound). */
export function AgentIntro({ brandName, onDone }: AgentIntroProps): JSX.Element {
  const [reduced] = useState(prefersReducedMotion)
  const [muted, setMuted] = useState(false)
  const { leaving, sound } = useIntroTimeline(onDone, reduced)

  function toggleMute(): void {
    sound.current?.setMuted(!muted)
    setMuted(!muted)
  }

  return (
    <section
      aria-label="Introducing the SignalorAI agent"
      className={`relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[var(--cat-canvas)] px-6 ${leaving ? 'cat-agent-out' : ''}`}
    >
      <IntroControls reduced={reduced} muted={muted} onToggleMute={toggleMute} onSkip={onDone} />
      <IntroHero brandName={brandName} />
      <AgentIntroSteps />
    </section>
  )
}
