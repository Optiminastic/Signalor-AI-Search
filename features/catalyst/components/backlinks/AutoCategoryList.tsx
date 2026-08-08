'use client'

import { useState } from 'react'

import { AUTO_SITES, groupBySite } from '@/features/catalyst/backlinks-data'
import { CategoryAccordion } from '@/features/catalyst/components/backlinks/CategoryAccordion'
import type { AutoBacklink } from '@/lib/api/backlinks'

interface AutoCategoryListProps {
  rows: AutoBacklink[]
}

/** The bordered card of five collapsible category accordions. */
export function AutoCategoryList({ rows }: AutoCategoryListProps): JSX.Element {
  const groups = groupBySite(rows)
  const firstWithRows = groups.find(g => g.rows.length > 0)?.site.value ?? AUTO_SITES[0].value
  const [open, setOpen] = useState<Record<string, boolean>>({ [firstWithRows]: true })

  const toggle = (value: string): void => setOpen(prev => ({ ...prev, [value]: !prev[value] }))

  return (
    <div className="cat-rise cat-card-edge overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
      {groups.map(({ site, rows: siteRows }) => (
        <CategoryAccordion
          key={site.value}
          site={site}
          rows={siteRows}
          open={Boolean(open[site.value])}
          onToggle={() => toggle(site.value)}
        />
      ))}
    </div>
  )
}
