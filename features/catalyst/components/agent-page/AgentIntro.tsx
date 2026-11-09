'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'

import { IntroOutroScene } from '@/features/catalyst/components/agent-page/intro/IntroOutroScene'
import { IntroProductScene } from '@/features/catalyst/components/agent-page/intro/IntroProductScene'
import { IntroTypeScene } from '@/features/catalyst/components/agent-page/intro/IntroTypeScene'
import { playIntroSound, type IntroSound } from '@/lib/agent-intro-sound'

/** Matches the CSS timeline in app/globals.css (cat-intro-*): 5s, short fade at the end. */
const FADE_OUT_AT_MS = 4700
const DONE_AT_MS = 5000
const GHOST_BUTTON =
  'inline-flex h-[34px] items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]'

interface AgentIntroProps {
  brandName: string
  onDone: () => void
}

interface IntroControlsProps {
  reduced: boolean
  muted: boolean
  onToggleMute: () => void
  onSkip: () => void
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Plays the soundtrack and ends the intro on time; cleans up on Skip/unmount. */
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

function IntroControls({ reduced, muted, onToggleMute, onSkip }: IntroControlsProps): JSX.Element {
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
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

/** Soft brand-tinted light that drifts for the whole piece. */
function IntroBackdrop(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="cat-intro-glow absolute -top-1/4 -left-1/4 h-[70vh] w-[70vh] rounded-full bg-[#e04a3d]/12 blur-[110px]" />
      <div className="cat-intro-glow absolute -right-1/4 -bottom-1/3 h-[80vh] w-[80vh] rounded-full bg-[#f59e8b]/15 blur-[120px]" />
    </div>
  )
}

/** First-visit 5s motion-graphics introduction to the Signalor autonomous agent. */
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
      className={`relative h-dvh overflow-hidden bg-[var(--cat-canvas)] ${leaving ? 'cat-intro-fadeout' : ''}`}
    >
      <IntroBackdrop />
      <IntroControls reduced={reduced} muted={muted} onToggleMute={toggleMute} onSkip={onDone} />
      <IntroTypeScene />
      <IntroProductScene />
      <IntroOutroScene brandName={brandName} />
    </section>
  )
}
