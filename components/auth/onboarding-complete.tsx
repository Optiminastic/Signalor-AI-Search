'use client'

import Link from 'next/link'

import { Check } from '@/lib/icons'
import { routes } from '@/lib/routes'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

/** Terminal step — shown once the flow finishes (API still stubbed). */
export function OnboardingComplete(): JSX.Element {
  const { authMode, companyName } = useOnboardingStore()
  const isSignUp = authMode === 'sign-up'

  return (
    <div className="flex flex-col items-center text-center">
      <span className="bg-primary/10 text-primary-ink flex h-12 w-12 items-center justify-center rounded-full">
        <Check className="h-6 w-6" />
      </span>
      <h1 className="text-foreground mt-4 text-xl font-semibold tracking-tight">
        {isSignUp ? "You're all set" : 'Signed in'}
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed font-light text-neutral-400">
        {isSignUp
          ? `Welcome${companyName ? ` to ${companyName}` : ''} — your account is ready.`
          : 'Welcome back — continue to your dashboard.'}
      </p>
      <Link
        href={routes.dashboard}
        className="auth-cta-btn mt-6 flex h-10 w-full items-center justify-center rounded-md text-[15px] font-medium text-white"
      >
        Continue to dashboard
      </Link>
    </div>
  )
}
