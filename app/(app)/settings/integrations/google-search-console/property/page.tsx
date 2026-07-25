'use client'

import Link from 'next/link'
import { useState } from 'react'

import { CallbackPanel } from '@/features/integrations/components/CallbackPanel'
import { GscSitePicker } from '@/features/integrations/components/GscSitePicker'
import { useSession } from '@/lib/auth-client'
import { CheckCircle2, Loader2 } from '@/lib/icons'
import { routes } from '@/lib/routes'

/**
 * Choose which Search Console property this brand reads from.
 *
 * GSC's OAuth callback is server-side (the backend exchanges the code and
 * redirects here with ?gsc=connected), so — unlike GA4 — the property step lives
 * on its own page. Tokens are already stored, so the picker lists and binds a
 * site directly, no second trip through Google.
 */
function ChooseSite(): JSX.Element {
  const { data: session } = useSession()
  const email = session?.user?.email
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <CallbackPanel
        title="Property connected"
        icon={<CheckCircle2 className="h-6 w-6 text-[#047857]" />}
      >
        <p className="flex items-center justify-center gap-1.5 text-[13px] text-neutral-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          First sync in progress — usually 1&ndash;2 minutes.
        </p>
        <p className="mt-1.5 text-[12px] text-neutral-400">
          You can head to the dashboard now; the Search Console cards fill in automatically as data
          lands.
        </p>
        <Link
          href={routes.dashboard}
          className="auth-cta-btn mt-4 inline-flex h-9 items-center rounded-md px-4 text-[13px] font-medium text-white"
        >
          Go to dashboard
        </Link>
      </CallbackPanel>
    )
  }

  if (!email) {
    return (
      <CallbackPanel title="Choose a Search Console property">
        <p className="text-[13px] text-neutral-500">
          Sign in to choose your Search Console property.
        </p>
      </CallbackPanel>
    )
  }

  return (
    <CallbackPanel title="Choose a Search Console property">
      <GscSitePicker email={email} onDone={() => setDone(true)} />
    </CallbackPanel>
  )
}

export default function ChooseGscSitePage(): JSX.Element {
  return <ChooseSite />
}
