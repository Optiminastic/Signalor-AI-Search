'use client'

import { Gauge, Sparkles } from '@/features/site/components/icons'
import { UsageMeter } from '@/features/site/components/settings/usage-meter'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/site/components/ui/card'
import type { UsageData } from '@/features/site/lib/api/payments'

interface BillingUsageCardProps {
  usage: UsageData | undefined
  loading: boolean
}

interface MeterRow {
  label: string
  used: number
  cap: number
  valueText?: string
  hint?: string
}

function buildMeters(usage: UsageData): MeterRow[] {
  const windowDays = usage.window_days ?? 30
  const perBrand =
    usage.account_type === 'agency' || usage.usage.projects > 1
      ? 'Cap applies per brand · usage shown across all your brands'
      : undefined
  const rows: MeterRow[] = [
    { label: 'Brands', used: usage.usage.projects, cap: usage.limits.max_projects },
    { label: 'Tracked prompts', used: usage.usage.prompts, cap: usage.limits.max_prompts },
    {
      label: `Analyses · last ${windowDays} days`,
      used: usage.usage.analyses_30d ?? usage.usage.runs_this_month,
      cap: usage.limits.max_analyses_per_month ?? 0,
      hint: perBrand,
    },
    {
      label: `Auto-fixes · last ${windowDays} days`,
      used: usage.usage.autofixes_30d ?? 0,
      cap: usage.limits.max_autofixes_per_month ?? 0,
      hint: perBrand,
    },
    {
      label: 'Auto-fixes · today',
      used: usage.usage.autofixes_today ?? 0,
      cap: usage.limits.max_autofixes_per_day ?? 0,
    },
  ]
  const allowance = usage.ai_allowance
  if (allowance) {
    rows.push({
      label: 'AI usage allowance',
      used: allowance.uncapped ? 0 : allowance.used_pct,
      cap: allowance.uncapped ? 0 : 100,
      valueText: allowance.uncapped ? 'Unlimited' : `${allowance.used_pct}% used`,
      hint: `Overall AI workload included in your plan, rolling ${windowDays}-day basis.`,
    })
  }
  return rows
}

export function BillingUsageCard({ usage, loading }: BillingUsageCardProps): JSX.Element {
  const windowDays = usage?.window_days ?? 30
  const regens = usage?.limits.max_autofix_regens ?? 0

  return (
    <Card className="glass-card border-border/70">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gauge className="text-primary h-4 w-4" />
          <CardTitle>Usage &amp; limits</CardTitle>
        </div>
        <CardDescription>
          Analyses and auto-fixes reset on a rolling {windowDays}-day basis; prompts reset with
          your billing cycle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !usage ? (
          <p className="text-muted-foreground text-sm">Loading usage…</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {buildMeters(usage).map(m => (
                <UsageMeter key={m.label} {...m} />
              ))}
            </div>
            {regens > 0 && (
              <p className="text-muted-foreground text-xs">
                Each recommendation can be regenerated up to{' '}
                <span className="text-foreground font-semibold tabular-nums">{regens} times</span>.
              </p>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="text-primary h-3.5 w-3.5" />
                <p className="text-foreground text-sm">AI engines on your plan</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {usage.limits.engines.map(engine => (
                  <span
                    key={engine}
                    className="bg-muted text-foreground rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
                  >
                    {engine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
