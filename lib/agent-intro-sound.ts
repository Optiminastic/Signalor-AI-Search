/**
 * The Agent intro's soundtrack, synthesized with the Web Audio API (no audio
 * file, no dependency): a warm pad that swells under the logo reveal, then soft
 * chimes timed to the intro's step reveals.
 *
 * Browsers only allow audio after a user gesture. The intro opens from a click on
 * the Agent button, which satisfies that; if the browser still refuses, the
 * intro simply plays silently.
 */

const PAD_NOTES_HZ = [220, 277.18, 329.63] // A3, C#4, E4: a calm A-major pad
const CHIME_NOTES_HZ = [659.25, 739.99, 880, 987.77] // E5, F#5, A5, B5, rising
const MASTER_VOLUME = 0.18
const PAD_SECONDS = 8
const CHIME_SECONDS = 1.6
/** Seconds from start when each chime sounds; matches the step reveals in AgentIntro. */
export const CHIME_TIMES_S = [3.4, 4.3, 5.2, 6.1]

export interface IntroSound {
  stop: () => void
  setMuted: (muted: boolean) => void
}

type AudioContextCtor = typeof AudioContext

function audioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  const legacy = (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  return window.AudioContext ?? legacy ?? null
}

function pad(ctx: AudioContext, out: AudioNode): void {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.6)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + PAD_SECONDS)
  gain.connect(out)
  for (const hz of PAD_NOTES_HZ) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = hz
    osc.connect(gain)
    osc.start()
    osc.stop(ctx.currentTime + PAD_SECONDS)
  }
}

interface ChimeOptions {
  at: number
  hz: number
}

function chime(ctx: AudioContext, out: AudioNode, { at, hz }: ChimeOptions): void {
  const start = ctx.currentTime + at
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.6, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, start + CHIME_SECONDS)
  gain.connect(out)
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = hz
  osc.connect(gain)
  osc.start(start)
  osc.stop(start + CHIME_SECONDS)
}

/** Starts the soundtrack. Returns null when audio isn't available. */
export function playIntroSound(): IntroSound | null {
  const Ctor = audioContextCtor()
  if (!Ctor) return null
  const ctx = new Ctor()
  void ctx.resume().catch(() => undefined)
  const master = ctx.createGain()
  master.gain.value = MASTER_VOLUME
  master.connect(ctx.destination)
  pad(ctx, master)
  CHIME_TIMES_S.forEach((at, i) =>
    chime(ctx, master, { at, hz: CHIME_NOTES_HZ[i % CHIME_NOTES_HZ.length] }),
  )
  return {
    stop: () => void ctx.close().catch(() => undefined),
    setMuted: muted => {
      master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, ctx.currentTime, 0.05)
    },
  }
}
