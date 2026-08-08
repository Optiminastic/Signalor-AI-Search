import { ChartFrame } from '@/features/catalyst/components/ChartFrame'
import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import type { SovBar } from '@/features/catalyst/visibility-data'

interface MiniBarsProps {
  bars: SovBar[]
  color: string
}

/** Compact labelled bar chart (share of voice per engine). */
export function MiniBars({ bars, color }: MiniBarsProps): JSX.Element {
  const max = Math.max(...bars.map(b => b.value), 1)
  return (
    <ChartFrame>
      <div className="flex items-end gap-1.5">
        {bars.map(bar => (
          // min-w-0 lets each column shrink below its content so many engines (up
          // to 9) fit instead of overflowing the card and clipping the last bars.
          <div key={bar.name} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex h-12 w-full items-end">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${(bar.value / max) * 100}%`,
                  minHeight: bar.value > 0 ? 4 : 2,
                  background: bar.value > 0 ? color : 'var(--cat-track)',
                }}
              />
            </div>
            <span className="flex w-full min-w-0 items-center justify-center gap-1 text-[9px] text-[var(--cat-ink-3)]">
              <EngineLogo name={bar.name} size={13} color={color} />
              <span className="truncate">{bar.name}</span>
            </span>
          </div>
        ))}
      </div>
    </ChartFrame>
  )
}
