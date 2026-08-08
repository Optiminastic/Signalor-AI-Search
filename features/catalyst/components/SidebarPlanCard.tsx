'use client'

import { IconBoltFilled, IconSparklesFilled } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { getSubscriptionStatus } from '@/lib/api/payments'
import { useSession } from '@/lib/auth-client'

/** Plans that still have room to upgrade — hide the nudge for top-tier accounts. */
function canUpgrade(plan: string, isActive: boolean): boolean {
  return !isActive || /free|starter|trial|basic/i.test(plan)
}

/** Reference-style plan card: current plan + a contextual upgrade nudge. Hidden
 *  in the collapsed rail and until the subscription status resolves. */
export function SidebarPlanCard({ collapsed }: { collapsed?: boolean }): JSX.Element | null {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const { data } = useQuery({
    queryKey: ['catalyst', 'subscription', email],
    enabled: Boolean(email),
    queryFn: () => getSubscriptionStatus(email),
  })

  if (collapsed || !data) return null

  return (
    <div className="mt-3 rounded-2xl border border-[var(--cat-border-soft)] bg-[var(--cat-card)] p-3 shadow-[0_1px_2px_rgba(16,24,40,.05)]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[rgba(224,74,61,0.1)] text-[#e04a3d]">
          <IconSparklesFilled size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] tracking-wide text-[var(--cat-ink-3)] uppercase">
            Current plan
          </p>
          <p className="truncate text-[12.5px] font-semibold text-[var(--cat-ink)]">
            {data.plan_label || 'Free'}
          </p>
        </div>
      </div>
      {canUpgrade(data.plan, data.is_active) && <UpgradeCta />}
    </div>
  )
}

function UpgradeCta(): JSX.Element {
  return (
    <>
      <p className="mt-2 text-[11px] leading-snug text-[var(--cat-ink-2)]">
        Unlock more brands, prompts and AI engines.
      </p>
      <Link
        href="/pricing"
        className="mt-2.5 flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#e04a3d] text-[12px] font-semibold text-white transition-colors hover:bg-[#c53f34]"
      >
        <IconBoltFilled size={13} />
        Upgrade
      </Link>
    </>
  )
}
