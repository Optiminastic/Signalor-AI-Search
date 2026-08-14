import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import { BRAND } from '@/features/catalyst/constants'

export interface HeatmapCell {
  /** 0-1. Drives the cell's fill strength. */
  intensity: number
  /** Shown on hover, so a cell is identifiable rather than anonymous. */
  label: string
}

/**
 * One cell per measurement, at a fixed size, wrapping to fill the width.
 *
 * Two things this deliberately does NOT do, both of which it used to:
 *
 * - Draw a fixed 7x12 = 84-cell grid. That shape is a retention cohort's (this
 *   file began as a template's "users by cohort by week"), and it was filled by
 *   cycling `values[idx % values.length]` — so ten tracked prompts were painted
 *   as eighty-four cells, each repeated eight times. The card asserted eight
 *   times the evidence it had.
 * - Size cells by `aspect-square` inside `grid-cols-12`. Cell height then tracks
 *   card WIDTH, so on a full-width card the grid grew to roughly 850px tall for
 *   ten data points. Height now follows how much data there is, which is the
 *   only thing it should follow.
 */
export function Heatmap({ cells }: { cells: HeatmapCell[] }): JSX.Element | null {
  if (cells.length === 0) return null
  return (
    <ChartFrame className="my-3">
      <div className="flex flex-wrap gap-1">
        {cells.map((cell, idx) => (
          <span
            key={idx}
            title={cell.label}
            // A floor of 0.08 keeps a zero cell visible as a measured zero
            // rather than blank canvas; the border keeps it legible on both grounds.
            className="h-6 w-6 rounded-sm border border-[var(--cat-border-soft)]"
            style={{
              background: BRAND,
              opacity: Math.max(0.08, Math.min(1, cell.intensity)),
            }}
          />
        ))}
      </div>
    </ChartFrame>
  )
}
