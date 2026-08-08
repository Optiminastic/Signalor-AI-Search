'use client'

import { DataState } from '@/features/catalyst/components/DataState'
import { AuditSection } from '@/features/catalyst/components/sitemap/AuditSection'
import { SitemapTabs } from '@/features/catalyst/components/sitemap/SitemapTabs'
import { SitemapUrlBar } from '@/features/catalyst/components/sitemap/SitemapUrlBar'
import { VitalsRow } from '@/features/catalyst/components/sitemap/VitalsRow'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useSitemap } from '@/hooks/useSitemap'

export function SitemapView(): JSX.Element {
  const { slug, isLoading: projectLoading } = useActiveProject()
  const { data, isLoading, isError } = useSitemap(slug)

  return (
    <>
      <SitemapTabs />
      <div className="-mx-3 mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3">
        <DataState
          isLoading={projectLoading || isLoading}
          isError={isError}
          isEmpty={!slug || !data}
          emptyTitle="No sitemap audit yet"
          emptyHint="Run a sitemap audit for this project to crawl and score every page."
        >
          {data && (
            <>
              <SitemapUrlBar url={data.sitemapUrl} />
              <VitalsRow indexed={data.indexed} vitals={data.vitals} />
              <AuditSection filters={data.filters} rows={data.rows} />
            </>
          )}
        </DataState>
      </div>
    </>
  )
}
