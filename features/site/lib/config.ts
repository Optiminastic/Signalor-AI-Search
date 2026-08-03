import { env } from './env'

export const config = {
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
  authBaseUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  framerPluginInstallUrl: env.NEXT_PUBLIC_FRAMER_PLUGIN_URL,
} as const

/**
 * Self-hosted WordPress plugin zips in `public/downloads/`.
 * When you release a new build: bump `version`, run `python scripts/build_signalor_geo_zip.py`,
 * commit both zips, and set `zipPathVersioned` to match (e.g. signalor-geo-1.0.2.zip).
 */
export const signalorWpPlugin = {
  version: '1.0.1',
  zipPath: '/downloads/signalor-geo.zip',
  zipPathVersioned: '/downloads/signalor-geo-1.0.1.zip',
} as const

export const routes = {
  signIn: '/sign-in',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  /** Analysing screen — polls the latest run by email, lands on the dashboard. */
  loading: '/loading',
  authCallback: '/auth/callback',
  onboardingCompanyInfo: '/onboarding/company-info',
  agencyWorkspace: '/dashboard/agency',
  dashboardProject: (slug: string) => `/dashboard/${slug}`,
  dashboardProjectRecommendations: (slug: string) => `/dashboard/${slug}/recommendations`,
  dashboardProjectVisibility: (slug: string) => `/dashboard/${slug}/visibility`,
  dashboardProjectPrompts: (slug: string) => `/dashboard/${slug}/prompt-tracker`,
  dashboardProjectAnalytics: (slug: string) => `/dashboard/${slug}/analytics`,
  dashboardProjectIntegrations: (slug: string) => `/dashboard/${slug}/integrations`,
  dashboardProjectSearchConsole: (slug: string) => `/dashboard/${slug}/search-console`,
  analyzer: '/sign-up',
  analyzerResults: (_runId: string | number) => '/sign-up',
  settingsAccount: '/settings/account',
  settingsBilling: '/settings/billing',
  contactSales: '/contact-sales',
} as const
