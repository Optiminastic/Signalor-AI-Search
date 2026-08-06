import type { Metadata } from 'next'

import { BenchmarkBuilder } from '@/features/outreach/components/BenchmarkBuilder'

// Internal sales tool, not a marketing page: keep it out of the index.
export const metadata: Metadata = {
  title: 'Outreach benchmark',
  robots: { index: false, follow: false },
}

export default function BenchmarkPage(): JSX.Element {
  return <BenchmarkBuilder />
}
