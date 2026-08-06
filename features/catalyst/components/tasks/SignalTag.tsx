import { signalColor } from '@/lib/signal-colors'

interface SignalTagProps {
  /** Short signal label, e.g. "E-E-A-T". Empty renders nothing. */
  signal: string
  /** Sentence explaining the effect; shown as the tooltip. */
  effect?: string
}

/** What completing a task improves — the "why is this worth doing" badge. */
export function SignalTag({ signal, effect }: SignalTagProps): JSX.Element | null {
  if (!signal) return null
  const color = signalColor(signal)
  return (
    <span
      title={effect}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: `${color}14` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {signal}
    </span>
  )
}
