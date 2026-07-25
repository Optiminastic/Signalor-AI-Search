'use client'

import Link from 'next/link'

import { Card } from '@/features/catalyst/components/Card'
import { GeoTrendLine } from '@/features/catalyst/components/cards/GeoTrendLine'
import { RangeSelect } from '@/features/catalyst/components/overview/RangeSelect'
import { Loader2 } from '@/lib/icons'

export interface MetricTrendCardProps {
  title: string
  source: string
  /** Headline total for the selected window. */
  total: number
  totalLabel: string
  /** Per-day values for the trend line. */
  trend: number[]
  days: number | undefined
  onDays: (days: number | undefined) => void
  connected: boolean
  isLoading: boolean
  isEmpty: boolean
  connectHref: string
  connectLabel: string
}

function CenteredNote({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="grid min-h-[132px] flex-1 place-items-center px-2 text-center text-[12.5px] text-[var(--cat-ink-3)]">
      {children}
    </div>
  )
}

function TrendBody({
  total,
  totalLabel,
  trend,
}: Pick<MetricTrendCardProps, 'total' | 'totalLabel' | 'trend'>): JSX.Element {
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] leading-none font-bold tracking-tight text-[var(--cat-ink)] tabular-nums">
          {total.toLocaleString()}
        </span>
        <span className="text-[12px] text-[var(--cat-ink-3)]">{totalLabel}</span>
      </div>
      {trend.length > 1 ? (
        <GeoTrendLine data={trend} />
      ) : (
        <p className="mt-6 text-[12px] text-[var(--cat-ink-3)]">
          Not enough data to plot a trend yet.
        </p>
      )}
    </div>
  )
}

function CardBody(props: MetricTrendCardProps): JSX.Element {
  const { connected, isLoading, isEmpty, connectHref, connectLabel, title } = props
  if (connected && isLoading) {
    return (
      <CenteredNote>
        <Loader2 className="h-5 w-5 animate-spin text-[var(--cat-ink-3)]" />
      </CenteredNote>
    )
  }
  if (!connected) {
    return (
      <CenteredNote>
        <span className="flex flex-col items-center gap-2">
          Connect Google to track {title.toLowerCase()} over time.
          <Link
            href={connectHref}
            className="auth-cta-btn inline-flex h-8 items-center rounded-md px-3 text-[12px] font-semibold text-white"
          >
            {connectLabel}
          </Link>
        </span>
      </CenteredNote>
    )
  }
  if (isEmpty) return <CenteredNote>No data for the selected range.</CenteredNote>
  return <TrendBody total={props.total} totalLabel={props.totalLabel} trend={props.trend} />
}

/** A titled metric card: headline total + trend line + a per-card date range. */
export function MetricTrendCard(props: MetricTrendCardProps): JSX.Element {
  return (
    <Card>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-[var(--cat-ink)]">{props.title}</p>
          <p className="text-[11px] text-[var(--cat-ink-3)]">{props.source}</p>
        </div>
        {props.connected && <RangeSelect value={props.days} onChange={props.onDays} />}
      </div>
      <CardBody {...props} />
    </Card>
  )
}
