const CARD_COUNT = 6

/** A single pulsing placeholder shaped like an overview card. */
function SkeletonCard(): JSX.Element {
  return (
    <div className="cat-card-edge flex animate-pulse flex-col gap-3 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-[var(--cat-hover)]" />
        <div className="h-3 w-12 rounded bg-[var(--cat-hover)]" />
      </div>
      <div className="h-7 w-24 rounded bg-[var(--cat-hover)]" />
      <div className="h-24 w-full rounded bg-[var(--cat-hover)]" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-[var(--cat-hover)]" />
        <div className="h-3 w-4/5 rounded bg-[var(--cat-hover)]" />
      </div>
    </div>
  )
}

/**
 * Loading placeholder for the dashboard overview grid. Mirrors the real card
 * layout so the cards don't flash in half-populated (empty "-" / "no data yet")
 * while their queries are still in flight.
 */
export function DashboardSkeleton(): JSX.Element {
  return (
    <section
      aria-busy="true"
      aria-label="Loading dashboard"
      className="-mx-3 mt-2.5 grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-2 overflow-y-auto px-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </section>
  )
}
