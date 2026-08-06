/**
 * Colour per GEO signal — the single source for every surface that names one.
 *
 * Lives in `lib/` rather than beside any one component because both the
 * dashboard (task badges and glyphs) and the marketing site's task card need
 * it, and features must not import from each other. It previously existed as
 * two hand-synced copies with a "keep these in sync" comment, which is the
 * kind of thing that is only ever in sync until someone adds a signal.
 */
export const SIGNAL_COLOR: Record<string, string> = {
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

const SIGNAL_FALLBACK = '#6B7280'

/** Hex for a signal label, falling back to neutral for anything unmapped. */
export function signalColor(signal: string): string {
  return SIGNAL_COLOR[signal] ?? SIGNAL_FALLBACK
}

/**
 * Alpha suffixes for tinting a signal colour as hex8 — a soft fill and a
 * slightly stronger edge. Shared so a tinted badge and a tinted tile match
 * exactly instead of drifting apart by a few percent.
 */
export const SIGNAL_TINT = { fill: '14', ring: '2E' } as const
