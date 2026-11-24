'use client'

import { useState } from 'react'

import { savePendingAccountType } from '@/components/auth/pending-account-type'
import { ArrowRight, Building2, Check, Users } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useOnboardingStore, type AccountType } from '@/stores/useOnboardingStore'

interface Option {
  value: AccountType
  label: string
  blurb: string
  Icon: typeof Building2
}

const OPTIONS: Option[] = [
  {
    value: 'individual',
    label: 'Sign up as an Individual',
    blurb: 'Track one brand or domain with self-serve .',
    Icon: Building2,
  },
  {
    value: 'agency',
    label: 'Sign up as an Agency',
    blurb: 'Manage multiple client brands with higher ',
    Icon: Users,
  },
]

/** Step 1: choose Individual vs Agency. Drives the rest of the flow. */
export function AccountTypeForm(): JSX.Element {
  const accountType = useOnboardingStore(s => s.accountType)
  const authMode = useOnboardingStore(s => s.authMode)
  const setAccountType = useOnboardingStore(s => s.setAccountType)
  const setStep = useOnboardingStore(s => s.setStep)
  const [selected, setSelected] = useState<AccountType>(accountType)

  const handleContinue = (): void => {
    setAccountType(selected)
    // Stash the choice so it survives a Google OAuth redirect (which wipes the
    // in-memory store). Persisted to the backend on onboarding entry.
    if (authMode === 'sign-up') savePendingAccountType({ accountType: selected })
    // Agencies fill in their name / agency / role before choosing an auth method.
    setStep(authMode === 'sign-up' && selected === 'agency' ? 'org-details' : 'auth-method')
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {OPTIONS.map(opt => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={cn(
                'bg-card flex w-full items-start gap-3 rounded-md px-3 py-3 text-left shadow transition-all',
                active ? 'ring-primary/60 ring-2' : 'ring-foreground/10 hover:bg-muted/40 ring-1',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                  active ? 'bg-primary/10 text-primary-ink' : 'bg-muted text-muted-foreground',
                )}
              >
                <opt.Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-foreground text-[15px] font-semibold">{opt.label}</span>
                  {active && <Check className="text-primary-ink h-4 w-4 shrink-0" />}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-[11px] leading-relaxed">
                  {opt.blurb}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={handleContinue}
        className="auth-cta-btn flex h-10 w-full items-center justify-center gap-1.5 rounded-md text-[15px] font-medium text-white"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
