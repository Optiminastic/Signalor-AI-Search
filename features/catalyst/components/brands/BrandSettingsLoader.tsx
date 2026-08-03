'use client'

import { BrandSettingsView } from '@/features/catalyst/components/brands/BrandSettingsView'
import { DataState } from '@/features/catalyst/components/DataState'
import { useBrands } from '@/hooks/useBrands'

/**
 * Resolves the brand for the settings page from the real workspace.
 *
 * The page used to look the slug up in a hard-coded demo array, so every real
 * brand 404'd — the gear icon in the brands list never opened anything.
 */
export function BrandSettingsLoader({ slug }: { slug: string }): JSX.Element {
  const { data, isLoading, isError } = useBrands()
  const brand = data?.find(b => b.slug === slug)

  return (
    <DataState
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !brand}
      emptyTitle="Brand not found"
      emptyHint="It may have been removed, or belong to another workspace."
    >
      {brand && <BrandSettingsView brand={brand} />}
    </DataState>
  )
}
