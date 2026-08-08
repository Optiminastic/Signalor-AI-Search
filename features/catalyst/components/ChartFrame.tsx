import type { ReactNode } from 'react'

interface ChartFrameProps {
  children: ReactNode
  /** Layout spacing for the frame itself (e.g. `mt-3`), kept off the plot. */
  className?: string
}

/**
 * The white surface every graph sits on. BoardUI draws its plots on the elevated
 * `background/primary` surface - white in light, a lifted grey in dark - so the
 * chart reads as its own panel inside the grey card rather than bleeding into it.
 * Centralised here so every graph in the dashboard shares one container.
 */
export function ChartFrame({ children, className = '' }: ChartFrameProps): JSX.Element {
  return (
    <div
      className={`bg-background-primary-default rounded-xl border border-[var(--cat-border-soft)] p-3 ${className}`}
    >
      {children}
    </div>
  )
}
