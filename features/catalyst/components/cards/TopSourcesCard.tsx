'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import { useOverviewFilters } from '@/features/catalyst/components/overview/OverviewFilters'
import { Sparkline } from '@/features/catalyst/components/visibility/Sparkline'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useTopSources, type TopSource } from '@/hooks/useTopSources'

function impactTone(impact: string): { label: string; color: string } {
  const v = impact.toLowerCase()
  if (v.startsWith('high')) return { label: 'High', color: GREEN }
  if (v.startsWith('med')) return { label: 'Medium', color: YELLOW }
  return { label: 'Low', color: NEG }
}

function sentimentColor(sentiment: number): string {
  if (sentiment >= 75) return GREEN
  if (sentiment >= 50) return YELLOW
  return NEG
}

function ImpactCell({ impact }: { impact: string }): JSX.Element {
  const tone = impactTone(impact)
  return (
    <td className="px-2 py-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.color }} />
        <span className="text-[12px] font-medium text-[var(--cat-ink-2)]">{tone.label}</span>
      </span>
    </td>
  )
}

function SourceRow({ source }: { source: TopSource }): JSX.Element {
  return (
    <tr className="border-t border-[var(--cat-border)] transition-colors hover:bg-[var(--cat-hover)]">
      <td className="py-2 pr-2">
        <div className="flex items-center gap-2">
          <EngineLogo name={source.name} size={20} />
          <span className="truncate text-[13px] font-medium text-[var(--cat-ink)]">
            {source.name}
          </span>
        </div>
      </td>
      <td className="px-2 py-2 text-right text-[13px] text-[var(--cat-ink)] tabular-nums">
        {source.mentions}
      </td>
      <td className="px-2 py-2 text-right">
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: sentimentColor(source.sentiment) }}
        >
          {source.sentiment}%
        </span>
      </td>
      <ImpactCell impact={source.impact} />
      <td className="w-16 py-2 pl-2">
        <div className="h-6 w-16">
          <Sparkline
            points={source.spark.length ? source.spark : [0, 0]}
            color={impactTone(source.impact).color}
            className="h-6"
          />
        </div>
      </td>
    </tr>
  )
}

function SourcesTable({ sources }: { sources: TopSource[] }): JSX.Element {
  return (
    <div className="mt-1 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-[11px] font-medium tracking-wide text-[var(--cat-ink-3)] uppercase">
            <th className="pr-2 pb-1 font-medium">Source</th>
            <th className="px-2 pb-1 text-right font-medium">Mentions</th>
            <th className="px-2 pb-1 text-right font-medium">Sentiment</th>
            <th className="px-2 pb-1 font-medium">Impact</th>
            <th className="pb-1 pl-2 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {sources.map(s => (
            <SourceRow key={`${s.name}-${s.engine}`} source={s} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** "Top Performing AI Sources" — where the brand is mentioned, by engine. */
export function TopSourcesCard(): JSX.Element {
  const { slug } = useActiveProject()
  const brandPath = useBrandPath()
  const { engineKey } = useOverviewFilters()
  const { data } = useTopSources(slug)

  const sources = (data ?? []).filter(
    s => engineKey === 'all' || s.engine.toLowerCase() === engineKey,
  )

  return (
    <Card>
      <div className="mb-1">
        <CardHead
          title="Top Performing AI Sources"
          action="View all sources"
          href={brandPath('visibility')}
        />
      </div>

      {sources.length === 0 ? (
        <div className="grid flex-1 place-items-center py-8 text-center text-[13px] text-[var(--cat-ink-3)]">
          No AI-source mentions yet for this filter.
        </div>
      ) : (
        <SourcesTable sources={sources} />
      )}
    </Card>
  )
}
