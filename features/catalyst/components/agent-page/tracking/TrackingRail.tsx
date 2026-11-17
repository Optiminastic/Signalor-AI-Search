import { RankTrackingPanel } from '@/features/catalyst/components/agent-page/tracking/RankTrackingPanel'

interface TrackingRailProps {
  orgSlug: string
}

/**
 * Third column, right of the board, on wide screens (1440px+): the weekly
 * SEO / GEO / AIO tracking. Below that width the board shows it as a tab instead.
 */
export function TrackingRail({ orgSlug }: TrackingRailProps): JSX.Element {
  return (
    <aside
      aria-label="You vs competitors"
      className="cat-agent-canvas hidden min-h-0 w-[400px] shrink-0 flex-col overflow-y-auto rounded-[22px] border border-white/80 bg-[var(--cat-content)]/90 px-5 py-5 shadow-[0_10px_40px_rgba(120,60,30,.08)] backdrop-blur-xl min-[1440px]:flex dark:border-white/10"
    >
      <RankTrackingPanel orgSlug={orgSlug} />
    </aside>
  )
}
