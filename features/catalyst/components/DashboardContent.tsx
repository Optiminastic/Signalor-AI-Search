'use client'

import { AiCitationCard } from '@/features/catalyst/components/cards/AiCitationCard'
import { CompetitorHeatmapCard } from '@/features/catalyst/components/cards/CompetitorHeatmapCard'
import { ConversionRateCard } from '@/features/catalyst/components/cards/ConversionRateCard'
import { DomainAuthorityCard } from '@/features/catalyst/components/cards/DomainAuthorityCard'
import { EngagementOpportunitiesCard } from '@/features/catalyst/components/cards/EngagementOpportunitiesCard'
import { GeoScoreCard } from '@/features/catalyst/components/cards/GeoScoreCard'
import { TopSourcesCard } from '@/features/catalyst/components/cards/TopSourcesCard'
import { UserRetentionCard } from '@/features/catalyst/components/cards/UserRetentionCard'
import { VisibilityBreakdownCard } from '@/features/catalyst/components/cards/VisibilityBreakdownCard'
import { VisibilityTrendCard } from '@/features/catalyst/components/cards/VisibilityTrendCard'
import { VisitorsChannelsCard } from '@/features/catalyst/components/cards/VisitorsChannelsCard'
import { DashboardSkeleton } from '@/features/catalyst/components/DashboardSkeleton'
import { AiAssistantPanel } from '@/features/catalyst/components/overview/AiAssistantPanel'
import { DashboardGreeting } from '@/features/catalyst/components/overview/DashboardGreeting'
import { OverviewFiltersProvider } from '@/features/catalyst/components/overview/OverviewFilters'
import { WorldPresenceCard } from '@/features/catalyst/components/overview/WorldPresenceCard'
import { useDashboardReady } from '@/hooks/useDashboardReady'

export function DashboardContent(): JSX.Element {
  const ready = useDashboardReady()

  // This page's toolbar (range, engine filter, Export, Re-analyze) renders on the
  // greeting row via DashboardGreeting rather than in the shared GlobalBar.
  if (!ready) return <DashboardSkeleton />

  return (
    <OverviewFiltersProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        <DashboardGreeting />
        <AiAssistantPanel />

        {/* Three equal columns; each column stacks its own cards (masonry).
            Kept to three cards per column so the column heights stay balanced. */}
        <div className="cat-stagger grid grid-cols-1 items-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <GeoScoreCard />
            <DomainAuthorityCard />
            <VisibilityTrendCard />
            <ConversionRateCard />
          </div>
          <div className="flex flex-col gap-2">
            <AiCitationCard />
            <VisitorsChannelsCard />
            <TopSourcesCard />
          </div>
          <div className="flex flex-col gap-2">
            <EngagementOpportunitiesCard />
            <VisibilityBreakdownCard />
            <UserRetentionCard />
          </div>
        </div>

        {/* Wide, table/map cards span the full width and stack cleanly below. */}
        <div className="flex flex-col gap-2">
          <CompetitorHeatmapCard />
          <WorldPresenceCard />
        </div>
      </div>
    </OverviewFiltersProvider>
  )
}
