'use client'

import { useState } from 'react'

import { MetricTrendCard } from '@/features/catalyst/components/cards/MetricTrendCard'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useGscData } from '@/hooks/useGscData'

/** Search Console clicks over time, with its own date-range selector. */
export function ClicksTrendCard(): JSX.Element {
  const [days, setDays] = useState<number | undefined>(undefined)
  const { data, isLoading, syncing, isEmpty, connected } = useGscData(days)
  const brandPath = useBrandPath()

  return (
    <MetricTrendCard
      title="Search clicks"
      source="Search Console"
      total={data?.clicks ?? 0}
      totalLabel="clicks"
      trend={(data?.daily_trend ?? []).map(p => p.clicks)}
      days={days}
      onDays={setDays}
      connected={connected}
      isLoading={isLoading}
      syncing={syncing}
      isEmpty={isEmpty}
      connectHref={brandPath('integrations')}
      connectLabel="Connect Search Console"
    />
  )
}
