import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth/auth-shell'
import { OnboardingFlow } from '@/components/auth/onboarding-flow'
import { buildMetadata } from '@/features/site/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in or create your Signalor account.',
  path: '/sign-in',
  noindex: true,
})

export default function SignInPage(): JSX.Element {
  return (
    <AuthShell>
      <OnboardingFlow mode="sign-in" />
    </AuthShell>
  )
}
