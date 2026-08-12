'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Chip } from '@/components/base/badges/chip'
import { Check, Copy, ExternalLink, Loader2 } from '@/features/site/components/icons'
import { Button } from '@/features/site/components/ui/button'
import type { CommissionRow } from '@/features/site/lib/api/partners-program'
import { flagEmoji } from '@/features/site/lib/countries'
import { cn } from '@/features/site/lib/utils'

import { useCreator } from './_components/creator-context'

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function CopyPill({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      }}
      className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : label || 'Copy'}
    </button>
  )
}

function StatTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper?: string
  tone?: 'neutral' | 'sky' | 'amber' | 'emerald' | 'violet'
}) {
  const toneClass =
    tone === 'sky'
      ? 'text-info dark:text-info'
      : tone === 'amber'
        ? 'text-warning dark:text-warning'
        : tone === 'emerald'
          ? 'text-success dark:text-success'
          : tone === 'violet'
            ? 'text-[var(--feature-violet)] dark:text-[var(--feature-violet)]'
            : 'text-foreground'
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', toneClass)}>{value}</p>
      {helper ? <p className="text-muted-foreground mt-0.5 text-[11px]">{helper}</p> : null}
    </div>
  )
}

function StatusPill({ row }: { row: CommissionRow }) {
  if (row.bucket === 'paid') {
    return (
      <Chip variant="caption" color="lime">
        Paid
      </Chip>
    )
  }
  if (row.bucket === 'locked') {
    return (
      <Chip variant="caption" color="blue">
        Locked
      </Chip>
    )
  }
  return (
    <Chip variant="caption" color="yellow">
      Pending
    </Chip>
  )
}

export default function CreatorDashboardOverviewPage() {
  const { profile, loading } = useCreator()

  if (loading || !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  const { stats } = profile
  const totalEarned = stats.paid.amount + stats.locked.amount
  const allClaims = stats.paid.count + stats.locked.count + stats.pending.count

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Hi {profile.name || 'creator'}
          </h1>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-[13px]">
            {profile.country ? (
              <span className="inline-flex items-center gap-1">
                <span className="text-base leading-none">{flagEmoji(profile.country)}</span>
                {profile.country}
              </span>
            ) : null}
            <span>·</span>
            <span>{profile.commission_percent}% commission</span>
            <span>·</span>
            <span className="capitalize">{profile.status}</span>
          </p>
        </div>
        <Link
          href={`/creators-program/${profile.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold"
        >
          View public page
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* Share link */}
      <div className="border-border bg-card rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Your share link
            </p>
            <p className="text-muted-foreground mt-1 text-[13px]">
              Anyone who lands on SignalorAI through this link gets 10% off. You earn{' '}
              {profile.commission_percent}% of their first paid invoice.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="border-border bg-background text-foreground min-w-0 flex-1 truncate rounded-md border px-3 py-2 font-mono text-[13px]">
            {profile.share_url}
          </code>
          <CopyPill value={profile.share_url} label="Copy link" />
          <CopyPill value={profile.code} label="Copy code" />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="Attributions"
          value={stats.attributions_total.toString()}
          helper={`${stats.attributions_active} active`}
        />
        <StatTile
          label="Pending"
          value={stats.pending.count.toString()}
          helper={formatMoney(stats.pending.amount, 'USD')}
          tone="amber"
        />
        <StatTile
          label="Locked"
          value={stats.locked.count.toString()}
          helper={formatMoney(stats.locked.amount, 'USD')}
          tone="sky"
        />
        <StatTile
          label="Paid"
          value={stats.paid.count.toString()}
          helper={formatMoney(stats.paid.amount, 'USD')}
          tone="emerald"
        />
        <StatTile
          label="Total earned"
          value={formatMoney(totalEarned, 'USD')}
          helper={`${allClaims} commission${allClaims === 1 ? '' : 's'}`}
          tone="violet"
        />
      </div>

      {/* Recent commissions */}
      <div className="border-border bg-card rounded-xl border">
        <div className="border-border flex items-center justify-between border-b px-5 py-3">
          <p className="text-foreground text-[13px] font-semibold">Recent commissions</p>
          <p className="text-muted-foreground text-[11px]">
            {stats.recent_commissions.length} shown · 30-day refund window
          </p>
        </div>
        {stats.recent_commissions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-foreground text-[13px] font-medium">No commissions yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Share your link to start earning. Commissions land here within minutes of a paid
              signup.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-border border-b">
                <tr className="text-muted-foreground text-left text-[11px] font-semibold tracking-wider uppercase">
                  <th className="px-5 py-2">Date</th>
                  <th className="px-5 py-2">Referee</th>
                  <th className="px-5 py-2 text-right">Amount</th>
                  <th className="px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_commissions.map(row => (
                  <tr
                    key={`${row.created_at}-${row.referee_email}`}
                    className="border-border/60 border-b last:border-0"
                  >
                    <td className="text-muted-foreground px-5 py-3 tabular-nums">
                      {new Date(row.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </td>
                    <td className="text-foreground px-5 py-3 font-mono text-xs">
                      {row.referee_email}
                    </td>
                    <td className="text-foreground px-5 py-3 text-right font-semibold tabular-nums">
                      {formatMoney(row.commission_amount, row.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help footer */}
      <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border p-5 text-xs">
        <p>
          Need to update your payout details or socials?{' '}
          <Link
            href="/creator-dashboard/settings"
            className="text-foreground hover:decoration-foreground font-semibold underline decoration-neutral-300 underline-offset-2"
          >
            Edit profile
          </Link>
          . Questions about a specific commission? Email{' '}
          <a
            href="mailto:creators@signalor.ai"
            className="text-foreground hover:decoration-foreground font-semibold underline decoration-neutral-300 underline-offset-2"
          >
            creators@signalor.ai
          </a>
          .
        </p>
      </div>
    </div>
  )
}
