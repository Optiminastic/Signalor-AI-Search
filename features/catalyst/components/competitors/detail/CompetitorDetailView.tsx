'use client'

import { useParams } from 'next/navigation'

import { TransitionLink } from '@/components/TransitionLink'
import { domainOf, relationFor, RELATION_META } from '@/features/catalyst/competitors-data'
import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import { CompetitorCompareCard } from '@/features/catalyst/components/competitors/detail/CompetitorCompareCard'
import { CompetitorProfileCard } from '@/features/catalyst/components/competitors/detail/CompetitorProfileCard'
import { CompetitorScoreCard } from '@/features/catalyst/components/competitors/detail/CompetitorScoreCard'
import { DataState } from '@/features/catalyst/components/DataState'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useCompetitorDetail } from '@/hooks/useCompetitorDetail'
import type { Competitor } from '@/lib/api/analyzer'
import { ChevronLeft } from '@/lib/icons'

function BackLink(): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <TransitionLink
      href={brandPath('competitors')}
      className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
    >
      <ChevronLeft size={14} />
      Competitors
    </TransitionLink>
  )
}

function DetailHeader({ competitor }: { competitor: Competitor }): JSX.Element {
  const domain = domainOf(competitor.url)
  const relation = RELATION_META[relationFor(competitor.tier)]
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <BackLink />
        <div className="mt-1.5 flex items-center gap-3">
          <BrandFavicon domain={domain} name={competitor.name} color="#111827" size={40} />
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-bold tracking-tight text-[var(--cat-ink)]">
              {competitor.name}
            </h1>
            <a
              href={competitor.url}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] font-medium text-[#e04a3d] hover:underline"
            >
              {domain}
            </a>
          </div>
        </div>
      </div>
      <span
        className="inline-flex shrink-0 items-center rounded-md border border-[var(--cat-border)] px-2.5 py-1 text-[12px] font-medium"
        style={{ color: relation.color }}
      >
        {relation.label}
      </span>
    </div>
  )
}

/** Detailed analysis of one competitor, routed at /competitors/[competitorId]. */
export function CompetitorDetailView(): JSX.Element {
  const params = useParams()
  const competitorId = Number(typeof params?.competitorId === 'string' ? params.competitorId : NaN)
  const { slug, run, isLoading: projectLoading } = useActiveProject()
  const { competitor, isLoading, isError, notFound } = useCompetitorDetail(slug, competitorId)

  return (
    <>
      <div className="cat-rise shrink-0 border-b border-[var(--cat-border)] pb-4">
        {competitor ? <DetailHeader competitor={competitor} /> : <BackLink />}
      </div>
      <div className="-mx-3 mt-3 min-h-0 flex-1 overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={notFound || !competitor}
          emptyTitle="Competitor not found"
          emptyHint="This competitor is not part of the current analysis run."
        >
          {competitor && (
            <div className="cat-stagger flex flex-col gap-2">
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
                <CompetitorScoreCard competitor={competitor} myScore={run?.composite_score ?? 0} />
                <CompetitorCompareCard competitor={competitor} />
              </div>
              <CompetitorProfileCard competitor={competitor} />
            </div>
          )}
        </DataState>
      </div>
    </>
  )
}
