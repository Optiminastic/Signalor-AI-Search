'use client'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useDomainAuthority } from '@/hooks/useDomainAuthority'
import type { DomainAuthority } from '@/lib/api/analyzer'

const SOURCE_LABEL: Record<string, string> = {
  ahrefs: 'Ahrefs',
  openpagerank: 'Open PageRank',
}

function fmt(n: number | null): string {
  return n === null ? '—' : n.toLocaleString('en-US')
}

function MetricRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between py-1.5 text-[13px]">
      <span className="text-[var(--cat-ink-3)]">{label}</span>
      <span className="font-semibold text-[var(--cat-ink)] tabular-nums">{value}</span>
    </div>
  )
}

function AuthorityBody({ data }: { data: DomainAuthority }): JSX.Element {
  const dr = data.domain_rating
  const hasBacklinks = data.backlinks !== null || data.linking_websites !== null
  return (
    <div className="mt-1 flex flex-col gap-2">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase">
            Domain Rating
          </span>
          <span className="text-[22px] leading-none font-bold text-[var(--cat-ink)] tabular-nums">
            {dr ?? '—'}
          </span>
        </div>
        <div className="mt-2">
          <TickBar value={dr ?? 0} ticks={24} showValue={false} />
        </div>
      </div>
      <div className="border-t border-[var(--cat-border-soft)] pt-1">
        {data.backlinks !== null && <MetricRow label="Backlinks" value={fmt(data.backlinks)} />}
        {data.linking_websites !== null && (
          <MetricRow label="Linking websites" value={fmt(data.linking_websites)} />
        )}
        {!hasBacklinks && data.global_rank !== null && (
          <MetricRow label="Global rank" value={`#${fmt(data.global_rank)}`} />
        )}
        {!hasBacklinks && (
          <p className="pt-1 text-[11px] text-[var(--cat-ink-3)]">
            Connect Ahrefs to track backlinks & linking websites.
          </p>
        )}
      </div>
    </div>
  )
}

function Empty({ children }: { children: string }): JSX.Element {
  return (
    <div className="grid flex-1 place-items-center py-8 text-center text-[13px] text-[var(--cat-ink-3)]">
      {children}
    </div>
  )
}

function AuthorityContent({
  data,
  isLoading,
}: {
  data: DomainAuthority | undefined
  isLoading: boolean
}): JSX.Element {
  if (isLoading) return <Empty>Loading…</Empty>
  if (!data || data.domain_rating === null) return <Empty>Domain authority unavailable yet.</Empty>
  return <AuthorityBody data={data} />
}

/** Brand Domain Authority: DR meter + (with Ahrefs) backlinks & linking websites. */
export function DomainAuthorityCard(): JSX.Element {
  const { slug } = useActiveProject()
  const { data, isLoading } = useDomainAuthority(slug)
  const source = data?.source ? (SOURCE_LABEL[data.source] ?? data.source) : ''

  return (
    <Card>
      <div className="flex items-start justify-between">
        <CardHead title="Domain Authority" />
        {source && (
          <span className="text-[11px] font-medium text-[var(--cat-ink-3)]">{source}</span>
        )}
      </div>
      <AuthorityContent data={data} isLoading={isLoading} />
    </Card>
  )
}
