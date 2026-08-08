'use client'

import { useState, type ReactNode } from 'react'

import { CONTROL_CHIP, CONTROL_RING } from '@/features/catalyst/components/control-styles'
import { EngineLogo } from '@/features/catalyst/components/EngineLogo'
import {
  ENGINE_LABELS,
  RANGE_LABELS,
  useOverviewFilters,
  type EngineLabel,
  type RangeLabel,
} from '@/features/catalyst/components/overview/OverviewFilters'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { BRAND } from '@/features/catalyst/constants'
import { engineLogo } from '@/features/catalyst/engine-logos'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useAnalysisCooldown } from '@/hooks/useAnalysisCooldown'
import { useNewAnalysis } from '@/hooks/useNewAnalysis'
import { useOverview, type OverviewStats } from '@/hooks/useOverview'
import type { LucideIcon } from '@/lib/icons'
import {
  Calendar,
  Check,
  ChevronDown,
  Download,
  Loader2,
  RotateCw,
  SlidersHorizontal,
} from '@/lib/icons'

const PANEL = `absolute right-0 z-50 mt-2 min-w-[190px] rounded-md bg-background-primary-default p-1 shadow-lg ${CONTROL_RING}`

/** Lightweight dropdown: a trigger + a click-away backdrop + a panel. */
function Dropdown({
  trigger,
  children,
}: {
  trigger: (toggle: () => void) => ReactNode
  children: (close: () => void) => ReactNode
}): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    // shrink-0: without it this wrapper collapses under a crowded bar and the
    // chip inside is squeezed regardless of its own shrink-0.
    <div className="relative shrink-0">
      {trigger(() => setOpen(o => !o))}
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className={PANEL}>{children(() => setOpen(false))}</div>
        </>
      )}
    </div>
  )
}

function MenuItem({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-background-secondary-default flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-[13px] text-[var(--cat-ink)] transition-colors"
    >
      <Check size={13} className={active ? 'text-[#e04a3d]' : 'opacity-0'} />
      {children}
    </button>
  )
}

interface SelectChipProps {
  icon: LucideIcon
  options: string[]
  value: string
  onChange: (v: string) => void
  /** Show each engine's logo (Topbar engine filter). */
  withLogos?: boolean
}

/** Leading glyph for a labelled option — the engine logo when available. */
function OptionGlyph({
  name,
  size,
  withLogos,
}: {
  name: string
  size: number
  withLogos: boolean
}): JSX.Element | null {
  if (withLogos && engineLogo(name)) return <EngineLogo name={name} size={size} />
  return null
}

function SelectChip({
  icon: Icon,
  options,
  value,
  onChange,
  withLogos = false,
}: SelectChipProps): JSX.Element {
  const trigger = (toggle: () => void): JSX.Element => (
    <button type="button" className={CONTROL_CHIP} onClick={toggle}>
      {withLogos && engineLogo(value) ? (
        <EngineLogo name={value} size={18} />
      ) : (
        <Icon size={16} className="text-[var(--cat-ink-2)]" />
      )}{' '}
      {value}
      <ChevronDown size={15} className="text-[var(--cat-ink-3)]" />
    </button>
  )
  return (
    <Dropdown trigger={trigger}>
      {close =>
        options.map(opt => (
          <MenuItem
            key={opt}
            active={opt === value}
            onClick={() => {
              onChange(opt)
              close()
            }}
          >
            <span className="flex items-center gap-2">
              <OptionGlyph name={opt} size={16} withLogos={withLogos} />
              {opt}
            </span>
          </MenuItem>
        ))
      }
    </Dropdown>
  )
}

/** A small ring that fills as the 24h cooldown window elapses (0→1). */
function CountdownRing({ progress }: { progress: number }): JSX.Element {
  const radius = 7
  const circumference = 2 * Math.PI * radius
  return (
    <svg width={16} height={16} viewBox="0 0 18 18" className="shrink-0 -rotate-90">
      <circle cx="9" cy="9" r={radius} fill="none" stroke="var(--cat-border)" strokeWidth="2" />
      <circle
        cx="9"
        cy="9"
        r={radius}
        fill="none"
        stroke={BRAND}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
      />
    </svg>
  )
}

