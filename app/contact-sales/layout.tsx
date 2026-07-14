import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { buildMetadata } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Sales',
  description:
    'Talk to the Signalor team about Enterprise GEO, agency plans, and custom AI visibility rollouts.',
  path: '/contact-sales',
})

export default function ContactSalesLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>
}
