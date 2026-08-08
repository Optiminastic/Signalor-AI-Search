'use client'

import { AllocationBlock } from '@/features/catalyst/components/agent/insights/AllocationBlock'
import { InsightCard } from '@/features/catalyst/components/agent/insights/InsightCard'
import { RankTable } from '@/features/catalyst/components/agent/insights/RankTable'
import { useAgentInsights } from '@/hooks/useAgentInsights'

function Header(): JSX.Element {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--cat-ink)]">Answer Engine Insights</h2>
      </div>
      <span className="cat-card-edge hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--cat-ink-2)] sm:inline">
        Latest run
      </span>
    </div>
  )
}

export function AnswerEngineInsights(): JSX.Element | null {
  const {
    platforms,
    engineRank,
    citationRank,
    brandCitations,
    competitorCitations,
    hasData,
    isLoading,
  } = useAgentInsights()

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-[var(--cat-hover)]" />
  }
  // No prompt/citation data on this run — hide the panel rather than show zeros.
  if (!hasData) return null

  return (
    <section>
      <Header />
      <div className="grid gap-3 lg:grid-cols-2">
        {platforms.length > 0 && (
          <InsightCard title="Answer engines" subtitle="Share of AI citations by engine">
            <AllocationBlock items={platforms} />
          </InsightCard>
        )}
        {engineRank.length > 0 && (
          <InsightCard title="Engine rank" subtitle="Mentions by platform">
            <RankTable rows={engineRank} nameHeader="Platform" valueHeader="Mentions" />
          </InsightCard>
        )}
        {citationRank.length > 0 && (
          <InsightCard
            title="Citation sources"
            subtitle={`${brandCitations} yours · ${competitorCitations} rivals`}
          >
            <RankTable rows={citationRank} nameHeader="Source" valueHeader="Cited" />
          </InsightCard>
        )}
      </div>
    </section>
  )
}
