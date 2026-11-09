/**
 * Sound design for the 5s Agent intro, synthesized with the Web Audio API (no
 * audio file, no dependency): an airy whoosh as the sparkle flies in, a crisp
 * click when the cursor presses "Run plan", and a warm chord under the lockup.
 * Cue times match the CSS timeline in app/globals.css (cat-intro-*).
 *
 * Browsers only allow audio after a user gesture. The intro opens from a click
 * on the Agent button, which satisfies that; otherwise it plays silently.
 */

const MASTER_VOLUME = 0.22
const WHOOSH = { at: 0.02, seconds: 0.85, fromHz: 300, toHz: 2600 }
const CLICK = { at: 3.06, seconds: 0.06 }
const SWELL = { at: 3.75, seconds: 1.4, notesHz: [261.63, 329.63, 392, 523.25] } // C major, warm

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

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function burst(ctx: AudioContext, out: AudioNode, filter: BiquadFilterNode): GainNode {
  const gain = ctx.createGain()
  filter.connect(gain)
  gain.connect(out)
  return gain
}

function whoosh(ctx: AudioContext, out: AudioNode): void {
  const start = ctx.currentTime + WHOOSH.at
  const end = start + WHOOSH.seconds
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer(ctx, WHOOSH.seconds)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 1.4
  band.frequency.setValueAtTime(WHOOSH.fromHz, start)
  band.frequency.exponentialRampToValueAtTime(WHOOSH.toHz, end)
  const gain = burst(ctx, out, band)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.9, start + WHOOSH.seconds * 0.45)
  gain.gain.linearRampToValueAtTime(0, end)
  source.connect(band)
  source.start(start)
}

function click(ctx: AudioContext, out: AudioNode): void {
  const start = ctx.currentTime + CLICK.at
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer(ctx, CLICK.seconds)
  const high = ctx.createBiquadFilter()
  high.type = 'highpass'
  high.frequency.value = 2200
  const gain = burst(ctx, out, high)
  gain.gain.setValueAtTime(0.8, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + CLICK.seconds)
  source.connect(high)
  source.start(start)
}

function swell(ctx: AudioContext, out: AudioNode): void {
  const start = ctx.currentTime + SWELL.at
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.35, start + 0.25)
  gain.gain.exponentialRampToValueAtTime(0.001, start + SWELL.seconds)
  gain.connect(out)
  for (const hz of SWELL.notesHz) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = hz
    osc.connect(gain)
    osc.start(start)
    osc.stop(start + SWELL.seconds)
  }
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
  whoosh(ctx, master)
  click(ctx, master)
  swell(ctx, master)
  return {
    stop: () => void ctx.close().catch(() => undefined),
    setMuted: muted => {
      master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, ctx.currentTime, 0.05)
    },
  }
}
