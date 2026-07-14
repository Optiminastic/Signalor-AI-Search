import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth/auth-shell'
import { OnboardingMarketingPanel } from '@/components/onboarding/onboarding-marketing-panel'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { buildMetadata } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Onboarding',
  description: 'Set up your Signalor workspace.',
  path: '/onboarding',
  noindex: true,
})

export default function OnboardingPage(): JSX.Element {
  return (
    <AuthShell contentClassName="w-[420px]" rightPanel={<OnboardingMarketingPanel />}>
      <OnboardingWizard />
    </AuthShell>
  )
}
