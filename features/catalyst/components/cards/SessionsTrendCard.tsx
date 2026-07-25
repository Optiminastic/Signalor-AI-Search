'use client'

import { useState } from 'react'

import { MetricTrendCard } from '@/features/catalyst/components/cards/MetricTrendCard'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useGaData } from '@/hooks/useGaData'

/** GA4 sessions over time, with its own date-range selector. */
export function SessionsTrendCard(): JSX.Element {
  const [days, setDays] = useState<number | undefined>(undefined)
  const { data, isLoading, isEmpty, connected } = useGaData(days)
  const brandPath = useBrandPath()

  return (
    <MetricTrendCard
      title="Sessions"
      source="Google Analytics"
      total={data?.sessions ?? 0}
      totalLabel="sessions"
      trend={(data?.daily_trend ?? []).map(p => p.sessions)}
      days={days}
      onDays={setDays}
      connected={connected}
      isLoading={isLoading}
      isEmpty={isEmpty}
      connectHref={brandPath('integrations')}
      connectLabel="Connect Analytics"
    />
  )
}
