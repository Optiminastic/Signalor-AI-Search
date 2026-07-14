import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Private workspace page - title only; noindex is inherited from the dashboard layout.
export const metadata: Metadata = {
  title: 'Overview · Signalor',
}

export default function SlugOverviewLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>
}
