interface PriorityPillProps {
  priority: string
}

const TONE: Record<string, { text: string; bg: string }> = {
  critical: { text: '#E5484D', bg: 'rgba(229,72,77,0.12)' },
  high: { text: '#e04a3d', bg: 'rgba(224,74,61,0.10)' },
  medium: { text: '#B7791F', bg: 'rgba(246,185,59,0.16)' },
  low: { text: 'var(--cat-ink-3)', bg: 'var(--cat-hover)' },
}

/** Small, honest priority chip — the real "how important" signal on a task
 * (replaces the removed fabricated impact number). */
export function PriorityPill({ priority }: PriorityPillProps): JSX.Element {
  const tone = TONE[priority.toLowerCase()] ?? TONE.low
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize"
      style={{ color: tone.text, background: tone.bg }}
    >
      {priority}
    </span>
  )
}
