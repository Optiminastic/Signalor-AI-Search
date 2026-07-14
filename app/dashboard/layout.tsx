import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { CatalystThemeProvider } from '@/features/catalyst/components/CatalystThemeProvider'
import { DashboardProjectGuard } from '@/features/catalyst/components/DashboardProjectGuard'
import { DashboardToaster } from '@/features/catalyst/components/DashboardToaster'
import { buildMetadata } from '@/features/site/lib/seo'

// Private workspace - keep the whole dashboard tree out of search indexes.
export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Dashboard',
    description: 'Signalor workspace dashboard.',
    noindex: true,
  }),
  title: 'Dashboard · Signalor',
}

export default function CatalystLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <CatalystThemeProvider>
      <DashboardProjectGuard>{children}</DashboardProjectGuard>
      <DashboardToaster />
    </CatalystThemeProvider>
  )
}
