'use client'

import { Chip, type ChipColor } from '@/components/base/badges/chip'
import { Favicon } from '@/components/Favicon'
import { TransitionLink } from '@/components/TransitionLink'
import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useOpportunities, type Opportunity } from '@/hooks/useOpportunities'
import { ArrowRight, ExternalLink, Link2, MessageSquare, Star } from '@/lib/icons'

const ENGAGE_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-2.5 py-1 text-[12px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-[var(--cat-hover)]'

/** Category → its glyph, rendered as an element (not a component alias). */
function CategoryGlyph({ category }: { category: string }): JSX.Element {
  const c = category.toLowerCase()
  if (c === 'community' || c === 'forum') return <MessageSquare size={16} strokeWidth={2} />
  if (c === 'directory' || c === 'review') return <Star size={16} strokeWidth={2} />
  return <Link2 size={16} strokeWidth={2} />
}

function impactColor(impact: Opportunity['impact']): ChipColor {
  if (impact === 'High impact') return 'lime'
  if (impact === 'Med impact') return 'yellow'
  return 'neutral'
}

function EngageButton({
  opp,
  backlinksHref,
}: {
  opp: Opportunity
  backlinksHref: string
}): JSX.Element {
  if (opp.submitUrl) {
    return (
      <a href={opp.submitUrl} target="_blank" rel="noopener noreferrer" className={ENGAGE_CLASS}>
        <ExternalLink size={13} /> Engage
      </a>
    )
  }
  return (
    <TransitionLink href={backlinksHref} className={ENGAGE_CLASS}>
      <MessageSquare size={13} /> Engage
    </TransitionLink>
  )
}

function OpportunityRow({ opp }: { opp: Opportunity }): JSX.Element {
  const backlinksHref = useBrandPath()('backlinks')
  return (
    <div className="bg-background-primary-default hover:bg-background-secondary-default rounded-2xl border border-[var(--cat-border-soft)] p-2.5 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center text-[var(--cat-ink-2)]">
            <Favicon
              url={opp.submitUrl}
              size={20}
              className="h-5 w-5 rounded object-contain"
              fallback={<CategoryGlyph category={opp.category} />}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[var(--cat-ink)]">{opp.name}</p>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--cat-ink-3)]">
              {opp.rationale || opp.description || opp.category || 'Awaiting engagement'}
            </p>
          </div>
        </div>
        <Chip variant="caption" color={impactColor(opp.impact)} className="shrink-0">
          {opp.impact}
        </Chip>
      </div>
      <div className="mt-2 flex items-center justify-end">
        <EngageButton opp={opp} backlinksHref={backlinksHref} />
      </div>
    </div>
  )
}

/** "Engagement Opportunities" — placements to pursue to lift AI visibility. */
export function EngagementOpportunitiesCard(): JSX.Element {
  const { slug } = useActiveProject()
  const brandPath = useBrandPath()
  const { data } = useOpportunities(slug)

  const rows = (data ?? []).slice(0, 3)

  return (
    <Card>
      <div className="mb-1">
        <CardHead title="Engagement Opportunities" />
      </div>

      {rows.length === 0 ? (
        <div className="grid flex-1 place-items-center py-8 text-center text-[13px] text-[var(--cat-ink-3)]">
          No opportunities yet — run an analysis to generate them.
        </div>
      ) : (
        <div className="mt-1 flex flex-col gap-2">
          {rows.map(o => (
            <OpportunityRow key={o.id || o.name} opp={o} />
          ))}
        </div>
      )}

      <TransitionLink
        href={brandPath('backlinks')}
        className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-[var(--cat-border)] py-1.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        View all opportunities <ArrowRight size={13} />
      </TransitionLink>
    </Card>
  )
}
