'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock } from '@/features/site/components/icons'

import { useSession } from '@/features/site/lib/auth-client'
import { getSubscriptionStatus } from '@/features/site/lib/api/payments'
import { routes } from '@/features/site/lib/config'
import { cn } from '@/features/site/lib/utils'

type GateTheme = 'orange' | 'blue' | 'emerald' | 'violet'

const THEME: Record<GateTheme, { border: string; btn: string; eyebrow: string; bg: string }> = {
  orange: {
    border: 'border-primary/25',
    btn: 'bg-primary',
    eyebrow: 'text-primary-ink',
    bg: 'bg-gradient-to-br from-primary/5 via-white to-primary/10',
  },
  blue: {
    border: 'border-info/25',
    btn: 'bg-info',
    eyebrow: 'text-info',
    bg: 'bg-gradient-to-br from-info/5 via-white to-info/10',
  },
  emerald: {
    border: 'border-success/25',
    btn: 'bg-success',
    eyebrow: 'text-success',
    bg: 'bg-gradient-to-br from-success/5 via-white to-success/10',
  },
  violet: {
    border: 'border-[var(--feature-violet)]/25',
    btn: 'bg-[var(--feature-violet)]',
    eyebrow: 'text-[var(--feature-violet)]',
    bg: 'bg-gradient-to-br from-[var(--feature-violet)]/5 via-white to-[var(--feature-violet)]/10',
  },
}

export function ToolGateCard({
  theme,
  signedOutMessage,
  upgradeMessage,
  signedInActiveMessage,
  signedInActiveHref = routes.dashboard,
  signedInActiveLabel = 'Open dashboard',
}: {
  theme: GateTheme
  signedOutMessage: string
  upgradeMessage: string
  signedInActiveMessage?: string
  signedInActiveHref?: string
  signedInActiveLabel?: string
}) {
  const { data: session, isPending } = useSession()
  const [active, setActive] = useState<boolean | null>(null)
  const t = THEME[theme]

  useEffect(() => {
    if (!session?.user?.email) {
      setActive(null)
      return
    }
    let alive = true
    getSubscriptionStatus(session.user.email)
      .then(s => {
        if (alive) setActive(!!s.is_active)
      })
      .catch(() => {
        if (alive) setActive(false)
      })
    return () => {
      alive = false
    }
  }, [session?.user?.email])

  if (isPending) return null

  if (!session) {
    return (
      <div className={cn('rounded-xl border p-5 shadow-sm', t.border, t.bg)}>
        <div className="flex items-center gap-2">
          <Lock className={cn('h-3.5 w-3.5', t.eyebrow)} />
          <p className={cn('text-[11px] font-semibold tracking-wide uppercase', t.eyebrow)}>
            Unlock the full report
          </p>
        </div>
        <p className="text-foreground mt-2 text-sm font-semibold">{signedOutMessage}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={routes.signUp}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110',
              t.btn,
            )}
          >
            Create a free account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={routes.signIn}
            className="text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-4 py-2 text-xs font-semibold"
          >
            Log in
          </Link>
        </div>
      </div>
    )
  }

  if (active === false) {
    return (
      <div className={cn('rounded-xl border p-5 shadow-sm', t.border, t.bg)}>
        <div className="flex items-center gap-2">
          <Lock className={cn('h-3.5 w-3.5', t.eyebrow)} />
          <p className={cn('text-[11px] font-semibold tracking-wide uppercase', t.eyebrow)}>
            Upgrade to see the full report
          </p>
        </div>
        <p className="text-foreground mt-2 text-sm font-semibold">{upgradeMessage}</p>
        <div className="mt-3">
          <Link
            href="/pricing"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110',
              t.btn,
            )}
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  if (active === true) {
    return (
      <div className="bg-muted rounded-xl border border-black/6 p-5">
        <p className="text-foreground text-sm font-semibold">
          {signedInActiveMessage ?? 'Run this on your connected projects for site-wide coverage.'}
        </p>
        <Link
          href={signedInActiveHref}
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110',
            t.btn,
          )}
        >
          {signedInActiveLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  return null
}
