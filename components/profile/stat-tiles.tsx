import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { Activity, FolderKanban, MessageSquare, Sparkles, Wrench, Zap } from '@/lib/icons'
import type { AccountOverview } from '@/services/account.service'

interface StatTileProps {
  label: string
  value: number
  max?: number
  /** Sub-line under the value: what the number means or what happens at the cap. */
  hint?: string
  /** Server-side at-limit verdict; tints the tile so a wall is impossible to miss. */
  atLimit?: boolean
  Icon: typeof Activity
}

/**
 * One usage number.
 *
 * `max === undefined` means the plan is UNLIMITED for this metric (the API
 * reports an uncapped plan as 0), so the tile shows a bare count with no
 * denominator and no meter — a full-looking bar on an unlimited plan would be
 * an outright lie.
 *
 * Border-only, no shadow, per DESIGN.md B4: depth comes from the panel float,
 * not per-card shadows.
 */
function StatTile({ label, value, max, hint, atLimit, Icon }: StatTileProps): JSX.Element {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : null
  return (
    <div
      className={`rounded-md border bg-[var(--cat-card)] p-3 ${
        atLimit ? 'border-[#E5484D]' : 'border-[var(--cat-border)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--cat-ink-2)]">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)]">
          <Icon size={15} strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[26px] font-bold tracking-tight text-[var(--cat-ink)] tabular-nums">
          {value}
        </span>
        {max !== undefined ? (
          <span className="text-xs text-[var(--cat-ink-3)]">/ {max}</span>
        ) : (
          <span className="text-xs text-[var(--cat-ink-3)]">Unlimited</span>
        )}
      </div>
      {pct !== null && (
        <div className="mt-3">
          <TickBar value={pct} ticks={22} showValue={false} />
        </div>
      )}
      {(hint || atLimit) && (
        <p
          className={`mt-2 text-[11px] ${atLimit ? 'font-medium text-[#E5484D]' : 'text-[var(--cat-ink-3)]'}`}
        >
          {atLimit ? 'Limit reached — upgrade to add more' : hint}
        </p>
      )}
    </div>
  )
}

/** The AI spend allowance: the one number that stops analyses running. */
function AllowanceTile({ pct }: { pct: number | null }): JSX.Element {
  if (pct === null) {
    return <StatTile label="AI allowance" value={0} hint="No cap on this plan" Icon={Sparkles} />
  }
  return (
    <div className="rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--cat-ink-2)]">AI allowance used</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)]">
          <Sparkles size={15} strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-3 text-[26px] font-bold tracking-tight text-[var(--cat-ink)] tabular-nums">
        {pct}%
      </div>
      <div className="mt-3">
        <TickBar value={pct} ticks={22} showValue={false} />
      </div>
      <p className="mt-2 text-[11px] text-[var(--cat-ink-3)]">
        {pct >= 100
          ? 'Spent — new analyses are blocked until it resets'
          : 'Of your rolling 30-day LLM budget'}
      </p>
    </div>
  )
}

/**
 * Everything the account is consuming against its plan.
 *
 * Previously three tiles (projects / prompts / runs) because the API client only
 * parsed those three fields. The endpoint also reports the AI spend allowance,
 * the analysis cap and the auto-fix caps — the numbers that actually explain why
 * a run gets refused — so they are shown too.
 */
export function StatTiles({ usage }: { usage: AccountOverview['usage'] }): JSX.Element {
  const window = `Last ${usage.windowDays} days`
  const tiles: (StatTileProps | null)[] = [
    {
      label: 'Projects',
      value: usage.projects.used,
      max: usage.projects.max,
      hint: 'Brands in this workspace',
      atLimit: usage.atLimit.projects,
      Icon: FolderKanban,
    },
    {
      label: 'Tracked prompts',
      value: usage.prompts.used,
      max: usage.prompts.max,
      hint: 'Buyer questions being measured',
      atLimit: usage.atLimit.prompts,
      Icon: MessageSquare,
    },
    {
      label: 'Analyses',
      value: usage.analyses.used,
      max: usage.analyses.max,
      hint: window,
      Icon: Activity,
    },
    {
      label: 'Auto-fixes',
      value: usage.autofixes.used,
      max: usage.autofixes.max,
      hint: window,
      Icon: Wrench,
    },
    // Only meaningful when the plan actually caps per-day auto-fixes.
    usage.autofixesToday.max
      ? {
          label: 'Auto-fixes today',
          value: usage.autofixesToday.used,
          max: usage.autofixesToday.max,
          hint: 'Resets at midnight UTC',
          Icon: Zap,
        }
      : null,
  ]

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <AllowanceTile pct={usage.aiAllowancePct} />
      {tiles
        .filter((t): t is StatTileProps => t !== null)
        .map(tile => (
          <StatTile key={tile.label} {...tile} />
        ))}
    </div>
  )
}
