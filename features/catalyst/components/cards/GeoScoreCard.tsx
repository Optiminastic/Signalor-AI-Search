'use client'

import { useState } from 'react'

import { Badge } from '@/features/catalyst/components/Badge'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { AnimatedScore } from '@/features/catalyst/components/cards/AnimatedScore'
import { Delta } from '@/features/catalyst/components/Delta'
import { LineChart } from '@/features/catalyst/components/LineChart'
import { RangeTabs, type Range } from '@/features/catalyst/components/RangeTabs'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useGeoScore } from '@/hooks/useGeoScore'

export function GeoScoreCard(): JSX.Element {
  const { slug } = useActiveProject()
  const [range, setRange] = useState<Range>('1W')
  const { data } = useGeoScore(slug, range)

  return (
    <Card>
      <CardHead title="GEO Score" action="Report" />
      <div className="flex items-center gap-2.5">
        <AnimatedScore value={data?.score} />
        <Badge positive={data?.positive ?? true}>{data ? data.delta : '—'}</Badge>
      </div>
      <RangeTabs value={range} onChange={setRange} />
      <LineChart data={data?.points ?? []} />
      <div className="mt-3 flex flex-col gap-2.5">
        {(data?.engines ?? []).map(engine => (
          <div key={engine.key} className="flex items-center gap-2.5 text-[13px]">
            <engine.icon size={16} className="text-[var(--cat-ink-2)]" />
            <span className="font-medium text-[var(--cat-ink)]">{engine.name}</span>
            <span className="ml-auto font-semibold text-[var(--cat-ink)]">{engine.value}</span>
            <span className="w-[64px] text-right">
              <Delta positive={engine.positive}>{engine.mentions} mentions</Delta>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
