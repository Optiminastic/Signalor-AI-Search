const ROWS = ['w-3/5', 'w-2/5', 'w-1/2']

/** Static placeholder rows while the log loads (no shimmer: the dashboard has no ambient motion). */
export function ActivitySkeleton(): JSX.Element {
  return (
    <div role="status" aria-label="Loading activity" className="mt-4 flex flex-col gap-4">
      {ROWS.map(width => (
        <div key={width} className="flex gap-3" aria-hidden="true">
          <span className="h-7 w-7 shrink-0 rounded-md bg-[var(--cat-hover)]" />
          <span className="flex flex-1 flex-col gap-1.5 pt-1">
            <span className={`h-3 rounded-sm bg-[var(--cat-hover)] ${width}`} />
            <span className="h-2.5 w-4/5 rounded-sm bg-[var(--cat-hover)] opacity-60" />
          </span>
        </div>
      ))}
    </div>
  )
}
