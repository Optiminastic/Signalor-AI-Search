import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { buildMetadata } from '@/features/site/lib/seo'

// Transient analysis-progress screen - not a landing target, keep it unindexed.
export const metadata: Metadata = buildMetadata({
  title: 'Analyzing',
  description: 'Signalor is analyzing your site.',
  path: '/loading',
  noindex: true,
})

export default function LoadingLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>
}
