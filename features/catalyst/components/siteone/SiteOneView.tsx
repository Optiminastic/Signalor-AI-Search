'use client'

import { DataState } from '@/features/catalyst/components/DataState'
import { SiteOneCategoryCard } from '@/features/catalyst/components/siteone/SiteOneCategoryCard'
import { SiteOneFindings } from '@/features/catalyst/components/siteone/SiteOneFindings'
import { SiteOneSummary } from '@/features/catalyst/components/siteone/SiteOneSummary'
import { SiteOneTables } from '@/features/catalyst/components/siteone/SiteOneTables'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useSiteOne } from '@/hooks/useSiteOne'

/** Full read-only SiteOne technical/SEO report for the active project's run. */
export function SiteOneView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useSiteOne(slug)

  return (
    <div className="-mx-3 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-6">
      <DataState
        isLoading={projectLoading || isLoading}
        isError={isError}
        isEmpty={!slug || !data}
        emptyTitle="No SiteOne report yet"
        emptyHint="SiteOne technical crawling is not enabled for this project's latest run."
      >
        {data && (
          <>
            <SiteOneSummary report={data} />
            <SiteOneFindings findings={data.findings} />
            {data.categories.length > 0 && (
              <section className="flex flex-col gap-3">
                <h3 className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
                  Category scores
                </h3>
                <div className="grid gap-2.5 md:grid-cols-2">
                  {data.categories.map(category => (
                    <SiteOneCategoryCard key={category.code || category.name} category={category} />
                  ))}
                </div>
              </section>
            )}
            <SiteOneTables tables={data.tables} />
          </>
        )}
      </DataState>
    </div>
  )
}
