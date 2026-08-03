import type { ReactNode } from 'react'

// Shared shells for the prompt detail tabs, so every panel reads the same.

/** Bordered tile holding one number, the dashboard's metric-card rhythm. */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}): JSX.Element {
  return (
    <div className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3">
      <p className="text-[11px] text-[var(--cat-ink-3)]">{label}</p>
      <p className="mt-1 text-[18px] font-bold text-[var(--cat-ink)] tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-[var(--cat-ink-3)]">{hint}</p>}
    </div>
  )
}

/** Titled block with an optional right-side action or caption. */
export function Panel({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}): JSX.Element {
  return (
    <section className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[12px] font-semibold text-[var(--cat-ink)]">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Uniform empty state — used whenever a date filter empties a tab. */
export function EmptyNote({ children }: { children: string }): JSX.Element {
  return (
    <p className="rounded-md border border-dashed border-[var(--cat-border)] p-6 text-center text-[12px] text-[var(--cat-ink-3)]">
      {children}
    </p>
  )
}

/** Horizontal 0-100 bar. Data mark, so it may use its metric's hue. */
export function RateBar({ value, color }: { value: number; color: string }): JSX.Element {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-sm bg-[var(--cat-track)]">
      <span
        className="block h-full rounded-sm"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </span>
  )
}
