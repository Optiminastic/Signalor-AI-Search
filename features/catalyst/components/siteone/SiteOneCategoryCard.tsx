'use client'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Card } from '@/features/catalyst/components/Card'
import { GREEN, NEG, YELLOW } from '@/features/catalyst/constants'
import type { SiteOneCategory, SiteOneDeduction } from '@/lib/api/siteone'

interface SiteOneCategoryCardProps {
  category: SiteOneCategory
}

/** 0-10 SiteOne score → traffic-light colour (shared with the summary tiles). */
function scoreColor(score: number): string {
  if (score >= 8) return GREEN
  if (score >= 5) return YELLOW
  return NEG
}

function DeductionRow({ deduction }: { deduction: SiteOneDeduction }): JSX.Element {
  return (
    <li className="flex items-start gap-2 border-t border-[var(--cat-border)] px-3 py-2 first:border-t-0">
      <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-[#e5484d] tabular-nums">
        -{deduction.points.toFixed(1)}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-[var(--cat-ink)]">{deduction.reason || 'Issue'}</p>
        {deduction.fix && (
          <p className="mt-0.5 text-[11px] text-[var(--cat-ink-3)]">Fix: {deduction.fix}</p>
        )}
      </div>
    </li>
  )
}

/** One SiteOne quality category: score meter + its scored deductions and fixes. */
export function SiteOneCategoryCard({ category }: SiteOneCategoryCardProps): JSX.Element {
  const color = scoreColor(category.score)
  return (
    <Card className="gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--cat-ink)]">
          {category.name || category.code}
        </h3>
        <span className="text-[12px] font-medium tabular-nums" style={{ color }}>
          {category.score.toFixed(1)}/10
          {category.label && (
            <span className="ml-1.5 text-[var(--cat-ink-3)]">{category.label}</span>
          )}
        </span>
      </div>
      <TickBar value={Math.round(category.score * 10)} showValue={false} />
      {category.deductions.length > 0 ? (
        <ul className="mt-1 overflow-hidden rounded-md border border-[var(--cat-border)]">
          {category.deductions.map((d, i) => (
            <DeductionRow key={`${d.reason}-${i}`} deduction={d} />
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-[var(--cat-ink-3)]">No issues found in this category.</p>
      )}
    </Card>
  )
}
