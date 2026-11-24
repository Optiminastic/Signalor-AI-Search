'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  Loader2,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { getOrgGithubInstallUrl, getOrgGithubStatus } from '@/lib/api/github'
import { connectWordPress, getWebflowAuthUrl } from '@/lib/api/integrations'
import { useSession } from '@/lib/auth-client'
import { useOnboardingWizardStore, type Platform } from '@/stores/useOnboardingWizardStore'

const CARD = 'shadow-input rounded-xl border border-black/8 bg-white p-5'
const CTA =
  'auth-cta-btn flex h-10 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium text-white disabled:opacity-60'
const INPUT =
  'shadow-input h-10 w-full rounded-md border border-black/8 bg-white px-3 text-[13px] outline-none focus:border-black/20'

/** OAuth return path — the backend redirects here with ?webflow=connected. */
const ONBOARDING_RETURN = '/onboarding'

/** Next.js → connect the GitHub App so Signalor can open fix PRs on the repo. */
function GithubConnector({ email }: { email: string }): JSX.Element {
  const setAppInstalled = useOnboardingWizardStore(s => s.setAppInstalled)

  const status = useQuery({
    queryKey: ['onboarding-github', email],
    queryFn: () => getOrgGithubStatus(email),
    enabled: Boolean(email),
    refetchInterval: q => (q.state.data?.connected ? false : 4000),
  })

  const connected = status.data?.connected ?? false

  useEffect(() => {
    if (connected) setAppInstalled(true)
  }, [connected, setAppInstalled])

  const connect = useMutation({
    mutationFn: () => getOrgGithubInstallUrl(email),
    onSuccess: url => {
      window.location.href = url
    },
  })

  if (status.isLoading) {
    return (
      <div className={`${CARD} flex items-center justify-center gap-2 py-6`}>
        <Loader2 className="h-4 w-4 animate-spin text-[var(--cat-ink-3)]" />
        <span className="text-xs text-neutral-500">Checking GitHub connection…</span>
      </div>
    )
  }

  if (connected) {
    return (
      <div className={`${CARD} flex items-start gap-3`}>
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#047857]" />
        <div>
          <p className="text-foreground text-[13px] font-semibold">GitHub repo connected</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {status.data?.repo_full_name || 'Signalor can now open fix PRs on your repo.'}
          </p>
        </div>
      </div>
    )
  }

  const notConfigured = Boolean(status.data && !status.data.configured)

  return (
    <div className={`${CARD} space-y-3`}>
      <ConnectorHeader
        icon={<Github className="text-foreground mt-0.5 h-5 w-5 shrink-0" />}
        title="Connect your GitHub repo"
        body="Install the Signalor GitHub App so it can open fix PRs (schema, llms.txt, robots, canonical) on your Next.js repo."
      />
      {notConfigured ? (
        <p className="rounded-md bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
          GitHub connect isn’t enabled on this server yet — you can skip for now.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => connect.mutate()}
          disabled={connect.isPending}
          className={CTA}
        >
          {connect.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-4 w-4" />
          )}
          Connect GitHub
        </button>
      )}
      {connect.isError && <ConnectError label="GitHub" />}
    </div>
  )
}

