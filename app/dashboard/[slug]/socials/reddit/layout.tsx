import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Private workspace page - title only; noindex is inherited from the dashboard layout.
export const metadata: Metadata = {
  title: 'Reddit · Signalor',
}

export default function RedditLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>
}
