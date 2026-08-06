import type { Metadata } from 'next'

import { BenchmarkBuilder } from '@/features/outreach/components/BenchmarkBuilder'

export const metadata: Metadata = {
  title: 'Outreach benchmark',
  robots: { index: false, follow: false },
}

/**
 * A previously generated benchmark, addressed by its unguessable slug so it can
 * be shared with the prospect it describes. Reads need no access key; only
 * generating a new report does.
 */
export default async function SharedBenchmarkPage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<JSX.Element> {
  const { slug } = await params
  return <BenchmarkBuilder initialSlug={slug} />
}
