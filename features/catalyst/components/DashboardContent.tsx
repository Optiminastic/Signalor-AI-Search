'use client'

import { AiCitationCard } from '@/features/catalyst/components/cards/AiCitationCard'
import { ClicksTrendCard } from '@/features/catalyst/components/cards/ClicksTrendCard'
import { CompetitorHeatmapCard } from '@/features/catalyst/components/cards/CompetitorHeatmapCard'
import { ConversionRateCard } from '@/features/catalyst/components/cards/ConversionRateCard'
import { DomainAuthorityCard } from '@/features/catalyst/components/cards/DomainAuthorityCard'
import { EngagementOpportunitiesCard } from '@/features/catalyst/components/cards/EngagementOpportunitiesCard'
import { GeoScoreCard } from '@/features/catalyst/components/cards/GeoScoreCard'
import { SessionsTrendCard } from '@/features/catalyst/components/cards/SessionsTrendCard'
import { TopSourcesCard } from '@/features/catalyst/components/cards/TopSourcesCard'
import { UserRetentionCard } from '@/features/catalyst/components/cards/UserRetentionCard'
import { VisibilityBreakdownCard } from '@/features/catalyst/components/cards/VisibilityBreakdownCard'
import { VisibilityTrendCard } from '@/features/catalyst/components/cards/VisibilityTrendCard'
import { VisitorsChannelsCard } from '@/features/catalyst/components/cards/VisitorsChannelsCard'
import { DashboardSkeleton } from '@/features/catalyst/components/DashboardSkeleton'
import { DashboardGreeting } from '@/features/catalyst/components/overview/DashboardGreeting'
import { OverviewFiltersProvider } from '@/features/catalyst/components/overview/OverviewFilters'
import { ProjectionPanel } from '@/features/catalyst/components/overview/ProjectionPanel'
import { WorldPresenceCard } from '@/features/catalyst/components/overview/WorldPresenceCard'
import { useDashboardReady } from '@/hooks/useDashboardReady'

export function DashboardContent(): JSX.Element {
  const ready = useDashboardReady()

  // This page's toolbar (range, engine filter, Export, Re-analyze) renders on the
  // greeting row via DashboardGreeting rather than in the shared GlobalBar.
  if (!ready) return <DashboardSkeleton />

  return (
    <OverviewFiltersProvider>
      <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3">
        <DashboardGreeting />
        <ProjectionPanel />

        <PrimaryCards />
        <WideRows />
      </div>
    </OverviewFiltersProvider>
  )
}

/**
 * The primary card grid.
 *
 * A real CSS grid, NOT the multi-column masonry this used to be. Masonry flows
 * cards down one column before starting the next and auto-balances the column
 * heights, so no two cards ever shared a top or bottom edge — every row read as
 * a different set of gaps even though the gap value was uniform. A grid puts
 * cards on shared rows and stretches each row's cards to a common height, which
 * is what makes the page look deliberate.
 *
 * Ten cards over three columns leaves one alone on the last row, so the final
 * card spans the full width rather than sitting as a lonely third. All ten
 * always render (none return null), so the spans are safe to hard-code.
 */
function PrimaryCards(): JSX.Element {
  return (
    <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <GeoScoreCard />
      <DomainAuthorityCard />
      <VisibilityTrendCard />
      <AiCitationCard />
      <VisitorsChannelsCard />
      <EngagementOpportunitiesCard />
      <VisibilityBreakdownCard />
      <ConversionRateCard />
      <TopSourcesCard />
      <div className="sm:col-span-2 xl:col-span-3">
        <UserRetentionCard />
      </div>
    </div>
  )
}

/** Bottom row: the left 2-col stack (competitor heatmap + the two GA/GSC trend
 *  cards filling the gap beneath it) sits beside World Presence. The grid stretches
 *  so the left column's bottom lines up with World Presence — it never runs past it. */
function WideRows(): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-2 xl:col-span-2">
        <CompetitorHeatmapCard />
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          <SessionsTrendCard />
          <ClicksTrendCard />
        </div>
      </div>
      <WorldPresenceCard />
    </div>
  )
}
