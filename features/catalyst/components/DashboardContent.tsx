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

/** One masonry item. `break-inside-avoid` keeps a card from splitting across columns. */
function Tile({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="mb-2 break-inside-avoid">{children}</div>
}

/** The primary card grid as a true CSS masonry — columns auto-balance to equal
 *  height, so shorter columns don't leave dead space at the bottom.
 *
 *  This was briefly a real CSS grid with `items-stretch`. That aligned the row
 *  edges, but it also forced every card in a row up to the tallest card's
 *  height, which is why a card with nothing to show (Domain Authority with no
 *  provider key, Prompt Coverage with no prompts) rendered as a large empty
 *  panel. Masonry lets each card be exactly as tall as its content. */
function PrimaryCards(): JSX.Element {
  return (
    <div className="columns-1 gap-2 sm:columns-2 xl:columns-3">
      <Tile>
        <GeoScoreCard />
      </Tile>
      <Tile>
        <DomainAuthorityCard />
      </Tile>
      <Tile>
        <VisibilityTrendCard />
      </Tile>
      <Tile>
        <AiCitationCard />
      </Tile>
      <Tile>
        <VisitorsChannelsCard />
      </Tile>
      <Tile>
        <EngagementOpportunitiesCard />
      </Tile>
      <Tile>
        <VisibilityBreakdownCard />
      </Tile>
      <Tile>
        <ConversionRateCard />
      </Tile>
      <Tile>
        <TopSourcesCard />
      </Tile>
      <Tile>
        <UserRetentionCard />
      </Tile>
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