/** Webflow → OAuth full-page redirect; the wizard advances on the ?webflow=connected return. */
function WebflowConnector({ email }: { email: string }): JSX.Element {
  const orgId = useOnboardingWizardStore(s => s.orgId)

  const connect = useMutation({
    mutationFn: () => getWebflowAuthUrl(email, ONBOARDING_RETURN, orgId ?? undefined),
    onSuccess: url => {
      window.location.href = url
    },
  })

  return (
    <div className={`${CARD} space-y-3`}>
      <ConnectorHeader
        icon={<Globe className="text-foreground mt-0.5 h-5 w-5 shrink-0" />}
        title="Connect Webflow"
        body="Authorize Signalor via Webflow so it can read your site and apply SEO + schema fixes. You'll approve access on Webflow, then come right back."
      />
      <button
        type="button"
        onClick={() => connect.mutate()}
        disabled={connect.isPending || !email}
        className={CTA}
      >
        {connect.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        Connect Webflow
      </button>
      {connect.isError && <ConnectError label="Webflow" />}
    </div>
  )
}

/** WordPress → install the Signalor GEO plugin, paste its API key, POST connect. */
function WordPressConnector({ email }: { email: string }): JSX.Element {
  const { siteUrl, setAppInstalled, setStep } = useOnboardingWizardStore()
  const [apiKey, setApiKey] = useState('')

  const connect = useMutation({
    mutationFn: () =>
      connectWordPress({ email, siteUrl, apiKey: apiKey.trim(), returnTo: ONBOARDING_RETURN }),
    onSuccess: res => {
      if (res.oauth_url) {
        window.location.href = res.oauth_url
        return
      }
      setAppInstalled(true)
      setStep('prompts')
    },
  })

  return (
    <div className={`${CARD} space-y-3`}>
      <ConnectorHeader
        icon={<Globe className="text-foreground mt-0.5 h-5 w-5 shrink-0" />}
        title="Connect WordPress"
        body="Install the free Signalor GEO plugin, then paste the API key it generates under Settings → Signalor GEO."
      />
      <a
        href="/integration/wordpress"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#e04a3d]"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Get the WordPress plugin
      </a>
      <input
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="Paste your Signalor GEO API key"
        className={INPUT}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => connect.mutate()}
        disabled={connect.isPending || !apiKey.trim()}
        className={CTA}
      >
        {connect.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Connect WordPress
      </button>
      {connect.isError && <ConnectError label="WordPress" />}
    </div>
  )
}

/** Framer → no server connect (matches the old app): install the plugin, analysed by URL. */
function FramerConnector(): JSX.Element {
  const { setAppInstalled, setStep } = useOnboardingWizardStore()
  return (
    <div className={`${CARD} space-y-3`}>
      <ConnectorHeader
        icon={<Globe className="text-foreground mt-0.5 h-5 w-5 shrink-0" />}
        title="Set up Framer"
        body="In Framer, enable Developer Tools and open the Signalor plugin to instrument your site. Signalor also analyses your published site by URL — you can continue either way."
      />
      <button
        type="button"
        onClick={() => {
          setAppInstalled(true)
          setStep('prompts')
        }}
        className={CTA}
      >
        <CheckCircle2 className="h-4 w-4" />
        I’ve installed it
      </button>
    </div>
  )
}

/** Shopify → open the connector marketing page (unchanged). */
function ShopifyConnector(): JSX.Element {
  return (
    <div className={`${CARD} space-y-3`}>
      <p className="text-foreground text-[13px] font-semibold">Connect your Shopify store</p>
      <p className="text-xs leading-relaxed text-neutral-500">
        Install the Signalor connector to enable auto-fixes, schema injection & AI meta tags.
      </p>
      <a href="/integration/shopify" target="_blank" rel="noreferrer" className={CTA}>
        <ExternalLink className="h-4 w-4" />
        Connect Shopify
      </a>
    </div>
  )
}

function ConnectorHeader({
  icon,
  title,
  body,
}: {
  icon: JSX.Element
  title: string
  body: string
}): JSX.Element {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-foreground text-[13px] font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{body}</p>
      </div>
    </div>
  )
}

function ConnectError({ label }: { label: string }): JSX.Element {
  return (
    <p className="text-xs font-medium text-[#E5484D]">
      Couldn’t start the {label} connection. You can skip and connect later.
    </p>
  )
}

function PlatformConnector({
  platform,
  email,
}: {
  platform: Platform
  email: string
}): JSX.Element {
  if (platform === 'nextjs') return <GithubConnector email={email} />
  if (platform === 'webflow') return <WebflowConnector email={email} />
  if (platform === 'wordpress') return <WordPressConnector email={email} />
  if (platform === 'framer') return <FramerConnector />
  return <ShopifyConnector />
}

/** Step 4: platform-aware connect (GitHub for Next.js, OAuth for Webflow, plugin for WordPress). */
export function InstallStep(): JSX.Element {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const { platform, appInstalled, setStep } = useOnboardingWizardStore()

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-foreground text-sm font-semibold">Connect your site</p>
        <p className="mt-1 text-xs leading-relaxed font-light text-neutral-400">
          Let Signalor apply fixes automatically — or skip and analyse by URL.
        </p>
      </div>

      <PlatformConnector platform={platform} email={email} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep('url')}
          className="shadow-input text-foreground flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white text-[13px] font-medium transition hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep('prompts')}
          className="auth-cta-btn flex h-10 flex-[2] items-center justify-center gap-1.5 rounded-md text-[15px] font-medium text-white"
        >
          {appInstalled ? 'Continue' : 'Skip for now'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
