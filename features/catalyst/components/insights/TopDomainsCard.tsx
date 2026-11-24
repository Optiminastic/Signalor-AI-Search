import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { BrandFavicon } from '@/features/catalyst/components/competitors/BrandFavicon'
import { LOGO_SIZE } from '@/features/catalyst/constants'
import type { Citations } from '@/lib/api/analyzer'

type Domain = Citations['domains'][number]

function DomainTag({ domain }: { domain: Domain }): JSX.Element | null {
  if (domain.is_brand) {
    return (
      <span className="text-primary-ink rounded-sm bg-[rgba(224,74,61,0.1)] px-1.5 py-0.5 text-[10px] font-semibold">
        You
      </span>
    )
  }
  if (domain.is_competitor) {
    return (
      <span className="rounded-sm bg-[rgba(246,185,59,0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[#a06f0a]">
        Competitor
      </span>
    )
  }
  return null
}

function DomainRow({ domain, max }: { domain: Domain; max: number }): JSX.Element {
  const width = Math.max(6, Math.round((domain.total / max) * 100))
  return (
    <div className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
      <BrandFavicon
        domain={domain.domain}
        name={domain.domain}
        color="#111827"
        size={LOGO_SIZE.base}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium text-[var(--cat-ink)]">
            {domain.domain}
          </span>
          <DomainTag domain={domain} />
        </p>
        <span className="mt-1 flex h-1 w-full overflow-hidden rounded-full bg-[var(--cat-track)]">
          <span className="rounded-full bg-[#3B9EF6]" style={{ width: `${width}%` }} />
        </span>
      </div>
      <span className="shrink-0 text-[12px] font-semibold text-[var(--cat-ink)] tabular-nums">
        {domain.total}
      </span>
    </div>
  )
}

/** The domains AI answers cite most, with brand/competitor identity tags. */
export function TopDomainsCard({ domains }: { domains: Domain[] }): JSX.Element {
  const max = Math.max(1, ...domains.map(d => d.total))
  return (
    <Card>
      <CardHead title="Top cited domains" />
      <div className="divide-y divide-[var(--cat-border-soft)]">
        {domains.length === 0 ? (
          <p className="py-3 text-[12px] text-[var(--cat-ink-3)]">No citations captured yet.</p>
        ) : (
          domains.map(domain => <DomainRow key={domain.domain} domain={domain} max={max} />)
        )}
      </div>
    </Card>
  )
}
