'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useSession } from '@/lib/auth-client'
import { ArrowLeft, Loader2, Rocket } from '@/lib/icons'
import { routes } from '@/lib/routes'
import { launchAnalysis, subscriptionGate } from '@/services/onboarding.service'
import { useOnboardingWizardStore } from '@/stores/useOnboardingWizardStore'
import { useProjectStore } from '@/stores/useProjectStore'

const PILLARS = ['Content', 'Schema', 'E-E-A-T', 'Technical', 'Entity', 'AI Visibility']

/** Step 7: review summary and launch the first analysis. */
export function LaunchStep(): JSX.Element {
  const router = useRouter()
  const { data: session } = useSession()
  const {
    companyName,
    platform,
    siteUrl,
    orgId,
    prompts,
    appInstalled,
    analyticsConnected,
    setStep,
  } = useOnboardingWizardStore()
  const setActiveOrgId = useProjectStore(s => s.setActiveOrgId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const summary: Array<{ k: string; v: string; warn?: boolean }> = [
    { k: 'Brand', v: companyName || '—' },
    { k: 'Platform', v: platform.charAt(0).toUpperCase() + platform.slice(1) },
    { k: 'App installed', v: appInstalled ? 'Yes' : 'Not yet', warn: !appInstalled },
    { k: 'Analytics', v: analyticsConnected ? 'Connected' : 'Skipped' },
    { k: 'Prompts', v: `${prompts.filter(Boolean).length} tracked` },
  ]

  const handleLaunch = async (): Promise<void> => {
    setLoading(true)
    setError('')
    try {
      const email = session?.user?.email ?? ''
      // Non-subscribers pick a plan first; subscribers (and internal emails)
      // go straight into the analysis. Pricing opens on the audience matching
      // the account type chosen at sign-up (brand vs agency), and returns here
      // after checkout so the user can hit Launch again.
      const gate = await subscriptionGate(email)
      if (!gate.active) {
        const params = new URLSearchParams({
          audience: gate.accountType,
          returnTo: routes.onboarding,
        })
        router.push(`${routes.pricing}?${params.toString()}`)
        return
      }
      const result = await launchAnalysis({
        url: siteUrl,
        email,
        orgId: orgId ?? undefined,
        brandName: companyName,
        prompts: prompts.filter(Boolean),
      })
      if (!result.ok) {
        setError(result.error ?? 'Failed to launch. Please try again.')
        return
      }
      // Make the brand just created the dashboard's active project, so when the
      // analysis finishes the dashboard opens THIS brand (which owns the fresh
      // run) rather than a stale/default one — otherwise the guard can bounce a
      // multi-brand user back to onboarding.
      if (orgId) setActiveOrgId(orgId)
      // Hand off to the analysing screen, which polls the run and lands on the
      // dashboard when the first analysis completes.
      router.push(routes.loading)
    } catch {
      setError('Failed to launch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {siteUrl && (
        <p className="text-center text-xs font-light text-neutral-400">
          Site{' '}
          <span className="text-foreground font-medium">
            {siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </span>
        </p>
      )}

      <div className="shadow-input overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {summary.map((r, i) => (
          <div
            key={r.k}
            className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-neutral-200' : ''}`}
          >
            <span className="text-xs text-neutral-500">{r.k}</span>
            <span
              className={`text-xs font-medium ${r.warn ? 'text-[#b45309]' : 'text-foreground'}`}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {PILLARS.map(n => (
          <span
            key={n}
            className="rounded-md border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium tracking-tight text-neutral-500"
          >
            {n}
          </span>
        ))}
      </div>

      {error && (
        <p className="border-destructive/20 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-center text-xs font-medium">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleLaunch}
        disabled={loading}
        className="auth-cta-btn flex h-10 w-full items-center justify-center gap-1.5 rounded-md text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Rocket className="h-4 w-4" />
            Launch analysis
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setStep('analytics')}
        disabled={loading}
        className="hover:text-foreground flex h-9 w-full items-center justify-center gap-1.5 text-[13px] text-neutral-500 transition disabled:opacity-60"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>
    </div>
  )
}
