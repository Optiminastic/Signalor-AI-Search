'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { OnboardingStepper } from '@/components/auth/onboarding-stepper'
import { routes } from '@/lib/routes'
import {
  useOnboardingWizardStore,
  WIZARD_STEP_ORDER,
  type WizardStep,
} from '@/stores/useOnboardingWizardStore'

import { AnalyticsStep } from './analytics-step'
import { CompanyStep } from './company-step'
import { InstallStep } from './install-step'
import { LaunchStep } from './launch-step'
import { PlatformStep } from './platform-step'
import { PromptsStep } from './prompts-step'
import { UrlStep } from './url-step'

const STEP_HEADER: Record<WizardStep, { title: string; description: string }> = {
  company: { title: 'Company details', description: 'Tell us about your organization.' },
  platform: { title: "Where's your site built?", description: 'Pick your platform to connect.' },
  url: { title: 'Your website', description: 'Enter your site URL to start analysis.' },
  install: { title: 'Connect your site', description: 'Install Signalor to enable auto-fixes.' },
  prompts: { title: 'Prompts to track', description: "We'll watch how AI answers these." },
  analytics: { title: 'Connect analytics', description: 'Measure AI-driven traffic (optional).' },
  launch: { title: 'Review & launch', description: 'Confirm and start your first analysis.' },
}

const STEP_COMPONENTS: Record<WizardStep, () => JSX.Element> = {
  company: CompanyStep,
  platform: PlatformStep,
  url: UrlStep,
  install: InstallStep,
  prompts: PromptsStep,
  analytics: AnalyticsStep,
  launch: LaunchStep,
}

/** Post-signup product onboarding wizard (company → … → launch). */
export function OnboardingWizard(): JSX.Element {
  const step = useOnboardingWizardStore(s => s.step)
  const reset = useOnboardingWizardStore(s => s.reset)
  const setAppInstalled = useOnboardingWizardStore(s => s.setAppInstalled)
  const setStep = useOnboardingWizardStore(s => s.setStep)

  // On mount: a Webflow/WordPress OAuth redirect returns here as
  // ?webflow=connected|error. Because the store is persisted to sessionStorage,
  // the wizard state survives that same-tab round-trip — so DON'T reset; just
  // advance past the connect step. Any other mount is a fresh start → reset.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('webflow') ?? params.get('wordpress')
    if (result) {
      if (result === 'connected') {
        setAppInstalled(true)
        setStep('prompts')
      }
      window.history.replaceState(null, '', window.location.pathname)
      return
    }
    reset()
  }, [reset, setAppInstalled, setStep])

  const stepIndex = Math.max(0, WIZARD_STEP_ORDER.indexOf(step))
  const { title, description } = STEP_HEADER[step]
  const StepComponent = STEP_COMPONENTS[step]

  return (
    <div>
      <div className="relative mb-5">
        <OnboardingStepper current={stepIndex + 1} total={WIZARD_STEP_ORDER.length} />
        <span className="absolute top-1/2 right-0 -translate-y-1/2 text-[11px] text-neutral-400 tabular-nums">
          {stepIndex + 1}/{WIZARD_STEP_ORDER.length}
        </span>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-[13px] leading-relaxed font-light text-neutral-400">{description}</p>
      </div>

      <div className="mt-5">
        <StepComponent />
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Different account?{' '}
        <Link
          href={routes.signIn}
          className="text-foreground hover:decoration-foreground font-medium underline decoration-neutral-300 underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
