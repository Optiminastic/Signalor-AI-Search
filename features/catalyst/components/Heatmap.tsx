import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import { BRAND } from '@/features/catalyst/constants'

const ROWS = 7
const COLS = 12

/** Decorative gradient fallback when no real intensities are supplied. */
function fallbackOpacity(row: number, col: number): number {
  const v = 1 - col * 0.075 - row * 0.03
  return Math.max(0.05, Math.min(1, v))
}

/** Grid of cells whose opacity encodes intensity (0–1). When `intensities` is
 * given, cells cycle through it; otherwise a decorative gradient is drawn. */
export function Heatmap({ intensities }: { intensities?: number[] }): JSX.Element {
  const values = intensities ?? []
  const cells = Array.from({ length: ROWS * COLS }, (_, idx) => {
    const row = Math.floor(idx / COLS)
    const col = idx % COLS
    const opacity =
      values.length > 0
        ? Math.max(0.05, Math.min(1, values[idx % values.length]))
        : fallbackOpacity(row, col)
    return (
      <span key={idx} className="aspect-square rounded-sm" style={{ background: BRAND, opacity }} />
    )
  })
  return (
    <ChartFrame className="my-3">
      <div className="grid grid-cols-12 gap-1">{cells}</div>
    </ChartFrame>
  )
}
