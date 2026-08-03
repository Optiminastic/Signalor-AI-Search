import { BrandSettingsLoader } from '@/features/catalyst/components/brands/BrandSettingsLoader'
import { CatalystShell } from '@/features/catalyst/components/CatalystShell'

export default async function BrandSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<JSX.Element> {
  const { slug } = await params

  // Brands live behind the authenticated API, so the lookup runs client-side.
  // Resolving it here meant matching against a build-time demo list, which no
  // real brand appeared in — every gear icon 404'd.
  return (
    <CatalystShell>
      <BrandSettingsLoader slug={slug} />
    </CatalystShell>
  )
}
