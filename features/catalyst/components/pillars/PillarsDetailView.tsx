'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { DataState } from '@/features/catalyst/components/DataState'
import { PillarCard } from '@/features/catalyst/components/pillars/PillarCard'
import { PillarCompareCard } from '@/features/catalyst/components/pillars/PillarCompareCard'
import { PillarRadarCard } from '@/features/catalyst/components/pillars/PillarRadarCard'
import { SiteOneCategoryCard } from '@/features/catalyst/components/siteone/SiteOneCategoryCard'
import { SiteOneSummary } from '@/features/catalyst/components/siteone/SiteOneSummary'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { usePillarBreakdown, type PillarBreakdown } from '@/hooks/usePillarBreakdown'
import { useSiteOne } from '@/hooks/useSiteOne'
import type { SiteOneReport } from '@/lib/api/siteone'

function SectionHeading({ title, hint }: { title: string; hint?: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{title}</span>
      <span className="h-px flex-1 bg-[var(--cat-border-soft)]" />
      {hint}
    </div>
  )
}

interface CrawlSectionProps {
  report: SiteOneReport | null | undefined
  isLoading: boolean
}

/** Technical evidence from the SiteOne crawler, when it ran for this project. */
function CrawlSection({ report, isLoading }: CrawlSectionProps): JSX.Element | null {
  const brandPath = useBrandPath()
  if (isLoading) return null
  if (!report) {
    return (
      <p className="rounded-md border border-dashed border-[var(--cat-border)] px-4 py-3 text-[12px] text-[var(--cat-ink-3)]">
        No SiteOne crawl data for this run. Re-run the analysis to collect crawler evidence for the
        Technical pillar.
      </p>
    )
  }
  return (
    <>
      <SiteOneSummary report={report} />
      {report.categories.length > 0 && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {report.categories.map(category => (
            <SiteOneCategoryCard key={category.code || category.name} category={category} />
          ))}
        </div>
      )}
      <TransitionLink
        href={`${brandPath('visibility')}?tab=siteone`}
        className="self-start text-[12px] font-medium text-[#e04a3d] underline decoration-[rgba(224,74,61,0.35)] underline-offset-2 hover:decoration-[#e04a3d]"
      >
        Open the full SiteOne report
      </TransitionLink>
    </>
  )
}

function Breakdown({ data }: { data: PillarBreakdown }): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
        <PillarRadarCard data={data} />
        <PillarCompareCard data={data} />
      </div>
      <SectionHeading
        title="Pillar deep dive"
        hint={
          <span className="text-[11px] text-[var(--cat-ink-3)]">
            {data.recTotal} open recommendations
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {data.pillars.map(pillar => (
          <PillarCard key={pillar.key} pillar={pillar} />
        ))}
      </div>
    </>
  )
}

/** GEO Pillars details page — the dashboard card's "Details" destination. */
export function PillarsDetailView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = usePillarBreakdown(slug)
  const siteone = useSiteOne(slug)

  return (
    <>
      <div className="cat-rise flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--cat-border)] pb-4">
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
            GEO Pillars
          </h1>
          <p className="text-[13px] text-[var(--cat-ink-2)]">
            How each scoring pillar holds up, with the crawler evidence behind it
          </p>
        </div>
      </div>
      <div className="-mx-3 mt-3 min-h-0 flex-1 overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data || data.pageCount === 0}
          emptyTitle="No pillar data yet"
          emptyHint="Run an analysis on this brand to score the six GEO pillars."
        >
          {data && (
            <div className="cat-stagger flex flex-col gap-2">
              <Breakdown data={data} />
              <SectionHeading title="Technical crawl · SiteOne" />
              <CrawlSection report={siteone.data} isLoading={siteone.isLoading} />
            </div>
          )}
        </DataState>
      </div>
    </>
  )
}
