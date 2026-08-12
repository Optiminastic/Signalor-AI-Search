import { Chip, type ChipColor } from '@/components/base/badges/chip'

interface PriorityPillProps {
  priority: string
}

const TONE: Record<string, ChipColor> = {
  critical: 'rose',
  high: 'rose',
  medium: 'yellow',
  low: 'neutral',
}

/** Small, honest priority chip — the real "how important" signal on a task
 * (replaces the removed fabricated impact number). */
export function PriorityPill({ priority }: PriorityPillProps): JSX.Element {
  return (
    <Chip variant="caption" color={TONE[priority.toLowerCase()] ?? TONE.low} className="capitalize">
      {priority}
    </Chip>
  )
}
