'use client'

import { DataState } from '@/features/catalyst/components/DataState'
import { SiteOneCategoryCard } from '@/features/catalyst/components/siteone/SiteOneCategoryCard'
import { SiteOneSummary } from '@/features/catalyst/components/siteone/SiteOneSummary'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useSiteOne } from '@/hooks/useSiteOne'

/** Read-only SiteOne technical/SEO breakdown for the active project's latest run. */
export function SiteOneView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useSiteOne(slug)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
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
            <div className="grid gap-2.5 md:grid-cols-2">
              {data.categories.map(category => (
                <SiteOneCategoryCard key={category.code || category.name} category={category} />
              ))}
            </div>
          </>
        )}
      </DataState>
    </div>
  )
}