/** Shown in place of Re-analyze while the brand is inside its 24h window. */
function NextCheckBadge({ label, progress }: { label: string; progress: number }): JSX.Element {
  return (
    <span title="Analysis runs once every 24 hours" className={`${CONTROL_CHIP} cursor-default`}>
      <CountdownRing progress={progress} />
      <span className="text-[var(--cat-ink-2)]">
        Next check in <span className="font-semibold text-[var(--cat-ink)]">{label}</span>
      </span>
    </span>
  )
}

function ReAnalyzeButton(): JSX.Element {
  const { email, activeOrg } = useActiveProject()
  const { trigger, isRunning } = useNewAnalysis()
  const cooldown = useAnalysisCooldown()

  if (cooldown.onCooldown && !isRunning) {
    return <NextCheckBadge label={cooldown.label} progress={cooldown.progress} />
  }

  return (
    <PrimaryButton
      icon={isRunning ? undefined : RotateCw}
      disabled={!email || !activeOrg || isRunning}
      onClick={trigger}
    >
      {isRunning && <Loader2 size={16} className="animate-spin" />}
      {isRunning ? 'Analyzing…' : 'Re-analyze'}
    </PrimaryButton>
  )
}

interface ExportContext {
  brand: string
  rangeLabel: string
  engineLabel: string
}

/** Build the Overview CSV rows from the rolled-up stats. */
function buildOverviewCsv(data: OverviewStats, ctx: ExportContext): string {
  const rows: [string, string | number][] = [
    ['Metric', 'Value'],
    ['Brand', ctx.brand],
    ['Range', ctx.rangeLabel],
    ['Engine filter', ctx.engineLabel],
    ['Mention rate %', data.mentionPct],
    ['Recommendation rate %', data.recommendationPct],
    ['Citation rate %', data.citationPct],
    ['Average share of voice %', data.avgSov],
    ['Answers analyzed', data.total],
    ['Mentioned', data.mentioned],
    ['Recommended', data.recommended],
    ['Cited', data.cited],
    ...data.engines.map(e => [`SoV — ${e.name} %`, e.sovPct] as [string, number]),
  ]
  return rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

/** Trigger a browser download of `csv` named after the brand. */
function downloadCsv(csv: string, brand: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${brand.toLowerCase().replace(/\s+/g, '-')}-overview.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Export the current Overview snapshot as a CSV the user can download. */
function ExportReportButton(): JSX.Element {
  const { slug, activeOrg } = useActiveProject()
  const { data } = useOverview(slug)
  const { rangeLabel, engineLabel } = useOverviewFilters()

  function exportCsv(): void {
    if (!data) return
    const brand = activeOrg?.name ?? 'brand'
    downloadCsv(buildOverviewCsv(data, { brand, rangeLabel, engineLabel }), brand)
  }

  return (
    <button type="button" className={CONTROL_CHIP} onClick={exportCsv} disabled={!data}>
      <Download size={15} className="text-[var(--cat-ink-2)]" />
      Export
    </button>
  )
}

/**
 * Overview toolbar: date range, engine filter, Export and Re-analyze. Sits on
 * the greeting row in the content flow (not the global top bar), so the controls
 * have room and no longer need to be hidden on smaller widths. Range + engine
 * write to the shared OverviewFilters so every card re-scopes on change.
 */
export function OverviewActions(): JSX.Element {
  const { rangeLabel, setRangeLabel, engineLabel, setEngineLabel } = useOverviewFilters()

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <SelectChip
        icon={Calendar}
        options={[...RANGE_LABELS]}
        value={rangeLabel}
        onChange={v => setRangeLabel(v as RangeLabel)}
      />
      <SelectChip
        icon={SlidersHorizontal}
        options={[...ENGINE_LABELS]}
        value={engineLabel}
        onChange={v => setEngineLabel(v as EngineLabel)}
        withLogos
      />
      <ExportReportButton />
      <ReAnalyzeButton />
    </div>
  )
}
