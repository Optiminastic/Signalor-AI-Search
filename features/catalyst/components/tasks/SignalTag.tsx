/** Colour per signal so the same pillar reads the same everywhere in the app. */
const SIGNAL_COLOR: Record<string, string> = {
  'E-E-A-T': '#7C3AED',
  Schema: '#2563EB',
  Content: '#0891B2',
  Technical: '#475569',
  Entity: '#C026D3',
  // Traces to one named tracked prompt, so it reads as the strongest signal.
  Prompt: '#e04a3d',
  'AI visibility': '#EA580C',
  'Off-site': '#A16207',
  Competitive: '#BE123C',
  GEO: '#6B7280',
}

const FALLBACK = '#6B7280'

interface SignalTagProps {
  /** Short signal label, e.g. "E-E-A-T". Empty renders nothing. */
  signal: string
  /** Sentence explaining the effect; shown as the tooltip. */
  effect?: string
}

/** What completing a task improves — the "why is this worth doing" badge. */
export function SignalTag({ signal, effect }: SignalTagProps): JSX.Element | null {
  if (!signal) return null
  const color = SIGNAL_COLOR[signal] ?? FALLBACK
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
