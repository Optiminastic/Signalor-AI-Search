import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type WizardStep =
  | 'company'
  | 'platform'
  | 'url'
  | 'install'
  | 'prompts'
  | 'analytics'
  | 'launch'

export type Platform = 'shopify' | 'wordpress' | 'webflow' | 'framer' | 'nextjs'

export const WIZARD_STEP_ORDER: WizardStep[] = [
  'company',
  'platform',
  'url',
  'install',
  'prompts',
  'analytics',
  'launch',
]

interface WizardState {
  step: WizardStep
  companyName: string
  platform: Platform
  siteUrl: string
  /** The single brand-as-project (backend Organization) created in the url step. */
  orgId: number | null
  prompts: string[]
  appInstalled: boolean
  analyticsConnected: boolean
}

interface WizardActions {
  setStep: (step: WizardStep) => void
  setCompanyName: (name: string) => void
  setPlatform: (platform: Platform) => void
  setSiteUrl: (url: string) => void
  setOrgId: (orgId: number | null) => void
  setPrompts: (prompts: string[]) => void
  setAppInstalled: (installed: boolean) => void
  setAnalyticsConnected: (connected: boolean) => void
  reset: () => void
}

const initialState: WizardState = {
  step: 'company',
  companyName: '',
  platform: 'shopify',
  siteUrl: '',
  orgId: null,
  prompts: [],
  appInstalled: false,
  analyticsConnected: false,
}

// Persisted to sessionStorage so the wizard survives a full-page OAuth
// round-trip (e.g. the Webflow connect redirect) in the same tab. A normal
// refresh still resets via OnboardingWizard's mount effect.
export const useOnboardingWizardStore = create<WizardState & WizardActions>()(
  persist(
    set => ({
      ...initialState,
      setStep: step => set({ step }),
      setCompanyName: companyName => set({ companyName }),
      setPlatform: platform => set({ platform }),
      setSiteUrl: siteUrl => set({ siteUrl }),
      setOrgId: orgId => set({ orgId }),
      setPrompts: prompts => set({ prompts }),
      setAppInstalled: appInstalled => set({ appInstalled }),
      setAnalyticsConnected: analyticsConnected => set({ analyticsConnected }),
      reset: () => set(initialState),
    }),
    {
      name: 'signalor-onboarding-wizard',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s): WizardState => ({
        step: s.step,
        companyName: s.companyName,
        platform: s.platform,
        siteUrl: s.siteUrl,
        orgId: s.orgId,
        prompts: s.prompts,
        appInstalled: s.appInstalled,
        analyticsConnected: s.analyticsConnected,
      }),
    },
  ),
)
