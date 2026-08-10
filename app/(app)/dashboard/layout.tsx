import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ViewTransitionProvider } from '@/components/providers/view-transition-provider'
import { AnalysisWatcher } from '@/features/catalyst/components/analysis/AnalysisWatcher'
import { CatalystThemeProvider } from '@/features/catalyst/components/CatalystThemeProvider'
import { DashboardProjectGuard } from '@/features/catalyst/components/DashboardProjectGuard'
import { DashboardToaster } from '@/features/catalyst/components/DashboardToaster'
import { OnboardingFloater } from '@/features/catalyst/components/onboarding/OnboardingFloater'
import { buildMetadata } from '@/features/site/lib/seo'

// Private workspace - keep the whole dashboard tree out of search indexes.
export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Dashboard',
    description: 'SignalorAI workspace dashboard.',
    noindex: true,
  }),
  title: 'Dashboard · SignalorAI',
}

export default function CatalystLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <CatalystThemeProvider>
      <ViewTransitionProvider>
        <DashboardProjectGuard>{children}</DashboardProjectGuard>
      </ViewTransitionProvider>
      <OnboardingFloater />
      {/* Layout-level so the progress toast survives moving between dashboard
          pages; a page-level mount loses the poll on every navigation. */}
      <AnalysisWatcher />
      <DashboardToaster />
    </CatalystThemeProvider>
  )
}
